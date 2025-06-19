import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {whitelistListingPost , whitelistDel} from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";
// import ModalUpload from "./modalUpload";

const IssueListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [whitelists, setWhitelists] = useState([])
    const [status, setStatus] = useState()
    
    // const [memberWalletAddress, setMemberWalletAddress] = useState()
    // const [tokenId, setTokenId] = useState()
    // const [nftType, setNFType] = useState()
    
    const {showSuccess, showFailed} = useContext(ToastContext)

    // const [pages, setPages] = useStateCallback([null])
    // const [pageIndex, setPageIndex] = useState(0)
    // const [lastPageIndex, setLastPageIndex] = useState()
    // const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    const mdUpload = useRef()
    // const [isCheckAll, setIsCheckAll] = useState(false)
    // const [isCheckNFTs, setIsCheckNFTs] = useState([])
    
    useEffect(() => {        
        // getWhiteLists()
        
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

    // useEffect(() => {
    //     console.log("load page pageIndex", pageIndex);
    //     getNFTs()
    // }, [pageIndex, pageSize])

    const getWhiteLists = async () => {
        setLoading(true)
        setWhitelists([]);
        let result = await whitelistListingPost({
            // pageSize: pageSize, 
            // lastKey: pages[pageIndex], 
            status: status
        })
        console.log("whitelists result", result);
        if(result.Success) {
            setWhitelists(result.Data)
            // setLastPageIndex(null);
            // if(result.Data.length > 0 && result.Data.lastKey) {
            //     //console.log("got data", pageIndex, lastPageIndex);
            //     if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
            //         setPages([...pages, result.Data.lastKey.created_date.S], x => setLoading(false))
            //     }
            // }
            // else {
            //     //console.log("setLastPageIndex");
            //     setLastPageIndex(pageIndex)
            // }
        }
        setLoading(false)
    }
    
    const deleteWhitelist = (whitelistId, memberId) => {
        mdConfirm.current.show("Confirm", "Confirm delete whitelist ?", "Delete Whitelist", confirmDeleteWhitelist, whitelistId+ "#"+memberId)
    }

    const confirmDeleteWhitelist = async (_id) => {
        mdLoading.current.show("Deleting whitelist..")
        
        let idArr = _id.split('#');

        let result = await whitelistDel({
            whitelistId: idArr[0],
            memberId: idArr[1]
        })
        console.log("delete whitelist result", result);
        if(result?.Success){
            showSuccess("Whitelist Deleted")
            await getWhiteLists();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }
    
    const upload = () => {
        mdUpload.current.show(getWhiteLists)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            {/* <ModalUpload ref={mdUpload} /> */}
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">ISSUE JPY STABLE COIN</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/stablecoin/issue/new")}>+ ISSUE JPY STABLE COIN</button>
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
                                    <label>NFT Type</label>
                                    <select className="select select-bordered"
                                            value={nftType} 
                                            onChange={(e) => setNFType(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="CAR">CAR</option>
                                        <option value="CHARACTER">CHARACTER</option>
                                        <option value="MEMBERSHIP">MEMBERSHIP</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>NFT Token Id</label>
                                    <input type="text" 
                                        placeholder="Token Id" 
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
                                </div> */}
                            </div>
                            {/* <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Join Date From" className="input input-bordered w-full" />
                                <input type="text" placeholder="Join Date To" className="input input-bordered w-full" />
                            </div> */}
                            {/* <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div> */}
                        </div>
                    </div>
                    <div className="flex justify-between w-full mb-2">
                        {/* <div className="flex items-center ml-5 gap-2">
                            <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => revealAll()}>Reveal</button>
                        </div> */}
                        {/* <div className="flex items-center mr-5">
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
                        </div> */}
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
                                <th>ISSUE ID</th>
                                <th>ISSUE BY</th>
                                <th>FIAT DEPOSIT INFO</th>
                                <th>DESTINATION WALLET</th>
                                <th>COMMENT</th>
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                whitelists && whitelists.length > 0
                                ?
                                whitelists
                                        .map(
                                            (x, index) => (
                                                <tr key={`whitelist_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    {/* <td>
                                                        <Checkbox
                                                            key={x.AssetId}
                                                            type="checkbox"
                                                            name={x.AssetId}
                                                            id={x.AssetId}
                                                            handleClick={handleClick}
                                                            isChecked={isCheckNFTs.includes(x.AssetId)}
                                                            />
                                                    </td> */}
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.WhitelistId}
                                                    </td>
                                                    <td>
                                                        {x.WhiteListType}
                                                    </td>
                                                    <td>
                                                        {x.FiatDepositInfo}
                                                    </td>
                                                    <td>
                                                        {x.DestinationWalletAddress}
                                                    </td>
                                                    <td>
                                                        { x.Comment }
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    {/* <a onClick={() => burn(x.ContractAddress, x.TokenId)}>Burn</a> */}
                                                                    {/* <a onClick={() => router.push("/survey/questionaires/edit/" + x.SurveyId)}>Edit</a> */}
                                                                    <a onClick={() => deleteWhitelist(x.WhitelistId, x.MemberId)}>Delete</a>
                                                                    {/* <a onClick={() => deactivateMessage(x.MessageId)}>Allow Transfer</a> */}
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
                    {/* <div className="flex justify-end items-center gap-2 w-full m-2 mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default IssueListing