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
import { chatChannelPut, chatChannelListingGet, enumGet } from "../api";
  
const ChatChannelEdit = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    const [accessType, setAccessType] = useState('CHANNEL_PUBLIC')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    const [chatChannelId, setChatChannelId] = useState()
    const [chatChannel, setChatChannel] = useState()

    // enum
    const [notifyModes, setNotifyModes] = useState([])
    const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleChannelPermission =  [
        {
          "target_type": "ROLE", 
          "target_id": "MEMBER",
          "permissions": [
            {"view_channel": true},
            {"send_messages": true}
          ]
        }, 
        {
          "target_type": "MEMBER", 
          "target_id": "01JB92QV0XE220PBCXHFNFMY9P",
          "permissions": [
            {"view_channel": true},
            {"send_messages": true}
          ]
        }
    ]

    useEffect(() => {

        let {chatchannelid} = router.query
        console.log("chatchannelid", chatchannelid)

        if(chatchannelid == 'DIRECT' || chatchannelid == 'GROUP_DIRECT') {
            chatchannelid = `${router.query.chatchannelid}${window.location.hash}`
            console.log("chatchannelid", chatchannelid);
        }
        
        if(!chatChannelId) {
            setChatChannelId(chatchannelid)
            getChatChannel(chatchannelid)
        }

    }, [])

    const getEnum = async () => {
        let enumResult = await enumGet();
        console.log("enumResult", enumResult);
        if(enumResult.Success) {
            setNotifyModes(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_values)
            setNotifyModeDescriptions(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_description)
        }
    }

    const getChatChannel = async (aid) => {
        console.log("getChatChannel", aid);
        
        await getEnum()
        let chatChannelResult = await chatChannelListingGet({chatChannelId: aid})
        console.log("getChatChannel", chatChannelResult)
        if(chatChannelResult.Success) {
            let obj = chatChannelResult.Data[0];
            setChatChannel(obj)
            setChatChannelId(obj.ChatChannelId)

            if(obj.ChatChannelCategory)
                setValue("chatchannelcategoryid", obj.ChatChannelCategory.ChatChannelCategoryId)

            setValue("name", obj.Name)
            setValue("channeltype", obj.ChatChannelType)
            setValue("muteminutes", obj.MuteMinutes)
            setValue("notifymode", obj.NotifyMode)
            setValue("accesstype", obj.AccessType)
            setAccessType(obj.AccessType)
            setValue("roles", obj.RolesAndMembers ? obj.RolesAndMembers.roles : "")
            setValue("members", obj.RolesAndMembers ? obj.RolesAndMembers.members : "")
            setValue("channelpermissions", obj.ChannelPermissions ? JSON.stringify(obj.ChannelPermissions, null, 2): JSON.stringify(sampleChannelPermission, null, 2))
            setValue("sequence", obj.SequenceNumber != undefined ? obj.SequenceNumber : "")
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await chatChannelPut({
                                        chatChannelId: chatChannelId,
                                        chatChannelCategoryId: data.chatchannelcategoryid,
                                        chatChannelName: data.name,
                                        channelType: data.channeltype,
                                        muteMinutes: data.muteminutes,
                                        notifyMode: data.notifymode,
                                        sequenceNumber: data.sequence,
                                        accessType: data.accesstype,
                                        rolesAndMembers: data.accesstype == 'CHANNEL_PRIVATE' 
                                                            ? {
                                                                roles: data.roles,
                                                                members: data.members
                                                            }
                                                            : undefined,
                                        channelPermissions: data.accesstype == 'CHANNEL_PRIVATE'  && data.channelpermissions
                                                            ? JSON.parse(data.channelpermissions)
                                                            : undefined
                                    })

        console.log("editChatChannel result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Chat Channel updated successfully")

            router.push("/chat/channel")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to update Chat Channel")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT CHAT CHANNEL</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Access Type<span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    {...register("accesstype", {required: true, onChange: (e) => setAccessType(e.target.value)})}>
                                <option value="CHANNEL_PUBLIC">Public Channel</option>
                                <option value="CHANNEL_PRIVATE">Private Channel</option>
                                <option value="DIRECT">Direct Message</option>
                                <option value="GROUP_DIRECT">Group Direct Message</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Category Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Category Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("chatchannelcategoryid", {required: false})} />
                            {/* {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>} */}
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Channel Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Channel Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Channel Type<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/6" 
                                    {...register("channeltype", {required: true})}>
                                    <option value={"TEXT"}>Text</option>
                            </select>
                            {errors.name?.type === 'required' && <p className="text-red-500">Channel Type is required</p>}
                        </div>
                    </div>
                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Mute Expiry in Minutes</label>
                            <input type="number" 
                                placeholder="Mute Expiry in Minutes" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("muteminutes", {required: false})} />
                        </div>
                    </div>
                    <br/>               
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Notification Mode<span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/2" 
                                    {...register("notifymode", {required: false})}>
                                    <option value={""}>--Please Select--</option>
                                    {
                                        notifyModes 
                                        && notifyModes.length > 0
                                        && notifyModes.map((x, index) => <option value={x}>{notifyModeDescriptions[index]}</option>)
                                    }
                            </select>
                        </div>
                    </div>
                    <br/> */}
                    {
                        accessType == 'CHANNEL_PRIVATE' &&
                        <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                            <br/>
                            <div className="flex flex-col">
                                <label>Allowed Roles<span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Roles" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("roles", {required: false})} />
                            </div>
                            <div className="flex flex-col">
                                <label>Allowed Member IDs<span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Member IDs" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("members", {required: false})} />
                            </div>
                            <div className="flex flex-col w-1/2">
                                <label>Channel Permissions<span className="text-xs"></span></label>
                                <textarea {...register("channelpermissions", {required: false})} rows={10}>
                                </textarea>
                            </div>
                        </div>
                    }
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Sequence Number<span className="text-xs"></span></label>
                            <input type="number" 
                                placeholder="Sequence Number" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("sequence", {required: true})} />
                            {errors.sequence?.type === 'required' && <p className="text-red-500">Sequence Number is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/channel")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ChatChannelEdit