import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';
import ULID from 'ulid';
import { MerkleTree } from 'merkletreejs';
import crypto from 'crypto';
import axios from 'axios';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
    maxAttempts: 1, // equivalent to maxRetries: 0 in SDK v2
    requestHandler: {
        requestTimeout: 1 * 60 * 1000 // 1 minutes in milliseconds
    }
});

// const enQueueMintPost = async (params, origin) => {
//     console.log("enQueueMintPost", params);
//     let response = await axios.post(process.env.API_URL + '/nft/queue',
//                         JSON.stringify(params),
//                         {
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'origin': origin
//                             }
//                         }
//                     );
//     console.log('enQueueMintPost jsonResult', response.data);
//     return response.data;
// }

const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest();
};

async function fetchAllRecords(sql) {
    let results = [];
    let nextToken;

    do {
        const command = new ExecuteStatementCommand({
            Statement: sql,
            NextToken: nextToken, // Add NextToken if available
        });

        const response = await dbClient.send(command);

        // Accumulate items from this page
        if (response.Items) {
            results = results.concat(response.Items);
        }

        // Update nextToken for the next iteration
        nextToken = response.NextToken;
    } while (nextToken); // Continue until there's no nextToken

    return results;
}

const fetchTextFileAsCharArray = async (url) => {
    try {
        // Fetch the content of the text file
        const response = await axios.get(url, { responseType: "text" });

        // Ensure the response contains text data
        if (response.headers['content-type']?.includes('text/plain')) {
            // Convert the text content into an array of characters
            const charArray = Array.from(response.data);

            console.log("Array of Characters:", charArray);
            return charArray;
        } else {
            throw new Error("The URL does not contain a plain text file.");
        }
    } catch (error) {
        console.error("Error fetching the text file:", error.message);
        throw error;
    }
};

