import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { surveyReport } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";
import { CSVLink } from "react-csv";

const MemberAnswerListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [surveyReports, setSurveyReports] = useState([])
    // const [status, setStatus] = useState()
    // const [memberWalletAddress, setMemberWalletAddress] = useState()
    const [surveyId, setSurveyId] = useState()
    const [memberId, setMemberId] = useState()
    
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)

    // const [isCheckAll, setIsCheckAll] = useState(false)
    // const [isCheckNFTs, setIsCheckNFTs] = useState([])
    
    useEffect(() => {        
        getSurveyReport()
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
        getSurveyReport()
    }, [pageIndex, pageSize])

    const getSurveyReport = async () => {
        setLoading(true)
        setSurveyReports([]);
        let result = await surveyReport({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            // status: status
            memberId: memberId,
            surveyId: surveyId
        })
        console.log("survey report result", result);
        if(result.Success) {
            setSurveyReports(result.Data.answers)
            setLastPageIndex(null);
            if(result.Data.answers.length > 0 && result.Data.lastKey) {
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
    
    // const deleteSurvey = (surveyId) => {
    //     mdConfirm.current.show("Confirm", "Confirm delete survey and its member answers ?", "Delete Survey", confirmDeleteSurvey, surveyId)
    // }

    // const confirmDeleteSurvey = async (surveyId) => {
    //     mdLoading.current.show("Deleting survey..")
        
    //     let result = await surveyDelete({
    //         surveyId: surveyId
    //     })
    //     console.log("delete survey result", result);
    //     if(result?.Success){
    //         showSuccess("Survey Deleted")
    //         await getSurveyReport();
    //     }
    //     else {
    //         showFailed(result.Message)
    //     }
    //     mdLoading.current.close()
    // }
    
    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getSurveyReport()
    }

    // const handleSelectAll = () => {
    //     setIsCheckAll(!isCheckAll)
    //     setIsCheckNFTs(nfts.map(x => x.AssetId))
    //     if (isCheckAll) {
    //         setIsCheckNFTs([])
    //     }
    // }

    // const handleClick = e => {
    //     const { id, checked } = e.target
    //     setIsCheckNFTs([...isCheckNFTs, id])
    //     if (!checked) {
    //         setIsCheckNFTs(isCheckNFTs.filter(x => x !== id))
    //     }
    // }

    // const revealAll = () =>  {
    //     mdConfirm.current.show("Confirm", "Confirm Reveal Selected NFTs ?", "Confirm", confirmRevealAllNFTs, isCheckNFTs)
    // }

    // const allowTransferAll = () => {
    //     mdConfirm.current.show("Confirm", "Confirm Allow Transfer All NFTs ?", "Confirm", confirmAllowTransferAllNFTs, isCheckNFTs)
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

    //             // let result = await lanternApprove(assetId, lantern.MemberId)
    //             // if(result?.Success)
    //             //     showSuccess("Lantern " + assetId + " approved")
    //             // else 
    //             //     showFailed("Failed to approve lantern " + assetId)
            
    //     }
      
    //     console.log("batch reveal nfts ", _nfts);

    //     let batchRevealNFTs = await batchRevealPost({nfts: _nfts});
    //     console.log("batchRevealNFTs", batchRevealNFTs);

    //     if(batchRevealNFTs?.Success) 
    //         showSuccess("Batch reveal success")
    //     else 
    //         showFailed("Failed to batch reveal")

    //     setIsCheckAll(false)
    //     setIsCheckNFTs([])
    //     await getNFTs()   
    //     mdLoading.current.close()
    // }

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


    // const announceReveal = (cntractAddress, tokenId) => {
    //     mdConfirm.current.show("Confirm", "Confirm send Discord message to user for NFT Reveal ?", "Announce Reveal", confirmAnnounceReveal, cntractAddress + '#'+tokenId)
    // }

    // const confirmAnnounceReveal = async (contrTokenId) => {
    //     mdLoading.current.show("Publishing reveal message..")
    //     let contracAddr = contrTokenId.split('#')[0];
    //     let tokenId = contrTokenId.split('#')[1];

    //     let result = await announceRevealPost({
    //         contractAddress: contracAddr,
    //         tokenId: tokenId
    //     })
    //     console.log("announce reveal result", result);
    //     if(result?.Success){
    //         showSuccess("Reveal message sent")
    //         await getNFTs();
    //     }
    //     else {
    //         showFailed(result.Message)
    //     }
    //     mdLoading.current.close()
    // }

    // const reveal = (cntractAddress, tokenId) => {
    //     mdConfirm.current.show("Confirm", "Confirm reveal NFT ?", "Reveal NFT", confirmReveal, cntractAddress + '#'+tokenId)
    // }

    // const confirmReveal = async (contrTokenId) => {
    //     mdLoading.current.show("Reveal NFT..")
    //     let contracAddr = contrTokenId.split('#')[0];
    //     let tokenId = contrTokenId.split('#')[1];

    //     let result = await revealPost({
    //         contractAddress: contracAddr,
    //         tokenId: tokenId
    //     })
    //     console.log("Reveal result", result);
    //     if(result?.Success){
    //         showSuccess("NFT Revealed")
    //         await getNFTs();
    //     }
    //     else {
    //         showFailed(result.Message)
    //     }
    //     mdLoading.current.close()
    // }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">Survey Report</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/survey/answers")}>+ NEW SURVEY QUESTIONAIRE</button>
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
                                </div> */}
                                <div className="flex flex-col">
                                    <label>Survey Id</label>
                                    <input type="text" 
                                        placeholder="Survey Id" 
                                        value={surveyId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setSurveyId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="Member Id" 
                                        value={memberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberId(e.target.value)} />
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
                        {/* <div className="flex items-center ml-5 gap-2">
                            <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => revealAll()}>Reveal</button>
                        </div> */}
                        <div className="flex gap-5 ml-10">
                            <CSVLink filename={"survey.csv"}
                                     data={surveyReports}
                                     headers={[
                                                {label: "SurveyId", key: "SurveyId"},
                                                {label: "SurveyTitle", key: "SurveyTitle"},
                                                {label: "MemberId", key: "MemberId"},
                                                {label: "DiscordId", key: "DiscordId"},
                                                {label: "WalletAddress", key: "WalletAddress"},
                                                {label: "Question", key: "QuestionJP"},
                                                {label: "Answer", key: "AnswerJP"},
                                                {label: "AnswerText", key: "AnswerText"},
                                                {label: "CreatedDate", key: "CreatedDate"}
                                            ]}>
                                <button className="btn btn-primary btn-sm" >Download CSV</button>
                            </CSVLink>
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
                                <th>SURVEY</th>
                                <th>MEMBER</th>
                                <th>QUESTION</th>
                                <th>ANSWER</th>
                                <th>CREATED DATE</th>
                                {/* <th>ACTIONS</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                surveyReports && surveyReports.length > 0
                                ?
                                surveyReports
                                        .map(
                                            (x, index) => (
                                                <tr key={`report_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
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
                                                        SurveyId: {x.SurveyId}
                                                        <br/>
                                                        Title: {x.SurveyTitle}
                                                        <br/>
                                                        Description: {x.SurveyDescription}
                                                    </td>
                                                    <td>
                                                        <span>Member Id: {x.MemberId}</span><br/>
                                                        <span>Discord Id: {x.DiscordId}</span><br/>
                                                        <span>Wallet Address: {x.WalletAddress}</span>
                                                    </td>
                                                    <td>
                                                        ({x.QuestionIndex}) {x.QuestionJP}
                                                    </td>
                                                    <td>
                                                        {x.AnswerIndex && <>({x.AnswerIndex})</> }{x.AnswerJP ? x.AnswerJP : x.AnswerText}
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    {/* <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    <a onClick={() => router.push("/survey/questionaires/edit/" + x.SurveyId)}>Edit</a>
                                                                    <a onClick={() => deleteSurvey(x.SurveyId)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td> */}
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

export default MemberAnswerListing