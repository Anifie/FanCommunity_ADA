import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import stripePackage from "stripe";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import ULID from 'ulid';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import FormData from 'form-data';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

let tableName;
let configs;

async function generateSuperChatImage(userName, avatarURL, color, currency, price, message) {
    let result = null;
    let browser = null;
  
    try {
  
      // Launch Puppeteer
      browser = await puppeteer.launch({
                                          args: chromium.args,
                                          defaultViewport: chromium.defaultViewport,
                                          executablePath: await chromium.executablePath(),
                                          headless: chromium.headless,
                                        });
  
      let page = await browser.newPage();
      // await page.goto(event.url || 'https://example.com');
      await page.setViewport({ width: 800, height: 200 });
  
      let htmlFileUrl = 'https://s3.ap-northeast-1.amazonaws.com/anifie.tokyodome.resource/superchat.html';
  
      // Fetch HTML content from the external file URL
      const response = await axios.get(htmlFileUrl);
      let htmlContent = response.data;
  
      // Replace placeholders in the HTML with dynamic values
      htmlContent = htmlContent
        .replace('!username', userName || 'Anonymous')
        .replace('!avatarurl', avatarURL)
        .replace('!color', `${color}`)
        .replace('!currency', `${currency}`)
        .replace('!price', `${price}`)
        .replace('!message', `${message}`);
  
      await page.setContent(htmlContent);
      const screenshotBuffer = await page.screenshot();
      await browser.close();
  
      return screenshotBuffer;
  
    } catch (error) {
      console.log("error in generateSuperChatImage", error);
      throw error
    } finally {
      if (browser !== null) {
        await browser.close();
      }
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

const postChannelMessage = async(params, origin, token) => {
    console.log('postChannelMessage', params, token);

    let response = await axios.post(configs.find(x=>x.key == 'API_URL').value + '/chat/channel/message',
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
    console.log('postChannelMessage jsonResult', response.data);
    return response.data;
}

const postThreadMessage = async(params, origin, token) => {
    console.log('postThreadMessage', params, token);

    let response = await axios.post(configs.find(x=>x.key == 'API_URL').value + '/chat/channel/thread/message',
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
    console.log('postThreadMessage jsonResult', response.data);
    return response.data;
}

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

        console.log("stripeEvent", stripeEvent);
        

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

            console.log("session", session);

            const project = session.metadata.project;
            const paymentType = session.metadata.paymentType;

            if (project === 'TOKYODOME_ADA' && paymentType == 'SUPERCHAT') {


                // const session = JSON.parse(event.session);
                // console.log("session", session);
                

                // Handle logic for Project TOKYODOME_ADA SUPERCHAT
                console.log('TOKYODOME_ADA SUPERCHAT payment completed');

                let txStatements = [];

                let sql = `SELECT * FROM "${tableName}" WHERE PK = 'MEMBER#${session.metadata.memberId}' AND type = 'MEMBER'`;
                let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                if (memberResult.Items.length === 0) {
                    console.log("member not found: " + session.metadata.memberId);
                    throw new Error("member not found: " + session.metadata.memberId)
                }    
                let member = memberResult.Items.map(item => unmarshall(item))[0];

                sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'SUPERCHAT_TEMPLATE' and super_chat_template_id = '${session.metadata.superChatTemplateId}'`;
                let superChatTemplatesResult = await fetchAllRecords(sql);
                let superChatTemplate = superChatTemplatesResult.map(x => unmarshall(x))[0];
                if(!superChatTemplate) {
                    console.log("No superchat template found");
                    throw new Error('No superchat template found');
                }

                let adminToken = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });
                
                // // update discord role in member record
                // sql = `update "${tableName}" set discord_roles = '${member.discord_roles ? member.discord_roles + ',' + session.metadata.artistCode : session.metadata.artistCode}', modified_date = '${new Date().toISOString()}' where type = 'MEMBER' and PK = 'MEMBER#${session.metadata.memberId}' and SK = 'MEMBERWALLET#${session.metadata.walletAddress}'`;
                // txStatements.push({ Statement: sql});

                // post message to channel or thread
                // if(session.metadata.channelId && !session.metadata.threadId) {
                //     let response = await postChannelMessage({
                //                                                 chatChannelId: session.metadata.channelId,
                //                                                 message: session.metadata.message,
                //                                                 isPinned: false,
                //                                                 messageType: 'TEXT',
                //                                                 // actionOptions: data.actionoptions
                //                                                 //                     ? JSON.parse(data.actionoptions)
                //                                                 //                     : undefined,
                //                                                 // actionResults: data.actionresults
                //                                                 //                 ? JSON.parse(data.actionresults)
                //                                                 //                 : undefined,
                //                                                 isEphemeral: false,
                //                                                 // ephemeralRecipientId: data.ephemeralrecipientid,
                //                                                 status: 'NEW',
                //                                                 // reactionResults: data.reactionResults
                //                                                 //                     ? JSON.parse(reactionResults)
                //                                                 //                     : undefined,
                //                                                 creatorId: session.metadata.memberId
                //                                             }
                //                                             , process.env.DOMAIN_PROD.split(',')[0]
                //                                             , adminToken);
                //     console.log("channel msg response", response);
                // }
                // else if (session.metadata.threadId) {
                //     let response = await postThreadMessage({
                //                                                 chatChannelId: session.metadata.channelId,
                //                                                 threadId: session.metadata.threadId,
                //                                                 message: session.metadata.message,
                //                                                 isPinned: false,
                //                                                 messageType: 'TEXT',
                //                                                 // actionOptions: data.actionoptions
                //                                                 //                     ? JSON.parse(data.actionoptions)
                //                                                 //                     : undefined,
                //                                                 // actionResults: data.actionresults
                //                                                 //                 ? JSON.parse(data.actionresults)
                //                                                 //                 : undefined,
                //                                                 isEphemeral: false,
                //                                                 // ephemeralRecipientId: data.ephemeralrecipientid,
                //                                                 status: 'NEW',
                //                                                 // reactionResults: data.reactionResults
                //                                                 //                     ? JSON.parse(reactionResults)
                //                                                 //                     : undefined,
                //                                                 creatorId: session.metadata.memberId
                //                                             }
                //                                         , process.env.DOMAIN_PROD.split(',')[0]
                //                                         , adminToken);
                //     console.log("thread msg response", response);                    
                // }
                // else {
                //     console.log("missing channelId or threadId");
                //     throw new Error('missing channelId or threadId');
                // }

                // if(!session.metadata.superChatTemplateArtworkId) {  
                //     console.log("No superChatTemplateArtworkId found");
                //     throw new Error('No superChatTemplateArtworkId found');
                // }

                // sql = `select * from "${tableName}" where type = 'ARTWORK' and PK = 'ARTWORK#${session.metadata.superChatTemplateArtworkId}'`;
                // let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                // let artwork = artworkResult.Items.map(item => unmarshall(item))[0];
                // console.log("superChatTemplateArtwork", artwork);

                const imageBuffer = await generateSuperChatImage(member.display_name || member.user_id,
                                                                member.avatar_uri,
                                                                superChatTemplate.color,
                                                                session.metadata.currency, 
                                                                session.metadata.amount,
                                                                session.metadata.message);

                // // Save the image temporarily 
                // const filePath = '/tmp/rank-card.png';  // tmp is aws lambda temporary storage
                // fs.writeFileSync(filePath, imageBuffer);
                // save to s3
                // Define S3 bucket and file name
                const bucketName = configs.find(x => x.key == 'S3_BUCKET').value;
                const fileName = `images/image_${ULID.ulid()}.png`;

                let s3Url;
                if(!session.metadata.artworkId) {
                    // Upload image buffer to S3
                    let uploadResult = await s3Client.send(new PutObjectCommand({
                        Bucket: bucketName,
                        Key: fileName,
                        Body: imageBuffer,
                        ContentType: "image/png",
                        ACL: "public-read", // Make publicly accessible
                    }));
                    console.log("uploadResult", uploadResult);

                    // Construct S3 URL
                    s3Url = `${configs.find(x => x.key == 'S3_URL').value}/${fileName}`;
                    console.log("s3Url", s3Url);
                }
                else {
                    // Use existing artworkId
                    sql = `select * from "${tableName}" where type = 'ARTWORK' and PK = 'ARTWORK#${session.metadata.artworkId}'`;

                    let artworkResult = await fetchAllRecords(sql);
                    let artwork = artworkResult.map(x => unmarshall(x))[0];

                    console.log("superChatTemplateArtwork", artwork);
                    s3Url = artwork.two_d_url;
                }
                

                // update payment to success, and set the supernft image inside the payment record
                sql = `update "${tableName}" set payment_intent = '${session.payment_intent}' , status = 'SUCCESS' , superchat_image_url = '${s3Url}', modified_date = '${new Date().toISOString()}' where type = 'STRIPE_PAYMENT' and PK = 'PAYMENT#${session.metadata.paymentId}' and SK = 'MEMBERWALLET#${session.metadata.walletAddress}'`;
                txStatements.push({ Statement: sql});

                let _metadata = [
                    {
                        "trait_type": "SUPERCHAT",
                        "value": superChatTemplate.name
                    }, 
                    {
                        "trait_type": "ARTIST",
                        "value": session.metadata.artistCode
                    }, 
                    {
                        "trait_type": session.metadata.channelId ? 'CHANNEL' : 'THREAD',
                        "value": session.metadata.channelId ? session.metadata.channelId : session.metadata.threadId,
                    }, 
                    {
                        "trait_type": "MESSAGE",
                        "value": session.metadata.message
                    }, 
                    {
                        "trait_type": "AMOUNT",
                        "value": session.metadata.currency + ' ' + session.metadata.amount
                    },
                    {
                        "trait_type": "LOCATION",
                        "value": session.metadata.location
                    },
                    {
                        "trait_type": "POSITION",
                        "value": session.metadata.position
                    },
                    {
                        "trait_type": "TIMESTAMP",
                        "value": new Date().toISOString()
                    },
                ];
                
                // let newArtworkId = ULID.ulid();
                let newArtworkId;
                if(!session.metadata.artworkId) {
                    newArtworkId = session.metadata.tempArtworkId ? session.metadata.tempArtworkId : ULID.ulid();
                    sql = `INSERT INTO "${tableName}" 
                            VALUE {
                                'PK': 'ARTWORK#${newArtworkId}',
                                'SK': '${member.SK}',
                                'type': 'ARTWORK',
                                'artwork_id': '${newArtworkId}',
                                'artwork_type': 'FULL_USER',
                                'name': 'SUPERCHAT#${member.user_id}',
                                'description': '${superChatTemplate.name}',
                                'category': 'SUPERCHAT',
                                'sub_category': '${session.metadata.artistCode}',
                                'two_d_url': '${s3Url}',
                                'two_d_file_name': '${fileName}',
                                'status': 'ACTIVE',
                                'amount': '${session.metadata.amount}',
                                'currency': '${session.metadata.currency}',
                                'duration_in_minutes': '${superChatTemplate.duration_in_minutes}',
                                'expiry': '${new Date(Date.now() + parseInt(superChatTemplate.duration_in_minutes) * 60 * 1000).toISOString()}',
                                'location': '${session.metadata.location}',
                                'position': '${session.metadata.position}',
                                'metadata': '${JSON.stringify(_metadata)}',
                                'created_date': '${new Date().toISOString()}',
                                'created_by': '${member.user_id}'
                            }`;
                    txStatements.push({ Statement: sql });
                }
                else {
                    newArtworkId = session.metadata.artworkId;

                    sql = `UPDATE "${tableName}" SET modified_date = '${new Date().toISOString()}',
                                description = '${superChatTemplate.name}',
                                amount = '${session.metadata.amount}',
                                currency = '${session.metadata.currency}',
                                duration_in_minutes = '${superChatTemplate.duration_in_minutes}',
                                expiry = '${new Date(Date.now() + parseInt(superChatTemplate.duration_in_minutes) * 60 * 1000).toISOString()}',
                                "location" = '${session.metadata.location}',
                                "position" = '${session.metadata.position}',
                                metadata = '${JSON.stringify(_metadata)}'
                            WHERE PK = 'ARTWORK#${newArtworkId}' AND SK = '${member.SK}'`;                            
                    txStatements.push({ Statement: sql });             
                }
                
                
                // send to mint NFT queue
                let response = await sendToMintQueue({
                    "nftType": 'SUPERCHAT',
                    "queueType": "MINT_QUEUE",
                    "memberId": session.metadata.memberId,
                    "artworkId": newArtworkId,
                    "metadata": _metadata,
                    "artistCode": session.metadata.artistCode,
                }
                , process.env.DOMAIN_TEST.split(',')[0]
                , adminToken);
                console.log("response", response);

                if(!response.Success) {
                    throw new Error('Failed to send to mint queue: '+ response.Message);
                }
                
                // no need because we already added discord role id in widgetbot JWT
                // // call widgetbot API to grant discord access to private channel
                // // todo



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
        console.error('error in ada-super-chat-buy-stripe-webhook-test ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-super-chat-buy-stripe-webhook-test - ' + random10DigitNumber,
            Message: `Error in ada-super-chat-buy-stripe-webhook-test ${e.message}\n\nStack trace:\n${e.stack}`,
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
