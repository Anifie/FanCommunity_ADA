import { faRefresh, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { useContext, useEffect, useState } from 'react'
// import { Web3Context } from '../../../../../common/context/Web3Context'
// import { statisticBuyOrdersGet, statisticEarningsGet, statisticMembersGet } from '../../../api'
// import dynamic from 'next/dynamic'
// import useStateCallback from '../../../../../common/hooks/useStateCallback';
// const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const StatisticChart = () => {

  // const {account} = useContext(Web3Context)
  // const [loadingEarningsStat, setEarningsStatLoading] = useState (true)
  // const [loadingOrdersStat, setOrdersStatLoading] = useState(true)
  // const [loadingMembersStat, setMembersStatLoading] = useState(true)
  // const [earningsStat, setEarningsStat] = useStateCallback([])
  // const [ordersStat, setOrdersStat] = useStateCallback([])
  // const [membersStat, setMembersStat] = useStateCallback([])
  // const [dateList, setDateList] = useState([])

  // const getEarningsStatistic = async () => {
  //     setEarningsStatLoading(true)

  //     let result = await statisticEarningsGet(account, localStorage.getItem("AnifieAdminSignature"), 12)
  //     if(result.Success) {
  //       setEarningsStat([
  //                           result.Data.earningsByDay.map(x => (+x.earning).toFixed(6)), 
  //                           +result.Data.totalEarnings
  //                       ], (x) => console.log("earningsStat", x)) 

  //       setDateList(result.Data.earningsByDay.map(x => x.date))
  //     }
      
  //     setEarningsStatLoading(false) 
  // }

  // const getOrdersStatistic = async () => {
  //     setOrdersStatLoading(true)

  //     let result = await statisticBuyOrdersGet(account, localStorage.getItem("AnifieAdminSignature"), 12)
  //     if(result.Success) {
  //         setOrdersStat([
  //                             result.Data.buyOrdersCountByDay.map(x => +x.count.toFixed(6)), 
  //                             +result.Data.allbuyOrderCount
  //                         ], (x) => console.log("ordersStat", x))
  //     }
      
  //     setOrdersStatLoading(false)
  // }

  // const getMembersStatistic = async () => {
  //     setMembersStatLoading(true)

  //     let result = await statisticMembersGet(account, localStorage.getItem("AnifieAdminSignature"), 12)
  //     if(result.Success) {
  //       setMembersStat([
  //                           result.Data.membershipsCountByDay.map(x => +x.count.toFixed(6)), 
  //                           +result.Data.allMembershipsCount
  //                       ], (x) => console.log("membersStat", x))
  //     }
      
  //     setMembersStatLoading(false)
  // }

  // useEffect(() => {
  //     getEarningsStatistic()
  //     getOrdersStatistic()
  //     getMembersStatistic() 
  // }, [])

  // const refresh = () => {
  //   getEarningsStatistic()
  //   getOrdersStatistic()
  //   getMembersStatistic()
  // }

  // const optionsStatistic = {
  //     chart: {
  //       height: 350,
  //       type: 'line',
  //       toolbar: {
  //         show: false
  //       }
  //     },
  //     stroke: {
  //       width: [0, 2, 2]
  //     },
  //     plotOptions: {
  //         bar: {
  //           columnWidth: '30%'
  //         }
  //     },
  //     tooltip: {
  //         enabled: true
  //     },
  //     legend: {
  //         labels: {
  //             colors: '#fff',
  //             useSeriesColors: false
  //         },
  //     },
  //     grid: {
  //         show: false,      // you can either change hear to disable all grids
  //         xaxis: {
  //           lines: {
  //             show: true  //or just here to disable only x axis grids
  //             }
  //           },  
  //         yaxis: {
  //           lines: { 
  //             show: true  //or just here to disable only y axis
  //             }
  //           },   
  //       },
  //     // title: {
  //     //   text: 'Traffic Sources'
  //     // },
  //     dataLabels: {
  //       //enabled: true,
  //       enabledOnSeries: [0, 1, 2]
  //     },
  //     labels: dateList, // ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
  //     xaxis: {
  //       type: 'datetime',
  //       labels: {
  //         show: true,
  //         style: {
  //             colors: '#fff',
  //             // fontSize: '8px',
  //             // cssClass: 'apexcharts-xaxis-label',
  //         },
  //       },
  //     },
  //     yaxis: [{
  //       title: {
  //         text: 'Earning (USD)',
  //         style: {
  //             color: '#fff'
  //         }
  //       },
  //       labels: {
  //         show: true,
  //         style: {
  //             colors: '#fff',
  //             // fontSize: '8px',
  //             // cssClass: 'apexcharts-xaxis-label',
  //         },
  //       },        
  //     }, {
  //       opposite: true,
  //       title: {
  //         text: 'Orders',
  //         style: {
  //             color: '#fff'
  //         }
  //       },
  //       labels: {
  //         show: true,
  //         style: {
  //             colors: '#fff',
  //             // fontSize: '8px',
  //             // cssClass: 'apexcharts-xaxis-label',
  //         },
  //       }, 
  //     }, {
  //       opposite: true,
  //       title: {
  //         text: 'Members',
  //         style: {
  //             color: '#fff'
  //         }
  //       },
  //       labels: {
  //         show: false,
  //         style: {
  //             colors: '#fff',
  //             // fontSize: '8px',
  //             // cssClass: 'apexcharts-xaxis-label',
  //         },
  //       }, 
  //     }]
  //   };

  // var seriesStatistic = [{
  //                             name: 'Earning (USD)',
  //                             type: 'column',
  //                             data: earningsStat[0]
  //                         }, {
  //                             name: 'Orders',
  //                             type: 'line',
  //                             data: ordersStat[0]
  //                         }, {
  //                             name: 'Members',
  //                             type: 'line',
  //                             data: membersStat[0]
  //                         }
  //                     ];

  // return (
  //     <>
  //       <button onClick={() => refresh()} disabled={loadingEarningsStat || loadingMembersStat || loadingOrdersStat} 
  //               className="mt-5 mr-4 carosel-btn btn btn-active btn-sm active:bg-slate-300 active:text-slate-700">
  //           <FontAwesomeIcon icon={faRefresh} className="h-4 mr-2"/>
  //           Refresh Graph
  //       </button>
  //         { (typeof window !== 'undefined') 
  //           && !loadingEarningsStat
  //           && !loadingMembersStat
  //           && !loadingOrdersStat 
  //           ? <ReactApexChart options={optionsStatistic} series={seriesStatistic} type="line" height={500}  />
  //           : <div className='w-full text-center mb-4'>
  //               <span>Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 text-md animate-spin"/></span>
  //             </div>
  //         }
  //     </>
  // )
}

export default StatisticChart