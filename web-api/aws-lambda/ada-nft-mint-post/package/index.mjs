import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as jose from 'jose';
import md5 from 'md5';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { ulid } from 'ulid';
import crypto from 'crypto';
import { MerkleTree } from 'merkletreejs';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
    maxAttempts: 1, // equivalent to maxRetries: 0 in SDK v2
    requestHandler: {
        requestTimeout: 8 * 60 * 1000 // 1 minutes in milliseconds
    }
});

let tableName;
let configs;

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest();
};

async function getImageBase64(url) {
    try {
      // Fetch the image data from the URL
      const response = await axios.get(url, {
        responseType: 'arraybuffer' // Important to get the data as a buffer
      });
  
      // Convert the response data to a Buffer
      const buffer = Buffer.from(response.data, 'binary');
  
      // Encode the Buffer to a Base64 string
      const base64String = buffer.toString('base64');
  
      // Optionally, you can add the data URI prefix to the Base64 string
      const mimeType = response.headers['content-type'];
      const base64Image = `data:${mimeType};base64,${base64String}`;
  
      return base64Image;
    } catch (error) {
      console.error('Error fetching and converting image:', error);
      throw error;
    }
}

const nftPost = async (params, origin) => {
    console.log("nftPost", params);
    let response = await axios.post(configs.find(x=>x.key == 'API_URL').value + '/asset',
                        JSON.stringify(params),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'origin': origin
                            }
                        }
                    );
    console.log('nftPost jsonResult', response.data);
    return response.data;
}

