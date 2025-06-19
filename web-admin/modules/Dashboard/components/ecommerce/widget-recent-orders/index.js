import { useEffect, useState, useContext } from "react"
import { Web3Context } from "../../../../../common/context/Web3Context"
import useStateCallback from "../../../../../common/hooks/useStateCallback"
// import { recentOrdersGet, topLikedAssetsGet } from "../../../api"
// import { faSpinner, faRefresh } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import useHelper from "../../../../../common/hooks/useHelper"
import moment from "moment";

const RecentOrders = () => {
    // const {account} = useContext (Web3Context)
    // const {toShortString, toShortHash} = useHelper()

    // const [loading, setLoading] = useState(false)
    // const [recentOrders, setRecenOrders] = useState([])
    // const [pages, setPages] = useStateCallback([null])
    // const [pageIndex, setPageIndex] = useStateCallback(0)
    // const [lastPageIndex, setLastPageIndex] = useState()
    // const [pageSize, setPageSize] = useState(6)
    
    // const getRecentOrders = async () => {
    //     setLoading(true)
    //     //setRecenOrders([])    // init to empty array
    //     console.log("getRecentOrders", pages, pageIndex, pages[pageIndex]);
    //     let result = await recentOrdersGet({
    //                                             walletAddress: account, 
    //                                             signature: localStorage.getItem("AnifieAdminSignature"),
    //                                             pageSize: pageSize, 
    //                                             lastKey: pages[pageIndex]
    //                                         })

    //     if(result.Success) {
    //         setRecenOrders(result.Data.sales)

    //         if(result.Data.sales.length > 0 && result.Data.lastKey) {
    //             //console.log(1, pages);
    //             if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
    //                 setPages([...pages, result.Data.lastKey.created_date.S], x => {
    //                     setLoading(false);
    //                     //console.log(2, pages, x, result.Data.lastKey.created_date.S);
    //                 })
    //             }
    //         }
    //         else
    //             setLastPageIndex(pageIndex)
    //     }

    //     setLoading(false)                   
    // }

    // const refresh = () => {
    //     setPageIndex(0, () => setPages([], () => getRecentOrders()))
    // }

    // useEffect(() => {
    //     console.log("load page pageIndex", pageIndex);
    //     getRecentOrders()
    // }, [pageSize, pageIndex])

    // return (
    //     <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
    //         <div className="flex justify-between w-full">
    //             <div className="p-4">
    //                 <h4>Recent Orders</h4>
    //             </div>
    //             <div className="flex items-center mr-4">
    //                 <button onClick={() => refresh()} disabled={loading} className="mr-4 carosel-btn btn btn-active btn-sm active:bg-slate-300 active:text-slate-700">
    //                     <FontAwesomeIcon icon={faRefresh} className="h-4 mr-2"/>
    //                     Refresh
    //                 </button>
    //                 {/* <span className="font-semibold uppercase text-sm">Sort by: &nbsp;</span>
    //                 <select className="select select-sm select-bordered max-w-xs">
    //                     <option value="">Today</option>
    //                     <option value="">Yesterday</option>
    //                     <option value="">Last 7 Days</option>
    //                     <option value="">Last 30 Days</option>
    //                     <option value="">This Month</option>
    //                     <option value="">Last Month</option>
    //                 </select> */}
    //             </div>
    //         </div>
    //         <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
    //             <tbody>
    //                 {
    //                     recentOrders.length > 0
    //                     ?
    //                         recentOrders
    //                             .map(
    //                                 (x, index) => (
    //                                     <tr key={`recentOrder_` + index}>
    //                                         <td>
    //                                             <div className="flex justify-start object-contain">
    //                                                 { x.AssetThumbnailURL && x.AssetThumbnailURL.slice(-4).toLowerCase() != '.mp3' && x.AssetThumbnailURL.slice(-4).toLowerCase() != '.mp4' && <img src={x.AssetThumbnailURL} className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain" />}
    //                                                 { x.AssetThumbnailURL && x.AssetThumbnailURL.slice(-4).toLowerCase() == '.mp3' && <audio src={x.AssetThumbnailURL} controls="controls" className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain" />}
    //                                                 { x.AssetThumbnailURL && x.AssetThumbnailURL.slice(-4).toLowerCase() == '.mp4' && <video src={x.AssetThumbnailURL} controls="controls" loop="loop" muted="muted" className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain"/>}
                                                    
    //                                                 {/* <img src={x.AssetThumbnailURL} className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain" alt={x.AssetName}></img> */}
    //                                             </div>
    //                                         </td>
    //                                         <td className="text-center">
    //                                             {x.AssetName}
    //                                             <br />
    //                                             <span className="text-slate-400 text-sm">Name</span>
    //                                             {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
    //                                         </td>
    //                                         <td className="text-center">
    //                                             {toShortHash(x.SellerAddress)}
    //                                             <br />
    //                                             <span className="text-slate-400 text-sm">Seller Address</span>
    //                                         </td>
    //                                         <td className="text-center">
    //                                             {toShortHash(x.BuyerAddress)}
    //                                             <br />
    //                                             <span className="text-slate-400 text-sm">Buyer Address</span>
    //                                         </td>
    //                                         <td className="text-center">
    //                                             {x.SellOrderId && "Fixed Price"}
    //                                             {x.AuctionId && "Auction"}
    //                                             <br />
    //                                             <span className="text-slate-400 text-sm">Type</span>
    //                                         </td>
    //                                         <td className="text-center">
    //                                             {x.Price} {x.CurrencyCode}
    //                                             <br />
    //                                             <span className="text-slate-400 text-sm">Price</span>
    //                                             {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
    //                                         </td>
    //                                         <td>
    //                                             { moment(x.CreatedDate).format('YYYY-MM-DD')}
    //                                             <br />
    //                                             { moment(x.CreatedDate).format('HH:mm')}
    //                                         </td>
    //                                     </tr>
    //                                 ))
    //                     : <tr>
    //                         <td colSpan={7} className="text-center">
    //                             {
    //                                 loading
    //                                     ?   <span>Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 text-md animate-spin"/></span>
    //                                     :   <span>No Result</span>
    //                             }
    //                         </td>
    //                         </tr>
    //                 }                    
    //             </tbody>                    
    //         </table>
    //         <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
    //             { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&lt;</button>}
    //             { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&gt;</button>}
    //         </div>
    //     </div>
    // )
}

export default RecentOrders