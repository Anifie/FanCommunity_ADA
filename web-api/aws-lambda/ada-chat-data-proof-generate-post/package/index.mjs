import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import md5 from 'md5';
import ULID from 'ulid';
import { MerkleTree } from 'merkletreejs';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs/promises';
import { groth16, wtns } from 'snarkjs';
import OpenAI from 'openai';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

// const enQueueMintPost = async (params, origin) => {
//     console.log("enQueueMintPost", params);
//     let response = await axios.post(process.env.API_URL + '/nft/queue',
//                         JSON.stringify(params),
//                         {
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'origin': origin
//                             }
//                         }
//                     );
//     console.log('enQueueMintPost jsonResult', response.data);
//     return response.data;
// }

const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest();
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

// const fetchTextFileAsCharArray = async (url) => {
//     try {
//         // Fetch the content of the text file
//         const response = await axios.get(url, { responseType: "text" });

//         // Ensure the response contains text data
//         if (response.headers['content-type']?.includes('text/plain')) {
//             // Convert the text content into an array of characters
//             const charArray = Array.from(response.data);

//             console.log("Array of Characters:", charArray);
//             return charArray;
//         } else {
//             throw new Error("The URL does not contain a plain text file.");
//         }
//     } catch (error) {
//         console.error("Error fetching the text file:", error.message);
//         throw error;
//     }
// };


