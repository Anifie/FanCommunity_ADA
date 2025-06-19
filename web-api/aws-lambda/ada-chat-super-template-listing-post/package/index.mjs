import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });


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


// function ToArtwork(obj) {
//     console.log("ToArtwork", obj);
    
//     return {
//         ArtworkId: obj.artwork_id,
//         MemberId: obj.user_id,
//         ArtworkType: obj.artwork_type,
//         Category: obj.category,
//         SubCategory: obj.sub_category,
//         Components: obj.components ? JSON.parse(obj.components) : undefined,
//         NameEN: obj.name_en,
//         ValueEN: obj.value_en,
//         NameJP: obj.name_jp,
//         ValueJP: obj.value_jp,
//         Metadata: obj.metadata ? JSON.parse(obj.metadata) : undefined,
//         Status: obj.status,
//         TwoDURL: obj.two_d_url,
//         TwoDMIME: obj.two_d_mime,
//         TwoDURL_2: obj.two_d_url_2,
//         TwoDMIME_2: obj.two_d_mime_2,
//         TwoDURL_3: obj.two_d_url_3,
//         TwoDMIME_3: obj.two_d_mime_3,
//         ThreeDURL: obj.three_d_url,
//         ThreeDMIME: obj.three_d_mime,
//         CreatedDate: obj.created_date,
//         LikeStamp: obj.like_stamp
//     }
// }

async function ToSuperChat(tableName, obj) {
    let  result = {
        SuperChatTemplateId: obj.super_chat_template_id,
        Name: obj.name,
        MinAmount: obj.amount_min,
        MaxAmount: obj.amount_max,
        Currency: obj.currency,
        // ArtworkId: obj.artwork_id,
        Color: obj.color,
        DurationInMinutes: obj.duration_in_minutes,
        CreatedDate: obj.created_date
    }

    // if(obj.artwork_id) {
    //     let sql = `select * from "${tableName}" where PK = '${'ARTWORK#' + obj.artwork_id}' and type = 'ARTWORK'`;
    //     console.log("sql", sql);
        
    //     let artwork = await fetchAllRecords(sql);
    //     artwork = artwork.map(item => unmarshall(item));
    //     console.log("artwork", artwork);
    //     artwork = artwork[0];
    //     result.Artwork = ToArtwork(artwork);
    // }

    return result;
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


        // let token = headers['authorization'];
        // console.log("token", token);

        // let memberId = null;
        // let member;

        // if (!body.appPubKey && token) {
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

        let singleRecord = false;

        let sql = `SELECT * FROM "${tableName}"."ByTypeCreatedDate" WHERE type = 'SUPERCHAT_TEMPLATE' order by created_date DESC`;
        console.log("sql", sql);

        let superChatTemplatesResult = await fetchAllRecords(sql);
        let superChatTemplates = superChatTemplatesResult.map(x => unmarshall(x));
        // let _superChatTemplates = superChatTemplates.map(x => ToSuperChat(x));
        let _superChatTemplates = await Promise.all(superChatTemplates.map(async(a) => await ToSuperChat(tableName, a)));

        return {
            Success: true,
            Data: {
                superChatTemplates: _superChatTemplates
            }
        };

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-super-template-listing-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-super-template-listing-post- ' + random10DigitNumber,
            Message: `Error in ada-chat-super-template-listing-post ${e.message}\n\nStack trace:\n${e.stack}`,
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