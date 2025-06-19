import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { batchPost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
// import {EditorState, convertToRaw} from 'draft-js';
// import Editor from '@draft-js-plugins/editor';
//import dynamic from 'next/dynamic'
//const {Editor, EditorState} = dynamic(() => import('draft-js'), { ssr: false });

//import 'draft-js/dist/Draft.css';
//import '@draft-js-plugins/static-toolbar/lib/plugin.css';
//import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
//import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
//const createToolbarPlugin = dynamic(() => import('@draft-js-plugins/static-toolbar'), { ssr: false });
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import ModalDatePicker from "../../../common/components/modal/ModalDatePicker";
import moment from "moment-timezone";

// const toolbarPlugin = createToolbarPlugin();
  
const AnalysisDiscordMessageNew = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    const [startDateUTC, setStartDateUTC] = useState()
    const [endDateUTC, setEndDateUTC] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)
    const mdCalendar = useRef()

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")

        // let result;

        // result = 
        batchPost({
            instruction: data.instruction,
            startDate: startDateUTC,
            endDate: endDateUTC,
            analysisType: "MESSAGE"
        })

        console.log("new analysis submitted")

        router.push("/analysis/discord")
        
        // if(result.Success) {

        //     mdLoading.current.close()
        //     showSuccess("New analysis submitted successfully")

        //     router.push("/analysis/discord")
        // }            
        // else {
        //     console.error(result.Message)
        //     showFailed("Failed to submit new analysis")
        // }
    }

    const calendar = (title, callback) => {
        mdCalendar.current.show(title, callback)
    }

    const changeStartDate = (selectedDate) => {
            console.log("selectedDate", selectedDate, selectedDate.getMonth());
            setValue("startdate", selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));
    
            // Convert to UTC
            let _dateUTC = moment.tz(`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()} 00:00:00`, "YYYY-MM-DD HH:mm:ss", "Asia/Tokyo").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
            console.log("start", _dateUTC);
            
            setStartDateUTC(_dateUTC);
        }

    const changeEndDate = (selectedDate) => {
        console.log("selectedDate", selectedDate);
        setValue("enddate", selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));

        // Convert to UTC
        let _dateUTC = moment.tz(`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()} 00:00:00`, "YYYY-MM-DD HH:mm:ss", "Asia/Tokyo").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        console.log("end", _dateUTC);

        setEndDateUTC(_dateUTC);
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalDatePicker ref={mdCalendar} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">DISCORD MESSAGE ANALYSIS</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Instruction</label>
                            <textarea {...register("instruction", {required: true})} rows={2}>
                            You are an analyst scoring a message for enthusiasm (1-5) and knowledge_depth (1-5). Output as JSON object.
                            </textarea>
                            {/* <input type="text" 
                                placeholder="Instruction" 
                                value={'You are an analyst scoring user messages for enthusiasm (1-5) and knowledge_depth (1-5).'}
                                className="input input-bordered w-full"
                                {...register("instruction", {required: false})} /> */}
                            {errors.instruction?.type === 'required' && <p className="text-red-500">Instruction is required</p>}
                        </div>
                    </div>
                    <br/>
                    <input type="text" 
                                placeholder="Start Date" 
                                //value={`${modifiedDateRange && modifiedDateRange.startDate ? moment(modifiedDateRange.startDate).format("YYYY-MM-DD") : "Start Date"} - ${modifiedDateRange && modifiedDateRange.endDate  ? moment(modifiedDateRange.endDate).format("YYYY-MM-DD") : "End Date"}`}
                                className="input input-bordered w-1/2"
                                readOnly
                                {...register("startdate", {required: true})}
                                onClick={(e) => calendar("Start Date", changeStartDate)} />
                    {errors.startdate?.type === 'required' && <p className="text-red-500">Start date is required</p>}
                    <br/>
                    <br/>
                    <input type="text" 
                                placeholder="End Date" 
                                //value={`${modifiedDateRange && modifiedDateRange.startDate ? moment(modifiedDateRange.startDate).format("YYYY-MM-DD") : "Start Date"} - ${modifiedDateRange && modifiedDateRange.endDate  ? moment(modifiedDateRange.endDate).format("YYYY-MM-DD") : "End Date"}`}
                                className="input input-bordered w-1/2"
                                readOnly
                                {...register("enddate", {required: true})}
                                onClick={(e) => calendar("End Date", changeEndDate)} />
                    {errors.enddate?.type === 'required' && <p className="text-red-500">End date is required</p>}
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Analyze</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/analysis/discord")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AnalysisDiscordMessageNew