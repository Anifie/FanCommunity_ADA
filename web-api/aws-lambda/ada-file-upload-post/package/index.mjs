import Arweave from 'arweave';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const fetchPkg = await import('node-fetch');
globalThis.fetch = fetchPkg.default;
globalThis.Headers = fetchPkg.Headers;
globalThis.Request = fetchPkg.Request;
globalThis.Response = fetchPkg.Response;

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });
// const sns = new AWS.SNS();

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});


function getFileMIME(fileExtension) {
    console.log("fileExtension",fileExtension);
    
    var mimeType;
    switch (fileExtension.toLowerCase()) {

        case 'json':
            mimeType = 'application/json';
            break;

        case 'png':
            mimeType = 'image/png';
            break;

        case 'gif':
            mimeType = 'image/gif';
            break;
        
        case 'jpe':
        case 'jpg':
        case 'jpeg':
            mimeType = 'image/jpeg';
            break;
            
        case 'webp':
            mimeType = 'image/webp';
            break;
            
        case 'svg':
            mimeType = 'image/svg+xml';
            break;
            
        case 'unity3d':
            mimeType = 'application/vnd.unity';
            break;
            
        case 'mp3':
            mimeType = 'audio/mp3';
            break;
            
        case 'mp4':
            mimeType = 'video/mp4';
            break;

        case 'txt':
            mimeType = 'text/plain';
            break;

        case 'gltf':
            mimeType = 'model/gltf+json';
            break;

        case 'glb':
            mimeType = 'model/gltf-binary';
            break;

        case 'fbx':
            mimeType = 'application/fbx';
            break;

        case 'html':
            mimeType = 'text/html';
            break;
            
        case 'bin':
            mimeType = 'application/octet-stream';
            break;
            
        default:
            throw Error('Unexpected file type');
    }
    
    return mimeType;
}

async function uploadFile(dataBuffer, fileName, walletPath) {
    try {
      // Read the wallet key file
      const wallet = JSON.parse(await fs.readFile(walletPath, 'utf8'));
      console.log("wallet", wallet);
      
  
      // Create a transaction
      const transaction = await arweave.createTransaction({ data: dataBuffer }, wallet);
      console.log("transaction", transaction);
      
  
      // Add tags to the transaction (optional)
      const mimeType = getFileMIME(fileName.split('.').pop());
      transaction.addTag('Content-Type', mimeType);
  
      // Sign the transaction
      await arweave.transactions.sign(transaction, wallet);
  
      // Submit the transaction
      const response = await arweave.transactions.post(transaction);
  
      console.log('Transaction ID:', transaction.id);
      console.log('Response status:', response.status);
  
      return {
        transaction: transaction,
        response: response
      }

    } catch (error) {
      console.error('Error uploading file to arweave:', error);
    }
}

