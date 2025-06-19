import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as jose from 'jose';
import md5 from 'md5';
import { ulid } from 'ulid';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

async function fetchAllRecords(sql) {
    let results = [];
    let nextToken;

    do {
        const params = {
            Statement: sql,
            NextToken: nextToken, // Include NextToken if available
        };

        const result = await dbClient.send(new ExecuteStatementCommand(params));

        // Accumulate items from this page
        if (result.Items) {
            results = results.concat(result.Items);
        }

        // Update nextToken for the next iteration
        nextToken = result.NextToken;
    } while (nextToken); // Continue until there's no nextToken

    return results;
}

export const handler = async (event) => {
    console.log("nft enqueue mint event", event);
    
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

        if(body.appPubKey == undefined && token) {
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
            let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
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

            if(body.memberId) {
                console.log('use user account as nft owner');
                
                // replace member with member who we want to sent the NFT to
                sql = `SELECT * FROM "${tableName}" WHERE type = 'MEMBER' and PK = 'MEMBER#${body.memberId}'`;
                memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
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
                console.log('use admin account as nft owner');

                // use super admin account to hold all the NFT minted
                sql = `select * from "${tableName}" where PK = 'MEMBER#LOCAL#admin@td.com' and SK = 'MEMBER_ID#01GJ5XT15FHWPFRN5QJSPXKW0X' and type = 'MEMBER'`;
                memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
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
            return {
                Success: false,
                Code: 1,
                Message: "Missing login info."
            };
        }

        if(body.queueType == 'MINT_QUEUE' && !body.nftType) {
            return {
                Success: false,
                Message: 'nftType is required'
            };
        }

        // if(body.nftType == 'CAR' || body.nftType == 'CHARACTER') {    
        //     if(!body.artworkId && body.queueType != 'UPDATE_QUEUE') {
        //         console.log('artworkId is required');
        //         return {
        //                     Success: false,
        //                     Message: 'artworkId is required'
        //                 };
        //     }
        // }

        if(!body.queueType) {
            return {
                Success: false,
                Message: "queueType is required"
            }
        }

        if(body.queueType != 'MINT_QUEUE' && body.queueType != 'UPGRADE_QUEUE' && body.queueType != 'UPDATE_QUEUE') {
            return {
                Success: false,
                Message: "Invalid queueType"
            }
        }

        if(body.queueType == 'UPGRADE_QUEUE' && !body.unit) {
            return {
                Success: false,
                Message: "unit is required for upgrade membership NFT"
            }
        }

        if(body.queueType == 'UPDATE_QUEUE' && !body.unit) {
            return {
                Success: false,
                Message: "unit is required for update NFT metadata"  // unit is required for update NFT metadata
            }
        }

        if(!body.artistCode) {
            return {
                Success: false,
                Message: "artistCode is required"
            }
        }
        
        // if(!member.discord_user_id) {
        //     console.log('User missing discord id. ' + member.user_id);
        //     return {
        //         Success: false,
        //         Message: 'ユーザーに discord ID がありません。 ' + member.user_id   //User missing discord id.
        //     }
        // }

        // if(body.queueType == 'MINT_QUEUE' && body.nftType == 'CAR') {
        //     let memberContractAddr = (tableName == process.env.TABLE_NAME_COMMUNITY_TEST ? process.env.CONTRACT_ADDRESS_HONDA721M_TEST : process.env.CONTRACT_ADDRESS_HONDA721M);
        //     let membershipNFTsResult = await db.executeStatement({Statement: `SELECT * FROM "${tableName}"."InvertedIndex" WHERE SK = '${member.SK}' and type = 'ASSET' and contract_address = '${memberContractAddr}' and status = 'NOTFORSALE'`}).promise();
        //     console.log("membershipNFTsResult", JSON.stringify(membershipNFTsResult));
        //     if(membershipNFTsResult.Items.length === 0) {
        //         return {
        //             Success: false,
        //             Message: 'Membership NFT not found.'
        //         };
        //     }
        // }
        
        let sql = `select * from "${tableName}"."InvertedIndex" where SK = '${member.SK}' and type = 'QUEUE' and queue_type = '${body.queueType}' and user_id = '${member.user_id}' and nft_type = '${body.nftType}' order by PK desc`;
        console.log("sql", sql);
        let queueResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        if(queueResult.Items.length > 0) {
            if(body.queueType == 'MINT_QUEUE') {
                if(body.nftType == 'CHATDATA') {
                    sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'QUEUE' and queue_type = 'MINT_QUEUE' and nft_type = 'CHATDATA' and chat_member_id = '${body.chatMemberId}'`;
                    let result = await fetchAllRecords(sql);
                    if(result.length > 0) {
                        console.log('Mint request for chat data already exist', body.chatMemberId);
                        return {
                            Success: false,
                            Message: 'Mint request for chat data already exist for memberId ' + body.chatMemberId
                        }
                    }
                }
            }
            
            // if(body.queueType == 'MINT_QUEUE') {
            //     if(body.nftType == 'CAR') {
            //         // for CAR NFT requests
            //         let successQueueItems = queueResult.Items.map(unmarshall).filter(x => x.status == 'SUCCESS');

            //         let memberContractAddr = (tableName == process.env.TABLE_NAME_COMMUNITY_TEST ? process.env.CONTRACT_ADDRESS_HONDA721M_TEST : process.env.CONTRACT_ADDRESS_HONDA721M);
            //         let membershipNFTsResult = await db.executeStatement({Statement: `SELECT * FROM "${tableName}"."InvertedIndex" WHERE SK = '${member.SK}' and type = 'ASSET' and contract_address = '${memberContractAddr}' and status = 'NOTFORSALE'`}).promise();
            //         console.log("membershipNFTsResult", JSON.stringify(membershipNFTsResult));
                    
            //         let BStatus;
            //         let membershipNFTs = membershipNFTsResult.Items.map(unmarshall);
            //         for (let i = 0; i < membershipNFTs.length; i++) {
            //             const memberNFT = membershipNFTs[i];
            //             console.log("memberNFT", memberNFT);
                        
            //             if(memberNFT.store_id == 'HONDA_MEMBERSHIP_B') {
            //                 if(memberNFT.is_gold === true) {
            //                     BStatus = 'GOLD'
            //                 }
            //                 else if(memberNFT.is_silver === true) {
            //                     BStatus = 'SILVER'
            //                 }
            //                 else {
            //                     BStatus = 'BRONZE'
            //                 }
            //             }
            //         }
                    
            //         console.log("BStatus", BStatus);
                    
            //         let maxNFT = 4;
            //         if(BStatus === 'GOLD')
            //             maxNFT = 8;
            //         else if(BStatus === 'SILVER')
            //             maxNFT = 6;
            //         else if(BStatus === 'BRONZE')
            //             maxNFT = 4;
            //         else {
            //             console.log("Invalid membership ranking");
                        
            //             return {
            //                 Success: false,
            //                 Message: 'MetaGarage のメンバーシップ ランキングが無効です'    //Invalid membership ranking for MetaGarage
            //             };
            //         }

            //         if(successQueueItems.length + 1 > maxNFT) {
            //             console.log("Maximum number of NFTs exceeded for your membership ranking. メンバーシップランキングのNFTの最大数を超えました。");
            //             return {
            //                 Success: false,
            //                 Message: "メンバーシップランキングのNFTの最大数を超えました"
            //             }
            //         }
            //     }
            //     else if(body.nftType == 'CHARACTER') { 
                    
            //         let memberWhitelistResult = await db.executeStatement({Statement: `select * from "${tableName}"."InvertedIndex" where SK = '${member.PK}' and type = 'WHITELIST'`}).promise();
            //         console.log("memberWhitelistResult", memberWhitelistResult);
            //         let memberWhiteLists = [];
            //         if(memberWhitelistResult.Items.length > 0) {
            //             memberWhiteLists = memberWhitelistResult.Items.map(unmarshall);
            //         }

            //         if(memberWhiteLists.find(x => x.whitelist_type.includes('PALEBLUEDOT_ADDITIONAL_NFT'))) {

            //         }
            //         else {
            //             let queueItem = queueResult.Items.map(unmarshall)[0];
            //             if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //                 return {
            //                     Success: false,
            //                     Message: "同じNFTを2回鋳造することは出来ません。現在、鋳造中です。鋳造には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //                 }
            //             }
            //             else if(queueItem.status == 'SUCCESS') {
            //                 if(body.nftType != 'CAR') {
            //                     return {
            //                         Success: false,
            //                         Message: "あなたのNFTはすでに正常に鋳造されています。重複したNFTは許可されません。"
            //                     }
            //                 }
            //             }
            //             else if(queueItem.status == 'FAILED') {
            //                 return {
            //                     Success: false,
            //                     Message: "NFT の鋳造に失敗しました。詳細については、キュー メッセージを参照してください。"
            //                 }
            //             }
            //         }
            //     }
            //     else { 
            //         let queueItem = queueResult.Items.map(unmarshall)[0];
            //         if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //             return {
            //                 Success: false,
            //                 Message: "同じNFTを2回鋳造することは出来ません。現在、鋳造中です。鋳造には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //             }
            //         }
            //         else if(queueItem.status == 'SUCCESS') {
            //             if(body.nftType != 'CAR') {
            //                 return {
            //                     Success: false,
            //                     Message: "あなたのNFTはすでに正常に鋳造されています。重複したNFTは許可されません。"
            //                 }
            //             }
            //         }
            //         else if(queueItem.status == 'FAILED') {
            //             return {
            //                 Success: false,
            //                 Message: "NFT の鋳造に失敗しました。詳細については、キュー メッセージを参照してください。"
            //             }
            //         }
            //     }
            // }

            // if(body.queueType == 'UPGRADE_QUEUE' && member.is_gold === true) {
            //     return {
            //         Success: false,
            //         Message: "会員はゴールド会員以上にアップグレードすることはできません" //"Member cannot upgrade more than Gold Membership"
            //     }
            // }

            // if(body.queueType == 'UPDATE_QUEUE') {
            //     if(body.appPubKey && body.nftType == 'CHARACTER') {

            //         let contractAddress= (tableName == process.env.TABLE_NAME_COMMUNITY_TEST ? process.env.CONTRACT_ADDRESS_HONDA721CH_TEST : process.env.CONTRACT_ADDRESS_HONDA721CH);
                    
            //         let assetsResult = await db.executeStatement({Statement: `SELECT * FROM "${tableName}"."${process.env.TABLE_NAME_GSI_INVERTED_INDEX}" WHERE SK = '${member.SK}' and type = 'ASSET' and contract_address = '${contractAddress}' and token_id = '${body.tokenId}'`}).promise();
            //         console.log("assetsResult", JSON.stringify(assetsResult));
            //         if(assetsResult.Items.length === 0) {
            //             console.log('NFT not found. contract address : tokenId : ' + body.tokenId);
                        
            //             return {
            //                 Success: false,
            //                 Message: 'NFT not found. contract address : tokenId : ' + body.tokenId
            //             };
            //         }

            //         let asset = assetsResult.Items.map(unmarshall)[0];

            //         let memberWhitelistResult = await db.executeStatement({Statement: `select * from "${tableName}"."InvertedIndex" where SK = '${member.PK}' and type = 'WHITELIST'`}).promise();
            //         console.log("memberWhitelistResult", memberWhitelistResult);
            //         let memberWhiteLists = [];
            //         if(memberWhitelistResult.Items.length > 0) {
            //             memberWhiteLists = memberWhitelistResult.Items.map(unmarshall);
            //         }

            //         let maxRevealCount = 1;
            //         if(memberWhiteLists.find(x => x.whitelist_type.includes('PALEBLUEDOT_WINNER'))) {
            //             maxRevealCount = 2;
            //         }

            //         if(asset.reveal_count === undefined || asset.reveal_count < maxRevealCount) {

            //             if(memberWhiteLists.find(x => x.whitelist_type.includes('PALEBLUEDOT_ADDITIONAL_NFT'))) {
            //                 let queueItems = queueResult.Items.map(unmarshall);
            //                 let existedQueueItems = queueItems.filter(x => x.token_id == body.tokenId);
                            
            //                 if(existedQueueItems) {
                                
            //                     let queueItem = existedQueueItems[0];

            //                     if(maxRevealCount === 2) {
            //                         if(existedQueueItems.length === 2) {
            //                             if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "同じNFTを2回公開することは出来ません。現在、公開中です。公開には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //                                 }
            //                             }
            //                             else if(queueItem.status == 'SUCCESS') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "あなたのNFTはすでに正常に公開されています。重複したNFTは許可されません。"
            //                                 }
            //                             }
            //                             else if(queueItem.status == 'FAILED') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "NFT の公開に失敗しました。詳細については、キュー メッセージを参照してください。"
            //                                 }
            //                             }
            //                         }
            //                     }
            //                     else {
            //                         if(queueItem) {
            //                             if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "同じNFTを2回公開することは出来ません。現在、公開中です。公開には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //                                 }
            //                             }
            //                             else if(queueItem.status == 'SUCCESS') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "あなたのNFTはすでに正常に公開されています。重複したNFTは許可されません。"
            //                                 }
            //                             }
            //                             else if(queueItem.status == 'FAILED') {
            //                                 return {
            //                                     Success: false,
            //                                     Message: "NFT の公開に失敗しました。詳細については、キュー メッセージを参照してください。"
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             }
            //             else {

            //                 let queueItem = queueResult.Items.map(unmarshall)[0];

            //                 if(maxRevealCount === 2) {
            //                     if(queueResult.Items.length === 2) {
            //                         if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //                             return {
            //                                 Success: false,
            //                                 Message: "同じNFTを2回公開することは出来ません。現在、公開中です。公開には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //                             }
            //                         }
            //                         else if(queueItem.status == 'SUCCESS') {
            //                             return {
            //                                 Success: false,
            //                                 Message: "あなたのNFTはすでに正常に公開されています。重複したNFTは許可されません。"
            //                             }
            //                         }
            //                         else if(queueItem.status == 'FAILED') {
            //                             return {
            //                                 Success: false,
            //                                 Message: "NFT の公開に失敗しました。詳細については、キュー メッセージを参照してください。"
            //                             }
            //                         }
            //                     }
            //                 }
            //                 else {
            //                     if(queueItem.status == 'NEW' || queueItem.status == 'IN_PROGRESS') {
            //                         return {
            //                             Success: false,
            //                             Message: "同じNFTを2回公開することは出来ません。現在、公開中です。公開には、数時間以上かかることがあります。数分経っても発行されない場合はブラウザを閉じてお待ちください。"
            //                         }
            //                     }
            //                     else if(queueItem.status == 'SUCCESS') {
            //                         return {
            //                             Success: false,
            //                             Message: "あなたのNFTはすでに正常に公開されています。重複したNFTは許可されません。"
            //                         }
            //                     }
            //                     else if(queueItem.status == 'FAILED') {
            //                         return {
            //                             Success: false,
            //                             Message: "NFT の公開に失敗しました。詳細については、キュー メッセージを参照してください。"
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //         else {
            //             return {
            //                 Success: false,
            //                 Message: `NFT を公開できるのは ${maxRevealCount} 回だけです` //You only can reveal the NFT once
            //             }
            //         }
            //     }
            // }
        }

        if(body.queueType == 'MINT_QUEUE') {
            if(body.nftType.includes("MEMBER_")) {

                // send welcome message first while waiting for membership nft to finish minting
                let welcomeChannelId;
                let selfIntroChannelId;
                let artistName;
                let chatChannelId;

                if(tableName == process.env.TABLE_NAME) {
                    switch(body.nftType) {
                        case "MEMBER_IMARITONES":
                            welcomeChannelId = "1318411719017762846";
                            selfIntroChannelId = "1318411775497994351";
                            artistName = "Imari Tones";
                            chatChannelId = "1318411811841642496";
                            break;
                        case "MEMBER_ME":
                            welcomeChannelId = "1318417255939309598";
                            selfIntroChannelId = "1318417473728675962";
                            artistName = "ME";
                            chatChannelId = "1318417809025273897";
                            break;
                        case "MEMBER_UKKA":
                            welcomeChannelId = "1318417143372709888";
                            selfIntroChannelId = "1318417362726289498";
                            artistName = "UKKA";
                            chatChannelId = "1318417718768042006";
                            break;
                        case "MEMBER_2I2":
                            welcomeChannelId = "1318417170698342530";
                            selfIntroChannelId = "1318417406065905724";
                            artistName = "2i2";
                            chatChannelId = "1318417736065618033";
                            break;
                        case "MEMBER_DENISUSAFATE":
                            welcomeChannelId = "1318412988637773934";
                            selfIntroChannelId = "1318417334557474827";
                            artistName = "デニス・サファテ";
                            chatChannelId = "1318417673432076339";
                            break;
                        case "MEMBER_TITLEMITEI":
                            welcomeChannelId = "1318417204949024770";
                            selfIntroChannelId = "1318417420901159003";
                            artistName = "タイトル未定";
                            chatChannelId = "1318417753526505613";
                            break;
                        case "MEMBER_KASUMISOUTOSUTERA":
                            welcomeChannelId = "1318417222061920326";
                            selfIntroChannelId = "1318417442376122388";
                            artistName = "かすみ草とステラ";
                            chatChannelId = "1318417767623557162";
                            break;
                        case "MEMBER_BABABABAMPI":
                            welcomeChannelId = "1318417236519550998";
                            selfIntroChannelId = "1318417458478186548";
                            artistName = "ババババンピ";
                            chatChannelId = "1318417789874208859";
                            break;
                        case "MEMBER_STELLINASAYURI":
                            welcomeChannelId = "1363761569137430548";
                            selfIntroChannelId = "1363761635235467295";
                            artistName = "Stellina Sayuri";
                            chatChannelId = "1363761720883019827";
                            break;
                        default:
                            throw new Error("Unsupported nft type: " + body.nftType)
                    }
                }
                else {
                    switch(body.nftType) {
                        case "MEMBER_IMARITONES":
                            welcomeChannelId = "1339584250248167425";
                            selfIntroChannelId = "1339587188005802054";
                            artistName = "Imari Tones";
                            chatChannelId = "1339589387188437094";
                            break;
                        case "MEMBER_ME":
                            welcomeChannelId = "1341118342949371934";
                            selfIntroChannelId = "1341118616984096909";
                            artistName = "ME";
                            chatChannelId = "1341118656473596027";
                            break;
                        case "MEMBER_UKKA":
                            welcomeChannelId = "1341113286946721975";
                            selfIntroChannelId = "1341113340482814064";
                            artistName = "UKKA";
                            chatChannelId = "1341113426323439676";
                            break;
                        case "MEMBER_2I2":
                            welcomeChannelId = "1341114037005455401";
                            selfIntroChannelId = "1341114099735728248";
                            artistName = "2i2";
                            chatChannelId = "1341114151715733604";
                            break;
                        case "MEMBER_DENISUSAFATE": //デニス・サファテ 
                            welcomeChannelId = "1341112433691066489";
                            selfIntroChannelId = "1341112494311084177";
                            artistName = "デニス・サファテ";
                            chatChannelId = "1341112542734323844";
                            break;
                        case "MEMBER_TITLEMITEI":   //タイトル未定
                            welcomeChannelId = "1341115009593376849";
                            selfIntroChannelId = "1341115567201058938";
                            artistName = "タイトル未定";
                            chatChannelId = "1341115616664490035";
                            break;
                        case "MEMBER_KASUMISOUTOSUTERA":    //かすみ草とステラ
                            welcomeChannelId = "1341116318358704128";
                            selfIntroChannelId = "1341116364718342215";
                            artistName = "かすみ草とステラ";
                            chatChannelId = "1341116408922116106";
                            break;
                        case "MEMBER_BABABABAMPI":  //ババババンピ
                            welcomeChannelId = "1341117929797713920";
                            selfIntroChannelId = "1341117970721669140";
                            artistName = "ババババンピ";
                            chatChannelId = "1341118013151383563";
                            break;
                        case "MEMBER_STELLINASAYURI":
                            welcomeChannelId = "1364046715694616698";
                            selfIntroChannelId = "1364046771235459092";
                            artistName = "Stellina Sayuri";
                            chatChannelId = "1364046841255165952";
                            break;
                        default:
                            throw new Error("Unsupported nft type: " + body.nftType)
                    }
                }

                try {
                    const response = await axios.post(`https://discord.com/api/v10/channels/${welcomeChannelId}/messages`, {
                        content: `🎉 こんにちは、${member.display_name}さん！自己紹介を気軽にしてください <#${selfIntroChannelId}>! 🎉
${artistName}について雑談チャンネルで自由に雑談を楽しんでください<#${chatChannelId}>! 
${member.display_name}さんの投稿を楽しみにしています😊`,
                    }, {
                        headers: {
                            "Authorization": `Bot ${configs.find(x => x.key == 'DISCORD_BOT_TOKEN').value}`,
                            "Content-Type": "application/json"
                        }
                    });

                    console.log("response", response);
                    console.log("Message sent successfully!");
                    
                } catch (_err) {
                    console.error("Error sending message:", _err);
                }
            }
        }
        
        let queueId = ulid(); 
        let currentDate = new Date().toISOString();
        sql = `INSERT INTO "${tableName}"
                VALUE { 
                        'PK': 'QUEUE#${body.queueType == 'MINT_QUEUE' ? 'MINT' : (body.queueType == 'UPGRADE_QUEUE' ? 'UPGRADE' : 'UPDATE')}#${queueId}', 
                        'SK': '${member.SK}', 
                        'type': 'QUEUE', 
                        'queue_type': '${body.queueType}',
                        'queue_id': '${queueId}',
                        'user_id': '${member.user_id}',
                        'wallet_address': '${member.wallet_address}',
                        'app_pub_key': '${body.appPubKey ? body.appPubKey : ''}',
                        'token': '${token}',
                        'artist_code': '${body.artistCode}',
                        'nft_type': '${body.nftType ? body.nftType : ''}',`;
        
        //for chat data
        // if(body.messageIds) {
        //     sql += `'message_ids': '${body.messageIds}',`;
        // }
        if(body.messages) {
            sql += `'messages': '${typeof body.messages == 'object' ? JSON.stringify(body.messages) : body.messages}',`;
        }

        // if(body.threadMessageIds) {
        //     sql += `'thread_message_ids': '${body.threadMessageIds}',`;
        // }

        if(body.chatMemberId) {
            sql += `'chat_member_id': '${body.chatMemberId}',`;
        }



        //for upgrade membership nft
        if(body.unit) {
            sql += `'unit': '${body.unit}',`;
        }

        if(body.policyId) {
            sql += `'policy_id': '${body.policyId}',`;
        }


        //for update nft metadata
        if(body.metadata) {
            sql += `'metadata': '${typeof body.metadata == 'object' ? JSON.stringify(body.metadata) : body.metadata}',`;
        }

        if(body.artworkId) {
            sql += `'artwork_id': '${body.artworkId}',`;
        }

        if(body.artworkId2) {
            sql += `'artwork_id_2': '${body.artworkId2}',`;
        }

        if(body.artworkId3) {
            sql += `'artwork_id_3': '${body.artworkId3}',`;
        }

        sql += `'status': 'NEW', 'created_date': '${currentDate}'}`;

        console.log("sql", sql);

        let enqueueResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        console.log("enqueueResult", enqueueResult);

        return {
            Success: true,
            Data: {
                queueId: queueId
            }
        }
        
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

        console.error('error in ada-nft-queue-en-post ' + random10DigitNumber, e);
        
        const message = {
            Subject: 'ADA Error - ada-nft-queue-en-post - ' + random10DigitNumber,
            Message: `Error in ada-nft-queue-en-post: ${e.message}\n\nStack trace:\n${e.stack}`,
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