import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { queueListingPost, queueDelete, enumGet, queueReset, resetQueueStatus } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";
import Tooltip from "../../../common/components/tooltip";

const QueueListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [queues, setQueues] = useState([])
    const [status, setStatus] = useState()
    const [queueType, setQueueType] = useState()
    const [queueId, setQueueId] = useState()
    const [memberId, setMemberId] = useState()
    const [nftType, setNFType] = useState()
    const [enums, setEnums] = useState()

    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)

    const [isCheckAll, setIsCheckAll] = useState(false)
    const [isCheckNFTs, setIsCheckNFTs] = useState([])
    
    useEffect(() => {  
        refreshStat()      
        getQueueItems()
    }, [])

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getQueueItems()
    }, [pageIndex, pageSize])

    const getQueueItems = async () => {
        setLoading(true)
        setQueues([]);
        let result = await queueListingPost({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            queueType: queueType, 
            nftType: nftType,
            memberId: memberId,
            status: status,
            queueId: queueId
        })
        console.log("queues result", result);
        if(result.Success) {
            setQueues(result.Data.queues)
            setLastPageIndex(null);
            if(result.Data.queues.length > 0 && result.Data.nextToken) {
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

    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getQueueItems()
        refreshStat()      
    }

    const deleteQueue = (queueId) => {
        mdConfirm.current.show("Confirm", "Confirm delete queue item ?", "Delete Queue Item", confirmDelete, queueId)
    }

    const confirmDelete = async (queueId) => {
        mdLoading.current.show("Deleting Queue Item..")

        let result = await queueDelete({
            queueId: queueId
        })
        console.log("Delete result", result);
        if(result?.message == 'Service Unavailable') {
            await getQueueItems();
        }
        else if(result?.Success){
            showSuccess("Queue Item Deleted")
            await getQueueItems();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const resetQueue = (queueId) => {
        mdConfirm.current.show("Confirm", "Confirm reset queue item ?", "Reset Queue Item", confirmReset, queueId)
    }

    const confirmReset = async (queueId) => {
        mdLoading.current.show("Reseting Queue Item..")

        let result = await queueReset({
            queueId: queueId
        })
        console.log("Reset result", result);
        if(result?.message == 'Service Unavailable') {
            await getQueueItems();
        }
        else if(result?.Success){
            showSuccess("Queue Item reseted")
            await getQueueItems();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }


    const refreshStat = async () => {
        let result = await enumGet();
        console.log("getEnum result", result);
        if(result.Success) {
            setEnums(result.Data);

            // let membershipStat = result.Data.filter(x => x.sk && x.sk.includes('MEMBERSHIP'));
            // let carStat = result.Data.filter(x => x.sk && x.sk.includes('COUNTER_CAR'));
            // let characterStat = result.Data.filter(x => x.sk && x.sk.includes('COUNTER_CHARACTER'));
            
        }
    }

    const forceMintMemberPreregister = (queueId) => {
        mdConfirm.current.show("Confirm", "Confirm reset with force preregister ?", "Reset Queue Item", confirmforceMintMemberPreregister, queueId)
    }

    const confirmforceMintMemberPreregister = async (queueId) => {
        mdLoading.current.show("Reseting Queue Item with force Preregister..")

        let result = await queueReset({
            queueId: queueId,
            isForcePreregister: true
        })
        console.log("Reset result", result);
        if(result?.message == 'Service Unavailable') {
            await getQueueItems();
        }
        else if(result?.Success){
            showSuccess("Queue Item reseted")
            await getQueueItems();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const forceMintMemberRegular = (queueId) => {
        mdConfirm.current.show("Confirm", "Confirm reset with force regular ?", "Reset Queue Item", confirmforceMintMemberRegular, queueId)
    }

    const confirmforceMintMemberRegular = async (queueId) => {
        mdLoading.current.show("Reseting Queue Item with force Regular..")

        let result = await queueReset({
            queueId: queueId,
            isForceRegular: true
        })
        console.log("Reset result", result);
        if(result?.message == 'Service Unavailable') {
            await getQueueItems();
        }
        else if(result?.Success){
            showSuccess("Queue Item reseted")
            await getQueueItems();
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const resetToDone = async (queueType) => {
        await resetQueueStatus({queueType: queueType})
        await refreshStat()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">NFT QUEUE</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/nft/mint")}>+ MINT NEW</button>
                    </div> */}
                    {/* <div className="flex flex-col w-full">
                        <button className="btn btn-primary btn-sm w-20 mb-2 mt-2 ml-2" onClick={async () => await refreshStat()}>Refresh</button>
                        <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                            <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                                <tr>
                                    <th className="colspan text-center" colspan="2">Membership - Follow Up Campaign</th>
                                    <th className="colspan text-center" colspan="2">Membership - Pre-Registration</th>
                                    <th className="colspan text-center" colspan="2">Membership - Regular Operation</th>
                                    <th className="colspan text-center">PaleBlueDot. Content NFT</th>
                                    <th className="colspan text-center">MetaGarage Content NFT</th>
                                </tr>
                                <tr className="text-center">
                                    <th>PaleBlueDot.</th>
                                    <th>MetaGarage</th>
                                    <th>PaleBlueDot.</th>
                                    <th>MetaGarage</th>
                                    <th>PaleBlueDot.</th>
                                    <th>MetaGarage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-center">
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[4].replace('A1-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[5].replace('B1-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[6].replace('A2-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[7].replace('B2-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[2].replace('A-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('MEMBERSHIP'))?.enum_description[3].replace('B-','')}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('COUNTER_CHARACTER')).enum_description}</td>
                                    <td>{enums && enums.find(x => x.sk && x.sk.includes('COUNTER_CAR')).enum_description}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br/>
                    <br/> */}
                    <div className="w-full justify-start">
                        <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                            <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                                <tr>
                                    <th className="colspan text-center">Mint Queue Status</th>
                                    <th className="colspan text-center">Update Queue Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-center">
                                    <td>
                                        {enums && enums.find(x => x.enum_name && x.enum_name.includes('QUEUE_STATUS'))?.enum_values[0]}
                                        {
                                            enums && enums.find(x => x.enum_name && x.enum_name.includes('QUEUE_STATUS'))?.enum_values[0] == 'PROCESSING' &&
                                            <>
                                                <button className='btn btn-xs ml-2' onClick={async() => await resetToDone('QUEUE_STATUS')}>Reset to DONE</button>
                                            </>
                                        }
                                    </td>
                                    <td>
                                        {enums && enums.find(x => x.enum_name && x.enum_name.includes('UPDATE_QUEUE_STATUS'))?.enum_values[0]}
                                        {
                                            enums && enums.find(x => x.enum_name && x.enum_name.includes('UPDATE_QUEUE_STATUS'))?.enum_values[0] == 'PROCESSING' &&
                                            <>
                                                <button className='btn btn-xs ml-2' onClick={async() => await resetToDone('UPDATE_QUEUE_STATUS')}>Reset to DONE</button>
                                            </>
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-5 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="NEW">NEW</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="FAILED">FAILED</option>
                                        <option value="SUCCESS">SUCCESS</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Queue Id</label>
                                    <input type="text" 
                                        placeholder="Queue Id" 
                                        value={queueId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setQueueId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>NFT Type</label>
                                    <select className="select select-bordered"
                                            value={nftType} 
                                            onChange={(e) => setNFType(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="ART">ART</option>
                                        <option value="CHATDATA">CHATDATA</option>
                                        <option value="MEMBER">MEMBERSHIP</option>
                                        <option value="SUPERCHAT">SUPERCHAT</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Queue Type</label>
                                    <select className="select select-bordered"
                                            value={queueType} 
                                            onChange={(e) => setQueueType(e.target.value)}>
                                        {/* <option value="">ALL</option> */}
                                        <option value="MINT_QUEUE">MINT</option>
                                        {/* <option value="UPGRADE_QUEUE">UPGRADE</option> */}
                                        <option value="UPDATE_QUEUE">UPDATE</option>
                                    </select>
                                </div>
                                {/* <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="Member Id" 
                                        value={memberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberId(e.target.value)} />
                                </div> */}
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
                    <div className="flex justify-end w-full mb-2">
                        {/* <div className="flex items-center ml-5 gap-2">
                            <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => revealAll()}>Reveal</button>
                        </div> */}
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
                                <th>QUEUE ID</th>
                                {/* <th>MEMBERSHIP</th> */}
                                {/* <th>CAMPAIGN CODE</th> */}
                                <th>NFT TYPE</th>
                                {/* <th>UPGRADE INFO</th> */}
                                <th>REQUESTER (Member Id)</th>
                                <th>QUEUE TYPE</th>
                                <th>STATUS</th>
                                <th>RESULT</th>
                                <th>NFT RESULT</th>
                                <th>CREATED</th>
                                <th>MODIFIED</th>
                                {/* <th>MEMBER REGISTER DATE</th> */}
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                queues && queues.length > 0
                                ?
                                queues
                                        .map(
                                            (x, index) => (
                                                <tr key={`queue_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
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
                                                        {/* <span>MemberId : {x.MemberId}</span>
                                                        <br/>
                                                        <span>Wallet Address : {x.WalletAddress}</span>
                                                        <br/> */}
                                                        <span>{x.QueueId}</span>
                                                    </td>
                                                    {/* <td>
                                                        {
                                                            x.MemberATokenId && "PaleBlueDot."
                                                        }
                                                        <br/>
                                                        {
                                                            x.MemberBTokenId && "MetaGarage"
                                                        }
                                                    </td> */}
                                                    {/* <td>
                                                        {
                                                            x.CampaignCode
                                                        }
                                                    </td> */}
                                                    <td>
                                                        { (x.NFTType == 'undefined' || x.NFTType == undefined) ? '' : x.NFTType }
                                                    </td>
                                                    {/* <td>
                                                        { x.TokenId && <>TokenId: {x.TokenId}</> }
                                                    </td> */}
                                                    <td>
                                                        { x.MemberId }
                                                    </td>
                                                    <td>
                                                        { x.QueueType }
                                                    </td>
                                                    <td>
                                                        { x.Status }
                                                    </td>
                                                    <td>
                                                        { 
                                                            x.Result &&
                                                            <Tooltip tooltipText={x.Result}>
                                                                <span>{x.Result.substring(0, 19) + (x.Result.length > 20 ? "..." : "")}</span>
                                                            </Tooltip>
                                                         }
                                                    </td>
                                                    <td>
                                                        { x.NFTResult && <a className="underline" target="_blank" href={`https://polygonscan.com/tx/${JSON.parse(x.NFTResult).transactionHash}`}>Tx Hash</a> }
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        { x.ModifiedDate && <>
                                                        { moment(x.ModifiedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.ModifiedDate).format('HH:mm')}
                                                        </>}
                                                    </td>
                                                    {/* <td>
                                                        { moment(x.MemberCreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.MemberCreatedDate).format('HH:mm')}
                                                    </td> */}
                                                    <td>
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    {<a onClick={() => deleteQueue(x.QueueId)}>Delete</a>}
                                                                    {x.Status != 'SUCCESS' && <a onClick={() => resetQueue(x.QueueId)}>Reset</a>}
                                                                    {/* {x.QueueType == 'MINT_QUEUE' && x.Status != 'SUCCESS' && <a onClick={() => forceMintMemberPreregister(x.QueueId)}>Reset with Force Preregister</a>}
                                                                    {x.QueueType == 'MINT_QUEUE' && x.Status != 'SUCCESS' && <a onClick={() => forceMintMemberRegular(x.QueueId)}>Reset with Force Regular</a>} */}

                                                                    {/* {x.QueueType == 'MINT_QUEUE' && (x.NFTType == 'MEMBER_A' || x.NFTType == 'MEMBER_B') && <a onClick={() => dequeue(x.QueueId, 'LEGEND')}>Mint Legend NFT</a>}
                                                                    {x.QueueType == 'MINT_QUEUE' && (x.NFTType == 'MEMBER_A' || x.NFTType == 'MEMBER_B') && <a onClick={() => dequeue(x.QueueId, 'COMMON')}>Mint Common NFT</a>}
                                                                    {x.QueueType == 'MINT_QUEUE' && (x.NFTType == 'MEMBER_A' || x.NFTType == 'MEMBER_B') && <a onClick={() => dequeue(x.QueueId, 'ASSOCIATE')}>Mint Associate NFT</a>}
                                                                    {x.QueueType == 'MINT_QUEUE' && (x.NFTType == 'CAR' || x.NFTType == 'CHARACTER') && <a onClick={() => dequeue(x.QueueId, '')}>Mint NFT</a>} */}

                                                                    {/* {<a onClick={() => announceReveal(x.ContractAddress, x.TokenId)}>Announce Reveal</a>}
                                                                    <a onClick={() => reveal(x.ContractAddress, x.TokenId)}>Reveal</a> */}
                                                                    {/* <a onClick={() => deactivateMessage(x.MessageId)}>Allow Transfer</a> */}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={11} className="text-center">
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

export default QueueListing