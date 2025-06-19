import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { artistListingPost, artistDelete, artistPost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";
import Tooltip from "../../../common/components/tooltip";

const ArtistListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [artworks, setArtworks] = useState([])
    // const [status, setStatus] = useState()
    const [category, setCategory] = useState()
    const [subCategory, setSubCategory] = useState()
    const [ownerMemberId, setOwnerMemberId] = useState()
    const [artworkId, setArtworkId] = useState()
    const [artworkType, setArtworkType] = useState()
    
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)

    const [isCheckAll, setIsCheckAll] = useState(false)
    const [isCheckArtworks, setIsCheckArtworks] = useState([])

    const [enums, setEnums] = useState([])
    
    useEffect(() => {
        // getEnums()        
        getArtworks()
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
        getArtworks()
    }, [pageIndex, pageSize])

    const getArtworks = async () => {
        setLoading(true)
        setArtworks([]);
        let result = await artistListingPost({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            // status: status, 
            memberId: ownerMemberId,
            artworkId: artworkId == '' ? undefined : artworkId,
            artworkType: artworkType == '' ? undefined : artworkType,
            category: category == '' ? undefined : category,
            subCategory: subCategory
        })
        console.log("artworks result", result);
        if(result.Success) {
            setArtworks(result.Data.artist)
            setLastPageIndex(null);
            if(result.Data.artist.length > 0 && result.Data.nextToken) {
                //console.log("got data", pageIndex, lastPageIndex);
                if(pages.indexOf(result.Data.nextToken) < 0) {
                    setPages([...pages, result.Data.nextToken], x => setLoading(false))
                }
            }
            else {
                //console.log("setLastPageIndex");
                setLastPageIndex(pageIndex)
            }
        }
        setLoading(false)
    }

    const getEnums = async () => {
        let result = await enumGet();
        console.log("getEnum result", result);
        if(result.Success) {
            setEnums(result.Data);
        }
    }

    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getArtworks()
    }

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll)
        setIsCheckArtworks(nfts.map(x => x.AssetId))
        if (isCheckAll) {
            setIsCheckArtworks([])
        }
    }

    const handleClick = e => {
        const { id, checked } = e.target
        setIsCheckArtworks([...isCheckArtworks, id])
        if (!checked) {
            setIsCheckArtworks(isCheckArtworks.filter(x => x !== id))
        }
    }

    // const revealAll = () =>  {
    //     mdConfirm.current.show("Confirm", "Confirm Reveal Selected NFTs ?", "Confirm", confirmRevealAllNFTs, isCheckArtworks)
    // }

    // const confirmRevealAllNFTs = async (assetIds) => {
    //     mdLoading.current.show("Revealing seleted NFTs..")
    //     console.log("confirmRevealAllNFTs", assetIds);
    //     let _nfts = [];
    //     for await (const assetId of assetIds) {
    //         console.log("assetId", assetId);
    //         let asset = nfts.find(x=>x.AssetId == assetId)
    //         if(asset.Revealed) 
    //             continue;

    //         if(!asset.TokenId)
    //             continue;

    //         _nfts.push({tokenId: asset.TokenId, contractAddress: asset.ContractAddress});            
    //     }
      
    //     console.log("batch reveal nfts ", _nfts);

    //     let batchRevealNFTs = await batchRevealPost({nfts: _nfts});
    //     console.log("batchRevealNFTs", batchRevealNFTs);

    //     if(batchRevealNFTs?.Success) 
    //         showSuccess("Batch reveal success")
    //     else 
    //         showFailed("Failed to batch reveal")

    //     setIsCheckAll(false)
    //     setIsCheckArtworks([])
    //     await getNFTs()   
    //     mdLoading.current.close()
    // }


    const deleteArtist = (artistCode) => {
        mdConfirm.current.show("Confirm", "Confirm delete artist ?", "Artist Delete", confirmArtistDelete, artistCode)
    }

    const confirmArtistDelete = async (artistCode) => {
        mdLoading.current.show("Updating database..")

        let result = await artistDelete({
            artistCode: artistCode
        })
        console.log("artist delete result", result);
        if(result?.Success){
            showSuccess("Artist delete sent")
            await getArtworks();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const mintArtwork = (_artworkId, category) => {
        mdConfirm.current.show("Confirm", "Confirm mint Artwork ?", "Mint Artwork", confirmMintArtwork, _artworkId + ',' + category)
    }

    const confirmMintArtwork = async (info) => {
        mdLoading.current.show("Minting Artwork..")

        let artworkId = info.split(',')[0];
        let category = info.split(',')[1];

        let result = await artworkMintPost({
            //"appPubKey": "0288ebfe4876c68daf1fd628c14998120e5bc6315f8ffdefc5e1e896bba8d9e36a",
            "nftType": category,  // MEMBER_A, MEMBER_B, , CAR, CHARACTER
            "queueType": "MINT_QUEUE"   // MINT_QUEUE or UPGRADE_QUEUE
            ,"artworkId": artworkId    // for CAR and CHARACTER
            // ,"tokenId": "3"
        })
        console.log("Mint result", result);
        if(result?.Success){
            showSuccess("Artwork Sent to Mint Queue. Please check NFT Queue for mint status.")
            await getArtworks();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const deleteArtwork = (_artworkId) => {
        mdConfirm.current.show("Confirm", "Confirm delete Artwork ?", "Delete Artwork", confirmDeleteArtwork, _artworkId)
    }

    const confirmDeleteArtwork = async (_artworkId) => {
        mdLoading.current.show("Deleting Artwork..")

        let result = await artworkDelete({
            artworkId: _artworkId
        })
        console.log("Delete result", result);
        if(result?.Success){
            showSuccess("Artwork Deleted")
            await getArtworks()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">Artist</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/artist/create")}>+ NEW ARTIST</button>
                    </div>
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
                                {/* <div className="flex flex-col">
                                    <label>Type</label>
                                    <select className="select select-bordered"
                                            value={artworkType} 
                                            onChange={(e) => setArtworkType(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="FULL_TEMPLATE">FULL (Template)</option>
                                        <option value="FULL_USER">FULL (User Customized)</option>
                                        <option value="COMPONENT">COMPONENT</option>
                                    </select>
                                </div> */}
                                {/* <div className="flex flex-col">
                                    <label>Category</label>
                                    <select className="select select-bordered"
                                            value={category} 
                                            onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="MEMBERSHIP">MEMBERSHIP</option>
                                        <option value="ART">ART</option>
                                    </select>
                                </div> */}
                                {/* <div className="flex flex-col">
                                    <label>Sub Category</label>
                                    <select className="select select-bordered"
                                            value={subCategory} 
                                            onChange={(e) => setSubCategory(e.target.value)}>
                                        <option value="">ALL</option>
                                        {
                                            enums && enums.length > 0 && category
                                            && enums.find(x=>x.enum_name == category) 
                                            && enums.find(x=>x.enum_name == category).enum_values.map(x => <option value={x}>{x}</option>)
                                        }
                                    </select>
                                </div> */}
                                {/* <div className="flex flex-col">
                                    <label>Artwork Id</label>
                                    <input type="text" 
                                        placeholder="Artwork Id" 
                                        value={artworkId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setArtworkId(e.target.value)} />
                                </div> */}
                                {/* <div className="flex flex-col">
                                    <label>Owner MemberId</label>
                                    <input type="text" 
                                        placeholder="Owner MemberId" 
                                        value={ownerMemberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setOwnerMemberId(e.target.value)} />
                                </div> */}
                            </div>
                            {/* <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Join Date From" className="input input-bordered w-full" />
                                <input type="text" placeholder="Join Date To" className="input input-bordered w-full" />
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Refresh</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between w-full mb-2">
                        <div className="flex items-center ml-5 gap-2">
                            {/* <button className="btn btn-primary btn-sm" disabled={isCheckArtworks.length == 0} onClick={() => revealAll()}>Reveal</button> */}
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
                                {/* <th>
                                    <Checkbox
                                        type="checkbox"
                                        name="selectAll"
                                        id="selectAll"
                                        handleClick={handleSelectAll}
                                        isChecked={isCheckAll}
                                    />
                                </th> */}
                                <th>#</th>
                                <th>ARTIST CODE</th>
                                <th>ARTIST NAME</th>
                                <th>VIDEO URLs</th>
                                <th>CONFIGS</th>
                                <th>CREATED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                artworks && artworks.length > 0
                                ?
                                artworks
                                        .map(
                                            (x, index) => (
                                                <tr key={`artwork_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    {/* <td>
                                                        <Checkbox
                                                            key={x.ArtworkId}
                                                            type="checkbox"
                                                            name={x.ArtworkId}
                                                            id={x.ArtworkId}
                                                            handleClick={handleClick}
                                                            isChecked={isCheckArtworks.includes(x.ArtworkId)}
                                                            />
                                                    </td> */}
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.ArtistCode}
                                                    </td>
                                                    <td>
                                                        {x.ArtistName}
                                                    </td>
                                                    <td>
                                                        {x.VideoURLs ? x.VideoURLs : ''}
                                                    </td>
                                                    <td>
                                                        {x.Configs ? x.Configs : ''}
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
                                                                    <a onClick={() => router.push("/artist/edit/" + x.ArtistCode)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a onClick={() => deleteArtist(x.ArtistCode)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={12} className="text-center">
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

export default ArtistListing