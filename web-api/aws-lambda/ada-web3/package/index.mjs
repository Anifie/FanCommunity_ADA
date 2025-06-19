import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import {
  // resolveNativeScriptAddress,
  resolveNativeScriptHash,
  Transaction,
  // Data,
  // fromText,
  // toHex,
  ForgeScript,
  BlockfrostProvider,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  resolvePlutusScriptHash,
  resolvePlutusScriptAddress,
  resolvePaymentKeyHash,
  resolveScriptHash,
  deserializeAddress
  // UTxO
} from "@meshsdk/core";
import axios from "axios";
import md5 from "md5";

// import { NativeScript } from "@meshsdk/common"
// import mesh from "@meshsdk/core";
// import {MeshPlutusNFTContract} from "@meshsdk/contract"

// import { mnemonicToEntropy, entropyToMnemonic, mnemonicToSeedSync } from "bip39";
// import { Bip32PrivateKey, BaseAddress, NetworkInfo, StakeCredential } from "@emurgo/cardano-serialization-lib-browser";

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID);
const mnemonicArray = process.env.ADMIN_WALLET_MNEMONIC.split(" "); //mnemonic.split(" ");
// console.log("mnemonicArray", mnemonicArray);
const adminCardanoWallet = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
    type: 'mnemonic',
    words: mnemonicArray,
    },
});
console.log("adminCardanoWallet", adminCardanoWallet);

const blockchainProviderTest = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID_TEST);
const mnemonicArrayTest = process.env.ADMIN_WALLET_MNEMONIC_TEST.split(" "); //mnemonic.split(" ");
// console.log("mnemonicArray", mnemonicArray);
const adminCardanoWalletTest = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProviderTest,
    submitter: blockchainProviderTest,
    key: {
    type: 'mnemonic',
    words: mnemonicArrayTest,
    },
});
console.log("adminCardanoWalletTest", adminCardanoWalletTest);

export const handler = async (event) => {

    console.log("event", event);

    if(event.action === undefined){
        throw new Error("Action is required");
    }

    switch (event.action){          

        case "MINT_MEMBER": 
            return await MintMember(event.toAddress, event.metadata, event.isTest);

        case "MINT_SUPERCHAT_NFT": 
            return await MintSuperchatNFT(event.toAddress, event.metadata, event.isTest);

        case "MINT_CHATDATA_NFT":
            return await MintChatdataNFT(event.toAddress, event.metadata, event.isTest);

        case "UPDATE_CHATDATA_METADATA":
            return await UpdateChatDataMetadata(event.unit, event.toAddress, event.metadata, event.isTest);

        default:
            throw new Error("Not supported action " + event.action); 
    }
};

async function fetchTxStatus(txHash, isTest) {
    try {
        const response = await axios.get(`https://cardano-preview.blockfrost.io/api/v0/txs/${txHash}`, {
            headers: { project_id: isTest ? process.env.BLOCKFROST_PROJECT_ID_TEST : process.env.BLOCKFROST_PROJECT_ID },
        });

        console.log("response", response);
        return { status: "confirmed", data: response.data };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { status: "pending" };
        } else {
            console.error("Error fetching transaction:", error.message);
            return { status: "failed" };
        }
    }
}

