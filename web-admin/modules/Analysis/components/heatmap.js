import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { heatMapPost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import ModalResult from "./modalResult";
import ModalMessage from "./modalMessages";

// import Plot from 'react-plotly.js';
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const HeatMap = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState()
    const [result, setResult] = useState()
    
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    
    useEffect(() => {        
        getHeatMaps()
    }, [])
    
    const getHeatMaps = async () => {
        setLoading(true)
        setResult();
        let result = await heatMapPost({
        })
        console.log("heatmap result", result);
        if(result.Success) {
            setResult(result.Data)
        }
        setLoading(false)
    }

    const search = () => {
        getHeatMaps()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">HEAT MAP VISUALIZATION</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            {/* <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="DONE">DONE</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="FAILED">FAILED</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Batch Id</label>
                                    <input type="text" 
                                        placeholder="Batch Id" 
                                        value={batchId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setBatchId(e.target.value)} />
                                </div>
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Refresh</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {
                            loading && <div className="flex justify-center mb-5">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></div>
                        }
                        {
                            !loading && result &&
                            <div className="grid grid-cols-1 xxl:grid-cols-1 gap-2">
                                <div>
                                    <div className="mt-2">This heat map visualizes the overall chat activity throughout the week, helping to identify peak hours and days when the chat system is most active.</div>
                                    <Plot
                                        data={[
                                            {
                                                z: result.timeBasedAxisZ,
                                                x: result.timeBasedAxisX,
                                                y: result.timeBasedAxisY,
                                                type: "heatmap",
                                                colorscale: "YlGnBu",
                                                annotations: [
                                                    {
                                                        // x: 12, // Position in the middle of the chart
                                                        // y: 6,  // Adjust based on chart range
                                                        text: "This heat map visualizes the overall chat activity throughout the week, helping to identify peak hours and days when the chat system is most active.",
                                                        // showarrow: false,
                                                        // font: { size: 14, color: "white" },
                                                        // bgcolor: "rgba(0, 0, 0, 0.6)",
                                                        // bordercolor: "white",
                                                        // borderwidth: 2,
                                                        // xanchor: "center",
                                                        // yanchor: "top"
                                                    }
                                                ]
                                            }
                                        ]}
                                        layout={{
                                            title: "Chat Activity Heat Map",
                                            xaxis: { title: "Hour of the Day (UTC)" },
                                            yaxis: { title: "Day of the Week", type: "category" },
                                            width: 1000,  // Increase the width
                                            height: 600,  // Increase the height
                                            margin: { l: 180, r: 50, t: 50, b: 80 }, // Adjust margins to prevent text trimming
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="mt-2">This heat map highlights which users are most active at different hours, showing engagement patterns for the most active users.</div>                                    
                                    <Plot
                                        data={[
                                            {
                                                z: result.top50ActiveUsersHourAxisZ,
                                                x: result.top50ActiveUsersHourAxisX,
                                                y: result.top50ActiveUsersHourAxisY,
                                                type: "heatmap",
                                                colorscale: "YlGnBu",
                                                annotations: [
                                                    {
                                                        // x: 12, // Position in the middle of the chart
                                                        // y: 6,  // Adjust based on chart range
                                                        text: "This heat map highlights which users are most active at different hours, showing engagement patterns for individual users.",
                                                        // showarrow: false,
                                                        // font: { size: 14, color: "white" },
                                                        // bgcolor: "rgba(0, 0, 0, 0.6)",
                                                        // bordercolor: "white",
                                                        // borderwidth: 2,
                                                        // xanchor: "center",
                                                        // yanchor: "top"
                                                    }
                                                ]
                                                
                                            }
                                        ]}
                                        layout={{
                                            title: "User Activity Heat Map",
                                            xaxis: { title: "Hour of the Day (UTC)" },
                                            yaxis: { title: "User ID", type: "category" },
                                            width: 1000,  // Increase the width
                                            height: 600,  // Increase the height
                                            margin: { l: 180, r: 50, t: 50, b: 80 }, // Adjust margins to prevent text trimming
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="mt-2">This heat map shows which chat channels are busiest at different hours, helping to analyze traffic distribution across different conversation spaces.</div>
                                    <Plot
                                        data={[
                                            {
                                                z: result.top50ActiveChannelsAxisZ,
                                                x: result.top50ActiveChannelsAxisX,
                                                y: result.top50ActiveChannelsAxisY,
                                                type: "heatmap",
                                                colorscale: "YlGnBu",
                                                annotations: [
                                                    {
                                                        // x: 12, // Position in the middle of the chart
                                                        // y: 6,  // Adjust based on chart range
                                                        text: "This heat map shows which chat channels (or rooms) are busiest at different hours, helping to analyze traffic distribution across different conversation spaces.",
                                                        // showarrow: false,
                                                        // font: { size: 14, color: "white" },
                                                        // bgcolor: "rgba(0, 0, 0, 0.6)",
                                                        // bordercolor: "white",
                                                        // borderwidth: 2,
                                                        // xanchor: "center",
                                                        // yanchor: "top"
                                                    }
                                                ]
                                            }
                                        ]}
                                        layout={{
                                            title: "Channel Activity Heatmap",
                                            xaxis: { title: "Hour of the Day (UTC)" },
                                            yaxis: { title: "Channel ID", type: "category" },
                                            width: 1000,  // Increase the width
                                            height: 600,  // Increase the height
                                            margin: { l: 180, r: 50, t: 50, b: 80 }, // Adjust margins to prevent text trimming
                                        }}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatMap