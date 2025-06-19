import { useEffect, useState, useContext } from "react"
import { Web3Context } from "../../../../../common/context/Web3Context"
import useStateCallback from "../../../../../common/hooks/useStateCallback"
import { topSellersGet } from "../../../api"
import { faSpinner, faRefresh, faChartColumn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useHelper from "../../../../../common/hooks/useHelper"

const TopSellers = () => {

    const {account} = useContext (Web3Context)
    const {toShortString, toShortHash} = useHelper()

    const [loading, setLoading] = useState(false)
    const [topSellers, setTopSellers] = useState([])
    // const [pages, setPages] = useStateCallback([null])
    // const [pageIndex, setPageIndex] = useState(0)
    // const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(5)
    
    const getTopSellers = async () => {
        setLoading(true)
        let result = await topSellersGet({
                                                walletAddress: account, 
                                                signature: localStorage.getItem("AnifieAdminSignature"),
                                                pageSize: pageSize, 
                                                //lastKey: pages[pageIndex]
                                            })

        if(result.Success) {
            setTopSellers(result.Data.topSellers)

            // if(result.Data.topSellers.length > 0 && result.Data.lastKey) {
            //     //console.log(1, pages);
            //     if(pages.indexOf(result.Data.lastKey.liked_count_created_date.S) < 0) {
            //         setPages([...pages, result.Data.lastKey.liked_count_created_date.S], x => {
            //             setLoading(false);
            //             //console.log(2, pages, x, result.Data.lastKey.created_date.S);
            //         })
            //     }
            // }
            // else
            //     setLastPageIndex(pageIndex)
        }

        setLoading(false)                   
    }

    useEffect(() => {
        //console.log("load page pageIndex", pageIndex);
        getTopSellers()
    }, [pageSize])

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
                    <h4>Top Sellers</h4>
                </div>
                <div className="flex items-center mr-4">
                    <button onClick={() => getTopSellers()} disabled={loading} className="mr-4 carosel-btn btn btn-active btn-sm active:bg-slate-300 active:text-slate-700">
                        <FontAwesomeIcon icon={faRefresh} className="h-4 mr-2"/>
                        Refresh
                    </button>
                    {/* <span className="font-semibold uppercase text-sm">Result Size: &nbsp;</span> */}
                    <select className="select select-sm select-bordered max-w-xs"
                            onChange={(e) => setPageSize(e.target.value)}>
                        <option value="5">Top 5</option>
                        <option value="10">Top 10</option>
                    </select>
                </div>
            </div>
            <table className="table table-compact w-full rounded-none">
                <tbody>
                        {
                            topSellers.length > 0
                            ?
                                topSellers
                                    .map(
                                        (x, index) => (
                                            <tr key={`topSeller_` + index}>
                                                <td>
                                                    <div className="flex justify-start object-contain">
                                                        <img src={x.AvatarURL} className="flex items-center justify-center w-full max-w-[50px] max-h-[50px] object-contain" alt={x.Name}></img>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {x.DisplayName}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Name</span>
                                                    {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
                                                </td>
                                                <td className="text-center">
                                                    {toShortHash(x.SellerAddress)}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Wallet Address</span>
                                                </td>
                                                <td className="text-center">
                                                    {x.Email}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Email</span>
                                                </td>
                                                <td className="text-center">
                                                    {x.SalesCount}
                                                    <br />
                                                    <span className="text-slate-400 text-sm">Sales Count</span>
                                                    {/* <span class="badge badge-ghost badge-sm">Desktop Support Technician</span> */}
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
                {/* <tbody>
                    <tr className={x % 2 == 1 ? "active" : ""} key={`bestseller_` + x}>
                        <td>
                            <div className="flex justify-start object-contain">
                                <img src={"https://api.lorem.space/image?w=400&h=400&t=" + x} className="max-w-[50px]" alt="Shoe"></img>
                            </div>
                        </td>
                        <td>
                            Test Seller Name
                            <br />
                            <span className="text-slate-400 text-sm">0x6cB5..fc01</span>
                        </td>
                        <td>
                            ETH 2.363
                            <br />
                            <span className="text-slate-400 text-sm">Sold</span>
                        </td>
                        <td>
                            <div className="flex items-center h-full">
                                32%&nbsp;<FontAwesomeIcon icon={faChartColumn} className="h-5" />
                            </div>
                        </td>
                    </tr>                      
                </tbody> */}
            </table>
            {/* <div className="flex justify-end items-center gap-2 w-full h-10 r-4">
                <a className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&lt;</a>
                <a className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">&gt;</a>
            </div> */}
        </div>
    )
}

export default TopSellers