const fetchTextFileAsWordsArray = async (url, openAiApiKey) => {
    try {
        // Fetch the content of the text file
        const response = await axios.get(url, { responseType: "text" });

        // Ensure the response contains text data
        if (response.headers['content-type']?.includes('text/plain')) {
            const textContent = response.data;

            // Initialize OpenAI API client
            const openai = new OpenAI({
                                            apiKey: openAiApiKey
                                        });

            const aiResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", //"gpt-4",
                messages: [
                  { role: "system", content: `以下の日本語の文章を意味のある単語ごとに分割してください。それぞれの単語は配列の要素として出力されます。各単語は文脈上の意味を保ってください。 出力例: ["単語1", "単語2", "単語3", ...]` }, 
                  { role: "user", content: `文章: ${textContent}` },
                ],
              });
            
            console.log("aiResponse", aiResponse);              

            // Parse and return the result
            const wordsArray = JSON.parse(aiResponse.choices[0].message.content.trim());
            console.log("Array of Words:", wordsArray);
            return wordsArray;
        } else {
            throw new Error("The URL does not contain a plain text file.");
        }
    } catch (error) {
        console.error("Error processing the text file:", error.message);
        throw error;
    }
};

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


        let token = headers['authorization'];
        console.log("token", token);

        let memberId = null;
        let member;

        if (!body.appPubKey && token) {
            try {
                const decoded = jwt.verify(token.split(' ')[1], configs.find(x=>x.key == 'JWT_SECRET').value);
                console.log("decoded", decoded);

                memberId = decoded.MemberId;

                if (Date.now() >= decoded.exp * 1000) {
                    return {
                        Success: false,
                        Message: "Token expired"
                    };
                }
            } catch (e) {
                console.log("error verify token", e);
                return {
                    Success: false,
                    Message: "Invalid token."
                };
            }

            let sql = `SELECT * FROM "${tableName}"."InvertedIndex" WHERE SK = 'MEMBER_ID#${memberId}' AND type = 'MEMBER' AND begins_with("PK", 'MEMBER#')`;
            let memberResult = await dbClient.send(new ExecuteStatementCommand({ Statement: sql }));
            if (memberResult.Items.length === 0) {
                console.log("member not found: " + memberId);
                return {
                    Success: false,
                    Message: "member not found: " + memberId
                };
            }
            member = memberResult.Items.map(item => unmarshall(item))[0];

            if (!member.role?.includes('ADMIN')) {
                return {
                    Success: false,
                    Message: "Unauthorized access"
                };
            }
        } 
        else if (body.appPubKey){
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

        } 
        else {
            return {
                Success: false,
                Message: "Missing login info"
            };
        }

        if(!body.keyword) {
            return {
                Success: false,
                Message: "keyword is required"
            };
        }

        // if(!body.rootHash) {
        //     return {
        //         Success: false,
        //         Message: "rootHash is required"
        //     };
        // }

        if(!body.chatMemberId) {
            return {
                Success: false,
                Message: "chatMemberId is required"
            };
        }

        if(!body.artistCode) {
            return {
                Success: false,
                Message: "artistCode is required"
            };
        }

        let sql = `select * from "${tableName}" where type = 'MEMBER' and PK = 'MEMBER#${body.chatMemberId}'`;
        let chatMemberResult = await fetchAllRecords(sql);
        let chatMember = chatMemberResult.map(item => unmarshall(item))[0];

        if(body.artistCode == 'IMARITONES' && !chatMember.nft_member_chatdata_token_id_imaritones) {
            return {
                Success: false,
                Message: "Chat member don't have chat data NFT for Imari Tones"
            }
        }
        else if(body.artistCode == 'STELLINASAYURI' && !chatMember.nft_member_chatdata_token_id_stellinasayuri) {
            return {
                Success: false,
                Message: "Chat member don't have chat data NFT for Stelina Sayuri"
            }
        }

        let tokenId;
        let contractAddress;
        if(body.artistCode == 'IMARITONES') {
            sql = `select * from "${tableName}" where type = 'ASSET' and PK = 'ASSET#${chatMember.nft_member_chatdata_contract_address_imaritones}#${chatMember.nft_member_chatdata_token_id_imaritones}'`;
            contractAddress = chatMember.nft_member_chatdata_contract_address_imaritones;
            tokenId = chatMember.nft_member_chatdata_token_id_imaritones;
        }
        else if (body.artistCode == 'STELLINASAYURI') {
            sql = `select * from "${tableName}" where type = 'ASSET' and PK = 'ASSET#${chatMember.nft_member_chatdata_contract_address_stellinasayuri}#${chatMember.nft_member_chatdata_token_id_stellinasayuri}'`;
            contractAddress = chatMember.nft_member_chatdata_contract_address_stellinasayuri;
            tokenId = chatMember.nft_member_chatdata_token_id_stellinasayuri;
        }
        
        let assetResult = await fetchAllRecords(sql);
        let asset = assetResult.map(item => unmarshall(item))[0];

        if(!asset.chat_data_local_url) {
            return {
                Success: false,
                Message: "Chat Data missing chat_data_local_url"
            }
        }

        let wordsArray = await fetchTextFileAsWordsArray(asset.chat_data_local_url, configs.find(x => x.key == 'OPENAI_APIKEY').value);
        // let charsArray = await fetchTextFileAsCharArray(asset.chat_data_local_url);

        // Create the Merkle Tree
        const leaves = wordsArray.map(data => hashData(data));
        console.log('leaves', leaves);
        
        const tree = new MerkleTree(leaves, (data) => crypto.createHash('sha256').update(data).digest());
        console.log('tree', tree);
        
        // Get the Merkle Root
        const root = tree.getRoot().toString('hex');
        console.log('Merkle Root:', root);

        if(asset.chat_data_hash != root) {
            console.log("Merkle Root not matched");
        }

        // generate ZKP
        let leaf ;

        let _proof;

        // if(body.keyword.length > 1) {
        //     // const subCharArray = Array.from(body.keyword);
        //     // const subLeaves = subCharArray.map(item => hashData(item));
        //     // const subTree = new MerkleTree(subLeaves, (item) => crypto.createHash('sha256').update(item).digest());
        //     // console.log('subTree', subTree);        
        //     // // Get the Merkle Root
        //     // const keywordRoot = subTree.getRoot();
        //     // console.log('Keyword Merkle Root:', keywordRoot);
        //     // leaf = keywordRoot;



        //     // // Find the index of the leaf corresponding to each character in the word
        //     // const leafIndices = [];
        //     // const leaves = charsArray;
        //     // // Store indices of leaf nodes for keyword
        //     // for (let i = 0; i < leaves.length; i++) {
        //     //     if (body.keyword.includes(leaves[i])) {
        //     //         leafIndices.push(i);
        //     //     }
        //     // }
        //     // // Generate proof for the word
        //     // _proof = leafIndices.map(index => {
        //     //                                     const _leaf = hashData(charsArray[index]);
        //     //                                     return tree.getProof(_leaf).map(x => x.data.toString('hex'));
        //     //                                 });
        //     // leaf = "0".repeat(64);  // leaf is not been used in circom logic, so i put 0

        //     return {
        //         Success: false,
        //         Message: 'Only single character is supported'
        //     }

        // }
        // else  {
            leaf = hashData(body.keyword);

            console.log("leaf hash for keyword", leaf.toString('hex'));

            _proof = tree.getProof(leaf).map(x => x.data.toString('hex'));
        // }

        // If the proof has less than 20 elements, add dummy elements to make it exactly 10
        const proofDepth = 20;
        while (_proof.length < proofDepth) {
            _proof.push("0".repeat(64));  // Adding dummy hashes (empty hashes) if proof length is less than desired depth
        }

        _proof = _proof.map(item => "0x" + item.toString());

        // return {
        //     Success: true,
        //     Data: {
        //         root: "0x" + root.toString(),
        //         leaf: "0x" + leaf.toString('hex'),
        //         proof: _proof
        //     }
        // };

        const input = {
            root: "0x" + root.toString(),
            leaf: "0x" + leaf.toString('hex'),
            proof: _proof
        };

        console.log("input", input);
        

        // const inputPath = "/tmp/input.json";
        const wasmFilePath = "./MerkleVerifier/MerkleVerifier.wasm";
        const zkeyFilePath = "./MerkleVerifier/MerkleVerifier_0001.zkey";

        // await fs.writeFile(inputPath, JSON.stringify(input));

        // Generate witness
        // const witness = await wtns.calculate(wasmFilePath, inputPath);

        // Generate proof
        const { proof, publicSignals } = await groth16.fullProve(input, wasmFilePath, zkeyFilePath);

        // Generate calldata for smart contract
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        return {
            Success: true,
            Data: {
                callData: JSON.parse("[" + calldata + "]"),
                chatDataHash: root,
                tokenId: tokenId,
                contractAddress: contractAddress
            }
        };

    } catch (e) {
        const random10DigitNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        console.error('error in ada-chat-data-proof-generate-post ' + random10DigitNumber, e);
    
        const message = {
            Subject: 'ADA Error - ada-chat-data-proof-generate-post- ' + random10DigitNumber,
            Message: `Error in ada-chat-data-proof-generate-post ${e.message}\n\nStack trace:\n${e.stack}`,
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