async function waitForTx(txHash, isTest, maxRetries = 30, delay = 5000) {
    for (let i = 0; i < maxRetries; i++) {
        const result = await fetchTxStatus(txHash, isTest);
        console.log(`Transaction Status: ${result.status}`);

        if (result.status === "confirmed") {
            console.log("Transaction confirmed!");
            return result.data;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error("Transaction confirmation timeout exceeded.");
}

async function MintMember(toAddress, metadata, isTest) {
    console.log("MintMember", toAddress, metadata, isTest);

    let result = await MintNFT(toAddress, metadata, isTest);
    return result;
}

async function MintSuperchatNFT(toAddress, metadata, isTest) {
    console.log("MintSuperchatNFT", toAddress, metadata, isTest);

    let result = await MintNFT(toAddress, metadata, isTest);
    return result;
}

async function MintChatdataNFT(toAddress, metadata, isTest) {
    console.log("MintChatdataNFT", toAddress, metadata, isTest);

    // ignore toAddress, chat data will always mint to our wallet, as we need to update (burn and re-mint) it from time to time
    let adminAddr = await wallet.getChangeAddress();
    console.log("adminAddr", adminAddr);
    let result = await MintNFT(adminAddr, metadata, isTest);
    return result;
}

// burn and re-mint
async function UpdateChatDataMetadata(unit, toAddress, metadata, isTest) {
    console.log("UpdateChatDataMetadata", toAddress, metadata, isTest);

    let burnResult = await BurnNFT(unit, isTest);
    console.log("burnResult", burnResult);

    // ignore toAddress, chat data will always mint to our wallet, as we need to update (burn and re-mint) it from time to time
    let adminAddr = await wallet.getChangeAddress();
    console.log("adminAddr", adminAddr);
    let mintResult = await MintNFT(adminAddr, metadata, isTest);
    console.log("mintResult", mintResult);
    
    return mintResult;
}

async function MintNFT(toAddress, metadata, isTest) {
    let _metadata = metadata;
    let wallet = isTest ? adminCardanoWalletTest : adminCardanoWallet;

    if(typeof _metadata !== 'object') {
        _metadata = JSON.parse(_metadata);
    }

    if(!_metadata.name || !_metadata.name.trim()) {
        throw new Error("Metadata name is required");
    }

    if(!_metadata.attributes) {
        _metadata.attributes = [];
    }
    _metadata.attributes.push({
                    "trait_type": "SIGNATURE",
                    "value": md5(JSON.stringify(_metadata) + process.env.NFT_SECRET)
                });

    let asset = {   
      assetName: _metadata.name,
      assetQuantity: '1',
      metadata: _metadata,
      label: '721',
      recipient: toAddress
    }
    console.log("asset", asset);
    
    const { pubKeyHash: keyHash } = deserializeAddress(await wallet.getChangeAddress());
    console.log("keyHash", keyHash);

    const nativeScript = {
      type: "sig",
      keyHash: keyHash
    };
    
    const forgingScript = ForgeScript.fromNativeScript(nativeScript);

    const tx = new Transaction({ initiator: wallet });
    console.log("tx", tx);
    
    tx.mintAsset(
      forgingScript,
      asset,
    );

    const unsignedTx = await tx.build();
    console.log("unsignedTx", unsignedTx);
    
    const signedTx = await wallet.signTx(unsignedTx);
    console.log("signedTx", signedTx);
    
    const txHash = await wallet.submitTx(signedTx);    
    console.log("txHash", txHash);
    
    const response = await waitForTx(txHash, isTest)
    console.log("response", response);

    const policyId = resolveNativeScriptHash(nativeScript);
    console.log("policyId", policyId);
    
    const assetNameHex = Buffer.from(_metadata.name, 'utf8').toString('hex');
    console.log("assetNameHex", assetNameHex);

    const unit = policyId + assetNameHex;
    console.log("unit", unit);
    
    return {
        response: response,
        transactionHash: txHash,
        policyId: policyId,
        assetNameHex: assetNameHex,
        unit: unit,
    };
}

async function BurnNFT(unit, isTest) {
    let wallet = isTest ? adminCardanoWalletTest : adminCardanoWallet;

    const policyId = unit.slice(0, 56);
    const assetNameHex = unit.slice(56);
    const assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');

    const { pubKeyHash: keyHash } = deserializeAddress(await wallet.getChangeAddress());

    const nativeScript = {
        type: "sig",
        keyHash: keyHash
    };

    // ⚠️ Validate derived policyId matches expected policyId
    const derivedPolicyId = resolveNativeScriptHash(nativeScript);
    if (derivedPolicyId !== policyId) {
        throw new Error(`Mismatch in policyId: expected ${policyId}, got ${derivedPolicyId}`);
    }

    const forgingScript = ForgeScript.fromNativeScript(nativeScript);

    const tx = new Transaction({ initiator: wallet });

    tx.mintAsset(
        forgingScript,
        {
            assetName: assetName,
            assetQuantity: '-1',
            label: '721',
            recipient: await wallet.getChangeAddress()
        }
    );

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    const response = await waitForTx(txHash, isTest);

    return {
        response,
        transactionHash: txHash,
        policyId: derivedPolicyId,
        assetName,
        unit
    };
}