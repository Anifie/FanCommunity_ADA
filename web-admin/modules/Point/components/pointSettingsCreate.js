import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { administratorPost } from "../api";
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
import { pointSettingPost } from "../api";
import ModalDatePicker from "../../../common/components/modal/ModalDatePicker";
import moment from "moment-timezone";

// const toolbarPlugin = createToolbarPlugin();
  
const PointSettingNew = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    // const [isPrivate, setIsPrivate] = useState('NO')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    // enum
    // const [notifyModes, setNotifyModes] = useState([])
    // const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])

    const [cutOffDateUTC, setCutOffDateUTC] = useState();

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)
    const mdCalendar = useRef()

    const sampleRolePermission =  [
        {"view_channel": true},
        {"send_messages": true}
      ]

    // useEffect(() => {
    //     getEnum()
    // }, [])

    // const getEnum = async () => {
    //     let enumResult = await enumGet();
    //     console.log("enumResult", enumResult);
    //     if(enumResult.Success) {
    //         setNotifyModes(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_values)
    //         setNotifyModeDescriptions(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_description)
    //     }
    // }

    const calendar = (title, callback) => {
        mdCalendar.current.show(title, callback)
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await pointSettingPost({
                                        pointSettingType: 'DATE',
                                        cutOffDate: cutOffDateUTC,
                                    })

        console.log("create new point settings result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Point Setting created successfully")

            router.push("/point/settings")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to create Point Setting")
        }
    }

    const changeCutOffDate = (selectedDate) => {
        console.log("selectedDate", selectedDate);
        setValue("cutoffdate", selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));

        // Convert to UTC
        let _dateUTC = moment.tz(`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()} 00:00:00`, "YYYY-MM-DD HH:mm:ss", "Asia/Tokyo").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        
        setCutOffDateUTC(_dateUTC);
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalDatePicker ref={mdCalendar} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW POINT SETTING</h2>                        
                </div>
                <div className="p-4 w-full">
                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Setting Type<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    {...register("settingtype", {required: true})}>
                                <option value="GENERAL">GENERAL</option>
                                <option value="DATE">DATE</option>
                            </select>
                            {errors.currency?.type === 'required' && <p className="text-red-500">Currency is required</p>}
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/>  */}
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Cut Off Date</label>
                            {/* <input type="text" 
                                placeholder="Cut Off Date in Tokyo, Japan Timezone" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("cutoffdate", {required: false})} /> */}

                            <input type="text" 
                                placeholder="Cut Off Date" 
                                //value={`${modifiedDateRange && modifiedDateRange.startDate ? moment(modifiedDateRange.startDate).format("YYYY-MM-DD") : "Start Date"} - ${modifiedDateRange && modifiedDateRange.endDate  ? moment(modifiedDateRange.endDate).format("YYYY-MM-DD") : "End Date"}`}
                                className="input input-bordered w-full"
                                readOnly
                                {...register("cutoffdate", {required: true})}
                                onClick={(e) => calendar("Cut Off Date", changeCutOffDate)} />
                            {errors.cutoffdate?.type === 'required' && <p className="text-red-500">Cut off date is required</p>}
                        </div>
                    </div>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Add</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/point/settings")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default PointSettingNew