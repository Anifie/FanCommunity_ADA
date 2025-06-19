import { faSpinner, faArrowTrendUp, faArrowTrendDown, faCircleUser, faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import { statisticLanternCountGet } from '../../../api'

const StatisticSummary = () => {

    const [loadingLantern, setLanternLoading] = useState(false)
    const [lanternsStat, setLanternsStat] = useState([])
    
    const getLanternCountStatistic = async () => {
        setLanternLoading(true)

        let result = await statisticLanternCountGet()
        if(result.Success) {
            setLanternsStat([
                                +result.Data.CountRank0, 
                                +result.Data.MaxRank0
                            ])
        }
        
        setLanternLoading(false)
    }

    useEffect(() => {
        //getLanternCountStatistic()
    }, [])

    return (
        <></>
        // <div className="grid grid-cols-2 mt-5 gap-4">
        //     <div className="bg-[#212529] p-2">
        //         <div className="flex justify-between">
        //             <span className="uppercase text-slate-400 text-[13px]">TOTAL MEMBERS</span>
        //             <span className={`flex items-center ${lanternsStat.length> 0 && lanternsStat[0] > 0 ? "text-[#36d399]" : "text-[#cf6548]"}`}>
        //                 {
        //                     lanternsStat.length> 0 && lanternsStat[0] > 0
        //                         ? <FontAwesomeIcon icon={faArrowTrendUp} className="h-4" />
        //                         : <FontAwesomeIcon icon={faArrowTrendDown} className="h-4" />
        //                 }
        //                 &nbsp;
        //                 {lanternsStat.length> 0 && lanternsStat[0] > 0 ? "+" + (lanternsStat[0] / lanternsStat[1] * 100).toString() + "%" : "0%"}
        //             </span>
        //         </div>
        //         <div className="mt-4 flex justify-between items-end">
        //             <div>
        //                 <h4 className="font-semibold mb-4 text-xl">
        //                 { 
        //                         loadingLantern 
        //                             ? <FontAwesomeIcon icon={faSpinner} className="h-4 animate-spin" />
        //                             : lanternsStat[0] + " / " + lanternsStat[1]
        //                     }
        //                 </h4>
        //                 <Link href="/lantern/illuminated"><span className="text-sm underline cursor-pointer">View details</span></Link>
        //             </div>
        //             <div onClick={() => getLanternStatistic()} className="cursor-pointer h-12 w-12 bg-[#223a4a] p-2 flex justify-center items-center rounded-md">
        //                 <FontAwesomeIcon icon={faLightbulb} className="h-5 mx-auto text-[#279cdb]"/>
        //             </div>
        //         </div>
        //     </div>
        //     <div className="bg-[#212529] p-2">
        //         <div className="flex justify-between">
        //             <span className="uppercase text-slate-400 text-[13px]">MEMBERS</span>
        //             <span className={`flex items-center ${membersStat.length> 0 && membersStat[0] > 0 ? "text-[#36d399]" : "text-[#cf6548]"}`}>
        //                 {
        //                     membersStat.length> 0 && membersStat[0] > 0
        //                         ? <FontAwesomeIcon icon={faArrowTrendUp} className="h-4" />
        //                         : <FontAwesomeIcon icon={faArrowTrendDown} className="h-4" />
        //                 }
        //                 &nbsp;
        //                 {membersStat.length> 0 && membersStat[0] > 0 ? "+" (membersStat[0] / membersStat[1] * 100) + "%" : "0%"}
        //             </span>
        //         </div>
        //         <div className="mt-4 flex justify-between items-end">
        //             <div>
        //                 <h4 className="font-semibold mb-4 text-xl">
        //                     { 
        //                         loadingMembersStat 
        //                             ? <FontAwesomeIcon icon={faSpinner} className="h-4 animate-spin" />
        //                             : membersStat[1]
        //                     }
        //                 </h4>
        //                 <Link href="/member"><span className="text-sm underline cursor-pointer">View details</span></Link>
        //             </div>
        //             <div onClick={() => getMembersStatistic()} className="cursor-pointer h-12 w-12 bg-[#483f2f] p-2 flex justify-center items-center rounded-md">
        //                 <FontAwesomeIcon icon={faCircleUser} className="h-5 mx-auto text-[#f7ac3a]"/>
        //             </div>
        //         </div>
        //     </div>
            
        // </div>
    )
}

export default StatisticSummary