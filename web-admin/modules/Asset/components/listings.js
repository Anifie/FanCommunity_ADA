
   import { useContext, useEffect, useRef, useState } from "react";
   import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
   import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
   import { assetListingGet } from "../api";
   //import { Web3Context } from "../../../common/context/Web3Context";
   import { useRouter } from 'next/router'
   import moment from "moment";
   import ModalConfirm from "../../../common/components/modal/ModalConfirm";
   import { ToastContext } from "../../../common/context/ToastContext";
   import ModalLoading from "../../../common/components/modal/ModalLoading";
   import useStateCallback from "../../../common/hooks/useStateCallback";
   
   const AssetListing = () => {
   
       const router = useRouter()
       const [loading, setLoading] = useState(false)
       const [assets, setAssets] = useState([])
    //    const [status, setStatus] = useState()
    //    const [playerId, setPlayerId] = useState()
    //    const [nftId, setNFTId] = useState()
       
       const {showSuccess, showFailed} = useContext(ToastContext)
   
       const [pages, setPages] = useStateCallback([null])
       const [pageIndex, setPageIndex] = useState(0)
       const [lastPageIndex, setLastPageIndex] = useState()
       const [pageSize, setPageSize] = useState(10)
   
       const mdLoading = useRef(null)
       const mdConfirm = useRef(null)
       
       useEffect(() => {        
           getAssets()
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
           getAssets()
       }, [pageIndex, pageSize])
   
       const getAssets = async () => {
           setLoading(true)
           setAssets([]);
           let result = await assetListingGet({
               pageSize: pageSize, 
               status:"FORSALE",
               storeId:"METAVERSETV",
               sortBy:"STORE_NEWLY_CREATED",
               lastKey: pages[pageIndex], 
           })
        
           console.log("assets result", result);
           if(result.Success) {
               setAssets(result.Data.assets)
               setLastPageIndex(null);
               if(result.Data.assets.length > 0 && result.Data.nextToken) {
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
           getAssets()
       }
   
       // const deactivateMessage = (messageId) => {
       //     mdConfirm.current.show("Confirm", "Confirm Deactivate Message with Id '" + messageId+ "' ?", "Deactivate", confirmDeactivateMessage, messageId)
       // }
   
       // const player2Celebrity = (playerId) => {
       //     mdConfirm.current.show("Confirm", "Convert Player to Celebrity with Id '" + playerId + "' ?", "Convert", confirmPlayer2Celebrity, playerId)
       // }
   
       // const confirmDeactivateMessage = async (messageId) => {
       //     mdLoading.current.show("Deactivating..")
       //     // let result = await playerDeactivate(collectionId)
       //     // console.log("deactivate result", result);
       //     // if(result?.Success){
       //     //     showSuccess("Player deactivated")
       //     //     await getCollections()
       //     // }
       //     // else {
       //     //     showFailed(result.Message)
       //     // }
       //     mdLoading.current.close()
       // }
   
       return (
           <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
               <ModalLoading ref={mdLoading} />
               <ModalConfirm ref={mdConfirm} />
               <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                   <h2 className="ml-3 text-sm font-bold">NFT</h2>   
               </div>
               <div className="p-4 w-full">
                   <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                       {/* <div className="w-full justify-start">
                           <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/nft/edit")}>+ CREATE NEW</button>
                       </div> */}
                       <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                           <div className="card-body">
                               {/* <div className="grid grid-cols-4 gap-2">
                                   <div className="flex flex-col">
                                       <label>Status</label>
                                       <select className="select select-bordered"
                                               value={status} 
                                               onChange={(e) => setStatus(e.target.value)}>
                                           <option value="">ALL</option>
                                           <option value="NOTFORSALE">NOTFORSALE</option>
                                           <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                           <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                                       </select>
                                   </div>
                                   <div className="flex flex-col">
                                       <label>Player Id</label>
                                       <input type="text" 
                                           placeholder="Player Id" 
                                           value={playerId}
                                           className="input input-bordered w-full"
                                           onChange={(e) => setPlayerId(e.target.value)} />
                                   </div>
                                   <div className="flex flex-col">
                                       <label>NFT Id</label>
                                       <input type="text" 
                                           placeholder="NFT Id" 
                                           value={nftId}
                                           className="input input-bordered w-full"
                                           onChange={(e) => setNFTId(e.target.value)} />
                                   </div>
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
                                   <th>IMAGE</th>
                                   <th>ID</th>
                                   <th>Name</th>
                                   <th>METADATA</th>
                                   <th>PRICE</th>
                                   <th>ROYALTY (%)</th>
                                   <th>STATUS</th>
                                   <th>ACTIONS</th>
                               </tr>
                           </thead>
                           <tbody>
                               {
                                   assets && assets.length > 0
                                   ?
                                   assets
                                           .map(
                                               (x, index) => (
                                                   <tr key={`asset_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                       <td>
                                                           {index + 1}
                                                       </td>
                                                       <td>
                                                           {x.URL && <a href={x.URL}><img src={x.URL} className="w-[50px]" /></a>}
                                                       </td>
                                                       <td>
                                                           Asset Id : {x.AssetId}
                                                           <br/>
                                                           Token Id : {x.TokenId}
                                                       </td>
                                                       <td>
                                                           {x.Name}
                                                           <br/>
                                                           {x.Description && ("(" + x.Description + ")")}
                                                       </td>
                                                       <td>
                                                           { x.MetadataURL ? <a target="_blank" className="underline" href={x.MetadataURL}>Link</a> : ""}
                                                       </td>
                                                       <td>
                                                           {x.SellOrder.CurrencyCode ? x.SellOrder.CurrencyCode + " " + x.SellOrder.Price : ""}
                                                       </td>
                                                       <td>
                                                           { x.RoyaltiesPercentage }
                                                       </td>
                                                       <td>
                                                           { x.Status }
                                                       </td>
                                                       <td>
                                                           <div className="dropdown dropdown-down">
                                                               <label tabIndex="0" className="btn btn-sm m-1">
                                                                   <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                   &nbsp;
                                                                   Manage
                                                               </label>
                                                               <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                   <li>
                                                                       {/* <a onClick={() => deactivateMessage(x.MessageId)}>Deactivate</a> */}
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
   
   export default AssetListing