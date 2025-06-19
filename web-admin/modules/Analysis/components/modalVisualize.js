import { forwardRef, useState, useImperativeHandle, Suspense, lazy, useEffect } from "react";
import { ToastContext } from "../../../common/context/ToastContext";
import { batchVisualize } from "../api";
// import Plot from 'react-plotly.js';
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ModalVisualize = forwardRef((props, _ref) => {
    
    const [instruction, setInstruction] = useState();
    // const [url, setURL] = useState()
    // const [Chart, setChartComponent] = useState()
    const [htmlContent, setHtmlContent] = useState(null);
    const [loading, setLoading] = useState(false)

    // const callbackFn = useRef(null)
    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    useEffect(() => {
        setHtmlContent(null)
    }, [])

    useImperativeHandle(_ref, () => ({
        show: (_url) => {
            // callbackFn.current = actionCallback
            setValue("jsondata", _url)
            document.getElementById('lnkOpenModalVisualize').click();
        },
        assignInstruction: (_instruction) => {
            setInstruction(_instruction)
        }
    }));

    const close = () => {
        document.getElementById('btnCloseVisualize').click();
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        setLoading(true)
        setHtmlContent(null)

        let result = await batchVisualize({jsonDataURL: data.jsondata, instruction: data.instruction});
        console.log("result", result);

        if(result.Success) {
            let html = result.Data.html;
            html = html.replace('data = []', 'data = ' + JSON.stringify(result.Data.sourceData));
            console.log("html", html);
            
            setHtmlContent(html)
        }
        else {
            setLoading(false);
            alert('Failed to generate chart. please try again.')
        }

//         let html = `
//         <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Plotly Chart</title>
//     <script src="https://cdn.plot.ly/plotly-2.25.2.min.js"></script>
// </head>
// <body>
    
//     <div id="chart"></div>

//     <script>
//         // Your data array
//         let data = [
//             { user_id: "1024378561768992821", result: { enthusiasm: 4, knowledge_depth: 3 } },
//             { user_id: "1318481029882970193", result: { enthusiasm: 2, knowledge_depth: 1 } },
//             { user_id: "1318841931840622633", result: { enthusiasm: 2, knowledge_depth: 1 } },
//             { user_id: "1321378166891216907", result: { enthusiasm: 2, knowledge_depth: 1 } },
//         ];

//         // Map the data into Plotly format
//         const plotData = data.map(user => ({
//             type: 'scatter',
//             mode: 'markers',
//             x: [user.result.knowledge_depth],
//             y: [user.result.enthusiasm],
//             marker: { size: 14 },
//             text: [user.user_id], // Tooltip showing user_id
//         }));

//         // Layout configuration
//         const layout = {
//             title: 'Knowledge Depth vs Enthusiasm',
//             xaxis: { title: 'Knowledge Depth' },
//             yaxis: { title: 'Enthusiasm' },
//             width: 600,
//             height: 600,
//         };

//         // Render the chart
//         Plotly.newPlot('chart', plotData, layout);
//     </script>
// </body>
// </html>
//         `;
        // setHtmlContent(html);

        console.log("done visualization")
        setLoading(false)

    }

    // const generate = async () => {
    //     // let result = await batchVisualize({jsonDataURL: url});
    //     // console.log("result", result);
    //     let result = {Success: true};

    //     if(result.Success) {
    //         // let _reactCode = result.Data.react;
    //         // _reactCode = _reactCode.replace('[]', JSON.stringify(result.Data.sourceData));
    //         let _reactCode = `
    //         import React from 'react';
    //         import Plot from 'react-plotly.js';

    //         const ScatterPlotChart = () => {
    //         let data = [{"user_id":"1024378561768992821","result":{"enthusiasm":4,"knowledge_depth":3}},{"user_id":"1318481029882970193","result":{"enthusiasm":2,"knowledge_depth":1}},{"user_id":"1318841931840622633","result":{"enthusiasm":2,"knowledge_depth":1}},{"user_id":"1321378166891216907","result":{"enthusiasm":2,"knowledge_depth":1}}]; // Ensure data is populated with valid objects if this is a placeholder

    //         const plotData = data.map(user => {
    //             return {
    //             type: 'scatter',
    //             mode: 'markers',
    //             x: [user.result.knowledge_depth],
    //             y: [user.result.enthusiasm],
    //             marker: { size: 14 },
    //             text: [user.user_id],
    //             };
    //         });

    //         return (
    //             <Plot
    //             data={plotData}
    //             layout={{ width: 500, height: 500, title: 'Knowledge Depth vs Enthusiasm' }}
    //             />
    //         );
    //         };

    //         window.ScatterPlotChart = ScatterPlotChart;
    //         export default ScatterPlotChart;
    //                     `;
    //         //_reactCode = _reactCode.replace('[]', JSON.stringify([{"user_id":"1024378561768992821","result":{"enthusiasm":4,"knowledge_depth":3}},{"user_id":"1318481029882970193","result":{"enthusiasm":2,"knowledge_depth":1}},{"user_id":"1318841931840622633","result":{"enthusiasm":2,"knowledge_depth":1}},{"user_id":"1321378166891216907","result":{"enthusiasm":2,"knowledge_depth":1}}]));
            
    //         // Dynamically generate a React component
    //         // try {
    //         //     // // Wrap the dynamic code in a React component
    //         //     // const ChartComponent = lazy(() =>
    //         //     //     import(chartComponentPath).then((module) => ({
    //         //     //       default: module.default,
    //         //     //     }))
    //         //     //   );

    //         //     // setChartComponent(() => ChartComponent);

    //         //     const blob = new Blob([_reactCode], { type: 'application/javascript' });
    //         //     const url = URL.createObjectURL(blob);
    //         //     console.log("url", url);
                

    //         //     const module = await import(/* webpackIgnore: true */ url);
    //         //     console.log("module", module);
                
    //         //     setChartComponent(() => module.default);

                
    //         // } catch (error) {
    //         //     console.error("Error parsing chart component:", error);
    //         // }

    //         try {
    //             const blob = new Blob([_reactCode], { type: 'application/javascript' });
    //             const url = URL.createObjectURL(blob);
            
    //             // Dynamically load the script
    //             const script = document.createElement("script");
    //             script.type = "text/javascript"; // Use regular script type if relying on global exposure
    //             script.src = url;
    //             script.onload = () => {
    //                 console.log("Script loaded successfully");
    //                 const module = window.ScatterPlotChart;
    //                 if (module) {
    //                     setChartComponent(() => module);
    //                 } else {
    //                     console.error("ScatterPlotChart is not available on window.");
    //                 }
    //             };
    //             script.onerror = (e) => console.error("Error loading script:", e);
    //             document.body.appendChild(script);

    //         } catch (error) {
    //             console.error("Error parsing chart component:", error);
    //         }

            
    //     }
    // }

    return (
        <div>

            <label id="lnkOpenModalVisualize" htmlFor="modal-visualize" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-visualize" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box w-[680px] max-w-7xl">
                    <label htmlFor="modal-visualize" id="btnCloseVisualize" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">Data Visualization</h3>
                    
                    <br/>
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <div className="flex flex-col">
                            <label>Instruction <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <textarea {...register("instruction", {required: true})} rows={2} className="textarea textarea-bordered">
                            Generate plotly chart for following json array in html with vanilla javascript. Import plotly library from its cdn. No title is needed. Output as single line html with no line break. The chart should depict the majority of user knowledge depth and enthusiasm.
                            </textarea>
                            {errors.instruction?.type === 'required' && <p className="text-red-500">Instruction is required</p>}
                        </div>
                        <br/>
                        <div className="flex flex-col">
                            <label>JSON Data <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="JSON Data" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("jsondata", {required: true})} />
                            {errors.jsondata?.type === 'required' && <p className="text-red-500">JSON Data is required</p>}
                        </div>
                        <div className="modal-action">
                            <button className="mt-5 btn btn-primary btn-sm" type="submit" disabled={loading}>
                                {
                                    loading
                                        ?   <span className="flex justify-center">Visualizing.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>
                                        :   <span>Visualize Data</span>
                                }
                            </button>
                            <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => {setHtmlContent(null); setLoading(false); close();}}>Cancel</button>
                        </div>
                    </form>
                    <br/>
                    {/* {chartComponent && React.createElement(chartComponent)} */}
                    {/* <Suspense fallback={<div>Loading...</div>}>{Chart ? <Chart /> : <div>No Chart Available</div>}</Suspense> */}

                    {
                        htmlContent && 
                        <div className="flex justify-middle w-full">
                            <iframe
                                srcDoc={htmlContent}
                                width="100%"  // Or set a specific width and height
                                height="600px"
                                style={{ border: "none" }}
                                //title="Knowledge Depth vs Enthusiasm Chart"
                            ></iframe>
                        </div>
                    }

                    
                </div>
            </div>

        </div>
    )
});

export default ModalVisualize