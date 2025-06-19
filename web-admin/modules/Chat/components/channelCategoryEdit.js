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
import { chatChannelCategoryPut, chatChannelCategoryListingGet, enumGet } from "../api";
  
const ChatCategoryEdit = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    const [accessType, setAccessType] = useState('CATEGORY_PUBLIC')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    const [chatChannelCategoryId, setChatChannelCategoryId] = useState()
    const [chatChannelCategory, setChatChannelCategory] = useState()

    // enum
    const [notifyModes, setNotifyModes] = useState([])
    const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleCategoryPermission =  [
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

        const {chatchannelcategoryid} = router.query
        if(!chatChannelCategoryId) {
            setChatChannelCategoryId(chatchannelcategoryid)
            getChatChannelCategory(chatchannelcategoryid)
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

    const getChatChannelCategory = async (aid) => {
        await getEnum()
        let chatChannelCategoryResult = await chatChannelCategoryListingGet({chatChannelCategoryId: aid})
        console.log("getChatChannelCategory", chatChannelCategoryResult)
        if(chatChannelCategoryResult.Success) {
            let obj = chatChannelCategoryResult.Data[0];
            setChatChannelCategory(obj)
            setChatChannelCategoryId(obj.ChatChannelCategoryId)
            setValue("name", obj.Name)
            setValue("muteminutes", obj.MuteMinutes)
            setValue("notifymode", obj.NotifyMode)
            //setValue("isprivate", obj.IsPrivate ? 'YES' : 'NO')
            setValue("accesstype", obj.AccessType)
            setValue("roles", obj.RolesAndMembers ? obj.RolesAndMembers.roles : "")
            setValue("members", obj.RolesAndMembers ? obj.RolesAndMembers.members : "")
            setValue("categorypermissions", obj.CategoryPermissions ? JSON.stringify(obj.CategoryPermissions, null, 2): JSON.stringify(sampleCategoryPermission, null, 2))
            setValue("sequence", obj.SequenceNumber != undefined ? obj.SequenceNumber : "")
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await chatChannelCategoryPut({
                                        chatChannelCategoryId: chatChannelCategoryId,
                                        chatChannelCategoryName: data.name,
                                        muteMinutes: data.muteminutes,
                                        notifyMode: data.notifymode,
                                        sequenceNumber: data.sequence,
                                        //isPrivate: data.isprivate == 'YES',
                                        accessType: data.accesstype,
                                        rolesAndMembers: data.accesstype == 'CATEGORY_PRIVATE'
                                                            ? {
                                                                roles: data.roles,
                                                                members: data.members
                                                            }
                                                            : undefined,
                                        categoryPermissions: data.accesstype == 'CATEGORY_PRIVATE' && data.categorypermissions
                                                            ? JSON.parse(data.categorypermissions)
                                                            : undefined
                                    })

        console.log("editChatChannelCategory result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Chat Channel Category updated successfully")

            router.push("/chat/channel-category")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to update Chat Channel Category")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT NEW CHAT CHANNEL CATEGORY</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Category Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Category Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/> 
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
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Access Type<span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    {...register("accesstype", {required: true, onChange: (e) => setAccessType(e.target.value)})}>
                                <option value="CATEGORY_PUBLIC">Public Category</option>
                                <option value="CATEGORY_PRIVATE">Private Category</option>
                            </select>
                        </div>
                    </div>
                    {
                        accessType == 'CATEGORY_PRIVATE' &&
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
                                <label>Category Permissions<span className="text-xs"></span></label>
                                <textarea {...register("categorypermissions", {required: false})} rows={10}>
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
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/channel-category")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ChatCategoryEdit