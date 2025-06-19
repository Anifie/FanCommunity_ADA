import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { avatarListing, avatarPost, avatarPut } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Tooltip from "../../../common/components/tooltip";

const AvatarListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [avatars, setAvatars] = useState([])
    const [status, setStatus] = useState()
    const [avatarId, setAvatarId] = useState()
    const [memberId, setMemberId] = useState()
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(50)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    
    useEffect(() => {        
        getAvatars()
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
        getAvatars()
    }, [pageIndex, pageSize])

    const getAvatars = async () => {
        setLoading(true)
        setAvatars([]);
        let result = await avatarListing({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            avatarId: avatarId,
            memberId: memberId
        })
        console.log("avatars result", result);
        if(result.Success) {
            setAvatars(result.Data.Avatars)
            setLastPageIndex(null);
            if(result.Data.Avatars.length > 0 && result.Data.lastKey) {
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
        getAvatars()
    }

    const deactivateAvatar = (avatarId) => {
        mdConfirm.current.show("Confirm", "Confirm Deactivate Avatar with Id '" + avatarId + "' ?", "Deactivate", confirmDeactivateAvatar, avatarId)
    }

    // const player2Celebrity = (playerId) => {
    //     mdConfirm.current.show("Confirm", "Convert Player to Celebrity with Id '" + playerId + "' ?", "Convert", confirmPlayer2Celebrity, playerId)
    // }

    const confirmDeactivateAvatar = async (avatarId) => {
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
                <h2 className="ml-3 text-sm font-bold">AVATAR</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/metaverse/avatar/create")}>+ CREATE NEW</button>
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
                                    <label>Avatar Id</label>
                                    <input type="text" 
                                        placeholder="Avatar Id" 
                                        value={avatarId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setAvatarId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="Member Id" 
                                        value={memberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberId(e.target.value)} />
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
                                <th>AVATAR ID</th>
                                <th>MEMBER ID</th>
                                <th>AVATAR DATA</th>
                                <th>STATUS</th>
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                avatars && avatars.length > 0
                                ?
                                avatars
                                        .map(
                                            (x, index) => (
                                                <tr key={`avatars_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.AvatarId}
                                                    </td>
                                                    <td>
                                                        {x.MemberId}
                                                    </td>
                                                    <td>
                                                        { 
                                                            x.AvatarData &&
                                                            <Tooltip tooltipText={JSON.stringify(x.AvatarData)}>
                                                                <span>{JSON.stringify(x.AvatarData).substring(0, 19) + (JSON.stringify(x.AvatarData).length > 20 ? "..." : "")}</span>
                                                            </Tooltip>
                                                        }
                                                    </td>
                                                    <td>
                                                        {x.Status}
                                                    </td>
                                                    {/* <td>
                                                        { x.CelebrityId}
                                                    </td> */}
                                                    {/* <td>
                                                        {x.ThemeId}
                                                    </td>
                                                    <td>
                                                        {x.Tag}
                                                    </td>
                                                    <td>
                                                        { x.Config}
                                                    </td> */}
                                                    <td>
                                                        { x.CreatedDate}
                                                    </td>
                                                    {/* <td>
                                                        {x.Role}
                                                    </td>
                                                    <td>
                                                        {x.ProfilePictureURL && <a href={x.ProfilePictureURL}><img src={x.ProfilePictureURL} className="w-[50px]" /></a>}
                                                    </td> */}
                                                    <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                {/* <li>
                                                                    <a onClick={() => deactivateAvatar(x.AvatarId)}>Deactivate</a>
                                                                </li> */}
                                                                <li>
                                                                    <a onClick={() => router.push("/metaverse/avatar/edit/" + x.AvatarId)}>Edit</a>
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

export default AvatarListing