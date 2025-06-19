import { useEffect, useState, useContext } from "react"
import { Web3Context } from "../../../../../common/context/Web3Context"
import useStateCallback from "../../../../../common/hooks/useStateCallback"
import { topLikedAssetsGet } from "../../../api"
import { faSpinner, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useHelper from "../../../../../common/hooks/useHelper"

const TopLikedAssets = () => {

    const {account} = useContext (Web3Context)
    const {toShortString, toShortHash} = useHelper()

    const [loading, setLoading] = useState(false)
    const [likedAssets, setLikedAssets] = useState([])
    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(5)
    
    const getLikedAssets = async () => {
        setLoading(true)
        let result = await topLikedAssetsGet({
                                                walletAddress: account, 
                                                signature: localStorage.getItem("AnifieAdminSignature"),
                                                pageSize: pageSize, 
                                                lastKey: pages[pageIndex],
                                                fromDate: '', 
                                                toDate: ''
                                            })

        if(result.Success) {
            setLikedAssets(result.Data.likedAssets)

            if(result.Data.likedAssets.length > 0 && result.Data.lastKey) {
                //console.log(1, pages);
                if(pages.indexOf(result.Data.lastKey.liked_count_created_date.S) < 0) {
                    setPages([...pages, result.Data.lastKey.liked_count_created_date.S], x => {
                        setLoading(false);
                        //console.log(2, pages, x, result.Data.lastKey.created_date.S);
                    })
                }
            }
            else
                setLastPageIndex(pageIndex)
        }

        setLoading(false)                   
    }

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getLikedAssets()
    }, [pageIndex, pageSize])

    const renderAssetStatus = (assetStatus) => {
        switch (assetStatus) {
            case "NOTFORSALE":
                return "PRIVATE"
        
            case "FORAUCTION":
                return "AUCTION"

            case "FORSALE":
                return "SALE"

            default:
                break;
        }
    }

    return (
            <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <div className="flex justify-between w-full">
                    <div className="p-4">
                        <h4>Top Favourite NFTs</h4>
                    </div>
                    <div className="flex items-center">
                        <button onClick={() => getLikedAssets()} disabled={loading} className="mr-4 carosel-btn btn btn-active btn-sm active:bg-slate-300 active:text-slate-700">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 mr-2"/>
                            Refresh
                        </button>
                        {/* <span className="font-semibold uppercase text-sm">Sort by: &nbsp;</span> */}
                        {/* <select className="ml-4 select select-sm select-bordered max-w-xs"
                                onChange={(e) => selectTimeFrame(e.target.value)}>
                            <option value="TODAY">Today</option>
                            <option value="YESTERDAY">Yesterday</option>
                            <option value="LASTWEEK">Last 7 Days</option>
                            <option value="LASTMONTH">Last Month</option>
                        </select> */}
                    </div>
                </div>
                <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                    <tbody>
                        {
                            likedAssets.length > 0
                            ?
                                likedAssets
                                    .map(
                                        (x, index) => (
                                            <tr key={`likedAsset_` + index}>
                                                <td>
                                                    <div className="flex justify-start object-contain">
                                                        <img src={x.ThumbnailURL} className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain" alt={x.Name}></img>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {x.Liked}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Liked</span>
                                                    {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
                                                </td>
                                                <td>
                                                    {toShortString(x.Name, 20)}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Name</span>
                                                    {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
                                                </td>
                                                <td>
                                                {/* <span className={`badge badge-ghost badge-sm ${classes.badgeSoftDanger}`}>Out of stock</span> */}
                                                    {renderAssetStatus(x.Status)}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Status</span>
                                                </td>
                                                <td>
                                                    {toShortHash(x.OwnerAddress)}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Owner</span>
                                                </td>
                                            </tr>
                                        ))
                            : <tr>
                                <td colSpan={7} className="text-center">
                                    {
                                        loading
                                            ?   <span>Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 text-md animate-spin"/></span>
                                            :   <span>No Result</span>
                                    }
                                </td>
                                </tr>
                        }                    
                    </tbody>
                </table>
                <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                    { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&lt;</button>}
                    { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&gt;</button>}
                </div>
            </div>
    )
}

export default TopLikedAssets