import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import ULID from 'ulid';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

function ToPayment(obj) {

    if(!obj || obj.length == 0) 
        return[];

    return {
        PaymentType: obj.payment_type,
        PaymentPlatform: obj.payment_platform,
        PaymentMethod: obj.payment_method,
        PaymentId: obj.payment_id,
        Status: obj.status,
        ArtistCode: obj.artist_code,
        WalletAddress: obj.wallet_address,
        ArtworkId: obj.artwork_id,
        SuperChatTemplateId: obj.superchat_template_id,
        SuperChatTemplateArtworkId: obj.superchat_template_artwork_id,
        SuperChatImageURL: obj.superchat_image_url,
        Message: obj.message,
        ChannelId: obj.channel_id,
        ThreadId: obj.thread_id,
        Location: obj.location,
        Position: obj.position,
        TempArtworkId: obj.temp_artwork_id,
        Currency: obj.currency,
        Amount: obj.amount,
        MemberId: obj.user_id,
        EventId: obj.event_id,
        TicketId: obj.ticket_id,
        PaymentIntent: obj.payment_intent,
        ApplePayTransactionId: obj.apple_receipt_transaction_id,
        AppleReceipt: obj.apple_receipt ? JSON.parse(obj.apple_receipt) : undefined,
        CreatedDate: obj.created_date,
        ModifieddDate: obj.modified_date,
    };

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

        if (token) {
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

        let sql = `SELECT * FROM "${tableName}"."ByTypeCreatedDate" WHERE type = 'STRIPE_PAYMENT' `;
        
        if(body.artistCode) {
            sql += `AND artist_code = '${body.artistCode}' `;
        }

        if(body.paymentType) {
            sql += `AND payment_type = '${body.paymentType}' `;
        }

        if (body.status) {
            sql += `AND status = '${body.status}' `;
        }

        if (body.memberId) {
            sql += `AND user_id = '${body.memberId}' `;
        }

        if (body.walletAddress) {
            sql += `AND wallet_address = '${body.walletAddress}' `;
        }

        if (body.paymentPlatform) {
            sql += `AND payment_platform = '${body.paymentPlatform}' `;
        }

        sql += ` order by created_date DESC`;


        console.log("sql", sql);
        
        if(!body.pageSize)
            body.pageSize = 10;
        
        var nextToken = body.nextToken;
        var allPayments = [];
        var maxAttemps = 40;    // max page size
        var attempt = 0;
        var paymentsResult = null;
        while(attempt < maxAttemps) {
            paymentsResult = await dbClient.send(
                                                    new ExecuteStatementCommand({
                                                        Statement: sql,
                                                        NextToken: nextToken,
                                                        Limit: +body.pageSize
                                                    })
                                                );

            console.log("paymentsResult", JSON.stringify(paymentsResult));
            console.log("paymentsResult.NextToken", paymentsResult.NextToken);
            console.log("paymentsResult.LastEvaluatedKey", paymentsResult.LastEvaluatedKey);
            
            nextToken = paymentsResult.NextToken;
        
            let payments = paymentsResult.Items.map(unmarshall);
            allPayments.push(...payments);
            console.log("allPayments", JSON.stringify(allPayments));
            console.log("allPayments length", allPayments.length);
            console.log("attempt", attempt);

            attempt++;
            
            if(!nextToken || allPayments.length >= body.pageSize)
                break;
        }

        let _payments = await Promise.all(allPayments.map(async(a) => await ToPayment(a)));    

        // let result = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        // let payments = result.Items.map(item => unmarshall(item));

        // let _payments = payments.map(a => ToPayment(a));

        return {
            Success: true,
            Data: {
                payments: _payments,
                nextToken: nextToken
            }
        };

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-payment-listing-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'TD Error - ada-payment-listing-post- ' + random10DigitNumber,
            Message: `Error in ada-payment-listing-post ${e.message}\n\nStack trace:\n${e.stack}`,
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