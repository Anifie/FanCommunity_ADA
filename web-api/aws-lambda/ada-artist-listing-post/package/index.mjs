import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import ULID from 'ulid';
import md5 from 'md5';
import * as jose from 'jose';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

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


function ToArtist(obj) {
    return {
        ArtistCode: obj.artist_code,
        ArtistName: obj.artist_name,
        VideoURLs: obj.video_urls,
        Configs: obj.configs,
    }
}

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

        if (token && !body.appPubKey) {
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

            // if(!body.memberId) {
            // return {
            //     Success: false,
            //     Message: "memberId is required"
            // };
            // }
            // sql = `SELECT * FROM "${tableName}" WHERE PK = 'MEMBER#${body.memberId}' and type = 'MEMBER'`;
            // memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            // if (memberResult.Items.length === 0) {
            //     console.log("member not found: " + memberId);
            //     return {
            //         Success: false,
            //         Message: "member not found: " + memberId
            //     };
            // }
            // member = memberResult.Items.map(item => unmarshall(item))[0];
        } 
        else if (body.appPubKey) {
            try {
                const idToken = token.split(' ')[1] || "";
                const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
                const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
                console.log("jwtDecoded", JSON.stringify(jwtDecoded));

                if ((jwtDecoded.payload).wallets[0].public_key === body.appPubKey) {
                    console.log("Validation Success");
                } else {
                    console.log("Validation Failed");
                    return {
                        Success: false,
                        Code: 1,
                        Message: "Validation failed"
                    };
                }

                let userId = await md5(jwtDecoded.payload.verifierId + "#" + jwtDecoded.payload.aggregateVerifier);
                console.log("userId", userId);

                let memberResult = await dbClient.send(new ExecuteStatementCommand({
                    Statement: `SELECT * FROM "${tableName}" WHERE PK = ? and type = 'MEMBER'`,
                    Parameters: [{ S: 'MEMBER#' + userId }]
                }));
                if (memberResult.Items.length === 0) {
                    return {
                        Success: false,
                        Message: 'member not found',
                    };
                }
                member = memberResult.Items.map(item => unmarshall(item))[0];
                console.log("member", member);

            } catch (e) {
                console.log("error verify token", e);
                return {
                    Success: false,
                    Code: 1,
                    Message: "Invalid token."
                };
            }
        } 
        else {
            return {
                Success: false,
                Message: "Missing login info"
            };
        }

        let sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'ARTIST'`;

        if(body.artistCode) {
            sql = `select * from "${tableName}" where PK = 'ARTIST#${body.artistCode}' and SK = 'ARTIST'`;
        }

        let artistsResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        let artists = artistsResult.Items.map(item => unmarshall(item));

        return {
            Success: true,
            Data: {
                artist: artists.map(x => ToArtist(x))
            }
        };

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-artist-listing-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'TD Error - ada-artist-listing-post- ' + random10DigitNumber,
            Message: `Error in ada-artist-listing-post ${e.message}\n\nStack trace:\n${e.stack}`,
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