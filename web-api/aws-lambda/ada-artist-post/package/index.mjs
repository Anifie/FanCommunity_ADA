import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
// import axios from 'axios';
import * as jose from 'jose';
import md5 from 'md5';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

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
        configs = configResult.Items.map(unmarshall);
        console.log("configs", configs);

        var token = headers['authorization'];
        console.log("token", token);
        
        let memberId = null;
        let member;

        if(!body.appPubKey && token) {
            //verify token
            try{
                const decoded = jwt.verify(token.split(' ')[1], configs.find(x => x.key == 'JWT_SECRET').value);
                console.log("decoded", decoded);
                
                memberId = decoded.MemberId;
                
                if (Date.now() >= decoded.exp * 1000) {
                    const response = {
                        Success: false,
                        Message: "Token expired"
                    };
                    return response;
                }
            }catch(e){
                console.log("error verify token", e);
                const response = {
                    Success: false,
                    Message: "Invalid token."
                };
                return response;
            }

            let sql = `select * from "${tableName}"."InvertedIndex" where SK = 'MEMBER_ID#${memberId}' and type = 'MEMBER' and begins_with("PK", 'MEMBER#')`;
            let memberResult = await dbClient.send(new ExecuteStatementCommand({Statement: sql}));
            if(memberResult.Items.length == 0) {
                console.log("member not found: " + memberId);
                const response = {
                    Success: false,
                    Message: "member not found: " + memberId
                };
                return response;
            }
            member = memberResult.Items.map(unmarshall)[0];

            if(!member.role?.includes('ADMIN')) {
                return {
                    Success: false,
                    Message: "Unauthorized access"
                };
            }
        }
        else if(body.appPubKey) {

            var token = headers['authorization'];
            console.log("token", token);

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

            let memberResult = await dbClient.send(new ExecuteStatementCommand({Statement: `SELECT * FROM "${tableName}" WHERE PK = ? and type = 'MEMBER'`, Parameters: [{ S: 'MEMBER#' + userId }],}));
            console.log("memberResult", JSON.stringify(memberResult));
            if(memberResult.Items.length === 0) {
                return {
                    Success: false,
                    Message: 'member not found',
                };
            }

            member = memberResult.Items.map(unmarshall)[0];
        }
        else {
            console.log('Missing login info');
            const response = {
                    Success: false,
                    Message: "Missing login info"
                };
            return response;
        }

        if(!body.artistCode) {
            return {
                Success: false,
                Message: "artworkId is required"
            }
        }

        if(member.role != 'ADMIN') {
            return {
                Success: false,
                Message: "Unauthorized to add artist"
            }
            // if(body.artistCode == 'IMARITONES' && !member.discord_roles.includes('IMARITONES_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'ME' && !member.discord_roles.includes('ME_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'UKKA' && !member.discord_roles.includes('UKKA_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == '2I2' && !member.discord_roles.includes('2I2_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'ME' && !member.discord_roles.includes('ME_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'DENISUSAFATE' && !member.discord_roles.includes('DENISUSAFATE_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'TITLEMITEI' && !member.discord_roles.includes('TITLEMITEI_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'KASUMISOUTOSUTERA' && !member.discord_roles.includes('KASUMISOUTOSUTERA_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
            // else if(body.artistCode == 'BABABABAMPI' && !member.discord_roles.includes('BABABABAMPI_ADMIN')) {
            //     return {
            //         Success: false,
            //         Message: "Unauthorized to update artist."
            //     }   
            // }
        }

        let sql = `select * from "${tableName}" where PK = 'ARTIST#${body.artistCode}' and SK = 'ARTIST'`;
        let artistResult = await dbClient.send(new ExecuteStatementCommand({Statement: sql}));
        if(artistResult.Items.length > 0) {
            return {
                Success: false,
                Message: "Artist code already existed"
            }   
        }
        // let artist = artistResult.Items.map(unmarshall)[0];

        sql = `INSERT INTO "${tableName}" 
                VALUE { 
                        'PK': 'ARTIST#${body.artistCode}', 
                        'SK': 'ARTIST', 
                        'type': 'ARTIST', 
                        'artist_code': '${body.artistCode}', 
                        'artist_name': '${body.artistName}', 
                        'video_urls': ?, 
                        'configs': ?,
                        'created_date': '${new Date().toISOString()}'
                        }`;

        console.log("sql", sql);

        let parameters = [];
        parameters.push({S: body.videoURLs ? JSON.stringify(body.videoURLs) : ''})
        parameters.push({S: body.configs ? JSON.stringify(body.configs) : ''})
        
        let result = await dbClient.send(new ExecuteStatementCommand({Statement: sql, Parameters: parameters}));
        console.log("result", result);
        
        return {
            Success: true
        };
        
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

        console.error('error in ada-artist-post ' + random10DigitNumber, e);
        
        const message = {
            Subject: 'TD Error - ada-artist-post - ' + random10DigitNumber,
            Message: `Error in ada-artist-post: ${e.message}\n\nStack trace:\n${e.stack}`,
            TopicArn: configs.find(x=>x.key == 'SNS_TOPIC_ERROR').value
        };
        
        if(tableName == process.env.TABLE_NAME)
            await snsClient.send(new PublishCommand(message));
        
        const response = {
            Success: false,
            Message: 'エラーが発生しました。管理者に連絡してください。Code: ' + random10DigitNumber
        };
        
        return response;
    }
    
};