import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import stripePackage from "stripe";
import ULID from 'ulid';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';
import axios from 'axios';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import FormData from 'form-data';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

let tableName;
let configs;

async function verifyAppleReceipt(receiptBase64, appleSharedSecret, isTest) {
    try {
        let url = isTest ? "https://sandbox.itunes.apple.com/verifyReceipt" : "https://buy.itunes.apple.com/verifyReceipt"

        let response = await axios.post(url, {
            'receipt-data': receiptBase64,
            'password': appleSharedSecret,
            'exclude-old-transactions': true
        });

        console.log("Verification Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error verifying receipt:", error);
        throw new Error(error);
    }
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

export const handler = async (event) => {
    console.log("event", event);

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

        if (body.appPubKey){
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

        } else {
            return {
                Success: false,
                Message: "Missing login info"
            };
        }

        const stripe = stripePackage(configs.find(x => x.key == 'STRIPE_SECRET_KEY').value);

        if(!body.amount) {
            return {
                Success: false,
                Message: 'amount is required'
            }
        }

        if(!body.currency) {
            return {
                Success: false,
                Message: 'currency is required'
            }
        }

        if(!body.message) {
            return {
                Success: false,
                Message: 'message is required'
            }
        }

        if(!body.artistCode) {
            return {
                Success: false,
                Message: 'artistCode is required'
            }
        }

        if(!body.platform) {
            return {
                Success: false,
                Message: 'platform is required'
            }
        }

        if(body.platform != 'BROWSER' && body.platform != 'APPLE' && body.platform != 'GOOGLE' && body.platform != 'EMBEDDED_FORM') {
            return {
                Success: false,
                Message: 'Only EMBEDDED_FORM or BROWSER or APPLE or GOOGLE is valid platform'
            }
        }

        if((body.platform == 'APPLE' || body.platform == 'GOOGLE') && !body.paymentToken) {
            return {
                Success: false,
                Message: 'paymentToken is required for APPLE or GOOGLE platform'
            }
        }

        if((body.platform == 'APPLE' || body.platform == 'GOOGLE') && !body.returnURL) {
            return {
                Success: false,
                Message: 'returnURL is required for APPLE or GOOGLE platform'
            }
        }

        
        // if(!body.channelId && !body.threadId) {
        //     return {
        //         Success: false,
        //         Message: 'either channelId or threadId is required'
        //     }
        // }

        if(!body.channelId) {
            return {
                Success: false,
                Message: 'either channelId is required'
            }
        }

        if(body.platform == 'BROWSER' && !body.redirectURL) {
            return {
                Success: false,
                Message: 'redirectURL is required'
            }
        }

        if(!body.location) {
            return {
                Success: false,
                Message: 'location is required'
            }
        }

        if(!body.position) {
            return {
                Success: false,
                Message: 'position is required'
            }
        }

        // if(!body.tempArtworkId) {
        //     return {
        //         Success: false,
        //         Message: 'tempArtworkId is required'
        //     }
        // }

        if(body.location != 'FAN_ENGAGEMENT' && body.location != 'HEART_LEFT' && body.location != 'HEART_RIGHT' && body.location != 'LED_LEFT' && body.location != 'LED_RIGHT' && body.location != 'LANTERN') {
            return {
                Success: false,
                Message: 'Invalid location. Possible values are FAN_ENGAGEMENT, HEART_LEFT, HEART_RIGHT, LED_LEFT, LED_RIGHT, LANTERN'
            }
        }

        let sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'SUPERCHAT_TEMPLATE'`;
        let superChatTemplatesResult = await fetchAllRecords(sql);
        let superChatTemplates = superChatTemplatesResult.map(x => unmarshall(x));

        let superChatTemplate = superChatTemplates.find(x => x.currency == body.currency 
                                                            && x.amount_min <= parseInt(body.amount) 
                                                            && x.amount_max >= parseInt(body.amount));
        if(!superChatTemplate) {
            console.log("No superchat template found");
            
            return {
                Success: false,
                Message: "No super chat template found"
            }
        }

        sql = `select * from "${tableName}" where PK = 'ARTWORK#${superChatTemplate.artwork_id}' and type = 'ARTWORK'`;
        let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        let artwork = artworkResult.Items.map(item => unmarshall(item))[0];

        let stripePriceId;
        let txStatements = [];

        // call stripe to create product
        let obj = {
            name: "SUPERCHAT - " + superChatTemplate.name,
            //images: [artwork.two_d_url],
            //url: process.env.BASE_URL + "/nft?id=" + body.nftId,
            //description: artwork.description
        };
        console.log("product obj", obj);
        let stripeProduct = await stripe.products.create(obj);
        console.log("stripeProduct", stripeProduct);

        // create stripe price object        
        obj = {
                    unit_amount: body.currency == 'JPY' ? parseInt(body.amount) : parseInt(body.amount) * 100,
                    currency: body.currency,
                    product: stripeProduct.id
                };
        console.log("price obj", obj);
        let stripePrice = await stripe.prices.create(obj);
        console.log("stripePrice", stripePrice);

        stripePriceId = stripePrice.id;

        // sql = `update "${tableName}" set stripe_price_id = '${stripePriceId}' , modified_date = '${new Date().toISOString()}' where type = 'ARTWORK' and PK = '${artwork.PK}' and SK = '${artwork.SK}'`;
        // txStatements.push({ Statement: sql});
        
        const paymentId = ULID.ulid();
        let paymentLink;
        let paymentIntent;
        let session;
        if(body.platform == 'APPLE' || body.platform == 'GOOGLE') {

            // in-app purchase

            // get apple payment token from receipt
            if(body.platform == 'APPLE') {
                let verifyAppleResult = await verifyAppleReceipt(body.paymentToken, configs.find(x => x.key == 'APPLE_SHARED_SECRET').value, tableName == process.env.TABLE_NAME_TEST);
                console.log("verifyAppleResult", verifyAppleResult);

                // if(verifyAppleResult?.latest_receipt_info && verifyAppleResult?.latest_receipt_info.length > 0 && verifyAppleResult?.latest_receipt_info[0]?.payment_token) {
                //     body.paymentToken = verifyAppleResult?.latest_receipt_info[0]?.payment_token;
                //     console.log("apple payment token", body.paymentToken);
                // }

                // apple IAP transaction is done, no stripe required. profit from sale is in App Store Connect https://appstoreconnect.apple.com

                if(verifyAppleResult.status == 0) {

                    let adminToken = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });
                    
                    const imageBuffer = await generateSuperChatImage(member.display_name || member.user_id,
                                                                    member.avatar_uri,
                                                                    superChatTemplate.color,
                                                                    body.currency, 
                                                                    body.amount,
                                                                    body.message);
    
                    // // Save the image temporarily 
                    // const filePath = '/tmp/rank-card.png';  // tmp is aws lambda temporary storage
                    // fs.writeFileSync(filePath, imageBuffer);
                    // save to s3
                    // Define S3 bucket and file name
                    const bucketName = configs.find(x => x.key == 'S3_BUCKET').value;
                    const fileName = `images/image_${ULID.ulid()}.png`;
    
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
                    const s3Url = `${configs.find(x => x.key == 'S3_URL').value}/${fileName}`;
                    console.log("s3Url", s3Url);


                    //'apple_receipt': '${JSON.stringify(verifyAppleResult)}',
                    //'super_chat_template_artwork_id': '${artwork.artwork_id}',
                    sql = `INSERT INTO "${tableName}" 
                                VALUE {
                                    'PK': 'PAYMENT#${paymentId}',
                                    'SK': '${'MEMBERWALLET#' + member.wallet_address}',
                                    'type': 'STRIPE_PAYMENT',
                                    'payment_type': 'SUPERCHAT',
                                    'artist_code': '${body.artistCode}',
                                    'amount': '${body.amount}',
                                    'currency': '${body.currency}',
                                    'super_chat_template_id': '${superChatTemplate.super_chat_template_id}',
                                    'message': '${body.message}',
                                    'channel_id': '${body.channelId}',
                                    'thread_id': '${body.threadId}',
                                    'wallet_address': '${member.wallet_address}',
                                    'user_id': '${member.user_id}',
                                    'payment_id': '${paymentId}',
                                    'payment_platform': '${body.platform}',
                                    'location': '${body.location}',
                                    'position': '${body.position}',
                                    'temp_artwork_id': '${body.tempArtworkId ? body.tempArtworkId : ''}',
                                    'artwork_id': '${body.artworkId ? body.artworkId : ''}',
                                    'superchat_image_url': '${s3Url}',
                                    'apple_receipt': '${JSON.stringify(verifyAppleResult?.receipt?.in_app)}',
                                    'apple_receipt_transaction_id': '${JSON.stringify(verifyAppleResult?.receipt?.in_app[0].transaction_id)}',
                                    'status': 'SUCCESS',
                                    'created_date': '${new Date().toISOString()}'
                                }`;
                    txStatements.push({ Statement: sql});
                    
                    let _metadata = [
                        {
                            "trait_type": "SUPERCHAT",
                            "value": superChatTemplate.name
                        }, 
                        {
                            "trait_type": "ARTIST",
                            "value": body.artistCode
                        }, 
                        {
                            "trait_type": body.channelId ? 'CHANNEL' : 'THREAD',
                            "value": body.channelId ? body.channelId : body.threadId,
                        }, 
                        {
                            "trait_type": "MESSAGE",
                            "value": body.message
                        }, 
                        {
                            "trait_type": "AMOUNT",
                            "value": body.currency + ' ' + body.amount
                        },
                        {
                            "trait_type": "LOCATION",
                            "value": body.location
                        },
                        {
                            "trait_type": "POSITION",
                            "value": body.position
                        },
                        {
                            "trait_type": "TIMESTAMP",
                            "value": new Date().toISOString()
                        },
                    ];
    
                    let newArtworkId;
                    if(!body.artworkId) {
                        newArtworkId = body.tempArtworkId ? body.tempArtworkId : ULID.ulid();
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
                                    'sub_category': '${body.artistCode}',
                                    'two_d_url': '${s3Url}',
                                    'two_d_file_name': '${fileName}',
                                    'status': 'ACTIVE',
                                    'amount': '${body.amount}',
                                    'currency': '${body.currency}',
                                    'duration_in_minutes': '${superChatTemplate.duration_in_minutes}',
                                    'expiry': '${new Date(Date.now() + parseInt(superChatTemplate.duration_in_minutes) * 60 * 1000).toISOString()}',
                                    'location': '${body.location}',
                                    'position': '${body.position}',
                                    'metadata': '${JSON.stringify(_metadata)}',
                                    'created_date': '${new Date().toISOString()}',
                                    'created_by': '${member.user_id}'
                                }`;
                        txStatements.push({ Statement: sql });
                    }
                    else {
                        newArtworkId = body.artworkId;

                        sql = `UPDATE "${tableName}" SET modified_date = '${new Date().toISOString()}',
                                    description = '${superChatTemplate.name}',
                                    amount = '${body.amount}',
                                    currency = '${body.currency}',
                                    duration_in_minutes = '${superChatTemplate.duration_in_minutes}',
                                    expiry = '${new Date(Date.now() + parseInt(superChatTemplate.duration_in_minutes) * 60 * 1000).toISOString()}',
                                    "location" = '${body.location}',
                                    "position" = '${body.position}',
                                    metadata = '${JSON.stringify(_metadata)}'
                                WHERE PK = 'ARTWORK#${newArtworkId}' AND SK = '${member.SK}'`;

                        txStatements.push({ Statement: sql });
                    }
                    
                    // send to mint NFT queue
                    let response = await sendToMintQueue({
                        "nftType": 'SUPERCHAT',
                        "queueType": "MINT_QUEUE",
                        "memberId": member.user_id,
                        "artworkId": newArtworkId,
                        "metadata": _metadata,
                        "artistCode": body.artistCode,
                    }
                    , tableName == process.env.TABLE_NAME ? process.env.DOMAIN_PROD.split(',')[0] : process.env.DOMAIN_TEST.split(',')[0]
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
                    
                    return {
                        Success: true,
                        Data: {
                            // // paymentLink: paymentLink?.url,
                            // stripePaymentLink: paymentLink?.url,
                            // stripePaymentIntentId: paymentIntent?.id,
                            paymentId: paymentId
                        },
                    };
                    
                }
                else {
                    return {
                        Success: false,
                        Message: 'Apple receipt verification failed. ' + JSON.stringify(verifyAppleResult)
                    }
                }
            }

            obj = {
                //amount: Math.round(body.amount * 100), // Convert to cents
                amount: body.currency == 'JPY' ? Math.round(body.amount) : Math.round(body.amount) * 100,
                currency: body.currency,
                payment_method_data: {
                    type: "card",
                    card: { token: body.paymentToken } // Apple Pay or Google Pay token
                },
                return_url: body.returnURL.includes('http') ? body.returnURL : undefined,
                confirm: true, // Auto-confirm payment
                metadata: {
                    project: 'TOKYODOME_ADA',
                    paymentType: 'SUPERCHAT',
                    paymentId: paymentId,
                    amount: body.amount,
                    currency: body.currency,
                    superChatTemplateId: superChatTemplate.super_chat_template_id,
                    superChatTemplateArtworkId: artwork?.artwork_id,
                    message: body.message,
                    channelId: body.channelId,
                    threadId: body.threadId,
                    artistCode: body.artistCode,
                    memberId: member.user_id,
                    walletAddress: member.wallet_address,
                    location: body.location,
                    position: body.position,
                    tempArtworkId: body.tempArtworkId,
                    artworkId: body.artworkId
                }
            };

            if(body.platform == 'APPLE' || body.platform == 'GOOGLE') {
                obj.automatic_payment_methods = {
                    "enabled": true,
                    "allow_redirects": "never"
                }
            }

            console.log("payment intent obj", obj);
            paymentIntent = await stripe.paymentIntents.create(obj);
            console.log('Payment intent created:', paymentIntent);
        }
        else if(body.platform == 'EMBEDDED_FORM') {
            
            session = await stripe.checkout.sessions.create({
                                ui_mode: 'embedded',
                                line_items: [{price: stripePriceId, quantity: 1}],
                                mode: 'payment',
                                redirect_on_completion: "never",
                                // return_url: body.redirectURL + '?paymentid=' + paymentId + '&artistcode=' + body.artistCode + '&supperchattemplateid=' + superChatTemplate.super_chat_template_id + '&currency=' + body.currency + '&amount=' + body.amount,
                                metadata: {
                                    project: 'TOKYODOME_ADA',
                                    paymentType: 'SUPERCHAT',
                                    paymentId: paymentId,
                                    amount: body.amount,
                                    currency: body.currency,
                                    superChatTemplateId: superChatTemplate.super_chat_template_id,
                                    superChatTemplateArtworkId: artwork?.artwork_id,
                                    message: body.message,
                                    channelId: body.channelId,
                                    threadId: body.threadId,
                                    artistCode: body.artistCode,
                                    memberId: member.user_id,
                                    walletAddress: member.wallet_address,
                                    location: body.location,
                                    position: body.position,
                                    tempArtworkId: body.tempArtworkId,
                                    artworkId: body.artworkId
                                }
                            });
            console.log('Checkout session created:', session);
        }
        else {
            // browser
            // Create a Stripe payment link
            obj = {
                line_items: [{price: stripePriceId, quantity: 1}],
                after_completion: {type: 'redirect', redirect: {url: body.redirectURL + '?paymentid=' + paymentId + '&artistcode=' + body.artistCode + '&supperchattemplateid=' + superChatTemplate.super_chat_template_id + '&currency=' + body.currency + '&amount=' + body.amount}},
                metadata: {
                    project: 'TOKYODOME_ADA',
                    paymentType: 'SUPERCHAT',
                    paymentId: paymentId,
                    amount: body.amount,
                    currency: body.currency,
                    superChatTemplateId: superChatTemplate.super_chat_template_id,
                    superChatTemplateArtworkId: artwork?.artwork_id,
                    message: body.message,
                    channelId: body.channelId,
                    threadId: body.threadId,
                    artistCode: body.artistCode,
                    memberId: member.user_id,
                    walletAddress: member.wallet_address,
                    location: body.location,
                    position: body.position,
                    tempArtworkId: body.tempArtworkId,
                    artworkId: body.artworkId
                }
            };
            console.log("payment link obj", obj);
            paymentLink = await stripe.paymentLinks.create(obj);
            console.log('Payment Link created:', paymentLink.url);
        }
        
        //'super_chat_template_artwork_id': '${artwork.artwork_id}',
        sql = `INSERT INTO "${tableName}" 
                    VALUE {
                        'PK': 'PAYMENT#${paymentId}',
                        'SK': '${'MEMBERWALLET#' + member.wallet_address}',
                        'type': 'STRIPE_PAYMENT',
                        'payment_type': 'SUPERCHAT',
                        'artist_code': '${body.artistCode}',
                        'amount': '${body.amount}',
                        'currency': '${body.currency}',
                        'super_chat_template_id': '${superChatTemplate.super_chat_template_id}',
                        'message': '${body.message}',
                        'channel_id': '${body.channelId}',
                        'thread_id': '${body.threadId}',
                        'wallet_address': '${member.wallet_address}',
                        'user_id': '${member.user_id}',
                        'payment_id': '${paymentId}',
                        'payment_platform': '${body.platform}',
                        'location': '${body.location}',
                        'position': '${body.position}',
                        'temp_artwork_id': '${body.tempArtworkId ? body.tempArtworkId : ''}',
                        'artwork_id': '${body.artworkId ? body.artworkId : ''}',
                        'stripe_payment_link_url': '${paymentLink ? paymentLink.url : ''}',
                        'stripe_payment_link_json': '${paymentLink ? JSON.stringify(paymentLink) : ''}',
                        'stripe_payment_intent_id': '${paymentIntent ? paymentIntent.id : ''}',
                        'stripe_payment_intent_json': '${paymentIntent ? JSON.stringify(paymentIntent) : ''}',
                        'stripe_payment_embedded_session': '${session ? JSON.stringify(session) : ''}',
                        'stripe_payment_embedded_session_secret': '${session ? session.client_secret : ''}',
                        'status': 'PENDING',
                        'created_date': '${new Date().toISOString()}'
                    }`;
        txStatements.push({ Statement: sql});

        const statements = { "TransactStatements": txStatements };  
        console.log("statements", JSON.stringify(statements));
        const dbTxResult = await dbClient.send(new ExecuteTransactionCommand(statements));
        console.log("Transaction result", dbTxResult);

        return {
            Success: true,
            Data: {
                stripePaymentLink: paymentLink?.url,
                stripePaymentIntentId: paymentIntent?.id,
                paymentId: paymentId,
                embeddedSessionSecret: session?.client_secret
            },
        };
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-super-buy-stripe ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-super-buy-stripe - ' + random10DigitNumber,
            Message: `Error in ada-chat-super-buy-stripe ${e.message}\n\nStack trace:\n${e.stack}`,
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
