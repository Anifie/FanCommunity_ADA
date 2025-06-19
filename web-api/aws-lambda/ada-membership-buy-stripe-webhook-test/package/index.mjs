import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import stripePackage from "stripe";
import axios from 'axios';
import jwt from 'jsonwebtoken';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

let tableName;
let configs;



function toRoleId(roleName) {

    switch(roleName) {
        case 'IMARITONES':
            return '1318409940943245354'
        case 'ME':
            return '1318410815057039415'
        case '2I2':
            return '1318410451524128776'
        case 'UKKA':
            return '1318410349564919949'
        case 'DENISUSAFATE':    //デニス・サファテ 
            return '1318410225245749318'
        case 'TITLEMITEI':      //タイトル未定
            return '1318410586891096164'
        case 'KASUMISOUTOSUTERA':   //かすみ草とステラ
            return '1318410636555849729'
        case 'BABABABAMPI':     //ババババンピ
            return '1318410753853751377'
        case 'IMARITONES_ADMIN':
            return '1318419352067768380'
        case 'ME_ADMIN':
            return '1318521710772748329'
        case '2I2_ADMIN':
            return '1318518351026458674'
        case 'UKKA_ADMIN':
            return '1318512436600373288'
        case 'DENISUSAFATE_ADMIN':  //デニス・サファテ Admin
            return '1318481016540758058'
        case 'TITLEMITEI_ADMIN':    //タイトル未定 Admin
            return '1318519392023347201'
        case 'KASUMISOUTOSUTERA_ADMIN': //かすみ草とステラ Admin
            return '1318520266468491295'
        case 'BABABABAMPI_ADMIN':   //ババババンピ Admin
            return '1318521157443518475'
        case 'STELLINASAYURI_ADMIN':
            return '1363755492538716200'
        case 'STELLINASAYURI':
            return '1363755112023068733'
        default:
            console.log('Unexpected Role Name ' + roleName);
            return '';
    }
}


function toTestRoleId(roleName) {

    switch(roleName) {
        case 'IMARITONES':
            return '1339579374567161896'
        case 'ME':
            return '1339580589770145843'
        case '2I2':
            return '1339579917129748591'
        case 'UKKA':
            return '1339579807406493747'
        case 'DENISUSAFATE':    //デニス・サファテ 
            return '1339579686056890378'
        case 'TITLEMITEI':      //タイトル未定
            return '1339579990886453299'
        case 'KASUMISOUTOSUTERA':   //かすみ草とステラ
            return '1339580362795516017'
        case 'BABABABAMPI':     //ババババンピ
            return '1339580483574698014'
        case 'IMARITONES_ADMIN':
            return '1339579199803097159'
        case 'ME_ADMIN':
            return '1339580555054026752'
        case '2I2_ADMIN':
            return '1339579883126521929'
        case 'UKKA_ADMIN':
            return '1339579770265927710'
        case 'DENISUSAFATE_ADMIN':  //デニス・サファテ Admin
            return '1339579433811578890'
        case 'TITLEMITEI_ADMIN':    //タイトル未定 Admin
            return '1339580161036648518'
        case 'KASUMISOUTOSUTERA_ADMIN': //かすみ草とステラ Admin
            return '1339580309825519646'
        case 'BABABABAMPI_ADMIN':   //ババババンピ Admin
            return '1339580437227376690'
        case 'STELLINASAYURI':
            return '1364046100234895360'
        case 'STELLINASAYURI_ADMIN':
            return '1364046222809370684'
        default:
            console.log('Unexpected Role Name ' + roleName);
            return '';
            // throw new Error('Unexpected Role Name ' + roleName);
    }
}

const sendToMintQueue = async(params, origin, token) => {
    console.log('sendToMintQueue', params, token);

    let response = await axios.post(configs.find(x=>x.key == 'API_URL').value + '/nft/queue',
                                        JSON.stringify(params),
                                        {
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'origin': origin,
                                                'Authorization': 'Bearer ' + token
                                            }
                                        }
                                    );
    console.log(response.data);
    console.log('sendToMintQueue jsonResult', response.data);
    return response.data;
}