const web3Mint = async (params) => {
    const lambdaParams = {
        FunctionName: `ada-web3`,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: params
    };

    try {
        lambdaParams.Payload = JSON.stringify(lambdaParams.Payload); 
        const lambdaResult = await lambdaClient.send(new InvokeCommand(lambdaParams));
        const payload = JSON.parse(Buffer.from(lambdaResult.Payload).toString());
        
        if (payload.errorMessage) {
            console.error("web3 mint lambda error message:", JSON.stringify(payload.errorMessage));
            throw new Error('web3 mint Lambda error: ' + JSON.stringify(payload.errorMessage));
        }

        console.log("mint result", payload);
        return payload;
    } catch (error) {
        console.error("web3 mint Lambda invocation error:", error);
        throw new Error('Lambda invocation failed: ' + error.message);
    }
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


const fileUpload = async (params) => {
    console.log("fileUpload", params);

    let lambdaParams = {
        FunctionName: 'ada-file-upload-post',
        InvocationType: 'RequestResponse', 
        LogType: 'Tail',
        Payload: {
            body: JSON.stringify({
                S3URL: configs.find(x => x.key == 'S3_URL').value,
                S3BucketName: configs.find(x => x.key == 'S3_BUCKET').value, 
                SNSTopic: configs.find(x => x.key == 'SNS_TOPIC_ERROR').value, 
                assetId: params.assetId, fileData: params.fileData, fileName: params.fileName, fileExtension: params.fileExtension, params: params.params, isBase64: params.isBase64, isTest: params.isTest, isURL: params.isURL, skipNFTStorage: params.skipNFTStorage})
        }
    };

    try {
        lambdaParams.Payload = JSON.stringify(lambdaParams.Payload); 
        const lambdaResult = await lambdaClient.send(new InvokeCommand(lambdaParams));
        const payload = JSON.parse(Buffer.from(lambdaResult.Payload).toString());
        
        if (payload.errorMessage) {
            console.error("file upload lambda error message:", JSON.stringify(payload.errorMessage));
            throw new Error('file upload Lambda error: ' + JSON.stringify(payload.errorMessage));
        }

        const uploadResult = JSON.parse(Buffer.from(lambdaResult.Payload).toString()); 
        console.log("uploadResult", uploadResult);

        if(uploadResult) {
            return JSON.parse(uploadResult.body);
        }

    } catch (error) {
        console.error("file upload Lambda invocation error:", error);
        throw new Error('Lambda invocation failed: ' + error.message);
    }


    // lambdaParams.Payload = JSON.stringify(lambdaParams.Payload);            
    // console.log("lambdaParams", lambdaParams);            
    // const lambdaResult = await lambda.invoke(lambdaParams).promise();            
    // const uploaded = JSON.parse(lambdaResult.Payload).Success;    
    // if(lambdaResult.Payload.errorMessage) {
    //     console.log("file upload lambda error message: ", JSON.stringify(lambdaResult.Payload.errorMessage));
    //     throw new Error('fileupload Lambda error: '+ JSON.stringify(lambdaResult.Payload.errorMessage));
    // }            
    // const uploadResult = JSON.parse(lambdaResult.Payload);    
    // console.log("uploadResult", uploadResult);

    // if(uploadResult) {
    //     return JSON.parse(uploadResult.body);
    // }
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
        let aggregateVerifier;

        if (body.appPubKey){
            
            if(!body.walletAddress){
                
                console.log("walletAddress is required");
                
                return {
                    Success: false,
                    Message: 'walletAddress is required',
                };
            }

            if(!token)  {
                console.log('missing authorization token in headers');
                const response = {
                        Success: false,
                        Code: 1,
                        Message: "Unauthorize user"
                    };
                return response;
            }
        
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
                
                memberId = await md5(jwtDecoded.payload.verifierId + "#" + jwtDecoded.payload.aggregateVerifier)
                console.log("memberId", memberId);
                
                aggregateVerifier = jwtDecoded.payload.aggregateVerifier;
                body.displayName = jwtDecoded.payload.name;
                
            }catch(e){
                console.log("error verify token", e);
                const response = {
                    Success: false,
                    Code: 1,
                    Message: "Invalid token."
                };
                return response;
            }

        } 
        if(!body.appPubKey && token) {
            //verify token
            try{
                const decoded = jwt.verify(token.split(' ')[1], configs.find(x=>x.key == 'JWT_SECRET').value);
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


            // replace member with member who we want to sent the NFT to
            if(body.memberId == undefined) {
                return {
                    Success: false,
                    Message: "memberId is required"
                };
            }
            sql = `select * from "${tableName}" where PK = 'MEMBER#${body.memberId}' and type = 'MEMBER'`;
            memberResult = await dbClient.send(new ExecuteStatementCommand({Statement: sql}));
            if(memberResult.Items.length == 0) {
                console.log("member not found: " + body.memberId);
                const response = {
                    Success: false,
                    Message: "member not found: " + body.memberId
                };
                return response;
            }
            member = memberResult.Items.map(unmarshall)[0];
        }
        else {
            console.log("Invalid token.");
            return {
                Success: false,
                Code: 1,
                Message: "Invalid token."
            };
        }


        if(!body.nftType) {
            return {
                Success: false,
                Message: 'nftType is required'
            };
        }

        if(body.storeId === undefined){
            switch(body.nftType) {
                case 'ART':
                    body.storeId = 'ART';
                    break;
                case 'CHATDATA':
                    body.storeId = 'CHATDATA';
                    break;
                case 'MEMBER_IMARITONES':
                case 'MEMBER_ME':
                case 'MEMBER_UKKA':
                case 'MEMBER_2I2':
                case 'MEMBER_KASUMISOUTOSUTERA':
                case 'MEMBER_BABABABAMPI':
                case 'MEMBER_TITLEMITEI':
                case 'MEMBER_DENISUSAFATE':
                case 'MEMBER_STELLINASAYURI':
                    body.storeId = 'MEMBERSHIP';
                    break;
                case 'SUPERCHAT':
                    body.storeId = 'SUPERCHAT';
                    break;
                default:
                    break
            }
        }

        if(body.category === undefined){
            body.category = 'GRAPHIC'
        }

        if(body.licenseId === undefined) {
            body.licenseId = 'CC0';
        }

        if(!body.artistCode) {
            return {
                Success: false, 
                Message: 'artistCode is required',
            };
        }

        let sql;

        if(body.queueId) {
            sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , status = 'IN_PROGRESS' where PK = 'QUEUE#MINT#${body.queueId}' and SK = '${member.SK}'`;
            console.log("sql 2", sql);
            let updateQueueInProgressResult = await dbClient.send(new ExecuteStatementCommand({Statement: sql}));
            console.log("updateQueueInProgressResult", updateQueueInProgressResult);
        }

        let txStatements = [];

        let artwork, artworkV2, artworkV3;
        let chatMember, chatDataHash, chatDataLocalURL, encryptionKey, lastMintMessageId;
        let assetId = ulid();

        if(body.nftType == 'ART' && !body.artworkId) {
            console.log('artworkId is required for nftType ART');
            return {
                        Success: false,
                        Message: 'artworkId is required for nftType ART'
                    };
        }

        let _metadata = [
            {
                "trait_type": "Publisher",
                "value": body.artistCode
            },
        ];

        if(body.metadata) {
            let bodyMetadata = typeof body.metadata == 'string' ? JSON.parse(body.metadata) : body.metadata;
            if(bodyMetadata.length > 0)
                _metadata = _metadata.concat(bodyMetadata);
        }


        if(body.nftType == 'MEMBER_IMARITONES') {

            // body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_IMARITONES').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });

            sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'ARTWORK' and category = 'MEMBERSHIP' and sub_category = 'IMARITONES'`;
            let imaritoneArtworkResult = await fetchAllRecords(sql);
            if(imaritoneArtworkResult.length == 0)
                throw new Error("Imaritones artwork not found");

            let imaritonesArtworks = imaritoneArtworkResult.map(unmarshall);
            const imaritonesArtwork = randomPick(imaritonesArtworks);
            console.log("imaritonesArtwork", imaritonesArtwork);

            body.artworkId = imaritonesArtwork.artwork_id;
            
        }
        else if(body.nftType == 'MEMBER_ME') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_ME').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_UKKA') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_UKKA').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_2I2') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_2I2').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_KASUMISOUTOSUTERA') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_KASUMISOUTOSUTERA').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_BABABABAMPI') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_BABABABAMPI').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_TITLEMITEI') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_TITLEMITEI').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_DENISUSAFATE') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_DENISUSAFATE').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'MEMBER_STELLINASAYURI') {

            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_MEMBER_STELLINASAYURI').value;

            // _metadata.push({
            //     "trait_type": "MEMBERSHIP",
            //     "value": "IMARITONES"
            // });
            
        }
        else if(body.nftType == 'CHATDATA') {
            body.artworkId = configs.find(x => x.key == 'ARTWORK_ID_CHATDATA').value;

            if(!body.chatMemberId) {
                return {
                    Success: false,
                    Message: "chatMemberId is required for CHATDATA nft"
                }
            }

            sql = `select * from "${tableName}" where PK = 'MEMBER#${body.chatMemberId}' and type = 'MEMBER'`;
            let chatMemberResult = await fetchAllRecords(sql);
            if(chatMemberResult.length == 0)
                throw new Error("ChatMember not found: " + body.chatMemberId);

            chatMember = chatMemberResult.map(unmarshall)[0];

            let chatMemberId = body.chatMemberId;
            let msgsObj = [];

            // if(body.messageIds) {
            //     // let msgIds = body.messageIds.split(',');
            //     for (let i = 0; i < msgIds.length; i++) {
            //         const msgId = msgIds[i]; 
            //         let sql = `select * from "${tableName}"."InvertedIndex" where type = 'CHATCHANNEL_MESSAGE' and SK = 'MESSAGE#${msgId}' and sender_user_id = '${chatMemberId}'`;    
            //         // let msgResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            //         let msgResult = await fetchAllRecords(sql);
            //         if(msgResult.length == 0) {
            //             throw new Error("Message not found: " + msgId);
            //         }
            //         let msg = msgResult.map(unmarshall)[0];
            //         msgsObj.push({
            //             type: "CHANNELMESSAGE",
            //             channelId: msg.chat_channel_id,
            //             messageId: msg.message_id,
            //             message: msg.message,
            //             createdDate: msg.created_date
            //         });
            //     }
            // }

            if(body.messages) {

                if(typeof body.messages == 'string') {
                    body.messages = JSON.parse(body.messages);
                }

                for (let i = 0; i < body.messages.length; i++) {
                    const messageObj = body.messages[i];
                    console.log("messageObj", messageObj);
                    /*
                    let msg = {
                                    DiscordUserId: obj.discord_user_id,
                                    ChannelId: obj.discord_channel_id,
                                    // ChannelName: obj.channel_name,
                                    Timestamp: obj.timestamp,
                                    MessageId: obj.discord_message_id,
                                    Message: obj.content
                                };
                    */
                    msgsObj.push({
                        type: "CHANNELMESSAGE",
                        channelId: messageObj.ChannelId,
                        messageId: messageObj.MessageId,
                        message: messageObj.Message,
                        createdDate: messageObj.Timestamp
                    });
                }

                const latestMessage = body.messages.reduce((latest, msg) => 
                    BigInt(msg.MessageId) > BigInt(latest.MessageId) ? msg : latest
                  );

                lastMintMessageId = latestMessage.MessageId;
                console.log("lastMintMessageId", lastMintMessageId);
                
            }

            let _messages = msgsObj.map(x => x.message + ' |');
            let messages = _messages.join(' ').slice(0, -1);
            let messagesBuffer = Buffer.from(messages);
            let messagesBuffer64 = messagesBuffer.toString('base64')
            console.log("messagesBuffer64", messagesBuffer64);

            let textUploadResult = await fileUpload({
                assetId: chatMemberId + `_chatdata_${new Date().getTime()}`,
                isBase64: true,
                fileData: messagesBuffer64,
                fileName: chatMemberId + `_chatdata_${new Date().getTime()}.txt`,
                fileExtension: 'txt',
                isTest: tableName == process.env.TABLE_NAME_TEST,
                skipNFTStorage: true
            });

            console.log("textUploadResult", textUploadResult);

            chatDataLocalURL = textUploadResult.localURL;

            let wordsArray = await fetchTextFileAsWordsArray(chatDataLocalURL, configs.find(x => x.key == 'OPENAI_APIKEY').value);                                    
            // let charsArray = await fetchTextFileAsCharArray(chatDataLocalURL);

            // Create the Merkle Tree
            //const leaves = msgsObj.map(data => hashData(JSON.stringify(data)));
            const leaves = wordsArray.map(data => hashData(data));
            console.log('leaves', leaves);
            
            const tree = new MerkleTree(leaves, (data) => crypto.createHash('sha256').update(data).digest());
            console.log('tree', tree);
            
            // Get the Merkle Root
            const root = tree.getRoot().toString('hex');
            console.log('Merkle Root:', root);

            chatDataHash = root;

            _metadata.push({
                "trait_type": "ChatDataHash",
                "value": root
            });

            let filePassword = chatMemberId + '_pwd!';
            const jsonBuffer = Buffer.from(JSON.stringify(msgsObj), 'utf-8');
            let encryptResult = await encryptFile(jsonBuffer, filePassword);
            encryptionKey = `${filePassword};${encryptResult.salt};${encryptResult.iv};${encryptResult.authTag}`;

            let encyptedFileUploadResult = await fileUpload({
                                                                assetId: chatMemberId + "_chatdata",
                                                                isBase64: false,
                                                                fileData: encryptResult.encryptedData,
                                                                fileName: chatMemberId + '_chatdata.bin',
                                                                fileExtension: 'bin',
                                                                isTest: tableName == process.env.TABLE_NAME_TEST
                                                            });

            console.log("encyptedFileUploadResult", encyptedFileUploadResult);

            _metadata.push({
                "trait_type": "ChatDataFile",
                "value": `https://arweave.net/${encyptedFileUploadResult.metadata.transaction.id}`
            });

            _metadata.push({
                "trait_type": "MemberId",
                "value": `${chatMemberId}`
            });

        }
        else if(body.nftType == 'SUPERCHAT') {
            
            // the body should contain artworkId

        }


        if(body.artworkId) {
            sql = `select * from "${tableName}" where type = 'ARTWORK' and PK = 'ARTWORK#${body.artworkId}'`;
            let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            artwork = artworkResult.Items.map(unmarshall)[0];
            let imgBase64;

            imgBase64 = await getImageBase64(artwork.two_d_url);
            body.nftURLBase64 = imgBase64;
            body.fileName = artwork.two_d_file_name;
            body.name = assetId;    //artwork.name + '-' + member.user_id;
            body.description = artwork.description;
        }

        if(artwork && artwork.metadata) {
            let artworkMetadata = JSON.parse(artwork.metadata);
            if(artworkMetadata.length > 0)
                _metadata = _metadata.concat(artworkMetadata);
        }
        
        body.metadata = _metadata;


        if(body.artworkId2) {
            sql = `select * from "${tableName}" where type = 'ARTWORK' and PK = 'ARTWORK#${body.artworkId2}'`;
            let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            artworkV2 = artworkResult.Items.map(unmarshall)[0];
        }

        if(body.artworkId3) {
            sql = `select * from "${tableName}" where type = 'ARTWORK' and PK = 'ARTWORK#${body.artworkId3}'`;
            let artworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            artworkV3 = artworkResult.Items.map(unmarshall)[0];
        }

        // let arMetadataUploadResult;
        let metadata;
        
        // if(artwork && artworkV2 && !artworkV3) {

        //     body.fileName = "index.html";  // change to html so that the asset media type is html and not png

        //     let uploadResultNFTFolder = await folderUpload({
        //         artworkIdV1: artwork.artwork_id,
        //         artworkIdV2: artworkV2.artwork_id,
        //         isTest: tableName == process.env.TABLE_NAME_TEST
        //     });

        //     if(uploadResultNFTFolder.errorMessage) {
        //         console.log('upload folder err', uploadResultNFTFolder);
        //         return {
        //             Success: false,
        //             Message: 'Upload folder failed'
        //         }
        //     }
            
        //     metadata = {
        //         name: body.name,
        //         image: `https://arweave.net/${uploadResultNFTFolder.img1TxId}`,
        //         animation_url: `https://arweave.net/${uploadResultNFTFolder.htmlTxId}`,
        //         description: body.description,
        //         publisher: body.artistCode,
        //         attributes: body.metadata
        //     }
        //     console.log("metadata", metadata);
        // }
        // else if(artwork && artworkV2 && artworkV3) {

        //     body.fileName = "index.html";  // change to html so that the asset media type is html and not png

        //     let uploadResultNFTFolder = await folderUpload3({
        //         artworkIdV1: artwork.artwork_id,
        //         artworkIdV2: artworkV2.artwork_id,
        //         artworkIdV3: artworkV3.artwork_id,
        //         isTest: tableName == process.env.TABLE_NAME_TEST
        //     });

        //     if(uploadResultNFTFolder.errorMessage) {
        //         console.log('upload folder 3 err', uploadResultNFTFolder);
        //         return {
        //             Success: false,
        //             Message: 'Upload folder failed'
        //         }
        //     }
            
        //     metadata = {
        //         name: body.name,
        //         image: `https://arweave.net/${uploadResultNFTFolder.img1TxId}`,
        //         animation_url: `https://arweave.net/${uploadResultNFTFolder.htmlTxId}`,
        //         description: body.description,
        //         // termsOfService: process.env.TOS_URL,
        //         publisher: body.artistCode,
        //         attributes: body.metadata
        //     }
        //     console.log("metadata", metadata);

        //     // let _metaBuffer = Buffer.from(JSON.stringify(metadata));
        //     // let _metaBase64 = _metaBuffer.toString('base64')

        //     // console.log("_metaBase64", _metaBase64);

        //     // arMetadataUploadResult = await fileUpload({
        //     //                                         isBase64: true,
        //     //                                         fileData: _metaBase64,
        //     //                                         fileName: 'metadata.json',
        //     //                                         fileExtension: 'json',
        //     //                                         isTest: tableName == process.env.TABLE_NAME_TEST
        //     //                                     });

        //     // arMetadataUploadResult.localURL = artwork.two_d_url + ',' + artworkV2.two_d_url;
        // }
        if(false) {

        }
        else {

            let arTxId;
            
            if(artwork && artwork.ar_tx_id) {
                arTxId = artwork.ar_tx_id;
            }
            else {
                let arImageUploadResult = await fileUpload({
                    assetId: assetId,
                    isBase64: true,
                    fileData: body.nftURLBase64.split(',').pop(),
                    fileName: body.fileName,
                    fileExtension: body.fileName.split('.').pop(),
                    isTest: tableName == process.env.TABLE_NAME_TEST
                });

                arTxId = arImageUploadResult.metadata.transaction.id;

                if(artwork) {
                    sql = `update "${tableName}" set ar_tx_id = '${arTxId}' , modified_date = '${new Date().toISOString()}' where PK = '${artwork.PK}' and SK = '${artwork.SK}'`;
                    //txStatements.push({ "Statement": sql});
                    let updateArtworkResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                    console.log("updateArtworkResult", updateArtworkResult);
                }
            }

            let arVideoTxId;

            // if(artwork && artwork.ar_video_tx_id) {
            //     console.log('using existing video artwork id');
                
            //     arVideoTxId = artwork.ar_video_tx_id;

            //     let expectedVideoFileName = `${artwork.artwork_id}_video.mp4`;
            //     let expectedVideoUrl = `${tableName == process.env.TABLE_NAME ? process.env.S3_URL : process.env.S3_URL_TEST}/videos/${expectedVideoFileName}`;
            //     body.fileName = expectedVideoUrl;  // change to video so that the asset media type is mp4 and not png

            //     console.log("expectedVideoUrl", expectedVideoUrl);
            // }

            metadata = {
                            name: body.name,
                            image: `https://arweave.net/${arTxId}`,
                            description: body.description,
                            // termsOfService: process.env.TOS_URL,
                            publisher: body.artistCode,
                            animation_url: arVideoTxId ? `https://arweave.net/${arVideoTxId}` : undefined,
                            attributes: body.metadata
                        };

            // console.log("metadata", metadata);
            // let _metaBuffer = Buffer.from(JSON.stringify(metadata));
            // let _metaBase64 = _metaBuffer.toString('base64')
            // console.log("_metaBase64", _metaBase64);
            
            // arMetadataUploadResult = await fileUpload({
            //                                 assetId: assetId,
            //                                 isBase64: true,
            //                                 fileData: _metaBase64,
            //                                 fileName: 'metadata.json',
            //                                 fileExtension: 'json',
            //                                 isTest: tableName == process.env.TABLE_NAME_TEST
            //                             });

            // arMetadataUploadResult.localURL = artwork.two_d_url;
        }
        
        // console.log("arMetadataUploadResult", arMetadataUploadResult);


        sql = `select * from "${tableName}"."InvertedIndex" where SK = 'MEMBERWALLET#${member.wallet_address}' and type = 'ASSET' and status = 'MINTING' and store_id = '${body.storeId}'`;
        console.log("minting sql", sql);
        let mintingAssetResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        if(mintingAssetResult.Items.length > 0) {
            let mintingAsset = mintingAssetResult.Items.map(unmarshall)[0];
            console.log("mintingAsset", mintingAsset);
            throw new Error('Asset is already in minting status, cannot mint another asset. assetId: ' + mintingAsset.asset_id);
        }

        let mintResult;
        
        // if(nftPostResult.Success) {
            let action;
            switch(body.nftType) {
                case 'ART':
                    action = 'MINT_METAVERSE_NFT';
                    break;
                case 'CHATDATA':
                    action = 'MINT_CHATDATA_NFT';
                    break;
                case 'MEMBER_IMARITONES':
                case 'MEMBER_ME':
                case 'MEMBER_UKKA':
                case 'MEMBER_2I2':
                case 'MEMBER_KASUMISOUTOSUTERA':
                case 'MEMBER_BABABABAMPI':
                case 'MEMBER_TITLEMITEI':
                case 'MEMBER_DENISUSAFATE':
                case 'MEMBER_STELLINASAYURI':
                    action = 'MINT_MEMBER';
                    break;
                case 'SUPERCHAT':
                    action = 'MINT_SUPERCHAT_NFT';
                    break;
                default:
                    throw new Error("Invalid nftType " + body.nftType);
            }
            mintResult = await web3Mint({
                action: action,
                toAddress: member.wallet_address,
                metadata: metadata,
                chatDataHash: action == 'MINT_CHATDATA_NFT' ? chatDataHash : undefined,
                encryptionKey: encryptionKey ? encryptionKey : '',
                isTest: (tableName == process.env.TABLE_NAME_TEST),
                artistCode: body.artistCode
            });
  
            console.log("mintResult", mintResult);        
            if(mintResult.transactionHash) {
                console.log("minted nft");

                let nftPostResult = await nftPost({
                                        passcode: configs.find(x=>x.key == 'PASSCODE').value,
                                        assetId: assetId,
                                        memberId: body.chatMemberId ? body.chatMemberId : (body.memberId ? body.memberId : member.user_id),
                                        hiddenFile: metadata.image,
                                        nftFile: metadata.animation_url ? metadata.animation_url : metadata.image,    //"ipfs://" + cidNFTFile.metadata.ipnft,
                                        previewImageFile: metadata.image,
                                        metadataFile: undefined,    //`https://arweave.net/${arMetadataUploadResult.metadata.transaction.id}`,
                                        metadata: metadata,
                                        name: body.name,
                                        description: body.description,
                                        storeId: body.storeId,
                                        category: body.category,
                                        subCategory: body.subCategory,
                                        tags: [body.nftType],
                                        royalty: body.royalty,
                                        licenseId: body.licenseId,
                                        fileExtension: body.fileName.split('.').pop(),
                                        nftType: body.nftType,
                                        localURL: undefined, //arMetadataUploadResult.localURL,
                                        encryptionKey: encryptionKey,
                                        chatDataHash: chatDataHash,
                                        chatDataLocalURL: chatDataLocalURL,
                                        artistCode: body.artistCode,
                                        unit: mintResult.unit,  // similar to contract address + token id
                                        policyId: mintResult.policyId,  // similar to contract address
                                        assetName: mintResult.assetNameHex,   // similar to token id
                                    }, headers['origin']);

                console.log("nft post result", nftPostResult);

                if(!nftPostResult.Success) {
                    console.log("Failed to post NFT", nftPostResult.Message);
                    throw new Error(nftPostResult.Message);
                }

                if(body.nftType == 'MEMBER_IMARITONES') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_imaritones_asset_name = '${mintResult.assetNameHex}' , nft_member_imaritones_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_ME') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_me_asset_name = '${mintResult.assetNameHex}' , nft_member_me_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_UKKA') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_ukka_asset_name = '${mintResult.assetNameHex}' , nft_member_ukka_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_2I2') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_2i2_asset_name = '${mintResult.assetNameHex}' , nft_member_2i2_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_KASUMISOUTOSUTERA') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_kasumisoutosutera_asset_name = '${mintResult.assetNameHex}' , nft_member_kasumisoutosutera_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_BABABABAMPI') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_babababampi_asset_name = '${mintResult.assetNameHex}' , nft_member_babababampi_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_TITLEMITEI') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_titlemitei_asset_name = '${mintResult.assetNameHex}' , nft_member_titlemitei_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_DENISUSAFATE') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_denisusafate_asset_name = '${mintResult.assetNameHex}' , nft_member_denisusafate_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'MEMBER_STELLINASAYURI') {
                    sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , nft_member_stellinasayuri_asset_name = '${mintResult.assetNameHex}' , nft_member_stellinasayuri_policy_id = '${mintResult.policyId}' where PK = '${member.PK}' and SK = '${member.SK}' `;
                    txStatements.push({ "Statement": sql});
                }
                else if(body.nftType == 'CHATDATA') {
                    if(body.artistCode == 'IMARITONES') {
                        sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , last_mint_message_id = '${lastMintMessageId}' , nft_member_chatdata_asset_name_imaritones = '${mintResult.assetNameHex}' , nft_member_chatdata_unit_imaritones = '${mintResult.unit}' , nft_member_chatdata_policy_id_imaritones = '${mintResult.policyId}' where PK = '${chatMember.PK}' and SK = '${chatMember.SK}'`;
                    }
                    else if (body.artistCode == 'STELLINASAYURI') {
                        sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , last_mint_message_id = '${lastMintMessageId}' , nft_member_chatdata_asset_name_stellinasayuri = '${mintResult.assetNameHex}' , nft_member_chatdata_unit_stellinasayuri = '${mintResult.unit}' , nft_member_chatdata_policy_id_stellinasayuri = '${mintResult.policyId}' where PK = '${chatMember.PK}' and SK = '${chatMember.SK}'`;
                    }

                    txStatements.push({ "Statement": sql});
                }
                
                if(txStatements.length > 0) {
                    const statements = { "TransactStatements": txStatements };  
                    console.log("statements", JSON.stringify(statements));
                    
                    const dbTxResult = await dbClient.send(new ExecuteTransactionCommand(statements));
                    console.log("update for membership dbResult", dbTxResult);
                }
            }
            else {
                console.log('Failed to mint NFT in blockchain . ブロックチェーンでのNFTの鋳造に失敗しました');
                return {
                    Success: false,
                    Message: "ブロックチェーンでのNFTの鋳造に失敗しました"
                }
            }

            if(body.queueId) {
                let nftResult = {
                    assetName: mintResult.assetNameHex,
                    policyId: mintResult.policyId,
                    unit: mintResult.unit,
                    assetId: assetId,
                    transactionHash: mintResult.transactionHash
                }
                sql = `update "${tableName}" set modified_date = '${new Date().toISOString()}' , result = '${JSON.stringify(nftResult)}' where PK = 'QUEUE#MINT#${body.queueId}' and SK = '${member.SK}'`;
                let updateQueueResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                console.log("updateQueueResult", updateQueueResult);
            }
            
            return {
                Success: true,
                Data: {
                    assetName: mintResult.assetNameHex,
                    policyId: mintResult.policyId,
                    unit: mintResult.unit,
                    assetId: assetId
                }
            }
        // }
        // else {
        //     console.log("Failed to post NFT", nftPostResult.Message);
        //     throw new Error(nftPostResult.Message);
        //     // return {
        //     //     Success: false,
        //     //     Message: nftPostResult.Message
        //     // }
        // }

        // let metadata;

        // if(body.nftType == 'MEMBERSHIP') {
        //     metadata = {
        //         name: "MEMBERSHIP_" + member.user_id,   // This must be unique under the same policy
        //         image: `https://arweave.net/${uploadResultNFTFolder.img1TxId}`,
        //         description: "MEMBERSHIP NFT for " + member.user_id,
        //         publisher: body.artistCode,
        //         attributes: [{
        //             trait_type: "MEMBERSHIP",
        //             value: member.user_id
        //         },
        //         {
        //             trait_type: "USER_ID",
        //             value: member.user_id
        //         }]
        //     }
        // }
        // else if (body.nftType == 'SUPERCHAT') {

        // }
        // else {
        //     throw new Error("Invalid nftType: " + body.nftType);
        // }

        // console.log("metadata", metadata);

        

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-nft-mint-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'TD Error - ada-nft-mint-post - ' + random10DigitNumber,
            Message: `Error in ada-nft-mint-post  ${e.message}\n\nStack trace:\n${e.stack}`,
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