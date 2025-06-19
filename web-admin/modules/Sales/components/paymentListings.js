import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {paymentListingPost} from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import Checkbox from "../../../common/components/checkbox";

const PaymentListing = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [payments, setPayments] = useState([])
    const [status, setStatus] = useState()
    
    const [platform, setPlatform] = useState()
    const [memberId, setMemberId] = useState()
    const [paymentType, setPaymentType] = useState()
    const [artistCode, setArtistCode] = useState()
    
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
        getPayments()
        
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
        getPayments()
    }, [pageIndex, pageSize])

    const getPayments = async () => {
        setLoading(true)
        setPayments([]);
        let result = await paymentListingPost({
            pageSize: pageSize, 
            nextToken: pages[pageIndex], 
            status: status,
            paymentPlatform: platform,
            paymentType: paymentType,
            memberId: memberId,
            artistCode: artistCode,
        })
        console.log("payments result", result);
        if(result.Success) {
            setPayments(result.Data.payments)
            setLastPageIndex(null);
            if(result.Data.payments.length > 0 && result.Data.nextToken) {
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
        getPayments()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">Sales - Payments</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm ml-2" onClick={() => upload()}><FontAwesomeIcon icon={faUpload} className="text-sm w-4 mr-1" /> UPLOAD</button>
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/nft/whitelist/add")}>+ NEW WHITELIST</button>
                    </div> */}
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="SUCCESS">SUCCESS</option>
                                        {/* <option value="FAILED">FAILED</option> */}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Payment Type</label>
                                    <select className="select select-bordered"
                                            value={paymentType} 
                                            onChange={(e) => setPaymentType(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="MEMBERSHIP_NFT">MEMBERSHIP</option>
                                        <option value="SUPERCHAT">SUPERCHAT</option>
                                        <option value="TICKET">TICKET</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Platform</label>
                                    <select className="select select-bordered"
                                            value={platform} 
                                            onChange={(e) => setPlatform(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="BROWSER">BROWSER</option>
                                        <option value="APPLE">APPLE</option>
                                        <option value="GOOGLE">GOOGLE</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Member Id</label>
                                    <input type="text" 
                                        placeholder="Member Id" 
                                        value={memberId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMemberId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Artist Code</label>
                                    <select className="select select-bordered"
                                            value={artistCode} 
                                            onChange={(e) => setArtistCode(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="IMARITONES">Imari Tones</option>
                                        <option value="STELLINASAYURI">Stellina Sayuri</option>
                                    </select>
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
                        {/* <div className="flex items-center ml-5 gap-2">
                            <button className="btn btn-primary btn-sm" disabled={isCheckNFTs.length == 0} onClick={() => revealAll()}>Reveal</button>
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
                                <th>PAYMENT ID</th>
                                <th>PAYMENT TYPE</th>
                                <th>PLATFORM</th>
                                <th>MEMBER ID</th>
                                <th>INFO</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>CREATED DATE</th>
                                {/* <th>ACTIONS</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                payments && payments.length > 0
                                ?
                                payments
                                        .map(
                                            (x, index) => (
                                                <tr key={`payment_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.PaymentId} 
                                                        <br/>
                                                        {x.PaymentIntent && <>Stripe Payment Intent: {x.PaymentIntent}</>}
                                                        <br/>
                                                        {x.ApplePayTransactionId && <>Apple Pay Transaction Id: {x.ApplePayTransactionId}</>}
                                                    </td>
                                                    <td>
                                                        {x.PaymentType}
                                                    </td>
                                                    <td>
                                                        {x.PaymentPlatform}
                                                    </td>
                                                    <td>
                                                        {x.MemberId}
                                                    </td>
                                                    <td>
                                                         {
                                                            x.ArtistCode && 
                                                            <>
                                                                ArtistCode : <>{x.ArtistCode}</>
                                                            </>
                                                         }
                                                    </td>
                                                    <td>
                                                        { x.Currency } { x.Amount }
                                                    </td>
                                                    <td>
                                                        { x.Status }
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
                                                                    <a onClick={() => deleteWhitelist(x.WhitelistId, x.MemberId)}>Delete</a>
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

export default PaymentListing