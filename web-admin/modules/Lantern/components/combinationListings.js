import { useContext, useEffect, useState, useRef } from "react";
import { faSpinner, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MemberContext } from "../../../common/context/MemberContext";
import { combinationListingGet, combinationPost, combinationGet } from "../api";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import moment from "moment";
import { useRouter } from 'next/router'
import useStateCallback from "../../../common/hooks/useStateCallback";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";

const CombinationListings = () => {

    const {member} = useContext (MemberContext)

    const [loading, setLoading] = useState(false)
    const [combinations, setCombinations] = useState([])
    const [status, setStatus] = useState()
    //const [lanternId, setLanternId] = useState()
    const [groupId, setGroupId] = useState()
    //const [PlayerId, setPlayerId] = useState()
    const router = useRouter()
    const mdLoading = useRef(null)
    const {showSuccess} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdConfirm = useRef(null)

    useEffect(() => {
        getCombinations()
    }, [pageIndex, pageSize])

    const getCombinations = async () => {
        setLoading(true)
        setCombinations([]);
        let result = await combinationListingGet({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            groupId: groupId,
            //PlayerId: PlayerId
        })
        console.log("combinations result", result);
        if(result.Success) {
            setCombinations(result.Data.combinations)
            setLastPageIndex(null);
            if(result.Data.combinations.length > 0 && result.Data.lastKey) {
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
        getCombinations()
    }

    // const combineLantern = async (PlayerId) => {
    //     mdLoading.current.show("Combining..")
    //     let result = await combinationPost(PlayerId)
    //     if(result?.Success){
    //         showSuccess("Lantern combined")
    //         await getCombinations()
    //     }
    //     mdLoading.current.close()
    // }

    // const revokeLantern = async (lanternId, PlayerId) => {
    //     mdLoading.current.show("Revoking..")
    //     let result = await lanternRevoke(lanternId, PlayerId)
    //     if(result?.Success){
    //         showSuccess("Lantern revoked")
    //         await getLanterns()
    //     }
    //     mdLoading.current.close()
    // }

    // const deleteLantern = (lanternId) => {
    //     mdConfirm.current.show("Confirm", "Confirm Delete Lantern with Id '" + lanternId + "' ?", "Delete", confirmDeleteLantern, lanternId)
    // }

    // const confirmDeleteLantern = async (lanternId) => {
    //     mdLoading.current.show("Deleting..")
    //     let result = await lanternDelete(lanternId)
    //     if(result?.Success){
    //         showSuccess("Lantern deleted")
    //         await getLanterns()
    //     }
    //     mdLoading.current.close()
    // }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">LANTERN - COMBINATIONS</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/lantern/combination/combine")}>+ COMBINE LANTERN</button>
                    </div>
                    <div className="card bg-[#212529] w-full mb-4">
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="FILLED">FILLED</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Group Id</label>
                                    <input type="text" 
                                        placeholder="Group Id" 
                                        value={groupId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setGroupId(e.target.value)} />
                                </div>
                            </div>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end w-full mb-2">
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs" onChange={(e) => changePageSize(e.target.value)}>
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
                                <th>GROUP ID</th>
                                <th>PAIN LANTERN ID</th>
                                <th>FEVER LANTERN ID</th>
                                <th>FEAR LANTERN ID</th>
                                <th>LONELY LANTERN ID</th>
                                <th>PUS BLISTER LANTERN ID</th>
                                <th>STATUS</th>
                                <th>CREATED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                combinations && combinations.length > 0
                                ?
                                combinations
                                        .map(
                                            (x, index) => (
                                                <tr key={`combine_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.GroupId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.PainLanternId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.FeverLanternId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.FearLanternId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.LonelyLanternId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.PusBlisterLanternId}
                                                    </td>
                                                    <td>
                                                        {
                                                            x.Status == 'FILLED'
                                                            ? <div className="badge badge-success">{x.Status}</div>
                                                            : <div className="badge badge-warning">{x.Status}</div>
                                                        }
                                                    </td>
                                                    <td>
                                                        {x.CreatedDate}
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={9} className="text-center">
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

export default CombinationListings