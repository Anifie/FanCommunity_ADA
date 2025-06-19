import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import ULID from 'ulid';
import axios from 'axios';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

let tableName;
let configs;

function ToDiscordMessage(obj) {
    console.log("ToDiscordMessage", obj);
    
    /*
    let msg = {
        DiscordUserId: obj.user_id,
        DiscordUserName: obj.username,
        ChannelId: obj.channel_id,
        ChannelName: obj.channel_name,
        Timestamp: obj.timestamp,
        MessageId: obj.message_id,
        Message: obj.message
    };
    */

    let msg = {
        DiscordUserId: obj.discord_user_id,
        ChannelId: obj.discord_channel_id,
        // ChannelName: obj.channel_name,
        Timestamp: obj.timestamp,
        MessageId: obj.discord_message_id,
        Message: obj.content
    };

    return msg;
}

async function getWidgetBotMessages(userId, widgetbotAPIKey) {
    console.log("getWidgetBotMessages");
    let response = await axios.post('https://ext-s-anifie.widgetbot.co/api/messages',
                        JSON.stringify({
                            "userId": userId
                        }),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Widgetbot-External': widgetbotAPIKey
                            }
                        }
                    );
    console.log('getWidgetBotMessages jsonResult', response.data);
    return response.data;
}

async function getDiscordMessage(channelId, messageId, botToken) {
    console.log("getDiscordMessage", channelId, messageId, botToken);
    try {
        let response = await axios.get(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bot ${botToken}`
                }
            }
        );
        console.log('getDiscordMessage jsonResult', response.data);
        return response.data;
    } catch (error) {
        console.error("Error in getDiscordMessage:", error);
        return null;
    }
    
}

const enQueuePost = async (params, origin, adminToken) => {
    console.log("enQueuePost", params, origin, adminToken);
    let response = await axios.post(configs.find(x => x.key == 'API_URL').value + '/nft/queue',
                        JSON.stringify(params),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'origin': origin,
                                'authorization': `Bearer ${adminToken}`
                            }
                        }
                    );
    console.log('enQueuePost jsonResult', response.data);
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

const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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


        // let token = headers['authorization'];
        // console.log("token", token);

        // let memberId = null;
        // let member;

        // if (token) {
        //     try {
        //         const decoded = jwt.verify(token.split(' ')[1], configs.find(x=>x.key == 'JWT_SECRET').value);
        //         console.log("decoded", decoded);

        //         memberId = decoded.MemberId;

        //         if (Date.now() >= decoded.exp * 1000) {
        //             return {
        //                 Success: false,
        //                 Message: "Token expired"
        //             };
        //         }
        //     } catch (e) {
        //         console.log("error verify token", e);
        //         return {
        //             Success: false,
        //             Message: "Invalid token."
        //         };
        //     }

        //     let sql = `SELECT * FROM "${tableName}"."InvertedIndex" WHERE SK = 'MEMBER_ID#${memberId}' AND type = 'MEMBER' AND begins_with("PK", 'MEMBER#')`;
        //     let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
        //     if (memberResult.Items.length === 0) {
        //         console.log("member not found: " + memberId);
        //         return {
        //             Success: false,
        //             Message: "member not found: " + memberId
        //         };
        //     }
        //     member = memberResult.Items.map(item => unmarshall(item))[0];

        //     if (!member.role?.includes('ADMIN')) {
        //         return {
        //             Success: false,
        //             Message: "Unauthorized access"
        //         };
        //     }

        // } else {
        //     return {
        //         Success: false,
        //         Message: "Missing login info"
        //     };
        // }

        let sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'MEMBER'`;
        let membersResult = await fetchAllRecords(sql);
        let members = membersResult.map(unmarshall);

        sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'DISCORD_MESSAGE' order by created_date DESC`;
        let memberMessagesResult = await fetchAllRecords(sql);
        let memberMessages = memberMessagesResult.map(unmarshall);

        sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'DISCORD_CHANNEL' and SK = 'DISCORD_CHANNEL'`;
        let discordChannelResult = await fetchAllRecords(sql);
        let discordChannels = discordChannelResult.map(unmarshall);
        let imaritonesChannelIds = [];
        let stellinaSayuriChannelIds = [];
        for (let i = 0; i < discordChannels.length; i++) {
            const discordChannel = discordChannels[i];
            const rawChannel = JSON.parse(discordChannel.raw_channel);
            if(rawChannel.parent_id == configs.find(x => x.key == 'DISCORD_CATEGORY_ID_IMARITONES').value) {
                imaritonesChannelIds.push(discordChannel.discord_channel_id);
            }
            else if(rawChannel.parent_id == configs.find(x => x.key == 'DISCORD_CATEGORY_ID_STELLINASAYURI').value) {
                stellinaSayuriChannelIds.push(discordChannel.discord_channel_id);
            }
        }

        console.log("imaritonesChannelIds", imaritonesChannelIds);
        console.log("stellinaSayuriChannelIds", stellinaSayuriChannelIds);
        
        

        // sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'CHATCHANNEL_MESSAGE' order by created_date DESC`;
        // let memberMessagesResult = await fetchAllRecords(sql);
        // let memberMessages = memberMessagesResult.Items.map(item => unmarshall(item));

        // // sql = `select * from "${tableName}"."ByTypeCreatedDate" where type = 'CHATCHANNEL_THREADMESSAGE' order by created_date DESC`;
        // // let memberThreadMessagesResult = await fetchAllRecords(sql);
        // // let memberThreadMessages = memberThreadMessagesResult.Items.map(item => unmarshall(item));
        
        for (let i = 0; i < members.length; i++) {

            const member = members[i];

            console.log("member", member);
            
            if(!member.discord_user_id) {
                let widgetbotMessages = await getWidgetBotMessages(member.user_id, configs.find(x => x.key == 'WIDGETBOT_APIKEY').value);
                if(widgetbotMessages && widgetbotMessages.length > 0) {
                    for (let j = 0; j < widgetbotMessages.length; j++) {
                        let widgetbotMsg = widgetbotMessages[j];
                        let msg = await getDiscordMessage(widgetbotMsg.channelId, widgetbotMsg.id, configs.find(x => x.key == 'DISCORD_BOT_TOKEN').value);
                        await sleep(2000);  // delay to avoid rate limit imposed by Discord
                        if(msg) {
                            sql = `update "${tableName}" set modified_date = '${new Date()}' , discord_user_id = '${msg.author.id}' where PK = '${member.PK}' and SK = '${member.SK}'`;
                            console.log("sql", sql);
                            let updateMemberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                            console.log("updateMemberResult", updateMemberResult);

                            member.discord_user_id = msg.author.id;

                            break;
                        }
                        // else {
                        //     console.log("discord msg not found");
                        // }
                    }

                    // let latestMessage = widgetbotMessages[widgetbotMessages.length - 1];
                    // let latestDiscordMessage = await getDiscordMessage(latestMessage.channelId, latestMessage.id, configs.find(x => x.key == 'DISCORD_BOT_TOKEN').value);

                    // if(latestDiscordMessage) {
                    //     sql = `update "${tableName}" set modified_date = '${new Date()}' , discord_user_id = '${latestDiscordMessage.author.id}' where PK = '${member.PK}' and SK = '${member.SK}'`;
                    //     console.log("sql", sql);
                    //     let updateMemberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
                    //     console.log("updateMemberResult", updateMemberResult);

                    //     member.discord_user_id = latestDiscordMessage.author.id;
                    // }
                    // else {
                    //     console.log("latestDiscordMessage not found");
                    // }
                }
            }

            const _memberMessages = memberMessages.filter(x => x.discord_user_id == member.discord_user_id || x.discord_user_id == member.discord_user_id_real)
                                                  .sort((a, b) => a.discord_message_id - b.discord_message_id); // oldest to newest
            console.log("_memberMessages", _memberMessages);
            
            let messagesToMint = [];
            let messagesToUpdate = [];

            if(member.last_mint_message_id && _memberMessages.filter(x => x.discord_message_id > member.last_mint_message_id).length > 0) {
                messagesToUpdate = _memberMessages.map(x => ToDiscordMessage(x));
                console.log("messagesToUpdate", messagesToUpdate);
            }
            else if(!member.last_mint_message_id) {
                messagesToMint = _memberMessages.map(x => ToDiscordMessage(x));
                console.log("messagesToMint", messagesToMint);
            }

            if(messagesToMint.length > 0) {

                let imaritonesMessages = [];
                let stellinaSayuriMessages = [];
                for (let j = 0; j < messagesToMint.length; j++) {
                    const msg = messagesToMint[j];
                    if(imaritonesChannelIds.includes(msg.ChannelId)) {
                        imaritonesMessages.push(msg);
                    }
                    else if(stellinaSayuriChannelIds.includes(msg.ChannelId)) {
                        stellinaSayuriMessages.push(msg);
                    }
                }

                console.log("imaritonesMessages", imaritonesMessages);
                console.log("stellinaSayuriMessages", stellinaSayuriMessages);
                

                let adminToken = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });

                if(imaritonesMessages.length > 0) {
                    let resp = await enQueuePost({
                        "nftType": "CHATDATA"
                        ,"queueType": "MINT_QUEUE"
                        ,"messages": messagesToMint
                        , "chatMemberId": member.user_id
                        , "memberId": member.user_id    // use member wallet as the chat data NFT owner. without this, the NFT will be owned by admin wallet
                        , "artistCode": "IMARITONES"
                    }, headers['origin'], adminToken);
                    console.log("resp", resp);
                }
                else if(stellinaSayuriMessages.length > 0) {
                    let resp = await enQueuePost({
                        "nftType": "CHATDATA"
                        ,"queueType": "MINT_QUEUE"
                        ,"messages": messagesToMint
                        , "chatMemberId": member.user_id
                        , "memberId": member.user_id    // use member wallet as the chat data NFT owner. without this, the NFT will be owned by admin wallet
                        , "artistCode": "STELLINASAYURI"
                    }, headers['origin'], adminToken);
                    console.log("resp", resp);
                }                
            }

            if(messagesToUpdate.length > 0) {

                let imaritonesMessages = [];
                let stellinaSayuriMessages = [];
                for (let j = 0; j < messagesToUpdate.length; j++) {
                    const msg = messagesToUpdate[j];
                    if(imaritonesChannelIds.includes(msg.discord_channel_id)) {
                        imaritonesMessages.push(msg);
                    }
                    else if(stellinaSayuriChannelIds.includes(msg.discord_channel_id)) {
                        stellinaSayuriMessages.push(msg);
                    }
                }

                let adminToken = jwt.sign({ MemberId: '01GJ5XT15FHWPFRN5QJSPXKW0X' }, configs.find(x=>x.key=='JWT_SECRET').value, { expiresIn: '1440m' });
                if(imaritonesMessages.length > 0) {
                    let resp = await enQueuePost({
                        "nftType": "CHATDATA"
                        ,"queueType": "UPDATE_QUEUE"
                        ,"messages": messagesToUpdate
                        , "chatMemberId": member.user_id
                        , "memberId": member.user_id    // use member wallet as the chat data NFT owner. without this, the NFT will be owned by admin wallet
                        , "unit": member.nft_member_chatdata_unit_imaritones
                        , "policyId": member.nft_member_chatdata_policy_id_imaritones
                        , "artistCode":  "IMARITONES"
                    }, headers['origin'], adminToken);
                    console.log("resp", resp);
                }
                else if (stellinaSayuriMessages.length > 0) {
                    let resp = await enQueuePost({
                        "nftType": "CHATDATA"
                        ,"queueType": "UPDATE_QUEUE"
                        ,"messages": messagesToUpdate
                        , "chatMemberId": member.user_id
                        , "memberId": member.user_id    // use member wallet as the chat data NFT owner. without this, the NFT will be owned by admin wallet
                        , "unit": member.nft_member_chatdata_unit_stellinasayuri
                        , "policyId": member.nft_member_chatdata_policy_id_stellinasayuri
                        , "artistCode":  "STELLINASAYURI"
                    }, headers['origin'], adminToken);
                    console.log("resp", resp);
                }
            }

            // const _memberMessages = memberMessages.filter(x => x.discord_user_id == member.discord_user_id);
            // // const _memberMessages = memberMessages.filter(x => x.sender_user_id == member.user_id);
            // // // const _memberThreadMessages = memberThreadMessages.filter(x => x.sender_user_id == member.user_id);
            
            // let messageIdsToMint = [];
            // let messageIdsToUpdate = [];
            // // let threadMessageIdsToMint = [];
            // // let threadMessageIdsToUpdate = [];

            // if(member.last_mint_message_id && member.last_mint_message_id < _memberMessages[0].discord_message_id) {
            //     messageIdsToUpdate = _memberMessages.map(x => x.discord_message_id);    //_memberMessages.filter(x => x.message_id > member.last_mint_message_id).map(x => x.message_id);
            // }
            // else if(!member.last_mint_message_id) {
            //     messageIdsToMint = _memberMessages.map(x => x.discord_message_id);
            // }

            // // if(member.last_mint_thread_message_id && member.last_mint_thread_message_id < _memberThreadMessages[0].thread_message_id) {
            // //     threadMessageIdsToUpdate = _memberThreadMessages.map(x => x.thread_message_id);   //_memberThreadMessages.filter(x => x.thread_message_id > member.last_mint_thread_message_id).map(x => x.thread_message_id);
            // // }
            // // else if(!member.last_mint_thread_message_id) {
            // //     threadMessageIdsToMint = _memberThreadMessages.map(x => x.thread_message_id);
            // // }

            // //if(messageIdsToMint.length > 0 || threadMessageIdsToMint.length > 0) {
            // if(messageIdsToMint.length > 0) {
            //     let resp = await enQueueMintPost({
            //         "nftType": "CHATDATA"
            //         ,"queueType": "MINT_QUEUE"
            //         ,"messageIds": messageIdsToMint.length > 0 ? messageIdsToMint.join(',') : undefined
            //         // ,"threadMessageIds": threadMessageIdsToMint.length > 0 ? threadMessageIdsToMint.join(',') : undefined
            //         , "chatMemberId": member.user_id
            //     }, headers['origin']);
            //     console.log("resp", resp);
            // }

            // //if(messageIdsToUpdate.length > 0 || threadMessageIdsToUpdate.length > 0) {
            // if(messageIdsToUpdate.length > 0) {
            //     let resp = await enQueueMintPost({
            //         "nftType": "CHATDATA"
            //         ,"queueType": "UPDATE_QUEUE"
            //         ,"messageIds": messageIdsToUpdate.length > 0 ? messageIdsToUpdate.join(',') : undefined
            //         // ,"threadMessageIds": threadMessageIdsToUpdate.length > 0 ? threadMessageIdsToUpdate.join(',') : undefined
            //         , "chatMemberId": member.user_id
            //     }, headers['origin']);
            //     console.log("resp", resp);
            // }
        }

        return {
            Success: true
        };

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-data-mint-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-data-mint-post- ' + random10DigitNumber,
            Message: `Error in ada-chat-data-mint-post ${e.message}\n\nStack trace:\n${e.stack}`,
            TopicArn: configs.find(x=>x.key == 'SNS_TOPIC_ERROR').value
        };
        
        // if(tableName == process.env.TABLE_NAME)
        //     await snsClient.send(new PublishCommand(message));
    
        return {
            Success: false,
            Message: 'エラーが発生しました。管理者に連絡してください。Code: ' + random10DigitNumber
        };
    }
};    