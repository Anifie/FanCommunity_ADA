import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { batchUserListingPost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import ModalResult from "./modalResult";
import ModalMessage from "./modalMessages";

const AnalysisMessageListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState()
    const [batchId, setBatchId] = useState()
    
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    const mdResult = useRef()
    const mdMessage = useRef()
    
    useEffect(() => {        
        getBatches()
    }, [])

    const viewResult = (result) => {
        mdResult.current.assignResult(result);
        mdResult.current.show()
    }

    const viewMessages = (_batchId) => {
        let batch = batchListingPost({batchId: _batchId, includeMessages: true})
        if(!batch || !batch.Success || batch.Data.batches.length === 0) {
            showFailed('Messages not found')
            return;
        }
        mdMessage.current.assignMessages(JSON.parse(batch.Data.batches[0].UserMessages));
        mdMessage.current.show()
    }

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getBatches()
    }, [pageIndex, pageSize])

    const getBatches = async () => {
        setLoading(true)
        setMessages([]);
        let result = await batchUserListingPost({
            pageSize: pageSize, 
            nextToken: pages[pageIndex], 
            // status: status, 
            // batchId: batchId
        })
        console.log("messages result", result);
        if(result.Success) {
            setMessages(result.Data.messages)
            setLastPageIndex(null);
            if(result.Data.messages.length > 0 && result.Data.nextToken) {
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
        getBatches()
    }

    // const deactivateComment = async (messageId, commentId) => {
    //     mdLoading.current.show("Deactivating..")
    //     let result = await commentInactivePost({messageId: messageId, commentId: commentId})
    //     console.log("deactivate result", result);
    //     if(result?.Success){
    //         showSuccess("Comment inactivated succesfully")
    //         await getBatches()
    //     }
    //     else {
    //         showFailed(result.Comment)
    //     }
    //     mdLoading.current.close()
    // }

    // const activateComment = async (messageId, commentId) => {
    //     mdLoading.current.show("Activating..")
    //     let result = await commentActivePost({messageId: messageId, commentId: commentId})
    //     console.log("activate result", result);
    //     if(result?.Success){
    //         showSuccess("Comment activated succesfully")
    //         await getBatches()
    //     }
    //     else {
    //         showFailed(result.Comment)
    //     }
    //     mdLoading.current.close()
    // }

    const deleteBatch = (_batchId) => {
        mdConfirm.current.show("Confirm", "Confirm delete Batch ?", "Delete Batch", confirmDeleteBatch, _batchId)
    }

    const confirmDeleteBatch = async (_batchId) => {
        mdLoading.current.show("Deleting Batch..")

        let result = await batchDelete({
            batchId: _batchId
        })
        console.log("Delete result", result);
        if(result?.Success){
            showSuccess("Batch Deleted")
            await getBatches();
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
            <ModalResult ref={mdResult} />
            <ModalMessage ref={mdMessage} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">DISCORD USERS</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            {/* <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="DONE">DONE</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="FAILED">FAILED</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Batch Id</label>
                                    <input type="text" 
                                        placeholder="Batch Id" 
                                        value={batchId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setBatchId(e.target.value)} />
                                </div>
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Refresh</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end w-full mb-2">
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs"
                                    value={pageSize} 
                                    onChange={(e) => changePageSize(e.target.value)}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>#</th>
                                <th>DISCORD USER ID</th>
                                <th>ROLES</th>
                                <th>JOINED DATE</th>
                                <th>CREATED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                messages && messages.length > 0
                                ?
                                messages
                                        .map(
                                            (x, index) => (
                                                <tr key={`message_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.DiscordUserId}
                                                    </td>
                                                    <td>
                                                        {x.Roles}
                                                    </td>
                                                    <td>
                                                        {x.JoinedDate} <br/>
                                                        {/* {x.DiscordUserName} */}
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>    
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={5} className="text-center">
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
                    <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisMessageListing