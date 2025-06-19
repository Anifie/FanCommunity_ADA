import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';
import ULID from 'ulid';

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

        } else {
            return {
                Success: false,
                Message: "Missing login info"
            };
        }

        if(!body.minAmount) {
            return {
                Success: false,
                Message: "minAmount is required"
            };
        }

        if(!body.maxAmount) {
            return {
                Success: false,
                Message: "maxAmount is required"
            };
        }

        if(!body.currency) {
            return {
                Success: false,
                Message: "currency is required"
            };
        }

        // if(!body.artworkId) {
        //     return {
        //         Success: false,
        //         Message: "artworkId is required"
        //     };
        // }

        if(!body.name) {
            return {
                Success: false,
                Message: "name is required"
            };
        }

        if(!body.color) {
            return {
                Success: false,
                Message: "color is required"
            };
        }

        if(!body.durationInMinutes) {
            return {
                Success: false,
                Message: "durationInMinutes is required"
            };
        }
        
        let txStatements = [];

        let superChatTemplateId = ULID.ulid();

        let sql = `INSERT INTO "${tableName}" 
                    VALUE {
                        'PK': 'SUPERCHAT_TEMPLATE#${superChatTemplateId}',
                        'SK': '${body.name}',
                        'type': 'SUPERCHAT_TEMPLATE',
                        'status': 'ACTIVE',
                        'super_chat_template_id': '${superChatTemplateId}',
                        'name': '${body.name}',
                        'currency': '${body.currency}',
                        'amount_min': ${body.minAmount} ,
                        'amount_max': ${body.maxAmount} ,
                        'artwork_id': '${body.artworkId}',
                        'color': '${body.color}',
                        'duration_in_minutes': ${body.durationInMinutes},
                        'created_date': '${new Date().toISOString()}'
                    }`;

        txStatements.push({ "Statement": sql });
        
        const statements = { "TransactStatements": txStatements };  
        console.log("statements", JSON.stringify(statements));
        const dbTxResult = await dbClient.send(new ExecuteTransactionCommand(statements));
        console.log("Transaction result", dbTxResult);

        return {
            Success: true
        }

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-super-template-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-super-template-post- ' + random10DigitNumber,
            Message: `Error in ada-chat-super-template-post ${e.message}\n\nStack trace:\n${e.stack}`,
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