export const handler = async (event) => {
    console.log("event", event);

    let tableName;
    let configs;

    try {
        var headers = event.headers;
        var body = {};

        if(event.body)
            body = JSON.parse(event.body);    

        console.log("origin", headers['origin']);
        tableName = process.env.TABLE_NAME_TEST;
        const domainProdArray = process.env.DOMAIN_PROD.split(',');
        if (domainProdArray.some(domain => headers['origin'] === domain)) {
            tableName = process.env.TABLE_NAME;
        }
        console.log("tableName", tableName);

        let configResult = await dbClient.send(new ExecuteStatementCommand({ Statement: `SELECT * FROM "${tableName}" WHERE PK = 'CONFIG'` }));
        configs = configResult.Items.map(item => unmarshall(item));
        console.log("configs", configs);


        let token = headers['authorization'];
        console.log("token", token);

        let memberId = null;
        let member;

        if (!body.appPubKey && token) {
            try {
                const decoded = jwt.verify(token.split(' ')[1], configs.find(x=>x.key == 'JWT_SECRET').value);
                console.log("decoded", decoded);

                memberId = decoded.MemberId;

                if (Date.now() >= decoded.exp * 1000) {
                    return {
                        Success: false,
                        Message: "Token expired"
                    };
                }
            } catch (e) {
                console.log("error verify token", e);
                return {
                    Success: false,
                    Message: "Invalid token."
                };
            }

            let sql = `SELECT * FROM "${tableName}"."InvertedIndex" WHERE SK = 'MEMBER_ID#${memberId}' AND type = 'MEMBER' AND begins_with("PK", 'MEMBER#')`;
            let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            if (memberResult.Items.length === 0) {
                console.log("member not found: " + memberId);
                return {
                    Success: false,
                    Message: "member not found: " + memberId
                };
            }
            member = memberResult.Items.map(item => unmarshall(item))[0];

            if (!member.role?.includes('ADMIN')) {
                return {
                    Success: false,
                    Message: "Unauthorized access"
                };
            }
        } 
        else if (body.appPubKey){
            // web3auth

            if(!token)  {
                console.log('missing authorization token in headers');
                const response = {
                        Success: false,
                        Code: 1,
                        Message: "Unauthorize user"
                    };
                return response;
            }

            let userId;
            // let aggregateVerifier;
        
            //verify token
            try{
                const idToken = token.split(' ')[1] || "";
                const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
                const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
                                                                            algorithms: ["ES256"],
                                                                        });
                console.log("jwtDecoded", JSON.stringify(jwtDecoded));
        
                if ((jwtDecoded.payload).wallets[0].public_key == body.appPubKey) {
                    // Verified
                    console.log("Validation Success");
                } else {
                    // Verification failed
                    console.log("Validation Failed");
                    return {
                        Success: false,
                        Code: 1,
                        Message: "Validation failed"
                    };
                }
                
                userId = await md5(jwtDecoded.payload.verifierId + "#" + jwtDecoded.payload.aggregateVerifier)
                console.log("userId", userId);
                
                // aggregateVerifier = jwtDecoded.payload.aggregateVerifier;
                
            }catch(e){
                console.log("error verify token", e);
                const response = {
                    Success: false,
                    Code: 1,
                    Message: "Invalid token."
                };
                return response;
            }

            let sql = `SELECT * FROM "${tableName}" WHERE PK = 'MEMBER#${userId}' AND type = 'MEMBER'`;
            let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            if (memberResult.Items.length === 0) {
                console.log("member not found: " + memberId);
                return {
                    Success: false,
                    Message: "member not found: " + memberId
                };
            }

            member = memberResult.Items.map(item => unmarshall(item))[0];

        } 
        else {
            return {
                Success: false,
                Message: "Missing login info"
            };
        }

        if(!body.callData) {
            return {
                Success: false,
                Message: "callData is required"
            };
        }

        if(!body.chatDataHash) {
            return {
                Success: false,
                Message: "chatDataHash is required"
            };
        }

        if(!body.tokenId) {
            return {
                Success: false,
                Message: "tokenId is required"
            };
        }

        if(!body.artistCode) {
            return {
                Success: false,
                Message: "artistCode is required"
            };
        }

        try {
            const lambdaParams = {
                FunctionName: `ada-web3`,
                InvocationType: 'RequestResponse',
                LogType: 'Tail',
                Payload: JSON.stringify({
                    action: 'VERIFY_CHATDATA',
                    paramA: JSON.stringify(body.callData[0]),
                    paramB: JSON.stringify(body.callData[1]),
                    paramC: JSON.stringify(body.callData[2]),
                    paramPubSignal: JSON.stringify(body.callData[3]),
                    chatDataHash: body.chatDataHash,
                    tokenId: body.tokenId,
                    isTest: tableName == process.env.TABLE_NAME_TEST,
                    artistCode: body.artistCode
                })
            };
    
            console.log("lambdaParams", lambdaParams);
    
            const lambdaResult = await lambdaClient.send(new InvokeCommand(lambdaParams));
            console.log("lambdaResult", lambdaResult);
    
            const payload = JSON.parse(Buffer.from(lambdaResult.Payload).toString());
            console.log("payload", payload);
    
            if (payload.errorMessage) {
                console.error("lambda error message:", JSON.stringify(payload.errorMessage));
                throw new Error('Lambda error: ' + JSON.stringify(payload.errorMessage));
            }
            
            console.log("verifyResult", payload);     
    
            return {
                Success: true,
                Data: {
                    verifyResult: payload
                }
            };
    
        } catch (_err) {
            return {
                Success: true,
                Data: {
                    verifyResult: {
                        isValid: false
                    }
                }
            };
        }
        
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-data-proof-verify-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-data-proof-verify-post- ' + random10DigitNumber,
            Message: `Error in ada-chat-data-proof-verify-post ${e.message}\n\nStack trace:\n${e.stack}`,
            TopicArn: configs.find(x=>x.key == 'SNS_TOPIC_ERROR').value
        };
        
        if(tableName == process.env.TABLE_NAME)
            await snsClient.send(new PublishCommand(message));
    
        return {
            Success: false,
            Message: 'エラーが発生しました。管理者に連絡してください。Code: ' + random10DigitNumber
        };
    }
};    