export const handler = async (event) => {
    console.log("event", event);

    try {

        var headers = event.headers;
        var body = {};

        if(event.body)
            body = JSON.parse(event.body);    

        tableName = process.env.TABLE_NAME_TEST;
        console.log("tableName", tableName);

        let configResult = await dbClient.send(new ExecuteStatementCommand({ Statement: `SELECT * FROM "${tableName}" WHERE PK = 'CONFIG'` }));
        configs = configResult.Items.map(item => unmarshall(item));
        console.log("configs", configs);

        const stripe = stripePackage(configs.find(x => x.key == 'STRIPE_SECRET_KEY').value);

        const stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            event.headers['stripe-signature'],
            process.env.STRIPE_ENDPOINT_SECRET
        );

        if (stripeEvent.type === 'checkout.session.completed' || stripeEvent.type === 'payment_intent.succeeded') {
            
            let session;    // = stripeEvent.data.object;

            if (stripeEvent.type === "checkout.session.completed") {
                session = stripeEvent.data.object; // Checkout Session
            } else if (stripeEvent.type === "payment_intent.succeeded") {
                session = stripeEvent.data.object;
                // Ensure metadata is retrieved correctly
                if (!session.metadata && session.charges && session.charges.data.length > 0) {
                    session.metadata = session.charges.data[0].metadata;
                }
            } else {
                console.log(`Unhandled event type ${stripeEvent.type}`);
                return { statusCode: 200, body: "Unhandled event type" };
            }

            const project = session.metadata.project;
            const paymentType = session.metadata.paymentType;

            if (project === 'TOKYODOME_ADA' && paymentType == 'MEMBERSHIP_NFT') {
                // Handle logic for Project TOKYODOME_ADA

                // const session = JSON.parse(event.session);
                // console.log("session", session);

                console.log('TOKYODOME_ADA payment completed');

                let txStatements = [];

                // update payment to success
                let sql = `update "${tableName}" set payment_intent = '${session.payment_intent}' , status = 'SUCCESS' , modified_date = '${new Date().toISOString()}' where type = 'STRIPE_PAYMENT' and PK = 'PAYMENT#${session.metadata.paymentId}' and SK = 'MEMBERWALLET#${session.metadata.walletAddress}'`;
                txStatements.push({ Statement: sql});

                sql = `SELECT * FROM "${tableName}" WHERE PK = 'MEMBER#${session.metadata.memberId}' AND type = 'MEMBER'`;
                let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                if (memberResult.Items.length === 0) {
                    console.log("member not found: " + session.metadata.memberId);
                    throw new Error("member not found: " + session.metadata.memberId)
                }    
                let member = memberResult.Items.map(item => unmarshall(item))[0];
                
                // update discord role in member record
                sql = `update "${tableName}" set discord_roles = '${member.discord_roles ? member.discord_roles + ',' + session.metadata.artistCode : session.metadata.artistCode}', modified_date = '${new Date().toISOString()}' where type = 'MEMBER' and PK = 'MEMBER#${session.metadata.memberId}' and SK = 'MEMBERWALLET#${session.metadata.walletAddress}'`;
                txStatements.push({ Statement: sql});

                if(member.discord_user_id_real) {
                    
                    // grant role in discord
        
                    const GUILD_ID = configs.find(x => x.key === 'DISCORD_GUILD_ID').value;
                    const BOT_TOKEN = configs.find(x => x.key === 'DISCORD_BOT_TOKEN').value;
                            
                    let roleId = tableName == process.env.TABLE_NAME_TEST 
                                    ? toTestRoleId(session.metadata.artistCode)
                                    : toRoleId(session.metadata.artistCode);
    
                    try {
                    
                        let url = `https://discord.com/api/v8/guilds/${GUILD_ID}/members/${member.discord_user_id_real}/roles/${roleId}`
                        console.log('grant discord role for proj url', url);
                        let _headers = {
                                            "Authorization": `Bot ${BOT_TOKEN}`,
                                            "Content-Type": "application/json"
                                        };
                        let grantRoleResult = await axios.put(url,
                                                            null,
                                                            {
                                                                headers: _headers,
                                                            });
                        console.log("grant discord role result", grantRoleResult);
                        
                    } catch (err) {
                        console.log(err);
                        const _message = {
                            Subject: 'ADA Error - ada-membership-buy-stripe-webhook-test',
                            Message: "unable to grant discord role id " + roleId + " for discord user id " + member.discord_user_id_real,
                            TopicArn: configs.find(x => x.key === 'SNS_TOPIC_ARN').value
                        };
                        await sns.publish(_message).promise();
                    }
                }


                // send to mint NFT queue
                let token = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });
                let response = await sendToMintQueue({
                    "nftType": 'MEMBER_' + session.metadata.artistCode,
                    "queueType": "MINT_QUEUE",
                    "memberId": session.metadata.memberId,
                    "artworkId": session.metadata.artworkId,
                    "artistCode": session.metadata.artistCode
                }
                , process.env.DOMAIN_TEST.split(',')[0]
                , token);
                console.log("response", response);

                if(!response.Success) {
                    throw new Error('Failed to send to mint queue: '+ response.Message);
                }
                

                // no need to do here, frontend will call sign In api again to get new widgetbotJWT with role Id list
                //// call widgetbot API to grant discord access to private channel
                


                const statements = { "TransactStatements": txStatements };  
                console.log("statements", JSON.stringify(statements));
                const dbTxResult = await dbClient.send(new ExecuteTransactionCommand(statements));
                console.log("Transaction result", dbTxResult);


            } else {
                console.log('Other project event detected. Ignored');
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Webhook handled successfully' }),
        };
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-membership-buy-stripe-webhook-test ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'TD Error - ada-membership-buy-stripe-webhook-test - ' + random10DigitNumber,
            Message: `Error in ada-membership-buy-stripe-webhook-test ${e.message}\n\nStack trace:\n${e.stack}`,
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
