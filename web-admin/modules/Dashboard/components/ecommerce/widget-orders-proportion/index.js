import { useEffect, useContext, useState } from "react";
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dynamic from 'next/dynamic'
// import { Web3Context } from "../../../../../common/context/Web3Context";
// import { orderProportionGet } from "../../../api";
// const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const OrdersProportion = () => {

    // const {account} = useContext (Web3Context)

    // const [loading, setLoading] = useState(false)
    // const [ordersPercentage, setOrdersPercentage] = useState([0,0])

    // useEffect(()=> {
    //     getOrdersProportion()
    // }, [])

    // const getOrdersProportion = async () => {
    //     setLoading(true)

    //     let result = await orderProportionGet(account, localStorage.getItem("AnifieAdminSignature"));
    //     if(result.Success) {
    //         setOrdersPercentage([
    //                             +result.Data.sellOrderProportion, 
    //                             +result.Data.auctionProportion
    //                         ])
    //     }
        
    //     setLoading(false)
    // }

    // const options = {
    //     chart: {
    //       type: 'donut',
    //     },
    //     labels: ["Fixed Price NFT", "Auction NFT"],
    //     legend: {
    //         position: 'bottom',
    //         labels: {
    //             colors: 'fff',
    //             useSeriesColors: false
    //         },
    //     },
    //     stroke: {
    //         show: false
    //     },
    //     responsive: [{
    //       breakpoint: 480,
    //       options: {
    //         chart: {
    //           width: 200
    //         },
    //         legend: {
    //           position: 'bottom'
    //         }
    //       }
    //     }]
    //   };

    // return (
    //     <div className="flex flex-col">
    //         <div className="flex justify-between items-center w-full">
    //             <div className="p-4">
    //                 <h4>Sales</h4>
    //             </div>
    //             <button onClick={() => getOrdersProportion()} disabled={loading} className="mr-4 carosel-btn btn btn-active btn-sm active:bg-slate-300 active:text-slate-700">
    //                 <FontAwesomeIcon icon={faRefresh} className="h-4 mr-2"/>
    //                 Refresh
    //             </button>
    //         </div>
    //         { (typeof window !== 'undefined') && !loading && <ReactApexChart options={options} series={ordersPercentage} type="donut" /> }
    //     </div>
    // )
}

export default OrdersProportion