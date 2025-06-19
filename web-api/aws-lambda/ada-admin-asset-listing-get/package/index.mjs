import { DynamoDBClient, ExecuteStatementCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
// import jwt from 'jsonwebtoken';


const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

function ToAsset(a) {
    return {
        Name: a.name,
        //Description: a.description,
        ThumbnailURL: a.asset_thumbnail_url,
        URL: a.asset_url,
        PolicyId: a.policy_id,
        Unit: a.unit,
        AssetName: a.asset_name,
        Metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
        // ContractAddress: a.contract_address,
        // TokenId: a.token_id,
        Status: a.status,
        AssetId: a.asset_id,
        MaxSupply: a.max_supply,
        MetadataURL: a.metadata_url,
        RoyaltiesPercentage: a.royalties_percentage,
        Tags: a.tags,
        AssetType: a.asset_type,
        Category: a.category_name,
        Liked: a.liked_count,
        OwnerAddress: a.owner_address,
        // MemberId: '',
        NFTType: a.nft_type,
        Revealed: a.is_revealed == undefined ? false : a.is_revealed,        
        Metadata: a.metadata,
        CreatedDate: a.created_date,
        OwnerUserId: a.owner_user_id,
        NFTURL: a.nft_url,
        MediaType: a.media_type
    };
}

export const handler = async (event) => {
    
    console.log("admin asset listing get event", event);
    
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
        let configResult = await dbClient.send(new ExecuteStatementCommand({Statement: `SELECT * FROM "${tableName}" WHERE PK = 'CONFIG'`}));

        configs = configResult.Items.map(unmarshall);
        console.log("configs", configs);

        if(body.pageSize === undefined){
            const response = {
                Success: false,
                Message: 'pageSize is required',
            };
            return response;
        }
    
        var sql = `SELECT * FROM "${tableName}"."ByTypeCreatedDate"`;
        sql += ` WHERE type = 'ASSET'`;

        if(body.assetName !== undefined && body.assetName !== ''){
            sql += ` AND contains("name" , '${body.assetName}')`;
        }

        if(body.assetType !== undefined && body.assetType !== ''){
            sql += ` AND asset_type = '${body.assetType}'`;
        }

        if(body.revealed === true ){
            sql += ` AND is_revealed = ${body.revealed}`;
        }

        if(body.contractAddress !== undefined && body.contractAddress !== ''){
            sql += ` AND contract_address = '${body.contractAddress}'`;
        }

        if(body.tokenId !== undefined && body.tokenId !== ''){
            sql += ` AND token_id = '${body.tokenId}'`;
        }

        if(body.status !== undefined && body.status !== ''){
            sql += ` AND status = '${body.status}'`;
        }
        else {
            sql += ` AND status <> 'DELETED'`;
        }

        if(body.category !== undefined && body.category !== ''){
            sql += ` AND category_name = '${body.category}'`;
        }

        if(body.authorAddress !== undefined && body.authorAddress !== ''){
            sql += ` AND author_address = '${body.authorAddress}'`;
        }

        if(body.ownerAddress !== undefined && body.ownerAddress !== ''){
            sql += ` AND owner_address = '${body.ownerAddress}'`;
        }

        if(body.mediaType !== undefined && body.mediaType !== ''){
            sql += ` AND media_type = '${body.mediaType}'`;
        }
        
        if(body.lastKey !== undefined && body.lastKey !== ''){
            sql += ` AND created_date < '${body.lastKey}'`;
        }

        sql += ` ORDER BY created_date DESC`;

        console.log("sql", sql);

        var nextToken = null;
        var allAssets = [];
        var maxAttempts = 40;    // max page size
        var attempt = 0;
        var assetResult = null;
        while (attempt < maxAttempts) {
            assetResult = await dbClient.send(
                new ExecuteStatementCommand({
                    Statement: sql,
                    NextToken: nextToken,
                    Limit: +body.pageSize
                })
            );

            nextToken = assetResult.NextToken;
            const assets = assetResult.Items.map(unmarshall);
            allAssets.push(...assets);

            attempt++;

            if (!nextToken || allAssets.length >= body.pageSize) break;
        }
        
        const response = {
            Success: true,
            Data: { 
                    assets: allAssets.map(a => ToAsset(a)), 
                    nextToken: nextToken 
                }
        };
        
        return response;
        
    } catch (e) {
        console.error('error in ada-admin-asset-listing-get', e);
        
        const response = {
            Success: false,
            Message: JSON.stringify(e),
        };
        
        return response;
    }
    
};