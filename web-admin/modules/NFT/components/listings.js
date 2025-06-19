import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { nftGet, announceRevealPost, revealPost, batchRevealPost, upgradePost, notifyUpgradePost, deleteAssetPost, chatDateEncryptionKeyGet } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";
import ModalVerifyZKP from "./modalVerifyZKP";
import Tooltip from "../../../common/components/tooltip";

const NFTListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [nfts, setNFTs] = useState([])
    const [status, setStatus] = useState()
    const [memberWalletAddress, setMemberWalletAddress] = useState()
    const [tokenId, setTokenId] = useState()
    const [nftType, setNFType] = useState()
    
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    const mdVerifyZKP = useRef(null)

    const [isCheckAll, setIsCheckAll] = useState(false)
    const [isCheckNFTs, setIsCheckNFTs] = useState([])
    
    useEffect(() => {        
        getNFTs()
    }, [])

    // const getMembers = async () => {
    //     setLoading(true)
    //     let result = await memberListingGet(null, null, null, null, null, 5)
    //     console.log("members result", result);
    //     if(result.Success) {
    //         setMembers(result.Data.members)
    //     }
    //     setLoading(false)
    // }

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getNFTs()
    }, [pageIndex, pageSize])

    const getNFTs = async () => {
        setLoading(true)
        setNFTs([]);
        let result = await nftGet({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            memberWalletAddress: memberWalletAddress,
            tokenId: tokenId,
        })
        console.log("nfts result", result);
        if(result.Success) {
            setNFTs(result.Data.assets)
            setLastPageIndex(null);
            if(result.Data.assets.length > 0 && result.Data.lastKey) {
                //console.log("got data", pageIndex, lastPageIndex);
                if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
                    setPages([...pages, result.Data.lastKey.created_date.S], x => setLoading(false))
                }
            }
            else {
                //console.log("setLastPageIndex");
                setLastPageIndex(pageIndex)
            }
        }
        setLoading(false)
    }

    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getNFTs()
    }

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll)
        setIsCheckNFTs(nfts.map(x => x.AssetId))
        if (isCheckAll) {
            setIsCheckNFTs([])
        }
    }

    const handleClick = e => {
        const { id, checked } = e.target
        setIsCheckNFTs([...isCheckNFTs, id])
        if (!checked) {
            setIsCheckNFTs(isCheckNFTs.filter(x => x !== id))
        }
    }

    const revealAll = () =>  {
        mdConfirm.current.show("Confirm", "Confirm Reveal Selected NFTs ?", "Confirm", confirmRevealAllNFTs, isCheckNFTs)
    }

    // const allowTransferAll = () => {
    //     mdConfirm.current.show("Confirm", "Confirm Allow Transfer All NFTs ?", "Confirm", confirmAllowTransferAllNFTs, isCheckNFTs)
    // }

    const confirmRevealAllNFTs = async (assetIds) => {
        mdLoading.current.show("Revealing seleted NFTs..")
        console.log("confirmRevealAllNFTs", assetIds);
        let _nfts = [];
        for await (const assetId of assetIds) {
            console.log("assetId", assetId);
            let asset = nfts.find(x=>x.AssetId == assetId)
            if(asset.Revealed) 
                continue;

            if(!asset.TokenId)
                continue;

            _nfts.push({tokenId: asset.TokenId, contractAddress: asset.ContractAddress});

                // let result = await lanternApprove(assetId, lantern.MemberId)
                // if(result?.Success)
                //     showSuccess("Lantern " + assetId + " approved")
                // else 
                //     showFailed("Failed to approve lantern " + assetId)
            
        }
      
        console.log("batch reveal nfts ", _nfts);

        let batchRevealNFTs = await batchRevealPost({nfts: _nfts});
        console.log("batchRevealNFTs", batchRevealNFTs);

        if(batchRevealNFTs?.Success) 
            showSuccess("Batch reveal success")
        else 
            showFailed("Failed to batch reveal")

        setIsCheckAll(false)
        setIsCheckNFTs([])
        await getNFTs()   
        mdLoading.current.close()
    }

    // const confirmAllowTransferAllNFTs = async (assetIds) => {
    //     mdLoading.current.show("Approving..")
    //     for await (const lanternId of lanternIds) {
    //         let lantern = lanterns.find(x=>x.LanternId == lanternId)
    //         if(lantern.Status == 'PENDING') {
    //             let result = await lanternApprove(lanternId, lantern.MemberId)
    //             if(result?.Success)
    //                 showSuccess("Lantern " + lanternId + " approved")
    //             else 
    //                 showFailed("Failed to approve lantern " + lanternId)
    //         }
    //     };     
    //     setIsCheckAll(false)
    //     setIsCheckNFTs([])
    //     await getNFTs()   
    //     mdLoading.current.close()
    // }


    const notifyUpgrade = (cntractAddress, tokenId) => {
        mdConfirm.current.show("Confirm", "Confirm send Discord message to user for Membership NFT Upgrade ?", "Notify Upgrade", confirmNotifyUpgrade, `${cntractAddress},${tokenId}`)
    }

    const confirmNotifyUpgrade = async (cntrAddtokenId) => {
        mdLoading.current.show("Publishing notify message..")
        let arr = cntrAddtokenId.split(',');
        let result = await notifyUpgradePost({
            contractAddress: arr[0],
            tokenId: arr[1]
        })
        console.log("notify upgrade result", result);
        if(result?.Success){
            showSuccess("Reveal message sent")
            await getNFTs();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const upgrade = (tokenId) => {
        mdConfirm.current.show("Confirm", "Confirm upgrade NFT ?", "Upgrade NFT", confirmUpgrade, tokenId)
    }

    const confirmUpgrade = async (tokenId) => {
        mdLoading.current.show("Upgrading NFT..")

        let result = await upgradePost({
            tokenId: tokenId
        })
        console.log("Upgrade result", result);
        if(result?.message == 'Service Unavailable') {
            await getNFTs();
        }
        else if(result?.Success){
            showSuccess("NFT Upgraded")
            await getNFTs();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const deleteAsset = (assetId) => {
        mdConfirm.current.show("Confirm", "Confirm delete asset ?", "Delete NFT", confirmDeleteAsset, assetId)
    }

    const confirmDeleteAsset = async (assetId) => {
        mdLoading.current.show("Deleting Asset..")

        let result = await deleteAssetPost({
            assetId: assetId
        })
        console.log("Delete result", result);
        if(result?.message == 'Service Unavailable') {
            await getNFTs();
        }
        else if(result?.Success){
            showSuccess("Asset deleted")
            await getNFTs();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const decrypt = async(asset) => {
        console.log("decrypt", asset);
        
        mdLoading.current.show("Decrypting Chat Data..")
        // await getChatDataFile(JSON.parse(asset.Metadata).attributes.find(x => x.trait_type == 'HiddenFile').value, 
        //                     JSON.parse(asset.Metadata).attributes.find(x => x.trait_type == 'HiddenFileOriginalName').value);
        await getChatDataFile(asset.ContractAddress, asset.TokenId, JSON.parse(asset.Metadata).attributes.find(x => x.trait_type == 'ChatDataFile').value)

        //mdLoading.current.close()
    }

    const getChatDataFile = async(contractAddress, tokenId, chatDataFileURL) => {
        console.log("chatDataFileURL", chatDataFileURL);
        
        fetch(chatDataFileURL)
            .then(response => response.arrayBuffer())  // Get the encrypted file as an array buffer
            .then(async (encryptedData) => {
                console.log("encryptedData", encryptedData);
                
            // // Decrypt the data
            // const key = CryptoJS.enc.Utf8.parse(secretKey);
            // const iv = CryptoJS.lib.WordArray.create(0);
            // const encryptedBytes = CryptoJS.lib.WordArray.create(encryptedData);
            // const decryptedBytes = CryptoJS.AES.decrypt({ ciphertext: encryptedBytes, salt: '' }, key, {
            // iv: iv,
            // mode: CryptoJS.mode.CFB,
            // padding: CryptoJS.pad.Pkcs7
            // });

            // // Convert the decrypted bytes to a Blob
            // const decryptedArray = new Uint8Array(decryptedBytes.words.length * 4);
            // decryptedBytes.words.forEach((word, i) => {
            // decryptedArray[i * 4] = (word >> 24) & 0xff;
            // decryptedArray[i * 4 + 1] = (word >> 16) & 0xff;
            // decryptedArray[i * 4 + 2] = (word >> 8) & 0xff;
            // decryptedArray[i * 4 + 3] = word & 0xff;
            // });

            // const decryptedBlob = new Blob([decryptedArray], { type: 'application/octet-stream' });

            let artistCode;
            if(contractAddress == process.env.CONTRACT_ADDRESS_CHATDATA) {
                artistCode = 'IMARITONES';
            }
            else if(contractAddress == process.env.CONTRACT_ADDRESS_CHATDATA_SS) {
                artistCode = 'STELLINASAYURI';
            }

            let encryptionkeyResult = await chatDateEncryptionKeyGet({tokenId: tokenId, artistCode: artistCode})
            if(!encryptionkeyResult.Success)
                showFailed(encryptionkeyResult.Message)

            let encryptionkey = encryptionkeyResult.Data.encryptionKey.encryptionKey;
            console.log('encryptionkey', encryptionkey);
            
            let password = encryptionkey.split(';')[0]
            let saltHex = encryptionkey.split(';')[1]
            let ivHex = encryptionkey.split(';')[2]
            let authTagHex = encryptionkey.split(';')[3]
            let decryptedBlob = await decryptFile(encryptedData, password, saltHex, ivHex, authTagHex)
            console.log("decryptedBlob", decryptedBlob);

            if(decryptedBlob) {   
                // Create a download link for the decrypted file
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(decryptedBlob);
                downloadLink.download = "chatdata.json"//hiddenFileOriginalName;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                window.URL.revokeObjectURL(downloadLink.href);
                mdLoading.current.close()
                showSuccess("Chat Data decrypted and downloaded successfully")
            }
        })
        .catch(error => {
            mdLoading.current.close()
            showFailed("Chat Data decryption failed")
            console.error('Error downloading and decrypting the file:', error);
        });
    }

    async function decryptFile(encryptedData, filePassword, saltHex, ivHex, authTagHex) {
        // Validate inputs
        if (filePassword.includes(';')) {
            throw new Error('Semicolon is not allowed in file password');
        }
    
        // Decode hex strings back to Uint8Array
        const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const authTag = new Uint8Array(authTagHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
        // Convert password to ArrayBuffer
        const passwordTextEncoder = new TextEncoder();
        const passwordData = passwordTextEncoder.encode(filePassword);
    
        // Import the password as a key
        const importedKey = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
    
        // Derive the key using PBKDF2
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            importedKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt']
        );
    
        // Add the auth tag to the encrypted data
        const encryptedDataWithAuthTag = new Uint8Array([
            ...new Uint8Array(encryptedData),
            ...authTag
        ]);
    
        // Decrypt the data
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            derivedKey,
            encryptedDataWithAuthTag
        );    
        
        //return new Uint8Array(decryptedData);

        // Create a Blob from the decrypted data
        const decryptedBlob = new Blob([decryptedData]);
        return decryptedBlob;
    }
    
    const verifyKeyword = (_chatMemberId, contractAddress) => {
        let artistCode;
        if(contractAddress == process.env.CONTRACT_ADDRESS_CHATDATA) {
            artistCode = 'IMARITONES';
        }
        else if(contractAddress == process.env.CONTRACT_ADDRESS_CHATDATA_SS) {
            artistCode = 'STELLINASAYURI';
        }
        mdVerifyZKP.current.show(_chatMemberId, artistCode)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <ModalVerifyZKP ref={mdVerifyZKP} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">NFT</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/nft/mint")}>+ MINT NEW</button>
                    </div> */}
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                {/* <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="NOTFORSALE">NOTFORSALE</option>
                                        <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                        <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                                    </select>
                                </div> */}
                                <div className="flex flex-col">
                                    <label>NFT Type</label>
                                    <select className="select select-bordered"
                                            value={nftType} 
                                            onChange={(e) => setNFType(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="ART">ART</option>
                                        <option value="MEMBERSHIP">MEMBERSHIP</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>NFT Unit</label>
                                    <input type="text" 
                                        placeholder="Unit" 
                                        value={tokenId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setTokenId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Member Wallet Address</label>
                                    <input type="text" 
                                        placeholder="Member Wallet Address" 
                                        value={memberWalletAddress}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberWalletAddress(e.target.value)} />
                                </div>
                            </div>
                            {/* <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Join Date From" className="input input-bordered w-full" />
                                <input type="text" placeholder="Join Date To" className="input input-bordered w-full" />
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between w-full mb-2">
                        <div className="flex items-center ml-5 gap-2">
                            {/* <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => revealAll()}>Reveal</button> */}
                            {/* <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => allowTransferAll()}>Allow Transfer</button> */}
                        </div>
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs"
                                    value={pageSize} 
                                    onChange={(e) => changePageSize(e.target.value)}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="500">500</option>
                                <option value="1000">1000</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>
                                    <Checkbox
                                        type="checkbox"
                                        name="selectAll"
                                        id="selectAll"
                                        handleClick={handleSelectAll}
                                        isChecked={isCheckAll}
                                    />
                                </th>
                                <th>#</th>
                                <th>IMAGE</th>
                                <th>TOKEN INFO</th>
                                <th>TYPE</th>
                                <th>STATUS</th>
                                <th>METADATA</th>
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                nfts && nfts.length > 0
                                ?
                                nfts
                                        .map(
                                            (x, index) => (
                                                <tr key={`nft_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        <Checkbox
                                                            key={x.AssetId}
                                                            type="checkbox"
                                                            name={x.AssetId}
                                                            id={x.AssetId}
                                                            handleClick={handleClick}
                                                            isChecked={isCheckNFTs.includes(x.AssetId)}
                                                            />
                                                    </td>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.ThumbnailURL && <a href={`https://preview.cardanoscan.io/token/${x.Unit}`} target='_blank'><img src={window.location.href.includes("https://") ? x.ThumbnailURL.replace("http://", "https://") : x.ThumbnailURL.replace("https://", "http://")} className="max-w-[100px]" /></a>}
                                                        {/* {x.ThumbnailURL && x.ThumbnailURL.replace("ipfs://", "").split("/").length == 4 && <a href={`https://opensea.io/assets/matic/${x.ContractAddress}/${x.TokenId}`} target='_blank'><img src={`https://${x.ThumbnailURL.replace("ipfs://", "").split("/")[0]}.ipfs.nftstorage.link/${x.ThumbnailURL.replace("ipfs://", "").split("/")[1]}/${x.ThumbnailURL.replace("ipfs://", "").split("/")[2]}/${x.ThumbnailURL.replace("ipfs://", "").split("/")[3]}`} className="max-w-[100px]" /></a>} */}
                                                    </td>
                                                    <td>
                                                        <span>Policy Id : {x.PolicyId}</span>
                                                        <br/>
                                                        <span>Unit : {x.Unit}</span>
                                                        <br/>
                                                        <span>Asset Id : {x.AssetId}</span>
                                                        <br/>
                                                        <span>Member Wallet : {x.OwnerAddress}</span>
                                                        <br/>
                                                        <span>Member Id : {x.OwnerUserId}</span>
                                                        {/* <br/>
                                                        <span>Member Id : </span>
                                                        <br/>
                                                        <span>Member Discord Id : </span> */}
                                                        {/* {x.NFTId} */}
                                                    </td>
                                                    <td>
                                                        {
                                                            // x.ContractAddress == process.env.CONTRACT_ADDRESS_METAVERSE
                                                            // ? 'ART'
                                                            // : 
                                                            x.Metadata.includes("Membership") ? 'Membership' : ''
                                                        }
                                                    </td>
                                                    <td>
                                                        { x.Status == 'FORSALE' || x.Status == 'NOTFORSALE' ? 'MINTED' : x.Status }
                                                    </td>
                                                    <td>
                                                        { 
                                                            x.Metadata &&
                                                            <Tooltip tooltipText={JSON.stringify(x.Metadata)}>
                                                                <span>{JSON.stringify(x.Metadata).substring(0, 19) + (JSON.stringify(x.Metadata).length > 20 ? "..." : "")}</span>
                                                            </Tooltip>
                                                        }
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    { 
                                                                        x.Status == 'MINTING' && 
                                                                        <>
                                                                            <a onClick={async () => await deleteAsset(x.AssetId)}>Delete</a>
                                                                        </>
                                                                    }
                                                                    { 
                                                                        (x.ContractAddress == process.env.CONTRACT_ADDRESS_CHATDATA || x.ContractAddress == process.env.CONTRACT_ADDRESS_CHATDATA_SS) && (x.Status == 'FORSALE' || x.Status == 'NOTFORSALE') &&
                                                                        <>
                                                                            <a onClick={async () => await decrypt(x)}>Decrypt</a>
                                                                        </>
                                                                    }
                                                                    { 
                                                                        (x.ContractAddress == process.env.CONTRACT_ADDRESS_CHATDATA || x.ContractAddress == process.env.CONTRACT_ADDRESS_CHATDATA_SS) && (x.Status == 'FORSALE' || x.Status == 'NOTFORSALE') &&
                                                                        <>
                                                                            <a onClick={async () => await verifyKeyword(x.OwnerUserId, x.ContractAddress)}>Verify Word (ZKP)</a>
                                                                        </>
                                                                    }
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={10} className="text-center">
                                        {
                                            loading
                                                ?   <span className="flex justify-center">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>
                                                :   <span>No Result</span>
                                        }
                                    </td>
                                  </tr>
                            }                         
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center gap-2 w-full m-2 mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NFTListing