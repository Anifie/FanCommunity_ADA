import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { metaverseRoomListing, metaverseRoomPost, metaverseRoomPut } from "../api";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";

const MetaverseRoomListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [rooms, setRooms] = useState([])
    const [status, setStatus] = useState()
    const [roomId, setRoomId] = useState()
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(20)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    
    useEffect(() => {        
        getMetaverseRooms()
    }, [])

    // const getPlayers = async () => {
    //     setLoading(true)
    //     let result = await playerListingGet(null, null, null, null, null, 5)
    //     console.log("players result", result);
    //     if(result.Success) {
    //         setPlayers(result.Data.players)
    //     }
    //     setLoading(false)
    // }

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getMetaverseRooms()
    }, [pageIndex, pageSize])

    const getMetaverseRooms = async () => {
        setLoading(true)
        setRooms([]);
        let result = await metaverseRoomListing({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            roomId: roomId
        })
        console.log("rooms result", result);
        if(result.Success) {
            setRooms(result.Data.Rooms)
            setLastPageIndex(null);
            if(result.Data.Rooms.length > 0 && result.Data.lastKey) {
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
        getMetaverseRooms()
    }

    const deactivateMetaverseRoom = (metaverseRoomId) => {
        mdConfirm.current.show("Confirm", "Confirm Deactivate Room with Id '" + metaverseRoomId + "' ?", "Deactivate", confirmDeactivateMetaverseRoom, metaverseRoomId)
    }

    // const player2Celebrity = (playerId) => {
    //     mdConfirm.current.show("Confirm", "Convert Player to Celebrity with Id '" + playerId + "' ?", "Convert", confirmPlayer2Celebrity, playerId)
    // }

    const confirmDeactivateMetaverseRoom = async (metaverseRoomId) => {
        mdLoading.current.show("Deactivating..")
        // let result = await playerDeactivate(collectionId)
        // console.log("deactivate result", result);
        // if(result?.Success){
        //     showSuccess("Player deactivated")
        //     await getCollections()
        // }
        // else {
        //     showFailed(result.Message)
        // }
        mdLoading.current.close()
    }

    // const confirmPlayer2Celebrity = async (playerId) => {
    //     mdLoading.current.show("Converting..")
    //     let result = await celebrityPost({token: localStorage.getItem("tokyodome_admin_access_token"), playerId: playerId })
    //     console.log("celebrityPost result", result);
    //     if(result?.Success){
    //         showSuccess("Converted Player to Celebrity.")
    //         await getPlayers()
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
                <h2 className="ml-3 text-sm font-bold">METAVERSE ROOM</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/metaverse/room/create")}>+ CREATE NEW</button>
                    </div>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
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
                                    <label>Room Id</label>
                                    <input type="text" 
                                        placeholder="Room Id" 
                                        value={roomId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setRoomId(e.target.value)} />
                                </div>
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
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
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
                                <option value="50">100</option>
                                <option value="50">200</option>
                                <option value="50">500</option>
                                <option value="50">1000</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>#</th>
                                <th>EVENT ID</th>
                                <th>ROOM ID</th>
                                <th>ROOM INDEX</th>
                                <th>ROOM TYPE</th>
                                <th>ROOM INFO</th>
                                <th>USERS COUNT</th>
                                <th>VOICE CHAT</th>
                                <th>STATUS</th>
                                <th>CREATED</th>
                                <th>MODIFIED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rooms && rooms.length > 0
                                ?
                                rooms
                                        .map(
                                            (x, index) => (
                                                <tr key={`room_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.EventId}
                                                    </td>
                                                    <td>
                                                        {x.RoomId}
                                                    </td>
                                                    <td>
                                                        {x.RoomIndex}
                                                    </td>
                                                    <td>
                                                        {x.RoomType}
                                                    </td>
                                                    <td>
                                                        {x.Name}
                                                        <br/>
                                                        {x.Description}
                                                        <br/>
                                                        {x.ThumbnailURL}
                                                    </td>
                                                    <td>
                                                        {x.UsersCount} / {x.MaxUsers}
                                                    </td>
                                                    <td>
                                                        {x.IsVoiceChatEnabled ? 'Enabled' : 'Disabled'}
                                                    </td>
                                                    <td>
                                                        {x.Status}
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        { x.ModifiedDate && moment(x.ModifiedDate).format('YYYY-MM-DD')}
                                                        { x.ModifiedDate && <br />}
                                                        { x.ModifiedDate && moment(x.ModifiedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                {/* <li>
                                                                    <a onClick={() => deactivateMetaverseRoom(x.RoomId)}>Deactivate</a>
                                                                </li> */}
                                                                <li>
                                                                    <a onClick={() => router.push("/metaverse/room/edit/" + x.RoomId)}>Edit</a>
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
                    <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetaverseRoomListing