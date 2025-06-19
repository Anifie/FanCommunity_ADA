import { useEffect, useContext, useState } from "react";
import { faDollarSign, faRefresh, faAngleDown, faChartColumn, faArrowTrendUp, faArrowTrendDown, faBagShopping, faCircleUser, faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './index.module.css'
//import { ApexOptions } from "apexcharts";
//import ReactApexChart from "react-apexcharts";
import { MemberContext } from "../../../../common/context/MemberContext";
// import TopLikedAssets from "./widget-top-liked-assets";
// import TopSellers from "./widget-top-sellers";
// import RecentOrders from "./widget-recent-orders";
// import OrdersProportion from "./widget-orders-proportion";
// import { orderProportionGet } from "../../api";
// import { Web3Context } from "../../../../common/context/Web3Context";
import StatisticSummary from "./widget-statistic-summary";
// import StatisticChart from "./widget-statistic-chart";

const EcommerceDashboard = () => {

    const {member} = useContext(MemberContext)

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">DASHBOARD</h2>                        
            </div>
            <div className="p-4 w-full">
                <div className="flex justify-between w-full">
                    <div>
                        <h2>
                            Good Morning, {member && member.DisplayName}!
                        </h2>
                        <p className="text-[14px] text-slate-400">Here's what happening with {process.env.TITLE} today.</p>
                    </div>
                    <div>
                        {/* <button className="btn btn-secondary">Mint NFT</button> */}
                    </div>
                </div>
                <StatisticSummary/>
                {/* <div className="grid grid-cols-3">
                    <div className="col-span-3">
                        <StatisticChart/>
                    </div>
                    <div>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 mt-5">
                    <TopLikedAssets/>
                    <TopSellers/>
                </div>
                <div className="mt-5 grid grid-cols-3">
                    <OrdersProportion/>
                    <div className="col-span-2">
                        <RecentOrders/>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default EcommerceDashboard