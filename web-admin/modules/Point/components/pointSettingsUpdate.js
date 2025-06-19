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
import { pointSettingsListing, pointSettingPut } from "../api";
import moment from "moment-timezone";

// const toolbarPlugin = createToolbarPlugin();
  
const PointSettingUpdate = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    // const [isPrivate, setIsPrivate] = useState('NO')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    // enum
    // const [notifyModes, setNotifyModes] = useState([])
    // const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])

    const [pointSettingId, setPointSettingId] = useState()
    const [pointSetting, setPointSetting] = useState()
    
    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleWeightRole = [
        { role: "role_id_1", weight: 2 },
        { role: "role_id_2", weight: 3 }
      ];

    useEffect(() => {

        const {pointsettingsid} = router.query
        setPointSettingId(pointsettingsid)
        getPointSetting(pointsettingsid)

    }, [])

    // const getEnum = async () => {
    //     let enumResult = await enumGet();
    //     console.log("enumResult", enumResult);
    //     if(enumResult.Success) {
    //         setNotifyModes(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_values)
    //         setNotifyModeDescriptions(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_description)
    //     }
    // }

    const getPointSetting = async (id) => {
        let _pointSettingsResult = await pointSettingsListing();
        if(_pointSettingsResult.Success) {
            let _pointSettings = _pointSettingsResult.Data;
            let _pointSetting = _pointSettings.find(x => x.SK == id)
            setPointSetting(_pointSetting)

            console.log("_pointSetting", _pointSetting);
            

            setValue("pointsettingid", id)
            if(_pointSetting.start_date) setValue("startdate", moment(_pointSetting.start_date).utcOffset(9 * 60).format("YYYY-MM-DD HH:mm:ss"))
            if(_pointSetting.end_date) setValue("enddate", moment(_pointSetting.end_date).utcOffset(9 * 60).format("YYYY-MM-DD HH:mm:ss"))
            if(_pointSetting.weight_role) setValue("weightrole", _pointSetting.weight_role)
            if(_pointSetting.message_minimum_length) setValue("messageminimumlength", _pointSetting.message_minimum_length)
            if(_pointSetting.omitted_channel_ids) setValue("omittedchannelids", _pointSetting.omitted_channel_ids)
            if(_pointSetting.weight_attachments) setValue("weightattachments", _pointSetting.weight_attachments)
            if(_pointSetting.weight_message) setValue("weightmessage", _pointSetting.weight_message)
            if(_pointSetting.weight_reaction) setValue("weightreaction", _pointSetting.weight_reaction)
            if(_pointSetting.weight_vote) setValue("weightvote", _pointSetting.weight_vote)
            if(_pointSetting.weight_nft) setValue("weightnft", _pointSetting.weight_nft)
            if(_pointSetting.weight_replies) setValue("weightreplies", _pointSetting.weight_replies)

        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await pointSettingPut({
                                        pointSettingsId: pointSettingId,
                                        startDate: data.startdate ? moment.tz(data.startdate, "YYYY-MM-DD HH:mm:ss", "Asia/Tokyo").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : undefined,
                                        endDate: data.enddate ? moment.tz(data.enddate, "YYYY-MM-DD HH:mm:ss", "Asia/Tokyo").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : undefined,
                                        weightRole: data.weightrole,
                                        messageMinimumLength: data.messageminimumlength,
                                        omittedChannelIds: data.omittedchannelids,
                                        weightAttachments: data.weightattachments,
                                        weightMessage: data.weightmessage,
                                        weightReaction: data.weightreaction,
                                        weightVote: data.weightvote,
                                        weightNFT: data.weightnft,
                                        weightReplies: data.weightreplies
                                    })

        console.log("update point setting result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Point Setting created successfully")

            router.push("/point/settings")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to update point setting")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT POINT SETTING</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Point Setting Id</label>
                            <input type="text" 
                                placeholder="Point Setting Id" 
                                disabled="true"
                                className="input input-bordered w-full max-w-lg"
                                {...register("pointsettingid", {required: true})} />
                        </div>
                    </div>
                    <br/> 
                    {
                        pointSetting && pointSetting.start_date &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Start Date<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Start Date" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("startdate", {required: true})} />
                                    {errors.startdate?.type === 'required' && <p className="text-red-500">Start date is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.end_date &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>End Date<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="End Date" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("enddate", {required: true})} />
                                    {errors.enddate?.type === 'required' && <p className="text-red-500">End date is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.weight_role &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Role<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Role" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightrole", {required: true})} />
                                    {errors.weightrole?.type === 'required' && <p className="text-red-500">Weight on Role is required</p>}
                                </div>
                            </div>
                            <pre className="text-xs">Example:<br/><code>{JSON.stringify(sampleWeightRole, null, 2)}</code></pre>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.message_minimum_length &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Message Minimum Length<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Message Minimum Length" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("messageminimumlength", {required: true})} />
                                    {errors.messageminimumlength?.type === 'required' && <p className="text-red-500">Message Minimum Length is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.omitted_channel_ids != undefined &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Omitted Channel Ids</label>
                                    <input type="text" 
                                        placeholder="Omitted Channel Ids" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("omittedchannelids", {required: false})} />
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.weight_attachments &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Attachments<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Attachments" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightattachments", {required: true})} />
                                    {errors.weightattachments?.type === 'required' && <p className="text-red-500">Weight on Attachments is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.weight_message &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Message<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Message" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightmessage", {required: true})} />
                                    {errors.weightmessage?.type === 'required' && <p className="text-red-500">Weight on Message is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.weight_reaction &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Reaction<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Reaction" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightreaction", {required: true})} />
                                    {errors.weightreaction?.type === 'required' && <p className="text-red-500">Weight on Reaction is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {/* {
                        pointSetting && pointSetting.weight_vote &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Vote<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Vote" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightvote", {required: true})} />
                                    {errors.weightvote?.type === 'required' && <p className="text-red-500">Weight on Vote is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    } */}
                    {
                        pointSetting && pointSetting.weight_nft &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on NFT<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on NFT" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightnft", {required: true})} />
                                    {errors.weightnft?.type === 'required' && <p className="text-red-500">Weight on NFT is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    {
                        pointSetting && pointSetting.weight_replies &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Weight on Replies<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Weight on Replies" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("weightreplies", {required: true})} />
                                    {errors.weightreplies?.type === 'required' && <p className="text-red-500">Weight on Replies is required</p>}
                                </div>
                            </div>
                            <br/> 
                        </>
                    }
                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/point/settings")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default PointSettingUpdate