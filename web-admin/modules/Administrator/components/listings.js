import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { administratorListingGet, administratorPost, administratorPut } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";

const Administrator = () => {

    //const {account} = useContext(Web3Context)
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [administrators, setAdministrators] = useState([])
    const {showSuccess} = useContext(ToastContext)

    const mdConfirm = useRef(null)
    const mdLoading = useRef(null)
    
    useEffect(() => {        
        getAdministrators()
    }, [])

    const getAdministrators = async () => {
        setLoading(true)
        let result = await administratorListingGet(localStorage.getItem("tokyodome_admin_access_token"), 5)
        console.log("administrators result", result);
        if(result.Success) {
            setAdministrators(result.Data.members)
        }
        setLoading(false)
    }

    // const edit = (announcement_id) => {
    //     router.push("/announcement/edit/" + announcement_id)
    // }

    // const deactivate = (announcement_id) => {

    // }

    // const publish = (announcement_id) => {

    // }

    // const deleteAnnouncement = (announcement_id, subject) => {
    //     mdConfirm.current.show("Confirm", "Confirm Delete Announcement with subject '" + subject + "' ?", "Delete", confirmDeleteAnnouncement, announcement_id)
    // }

    // const confirmDeleteAnnouncement = async (announcement_id) => {
    //     mdLoading.current.show("Deleting..")
    //     let result = await announcementDelete({walletAddress: account, signature: localStorage.getItem("AnifieAdminSignature"), announcementId: announcement_id})
    //     if(result?.Success){
    //         showSuccess("Announcement deleted")
    //         await getAnnouncements()
    //     }
    //     mdLoading.current.close()
    // }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalConfirm ref={mdConfirm} />
            <ModalLoading ref={mdLoading} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">ADMINISTRATOR</h2>                        
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="flex justify-between w-full mb-2">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/administrator/create")}>+ CREATE NEW ADMINISTRATOR</button>
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>#</th>
                                <th>Member Id</th>
                                <th>EMAIL</th>
                                {/* <th>LAST LOGIN</th> */}
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                administrators && administrators.length > 0
                                ?
                                administrators
                                        .map(
                                            (x, index) => (
                                                <tr key={`admin_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.MemberId}
                                                    </td>
                                                    <td>
                                                        {x.Email}
                                                    </td>
                                                    {/* <td>
                                                        {moment(x.LastLogin).format('YYYY-MM-DD HH:mm')}
                                                    </td> */}
                                                    <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    <a onClick={() => router.push("/administrator/edit/" + x.MemberId)}>Change Password</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={6} className="text-center text-slate-100">
                                        {
                                            loading
                                                ?   <span className="flex justify-center">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 text-md animate-spin"/></span>
                                                :   <span>No Result</span>
                                        }
                                    </td>
                                  </tr>
                            }                         
                        </tbody>
                    </table>
                    {
                        administrators && administrators.length > 0
                        ?
                            <div className="flex justify-end items-center gap-2 w-full mr-4 h-full my-2">
                                <a className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</a>
                                <a className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</a>
                            </div>
                        :
                            <div></div>
                    }
                </div>
            </div>
        </div>
    );
};

export default Administrator