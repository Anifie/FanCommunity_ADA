import { useContext, useEffect, useRef, useState } from "react";
import { faCalculator, faGear, faSpinner, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { pointSettingsListing, enumGet, pointSettingDelete } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Tooltip from "../../../common/components/tooltip";

const PointSettingsListings = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [leaderboards, setLeaderboards] = useState([])
    const [enums, setEnums] = useState([])
    // const [status, setStatus] = useState()
    // const [chatId, setChatId] = useState()
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    
    useEffect(() => {        
        getLeaderboards()
        getEnums()
    }, [])

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getLeaderboards()
    }, [pageIndex, pageSize])

    const getEnums = async () => {
        let result = await enumGet();
        console.log("getEnum result", result);
        if(result.Success) {
            setEnums(result.Data);
        }
    }

    const getLeaderboards = async () => {
        setLoading(true)
        setLeaderboards([]);
        let result = await pointSettingsListing({
            pageSize: pageSize, 
            nextToken: pages[pageIndex], 
            // status: status, 
            // chatId: chatId
            // displayName: displayName, 
            // role: role
        })
        console.log("leaderboards result", result);
        if(result.Success) {
            setLeaderboards(result.Data)
            setLastPageIndex(null);
            if(result.Data.length > 0 && result.Data.nextToken) {
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
        getLeaderboards()
    }

    const deleteSetting = (id) => {
        mdConfirm.current.show("Confirm", "Confirm Delete Point Setting '" + id + "' ?", "Delete", confirmDeleteSetting, id)
    }

    const confirmDeleteSetting = async (id) => {
        mdLoading.current.show("Deleting..")
        let result = await pointSettingDelete({pointSettingsId: id})
        console.log("delete result", result);
        if(result?.Success){
            showSuccess("Point Setting deleted")
            await getLeaderboards()
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
                <h2 className="ml-3 text-sm font-bold">POINT SETTINGS</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/point/settings/create")}><FontAwesomeIcon icon={faGear} className="w-[15px]" /> NEW POINT SETTINGS BASED ON DATE</button>
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
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Chat Id</label>
                                    <input type="text" 
                                        placeholder="Chat Id" 
                                        value={chatId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setChatId(e.target.value)} />
                                </div> */}
                                {/* <div className="flex flex-col">
                                    <label>Display Name</label>
                                    <input type="text" 
                                        placeholder="Display Name" 
                                        value={displayName}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDisplayName(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Role</label>
                                    <select className="select select-bordered"
                                            value={role} 
                                            onChange={(e) => setRole(e.target.value)}>
                                        <option value="PLAYER">PLAYER</option>
                                        <option value="CELEBRITY">CELEBRITY</option>
                                    </select>
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
                    <div className="flex justify-end w-full mb-2">
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
                                <th>#</th>
                                <th>POINT SETTING ID</th>
                                <th>SETTINGS</th>
                                <th>SETTING TYPE</th>
                                <th>START DATE</th>
                                <th>END DATE</th>
                                <th>CREATED</th>
                                <th>MODIFIED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                leaderboards && leaderboards.length > 0 && leaderboards[0] != null
                                ?
                                leaderboards
                                        .map(
                                            (x, index) => (
                                                <tr key={`role_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.SK}
                                                    </td>
                                                    <td>
                                                        {
                                                            <Tooltip tooltipText={JSON.stringify({
                                                                "Weight on Role": x.weight_role,
                                                                "Minimum Message Length": x.message_minimum_length,
                                                                "Omitted Channels": x.omitted_channel_ids,
                                                                "Weight on Attachments": x.weight_attachments,
                                                                "Weight on Message": x.weight_message,
                                                                "Weight on Reaction": x.weight_reaction,
                                                                "Weight on Vote": x.weight_vote,
                                                                "Weight on NFT": x.weight_nft,
                                                                "Weight on Replies": x.weight_replies,
                                                            })}>
                                                                <span>Settings..</span>
                                                            </Tooltip>
                                                        }
                                                    </td>
                                                    <td>
                                                        {x.point_setting_type}
                                                    </td>
                                                    <td>
                                                        { x.start_date && moment(x.start_date).utcOffset(9 * 60).format("YYYY-MM-DD HH:mm:ss") }
                                                    </td>
                                                    <td>
                                                        { x.end_date && moment(x.end_date).utcOffset(9 * 60).format("YYYY-MM-DD HH:mm:ss") }
                                                    </td>
                                                    <td>
                                                        { moment(x.created_date).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.created_date).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        {
                                                            x.modified_date &&
                                                            <>
                                                                { moment(x.modified_date).format('YYYY-MM-DD')}
                                                                <br />
                                                                { moment(x.modified_date).format('HH:mm')}
                                                            </>
                                                        }
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
                                                                    <a onClick={() => router.push("/point/settings/" + x.SK)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a onClick={() => deleteSetting(x.SK)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
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

export default PointSettingsListings