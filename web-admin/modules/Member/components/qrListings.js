import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { membershipQRListingPost, membershipQRDelete } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { CSVLink } from "react-csv";

const MemberQRListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [memberQRs, setMemberQRs] = useState([])
    const [artistCode, setArtistCode] = useState()
    const [memberId, setMemberId] = useState()
    // const [discordUserId, setDiscordUserId] = useState()
    const [qrId, setQRId] = useState()
    const [status, setStatus] = useState()
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
        getMemberQRs()
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
        getMemberQRs()
    }, [pageIndex, pageSize])

    const getMemberQRs = async () => {
        setLoading(true)
        setMemberQRs([]);
        let result = await membershipQRListingPost({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            // status: status, 
            status: status ? status : undefined, 
            artistCode: artistCode ? artistCode : undefined,
            qrId: qrId ? qrId : undefined,
            // smartWalletAddress: smartWalletAddress === '' ? undefined : smartWalletAddress
            // displayName: displayName, 
            // role: role

        })
        console.log("memberQRs result", result);
        if(result.Success) {
            setMemberQRs(result.Data.QRs)
            setLastPageIndex(null);
            if(result.Data.QRs.length > 0 && result.Data.nextToken) {
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
        getMemberQRs()
    }

    const deactivatePlayer = (playerId) => {
        mdConfirm.current.show("Confirm", "Confirm Deactivate Player with Id '" + playerId + "' ?", "Delete", confirmDeactivatePlayer, playerId)
    }

    const player2Celebrity = (playerId) => {
        mdConfirm.current.show("Confirm", "Convert Player to Celebrity with Id '" + playerId + "' ?", "Convert", confirmPlayer2Celebrity, playerId)
    }

    const deleteQR = (qrId, artistCode) => {
        mdConfirm.current.show("Confirm", "Confirm Delete QR with Id '" + qrId + "' ?", "Delete", confirmDeleteQR, qrId + "," + artistCode)
    }

    const confirmDeleteQR = async (qrId_artistCode) => {
        mdLoading.current.show("Deleting..")

        let qrId = qrId_artistCode.split(',')[0];
        let artistCode = qrId_artistCode.split(',')[1];

        let result = await membershipQRDelete({qrId: qrId, artistCode: artistCode })
        console.log("delete QR result", result);
        if(result?.Success){
            showSuccess("Deleted QR successfully")
            await getMemberQRs()
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

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">MEMBERSHIP QR</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/member/qr/create")}>+ NEW QR(s)</button>
                    </div>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="NEW">NEW</option>
                                        <option value="CLAIMED">CLAIMED</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Artist Code</label>
                                    <select className="select select-bordered max-w-sm" 
                                            onChange={(e) => setArtistCode(e.target.value)}>
                                        <option value="">All</option>
                                        <option value="IMARITONES">IMARITONES</option>
                                        <option value="ME">ME</option>
                                        <option value="2I2">2I2</option>
                                        <option value="UKKA">UKKA</option>
                                        <option value="DENISUSAFATE">DENISUSAFATE</option>
                                        <option value="TITLEMITEI">TITLEMITEI</option>
                                        <option value="KASUMISOUTOSUTERA">KASUMISOUTOSUTERA</option>
                                        <option value="BABABABAMPI">BABABABAMPI</option>
                                        <option value="STELLINASAYURI">STELLINASAYURI</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>QR Id</label>
                                    <input type="text" 
                                        placeholder="QR Id" 
                                        value={qrId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setQRId(e.target.value)} />
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
                    <div className="flex justify-end w-full mb-2">
                        {/* <div className="flex gap-5 ml-10">
                            <CSVLink filename={"member.csv"}
                                     data={members}
                                     headers={[
                                                {label: "Member Id", key: "user_id"},
                                                {label: "Wallet Address", key: "wallet_address"},
                                                {label: "Created Date", key: "created_date"}
                                            ]}>
                                <button className="btn btn-primary btn-sm" >Download CSV</button>
                            </CSVLink>
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
                                <th>QR</th>
                                <th>QR Id</th>
                                <th>ARTIST CODE</th>
                                <th>STATUS</th>
                                <th>CLAIMED</th>
                                <th>CLAIMED DATE</th>
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                memberQRs && memberQRs.length > 0
                                ?
                                    memberQRs
                                        .map(
                                            (x, index) => (
                                                <tr key={`member_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <img src={x.QRImageURL} className='w-30'/>
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.QRId}
                                                    </td>
                                                    <td className="text-xs">
                                                        {x.ArtistCode}
                                                    </td>
                                                    <td>
                                                        {
                                                            x.Status
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            x.ClaimedBy
                                                        }
                                                    </td>
                                                    <td>
                                                        { x.ClaimedDate && moment(x.ClaimedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { x.ClaimedDate && moment(x.ClaimedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
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
                                                                    <a onClick={async() => await deleteQR(x.QRId, x.ArtistCode)}>Delete</a>
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

export default MemberQRListing