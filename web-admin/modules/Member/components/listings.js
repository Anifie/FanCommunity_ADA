import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memberListingGet, memberDelete } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { CSVLink } from "react-csv";

const MemberListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState([])
    // const [status, setStatus] = useState()
    const [memberId, setMemberId] = useState()
    const [discordUserId, setDiscordUserId] = useState()
    const [discordUserIdReal, setDiscordUserIdReal] = useState()
    const [walletAddress, setWalletAddress] = useState()
    // const [smartWalletAddress, setSmartWalletAddress] = useState()
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
        getMembers()
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
        getMembers()
    }, [pageIndex, pageSize])

    const getMembers = async () => {
        setLoading(true)
        setMembers([]);
        let result = await memberListingGet({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            // status: status, 
            memberId: memberId === '' ? undefined : memberId, 
            discordUserId: discordUserId === '' ? undefined : discordUserId,
            discordUserIdReal: discordUserIdReal === '' ? undefined : discordUserIdReal,
            walletAddress: walletAddress === '' ? undefined : walletAddress,
            // smartWalletAddress: smartWalletAddress === '' ? undefined : smartWalletAddress
            // displayName: displayName, 
            // role: role

        })
        console.log("members result", result);
        if(result.Success) {
            setMembers(result.Data.members)
            setLastPageIndex(null);
            if(result.Data.members.length > 0 && result.Data.lastKey) {
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
        getMembers()
    }

    const deactivatePlayer = (playerId) => {
        mdConfirm.current.show("Confirm", "Confirm Deactivate Player with Id '" + playerId + "' ?", "Delete", confirmDeactivatePlayer, playerId)
    }

    const player2Celebrity = (playerId) => {
        mdConfirm.current.show("Confirm", "Convert Player to Celebrity with Id '" + playerId + "' ?", "Convert", confirmPlayer2Celebrity, playerId)
    }

    const confirmDeactivatePlayer = async (playerId) => {
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

    const confirmPlayer2Celebrity = async (playerId) => {
        mdLoading.current.show("Converting..")
        let result = await celebrityPost({token: localStorage.getItem("tokyodome_admin_access_token"), playerId: playerId })
        console.log("celebrityPost result", result);
        if(result?.Success){
            showSuccess("Converted Player to Celebrity.")
            await getMembers()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const checkOwnerhipA = async (tokenIdA, walletAddress) => {
        
    }

    const checkOwnerhipB = async (tokenIdB, walletAddress) => {
        
    }

    const deleteMember = (memberId) => {
        mdConfirm.current.show("Confirm", "Confirm Delete Member with Id '" + memberId + "' ?", "Delete", confirmDeleteMember, memberId)
    }

    const confirmDeleteMember = async (memberId) => {
        mdLoading.current.show("Deleting..")

        let result = await memberDelete({memberId: memberId })
        console.log("delete member result", result);
        if(result?.Success){
            showSuccess("Deleted member successfully")
            await getMembers()
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
                <h2 className="ml-3 text-sm font-bold">MEMBER</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/player/create")}>+ CREATE NEW</button>
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
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div> */}
                                <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="Member Id" 
                                        value={memberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Wallet Address</label>
                                    <input type="text" 
                                        placeholder="Wallet Address" 
                                        value={walletAddress}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setWalletAddress(e.target.value)} />
                                </div>
                                {/* <div className="flex flex-col">
                                    <label>Wallet Address (Smart Account)</label>
                                    <input type="text" 
                                        placeholder="Wallet Address (Smart Account)" 
                                        value={smartWalletAddress}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setSmartWalletAddress(e.target.value)} />
                                </div> */}
                                <div className="flex flex-col">
                                    <label>Discord User Id (WidgetBot)</label>
                                    <input type="text" 
                                        placeholder="Discord User Id (WidgetBot)" 
                                        value={discordUserId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDiscordUserId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Discord User Id (Real)</label>
                                    <input type="text" 
                                        placeholder="Discord User Id (Real)" 
                                        value={discordUserIdReal}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDiscordUserIdReal(e.target.value)} />
                                </div>
                                {/* <div className="flex flex-col">
                                    <label>Display Name</label>
                                    <input type="text" 
                                        placeholder="Display Name" 
                                        value={displayName}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDisplayName(e.target.value)} />
                                </div> */}
                                {/* <div className="flex flex-col">
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
                    <div className="flex justify-between w-full mb-2">
                        <div className="flex gap-5 ml-10">
                            <CSVLink filename={"member.csv"}
                                     data={members}
                                     headers={[
                                                {label: "Member Id", key: "user_id"},
                                                {label: "Wallet Address", key: "wallet_address"},
                                                {label: "Created Date", key: "created_date"}
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
                                <th>MEMBER</th>
                                {/* <th>WALLET ADDRESS</th> */}
                                {/* <th>DIGITAL ID NFT</th> */}
                                {/* <th>ROLES</th> */}
                                {/* <th>XP</th>
                                <th>SETTINGS</th> */}
                                <th>DISCORD</th>
                                {/*<th>CONSENT DATE</th>*/}
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                members && members.length > 0
                                ?
                                    members
                                        .map(
                                            (x, index) => (
                                                <tr key={`member_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-xs">
                                                        Member Id: {x.user_id}
                                                        <br/>
                                                        Wallet Address: {x.wallet_address}
                                                    </td>
                                                    {/* <td className="text-xs">
                                                        {x.roles}
                                                    </td> */}
                                                    {/* <td className="text-xs"> */}
                                                        
                                                        {/* {x.wallet_address_smartaccount && <span><br/>Smart: {x.wallet_address_smartaccount}</span>} */}
                                                    {/* </td> */}
                                                    {/* <td>
                                                        {x.member_a_token_id && <span>PaleBlueDot: {x.member_a_token_id}&nbsp;<span><a onClick={() => checkOwnerhipA(x.member_a_token_id, x.wallet_address)}>.</a></span></span>}
                                                        {x.member_b_token_id && <span><br/>MetaGarage: {x.member_b_token_id}&nbsp;<span><a onClick={() => checkOwnerhipB(x.member_b_token_id, x.wallet_address)}>.</a></span></span>}
                                                    </td> */}
                                                    {/* <td>
                                                        {
                                                            x.xp_total !== undefined &&
                                                            <>
                                                            Total: {x.xp_total} <br/>
                                                            Level: {x.xp_level} <br/>
                                                            </>
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            x.settings !== undefined &&
                                                            <>
                                                            {x.settings}
                                                            </>
                                                        }
                                                    </td> */}
                                                    <td>
                                                        { x.discord_user_id && <span>WidgetBot Discord ID: {x.discord_user_id}</span>}
                                                        { x.discord_user_id_real && <span><br/>Real Discord ID: {x.discord_user_id_real}</span>}
                                                        { x.discord_roles && <span><br/>Roles: <span>{x.discord_roles}</span></span>}
                                                    </td>
                                                    {/* <td>
                                                        { x.consent_date && moment(x.consent_date).format('YYYY-MM-DD')}
                                                        <br />
                                                        { x.consent_date && moment(x.consent_date).format('HH:mm')}
                                                    </td> */}
                                                    <td>
                                                        { moment(x.created_date).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.created_date).format('HH:mm')}
                                                        {/* {x.ProfilePictureURL && <a href={x.ProfilePictureURL}><img src={x.ProfilePictureURL} className="w-[50px]" /></a>} */}
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
                                                                    <a onClick={() => router.push("/member/edit/" + x.user_id)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a onClick={() => deleteMember(x.user_id)}>Delete</a>
                                                                </li>
                                                                {/* <li>
                                                                    <a onClick={() => player2Celebrity(x.PlayerId)}>Player to Celebrity</a>
                                                                </li> */}
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={7} className="text-center">
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

export default MemberListing