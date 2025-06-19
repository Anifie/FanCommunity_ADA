import { useContext, useEffect, useState, useRef } from "react";
import { faSpinner, faGear, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MemberContext } from "../../../common/context/MemberContext";
import { lanternListingGet, lanternDelete, lanternApprove, lanternReject, lanternReset } from "../api";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import moment from "moment";
import { useRouter } from 'next/router'
import useStateCallback from "../../../common/hooks/useStateCallback";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import Tooltip from "../../../common/components/tooltip";
import Checkbox from "../../../common/components/checkbox";
import ModalUpload from "./modalUpload";
import ModalCalendar from "../../../common/components/modal/ModalCalendar";

const IlluminatedListings = () => {

    const {member} = useContext (MemberContext)

    const [loading, setLoading] = useState(false)
    const [lanterns, setLanterns] = useState([])
    const [status, setStatus] = useState()
    const [lanternId, setLanternId] = useState()
    const [collectionId, setCollectionId] = useState()
    const [PlayerId, setPlayerId] = useState()
    const router = useRouter()
    const mdLoading = useRef(null)
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useStateCallback(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const [isCheckAll, setIsCheckAll] = useState(false)
    const [isCheckLanterns, setIsCheckLanterns] = useState([])
        
    const [createdDateRange, setCreatedDateRange] = useState({startDate: null, endDate: null});
    const [modifiedDateRange, setModifiedDateRange] = useState({startDate: null, endDate: null});

    const mdUpload = useRef()
    const mdConfirm = useRef()
    const mdCalendar = useRef()

    useEffect(() => {
        getLanterns()
    }, [pageIndex, pageSize, pages])

    const getLanterns = async () => {
        setLoading(true)
        setLanterns([]);
        // console.log("pages 1", pages);
        // console.log("pageIndex", pageIndex);
        let result = await lanternListingGet({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            lanternId: lanternId,
            collectionId: collectionId,
            PlayerId: PlayerId,
            createdDateStart: createdDateRange.startDate,
            createdDateEnd: createdDateRange.endDate,
            modifiedDateStart: modifiedDateRange.startDate,
            modifiedDateEnd: modifiedDateRange.endDate
        })
        console.log("lanterns result", result);
        if(result.Success) {
            
            setLastPageIndex(null);
            if(result.Data.lanterns.length > 0 && result.Data.lastKey) {
                //console.log("got data", pageIndex, lastPageIndex);
                if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
                    //console.log("pages 3", pages);
                    setPages([...pages, result.Data.lastKey.created_date.S], x => {setLoading(false)})
                }
                else {
                    setLanterns(result.Data.lanterns)
                }
            }
            else {
                //console.log("setLastPageIndex");
                setLastPageIndex(pageIndex)
                setLanterns(result.Data.lanterns)
            }
        }
        setLoading(false)
    }

    const changePageSize = (newSize) => {
        console.log("changePageSize");
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        console.log("search");
        setPages([null])
        setPageIndex(0)
    }

    const approveLantern = async (lanternId, PlayerId) => {
        mdLoading.current.show("Approving..")
        let result = await lanternApprove(lanternId, PlayerId)
        if(result?.Success){
            showSuccess("Lantern approved")
            await getLanterns()
        }
        mdLoading.current.close()
    }

    const rejectLantern = async (lanternId, PlayerId) => {
        mdLoading.current.show("Rejecting..")
        let result = await lanternReject(lanternId, PlayerId)
        if(result?.Success){
            showSuccess("Lantern rejected")
            await getLanterns()
        }
        mdLoading.current.close()
    }

    const resetLantern = async (lanternId, PlayerId) => {
        mdLoading.current.show("Resetting..")
        let result = await lanternReset(lanternId, PlayerId)
        if(result?.Success){
            showSuccess("Lantern resetted")
            await getLanterns()
        }
        mdLoading.current.close()
    }

    const deleteLantern = (lanternId) => {
        mdConfirm.current.show("Confirm", "Confirm Delete Lantern with Id '" + lanternId + "' ?", "Delete", confirmDeleteLantern, lanternId)
    }

    const confirmDeleteLantern = async (lanternId) => {
        mdLoading.current.show("Deleting..")
        let result = await lanternDelete(lanternId)
        if(result?.Success){
            showSuccess("Lantern deleted")
            await getLanterns()
        }
        mdLoading.current.close()
    }

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll)
        setIsCheckLanterns(lanterns.map(x => x.LanternId))
        if (isCheckAll) {
            setIsCheckLanterns([])
        }
    }

    const handleClick = e => {
        const { id, checked } = e.target
        setIsCheckLanterns([...isCheckLanterns, id])
        if (!checked) {
            setIsCheckLanterns(isCheckLanterns.filter(x => x !== id))
        }
    }

    const deleteAll = () =>  {
        mdConfirm.current.show("Confirm", "Confirm Delete All Lanterns ?", "Delete", confirmDeleteAllLanterns, isCheckLanterns)
    }

    const resetAll = () => {
        mdConfirm.current.show("Confirm", "Confirm Reset All Lanterns's status to PENDING?", "Reset", confirmResetAllLanterns, isCheckLanterns)
    }

    const confirmResetAllLanterns = async (lanternIds) => {
        mdLoading.current.show("Reseting..", lanternIds)
        for await (const lanternId of lanternIds) {
            let lantern = lanterns.find(x=>x.LanternId == lanternId)
            let result = await lanternReset(lanternId, lantern.PlayerId)
            if(result?.Success){
                showSuccess("Lantern reseted")
            }
            else {
                showFailed(result.Message)
            }
        };     
        setIsCheckAll(false)
        setIsCheckLanterns([])
        await getLanterns()   
        mdLoading.current.close()
    }

    const changeCreatedDateRange = (dateRange) => {
        // console.log("pages 4", pages);
        setCreatedDateRange(dateRange)
    }

    const changeModifiedDateRange = (dateRange) => {
        // console.log("pages 4", pages);
        setModifiedDateRange(dateRange)
    }

    const approveAll = () =>  {
        mdConfirm.current.show("Confirm", "Confirm Approve All Lanterns ?", "Approve", confirmApproveAllLanterns, isCheckLanterns)
    }

    const rejectAll = () =>  {
        mdConfirm.current.show("Confirm", "Confirm Reject All Lanterns ?", "Reject", confirmRejectAllLanterns, isCheckLanterns)
    }

    const confirmApproveAllLanterns = async (lanternIds) => {
        mdLoading.current.show("Approving..")
        for await (const lanternId of lanternIds) {
            let lantern = lanterns.find(x=>x.LanternId == lanternId)
            if(lantern.Status == 'PENDING') {
                let result = await lanternApprove(lanternId, lantern.PlayerId)
                if(result?.Success)
                    showSuccess("Lantern " + lanternId + " approved")
                else 
                    showFailed("Failed to approve lantern " + lanternId)
            }
        };     
        setIsCheckAll(false)
        setIsCheckLanterns([])
        await getLanterns()   
        mdLoading.current.close()
    }

    const confirmRejectAllLanterns = async (lanternIds) => {
        mdLoading.current.show("Rejecting..")
        for await (const lanternId of lanternIds) {
            let lantern = lanterns.find(x=>x.LanternId == lanternId)
            if(lantern.Status == 'APPROVED') {
                let result = await lanternReject(lanternId, lantern.PlayerId)
                if(result?.Success)
                    showSuccess("Lantern " + lanternId + " rejected")
                else 
                    showFailed("Failed to reject lantern " + lanternId)
            }
        };     
        setIsCheckAll(false)
        setIsCheckLanterns([])
        await getLanterns()   
        mdLoading.current.close()
    }

    const confirmDeleteAllLanterns = async (lanternIds) => {
        mdLoading.current.show("Deleting..")
        for await (const lanternId of lanternIds) {
            let result = await lanternDelete(lanternId)
            if(result?.Success){
                showSuccess("Lantern deleted")
            }
        };     
        setIsCheckAll(false)
        setIsCheckLanterns([])
        await getLanterns()   
        mdLoading.current.close()
    }

    const upload = () => {
        mdUpload.current.show(search)
    }

    const calendar = (title, callback) => {
        mdCalendar.current.show(title, callback)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <ModalUpload ref={mdUpload} />
            <ModalCalendar ref={mdCalendar} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">LANTERN - ILLUMINATED</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="flex w-full justify-start items-center my-2">
                        <button className="btn btn-primary btn-sm ml-2" onClick={() => upload()}><FontAwesomeIcon icon={faUpload} className="text-sm w-4 mr-1" /> UPLOAD</button>
                        <button className="btn btn-primary btn-sm ml-2" onClick={() => router.push("/lantern/illuminated/create")}>+ ILLUMINATE NEW LANTERN</button>
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
                                        <option value="APPROVED">APPROVED</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Lantern Id</label>
                                    <input type="text" 
                                        placeholder="Lantern Id" 
                                        value={lanternId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setLanternId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Collection Id</label>
                                    <input type="text" 
                                        placeholder="Collection Id" 
                                        value={collectionId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setCollectionId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="PlayerId" 
                                        value={PlayerId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setPlayerId(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Created Date</label>
                                    <input type="text" 
                                        placeholder="Created Date" 
                                        value={`${createdDateRange && createdDateRange.startDate ? moment(createdDateRange.startDate).format("YYYY-MM-DD") : "Start Date"} - ${createdDateRange && createdDateRange.endDate ? moment(createdDateRange.endDate).format("YYYY-MM-DD") : "End Date"}`}
                                        className="input input-bordered w-full"
                                        readOnly
                                        onClick={(e) => calendar("Created Date", changeCreatedDateRange)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Modified Date</label>
                                    <input type="text" 
                                        placeholder="Modified Date" 
                                        value={`${modifiedDateRange && modifiedDateRange.startDate ? moment(modifiedDateRange.startDate).format("YYYY-MM-DD") : "Start Date"} - ${modifiedDateRange && modifiedDateRange.endDate  ? moment(modifiedDateRange.endDate).format("YYYY-MM-DD") : "End Date"}`}
                                        className="input input-bordered w-full"
                                        readOnly
                                        onClick={(e) => calendar("Modified Date", changeModifiedDateRange)} />
                                </div>
                            </div>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between w-full mb-2">
                        <div className="flex gap-2">
                            <button className="btn btn-secondary btn-sm" disabled={isCheckLanterns.length == 0} onClick={() => approveAll()}>Approve All</button>
                            <button className="btn btn-secondary btn-sm" disabled={isCheckLanterns.length == 0} onClick={() => rejectAll()}>Reject All</button>
                            <button className="btn btn-secondary btn-sm" disabled={isCheckLanterns.length == 0} onClick={() => resetAll()}>Reset to Pending</button>
                            <button className="btn btn-secondary btn-sm" disabled={isCheckLanterns.length == 0} onClick={() => deleteAll()}>Delete All</button>
                        </div>
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs" onChange={(e) => changePageSize(e.target.value)}>
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
                                <th>ID</th>
                                <th>NICK NAME</th>
                                <th>MESSAGE</th>
                                <th>MUSIC</th>
                                <th>POSITION</th>
                                <th>STATUS</th>
                                <th>CREATED</th>
                                <th>MODIFIED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                lanterns && lanterns.length > 0
                                ?
                                    lanterns
                                        .map(
                                            (x, index) => (
                                                <tr key={`lantern_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                    <Checkbox
                                                        key={x.LanternId}
                                                        type="checkbox"
                                                        name={x.LanternId}
                                                        id={x.LanternId}
                                                        handleClick={handleClick}
                                                        isChecked={isCheckLanterns.includes(x.LanternId)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-xs">
                                                        <div className="flex-col">
                                                            <div className="flex gap-1">
                                                                <label>Lantern Id:</label>
                                                                {x.LanternId}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <label>Member Id:</label>
                                                                {x.PlayerId}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <label>Collection Id:</label>
                                                                {x.CollectionId}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span>{x.NickName && x.NickName.substring(0, 19) + (x.NickName.length > 20 ? "..." : "")}</span>
                                                    </td>
                                                    <td>
                                                        <Tooltip tooltipText={x.Message}>
                                                            <span>{x.Message.substring(0, 19) + (x.Message.length > 20 ? "..." : "")}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td>
                                                        {/* <Tooltip tooltipText={x.Music}>
                                                            <span>{x.Music.substring(0, 19) + (x.Music.length > 20 ? "..." : "")}</span>
                                                        </Tooltip> */}
                                                        <span>{x.Music.substring(0, 19) + (x.Music.length > 20 ? "..." : "")}</span>
                                                    </td>
                                                    <td>
                                                        {/* <Tooltip tooltipText={x.Position}>
                                                            <span>{x.Position.substring(0, 19) + (x.Position.length > 20 ? "..." : "")}</span>
                                                        </Tooltip> */}
                                                        <span>{x.Position.substring(0, 19) + (x.Position.length > 20 ? "..." : "")}</span>
                                                    </td>
                                                    <td>
                                                        {
                                                            x.Status == 'APPROVED'
                                                            ? <div className="badge badge-success">{x.Status}</div>
                                                            : <div className="badge badge-warning">{x.Status}</div>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="flex-col justify-center items-center">
                                                            <div>{moment(x.CreatedDate).format('YYYY-MM-DD')}</div>
                                                            <div>{moment(x.CreatedDate).format('HH:mm')}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {
                                                            x.ModifiedDate &&
                                                            <div className="flex-col justify-center items-center">
                                                                <div>{moment(x.ModifiedDate).format('YYYY-MM-DD')}</div>
                                                                <div>{moment(x.ModifiedDate).format('HH:mm')}</div>
                                                            </div>
                                                        } 
                                                    </td>
                                                    <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                {
                                                                    (() => {
                                                                        switch(x.Status) {
                                                                            case 'APPROVED':
                                                                                return (
                                                                                    <>
                                                                                        <li>
                                                                                            <a onClick={() => rejectLantern(x.LanternId, x.PlayerId)}>Reject</a>
                                                                                        </li>
                                                                                        <li>
                                                                                            <a onClick={() => resetLantern(x.LanternId, x.PlayerId)}>Reset to Pending</a>
                                                                                        </li>
                                                                                    </>
                                                                                )

                                                                            case 'REJECTED':
                                                                                return (
                                                                                    <>
                                                                                        <li>
                                                                                            <a onClick={() => resetLantern(x.LanternId, x.PlayerId)}>Reset to Pending</a>
                                                                                        </li>
                                                                                    </>
                                                                                )

                                                                            case 'PENDING':
                                                                                return (
                                                                                    <>
                                                                                        <li>
                                                                                            <a onClick={() => approveLantern(x.LanternId, x.PlayerId)}>Approve</a>
                                                                                        </li>
                                                                                        <li>
                                                                                            <a onClick={() => rejectLantern(x.LanternId, x.PlayerId)}>Reject</a>
                                                                                        </li>
                                                                                    </>
                                                                                )
                                                                        }
                                                                    })()
                                                                }
                                                                <li>
                                                                    <a onClick={() => router.push("/lantern/illuminated/edit?lanternid=" + x.LanternId)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a onClick={() => deleteLantern(x.LanternId)}>Delete</a>
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
                    <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IlluminatedListings