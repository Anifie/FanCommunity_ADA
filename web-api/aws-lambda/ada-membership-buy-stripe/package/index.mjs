import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import stripePackage from "stripe";
import { ulid } from 'ulid';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';
import axios from 'axios';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

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
            return 
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

        if(body.platform != 'BROWSER' && body.platform != 'APPLE' && body.platform != 'GOOGLE') {
            return {
                Success: false,
                Message: 'Only BROWSER or APPLE or GOOGLE is valid platform'
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

        if(body.artistCode != 'IMARITONES'
            && body.artistCode != 'ME'
            && body.artistCode != '2I2'
            && body.artistCode != 'UKKA'
            && body.artistCode != 'DENISUSAFATE'
            && body.artistCode != 'TITLEMITEI'
            && body.artistCode != 'KASUMISOUTOSUTERA'
            && body.artistCode != 'BABABABAMPI'
            && body.artistCode != 'STELLINASAYURI') {
            return {
                Success: false,
                Message: 'Invalid artistCode : ' + body.artistCode
            }            
        }

        if(body.platform == 'BROWSER' && !body.redirectURL) {
            return {
                Success: false,
                Message: 'redirectURL is required'
            }
        }

        let artworkId;
        switch(body.artistCode) {

            case 'IMARITONES':
                if(body.artworkId)
                    artworkId = body.artworkId;
                else     
                    artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_IMARITONES').value;

                break;

            case 'ME':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_ME').value;
                break;

            case 'UKKA':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_UKKA').value;
                break;

            case '2I2':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_2I2').value;
                break;

            case 'KASUMISOUTOSUTERA':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_KASUMISOUTOSUTERA').value;
                break;

            case 'BABABABAMPI':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_BABABABAMPI').value;
                break;

            case 'TITLEMITEI':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_TITLEMITEI').value;
                break;

            case 'DENISUSAFATE':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_DENISUSAFATE').value;
                break;

            case 'STELLINASAYURI':
                artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_STELLINASAYURI').value;
                break;

            default:
                throw new Error('Unhandled artist code');
        }
        let sql = `select * from "${tableName}" where PK = 'ARTWORK#${artworkId}' and type = 'ARTWORK'`;
        let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        let artwork = artworkResult.Items.map(item => unmarshall(item))[0];

        let stripePriceId;
        let txStatements = [];

        if(!artwork.stripe_price_id) {
            // call stripe to create product
            let obj = {
                name: artwork.name,
                images: [artwork.two_d_url],
                //url: process.env.BASE_URL + "/nft?id=" + body.nftId,
                description: artwork.description
            };
            console.log("product obj", obj);
            let stripeProduct = await stripe.products.create(obj);
            console.log("stripeProduct", stripeProduct);

            // create stripe price object        
            obj = {
                        unit_amount: parseInt(configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE').value) * (configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value == 'USD' ? 100 : 1),
                        currency: configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value,
                        product: stripeProduct.id
                    };
            console.log("price obj", obj);
            let stripePrice = await stripe.prices.create(obj);
            console.log("stripePrice", stripePrice);

            stripePriceId = stripePrice.id;

            let sql = `update "${tableName}" set stripe_price_id = '${stripePriceId}' , modified_date = '${new Date().toISOString()}' where type = 'ARTWORK' and PK = '${artwork.PK}' and SK = '${artwork.SK}'`;
            txStatements.push({ Statement: sql});
        }
        else 
            stripePriceId = artwork.stripe_price_id;
        
        const paymentId = ulid();
        let paymentLink;
        let paymentIntent;

        if(body.platform == 'APPLE' || body.platform == 'GOOGLE') {
            // in-app purchase

            // verify apple receipt
            if(body.platform == 'APPLE') {
                let verifyAppleResult = await verifyAppleReceipt(body.paymentToken, configs.find(x => x.key == 'APPLE_SHARED_SECRET').value, tableName == process.env.TABLE_NAME_TEST);
                console.log("verifyAppleResult", verifyAppleResult);

                // apple IAP transaction is done, no stripe required. profit from sale is in App Store Connect https://appstoreconnect.apple.com

                if(verifyAppleResult.status == 0) {
                    // 'apple_receipt': '${JSON.stringify(verifyAppleResult)}',
                    sql = `INSERT INTO "${tableName}" 
                                VALUE {
                                    'PK': 'PAYMENT#${paymentId}',
                                    'SK': '${'MEMBERWALLET#' + member.wallet_address}',
                                    'type': 'STRIPE_PAYMENT',
                                    'payment_type': 'MEMBERSHIP_NFT',
                                    'artist_code': '${body.artistCode}',
                                    'wallet_address': '${member.wallet_address}',
                                    'user_id': '${member.user_id}',
                                    'artwork_id': '${artworkId}',
                                    'payment_id': '${paymentId}',
                                    'payment_platform': '${body.platform}',
                                    'apple_receipt': '${JSON.stringify(verifyAppleResult?.receipt?.in_app)}',
                                    'apple_receipt_transaction_id': '${JSON.stringify(verifyAppleResult?.receipt?.in_app[0].transaction_id)}',
                                    'status': 'SUCCESS',
                                    'currency': '${configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value}',
                                    'amount': '${configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE').value}',
                                    'created_date': '${new Date().toISOString()}'
                                }`;
                    txStatements.push({ Statement: sql});

                    // update discord role in member record
                    sql = `update "${tableName}" set discord_roles = '${member.discord_roles ? member.discord_roles + ',' + body.artistCode : body.artistCode}', modified_date = '${new Date().toISOString()}' where type = 'MEMBER' and PK = '${member.PK}' and SK = '${member.SK}'`;
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
                                Subject: 'TD Error - td-membership-buy-stripe',
                                Message: "unable to grant discord role id " + roleId + " for discord user id " + member.discord_user_id_real,
                                TopicArn: configs.find(x => x.key === 'SNS_TOPIC_ARN').value
                            };
                            await sns.publish(_message).promise();
                        }
                    }
    
    
    
                    // send to mint NFT queue
                    let token = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });
                    let response = await sendToMintQueue({
                        "nftType": 'MEMBER_' + body.artistCode,
                        "queueType": "MINT_QUEUE",
                        "memberId": member.user_id,
                        "artworkId": artworkId,
                        "artistCode": body.artistCode,
                    }
                    , tableName == process.env.TABLE_NAME ? process.env.DOMAIN_PROD.split(',')[0] : process.env.DOMAIN_TEST.split(',')[0]
                    , token);
                    console.log("response", response);
    
                    if(!response.Success) {
                        throw new Error('Failed to send to mint queue: '+ response.Message);
                    }
                    
                    // call widgetbot API to grant discord access to private channel
                    // todo
    
    
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

                // if(verifyAppleResult?.latest_receipt_info && verifyAppleResult?.latest_receipt_info.length > 0 && verifyAppleResult?.latest_receipt_info[0]?.payment_token) {
                //     body.paymentToken = verifyAppleResult?.latest_receipt_info[0]?.payment_token;
                //     console.log("apple payment token", body.paymentToken);
                // }
            }

            let obj = {
                //amount: Math.round(body.amount * 100), // Convert to cents
                amount: parseInt(configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE').value) * (configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value == 'USD' ? 100 : 1),
                currency: configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value,
                payment_method_data: {
                    type: "card",
                    card: { token: body.paymentToken } // Apple Pay or Google Pay token
                },
                return_url: body.returnURL.includes('http') ? body.returnURL : undefined,
                confirm: true, // Auto-confirm payment
                metadata: {
                    project: 'TOKYODOME_ADA',
                    paymentType: 'MEMBERSHIP_NFT',
                    paymentId: paymentId,
                    artistCode: body.artistCode,
                    memberId: member.user_id,
                    artworkId: artworkId,
                    walletAddress: member.wallet_address
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
        else {
            // browser
            // Create a Stripe payment link
            let obj = {
                line_items: [{price: stripePriceId, quantity: 1}],
                after_completion: {type: 'redirect', redirect: {url: body.redirectURL + '?paymentid=' + paymentId + '&artistcode=' + body.artistCode}},
                metadata: {
                    project: 'TOKYODOME_ADA',
                    paymentType: 'MEMBERSHIP_NFT',
                    paymentId: paymentId,
                    artistCode: body.artistCode,
                    memberId: member.user_id,
                    artworkId: artworkId,
                    walletAddress: member.wallet_address
                }
            };
            console.log("payment link obj", obj);
            paymentLink = await stripe.paymentLinks.create(obj);
            console.log('Payment Link created:', paymentLink.url);
        }
        
        sql = `INSERT INTO "${tableName}" 
                    VALUE {
                        'PK': 'PAYMENT#${paymentId}',
                        'SK': '${'MEMBERWALLET#' + member.wallet_address}',
                        'type': 'STRIPE_PAYMENT',
                        'payment_type': 'MEMBERSHIP_NFT',
                        'artist_code': '${body.artistCode}',
                        'wallet_address': '${member.wallet_address}',
                        'user_id': '${member.user_id}',
                        'artwork_id': '${artworkId}',
                        'payment_id': '${paymentId}',
                        'payment_platform': '${body.platform}',
                        'stripe_payment_link_url': '${paymentLink ? paymentLink.url : ''}',
                        'stripe_payment_link_json': '${paymentLink ? JSON.stringify(paymentLink) : ''}',
                        'stripe_payment_intent_id': '${paymentIntent ? paymentIntent.id : ''}',
                        'stripe_payment_intent_json': '${paymentIntent ? JSON.stringify(paymentIntent) : ''}',
                        'status': 'PENDING',
                        'currency': '${configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE_CURRENCY').value}',
                        'amount': '${configs.find(x => x.key == 'MEMBERSHIP_NFT_PRICE').value}',
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
                // paymentLink: paymentLink?.url,
                stripePaymentLink: paymentLink?.url,
                stripePaymentIntentId: paymentIntent?.id,
                paymentId: paymentId
            },
        };
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-membership-buy-stripe ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'TD Error - ada-membership-buy-stripe - ' + random10DigitNumber,
            Message: `Error in ada-membership-buy-stripe ${e.message}\n\nStack trace:\n${e.stack}`,
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