export const handler = async (event) => {
    
    console.log(event);
    
    const { S3URL, S3BucketName, SNSTopic, fileData, fileName, fileExtension, params, isBase64, assetId, skipNFTStorage, isURL} = typeof event.body == 'string' ? JSON.parse(event.body) : event.body;
    console.log("fileName", fileName);
    console.log("fileExtension", fileExtension);
    console.log("params", params);
    console.log("isBase64", isBase64);
    console.log("isURL", isURL);
    console.log("assetId", assetId);
    console.log("skipNFTStorage", skipNFTStorage);
    
    try {

        let arUploadResult;

        if(skipNFTStorage === true) {            
            console.log("skipNFTStorage", skipNFTStorage);
        }
        else {
            if(isBase64) {
                arUploadResult = await uploadFile(Buffer.from(fileData, 'base64'), `${fileName}`, './VEI2V1p5I2QftimS7ywLEIlbyPzizN92-uamhYwK1dk.json');
            }
            else if(isURL) {
                const response = await axios.get(fileData, {
                                                                responseType: 'arraybuffer' // Important to get the data as a buffer
                                                            });
                arUploadResult = await uploadFile(Buffer.from(response.data, 'binary'), `${fileName}`, './VEI2V1p5I2QftimS7ywLEIlbyPzizN92-uamhYwK1dk.json');
            }
            else {
                arUploadResult = await uploadFile(Buffer.from(fileData), `${fileName}`, './VEI2V1p5I2QftimS7ywLEIlbyPzizN92-uamhYwK1dk.json');
            }
            
            console.log("arweave arUploadResult", arUploadResult);    

            // delete unnecessary property to reduce response size
            if(arUploadResult.transaction && arUploadResult.transaction.data)
                delete arUploadResult.transaction.data;

            if(arUploadResult.transaction && arUploadResult.transaction.chunks)
                delete arUploadResult.transaction.chunks;
        }
        
        if(isBase64 && fileExtension != 'bin' && fileExtension != 'json' && fileExtension != 'html' && fileExtension != 'txt') {
            // backup image in our S3
            // Decode base64 string to buffer
            const imageBuffer = Buffer.from(fileData, 'base64');

            // Set a unique filename for the S3 object (you might want to enhance this logic)
            const _fileName = `image_${assetId}.` + fileExtension;

            // Specify S3 bucket and key
            const bucketName = S3BucketName;    //isTest ? process.env.BUCKET_NAME_TEST : process.env.BUCKET_NAME; //'your-s3-bucket-name';

            const mimeType = getFileMIME(fileExtension);
            // console.log("mime type", mimeType);

            let _fileData = {
                                Bucket: bucketName,
                                Key: "images/" + _fileName, 
                                Body: imageBuffer,
                                ContentType: mimeType,
                                ACL: 'public-read'
                            };

            let uploadResult = await s3Client.send(new PutObjectCommand(_fileData));
            console.log("uploadResult", uploadResult);

            const imageURL = `${S3URL + "/images/" + _fileName}`;    //`${(isTest ? process.env.S3_URL_TEST : process.env.S3_URL) + "/" + _fileName}`;

            if(skipNFTStorage === true) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', localURL: imageURL, mimeType: mimeType }),
                };
            }
            else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', metadata: arUploadResult, localURL: imageURL, mimeType: mimeType }),
                };
            }
        }
        else if(isBase64 && fileExtension == 'json') {
            
            const imageBuffer = Buffer.from(fileData, 'base64');

            // Set a unique filename for the S3 object (you might want to enhance this logic)
            const _fileName = `json_${assetId}.` + fileExtension;

            // Specify S3 bucket and key
            const bucketName = S3BucketName;    //isTest ? process.env.BUCKET_NAME_TEST : process.env.BUCKET_NAME; //'your-s3-bucket-name';

            const mimeType = getFileMIME(fileExtension);
            // console.log("mime type", mimeType);

            let _fileData = {
                                Bucket: bucketName,
                                Key: "json/" + _fileName, 
                                Body: imageBuffer,
                                ContentType: mimeType,
                                ACL: 'public-read'
                            };

            let uploadResult = await s3Client.send(new PutObjectCommand(_fileData));
            console.log("uploadResult", uploadResult);

            const jsonURL = `${S3URL + "/json/" + _fileName}`;    //`${(isTest ? process.env.S3_URL_TEST : process.env.S3_URL) + "/" + _fileName}`;

            if(skipNFTStorage === true) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', localURL: jsonURL, mimeType: mimeType }),
                };
            }
            else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', metadata: arUploadResult, localURL: jsonURL, mimeType: mimeType }),
                };
            }
        }

        else if(isBase64 && fileExtension == 'txt') {
            
            const imageBuffer = Buffer.from(fileData, 'base64');

            // Set a unique filename for the S3 object (you might want to enhance this logic)
            const _fileName = `txt_${assetId}.` + fileExtension;

            // Specify S3 bucket and key
            const bucketName = S3BucketName;    //isTest ? process.env.BUCKET_NAME_TEST : process.env.BUCKET_NAME; //'your-s3-bucket-name';

            const mimeType = getFileMIME(fileExtension);
            // console.log("mime type", mimeType);

            let _fileData = {
                                Bucket: bucketName,
                                Key: "txt/" + _fileName, 
                                Body: imageBuffer,
                                ContentType: mimeType,
                                ACL: 'public-read'
                            };

            let uploadResult = await s3Client.send(new PutObjectCommand(_fileData));
            console.log("uploadResult", uploadResult);

            const txtURL = `${S3URL + "/txt/" + _fileName}`;    //`${(isTest ? process.env.S3_URL_TEST : process.env.S3_URL) + "/" + _fileName}`;

            if(skipNFTStorage === true) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', localURL: txtURL, mimeType: mimeType }),
                };
            }
            else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File saved successfully.', metadata: arUploadResult, localURL: txtURL, mimeType: mimeType }),
                };
            }
        }
        else {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'File saved successfully.', metadata: arUploadResult}),
            };
        }
        
    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

        console.error('error in ada-file-upload-post' + random10DigitNumber, e);
        
        const message = {
            Subject: 'ADA Error - ada-file-upload-post - ' + random10DigitNumber,
            Message: `Error in ada-file-upload-post: ${e.message}\n\nStack trace:\n${e.stack}`,
            TopicArn: SNSTopic
        };
        
        await snsClient.send(new PublishCommand(message));
        
        const response = {
            Success: false,
            Message: 'エラーが発生しました。管理者に連絡してください。Code: ' + random10DigitNumber
        };
        
        return response;
    }
};