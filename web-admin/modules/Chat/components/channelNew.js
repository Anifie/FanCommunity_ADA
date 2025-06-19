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
import { chatChannelPost, chatChannelDirectPost, chatChannelGroupDirectPost, enumGet } from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const ChatChannelNew = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    const [accessType, setAccessType] = useState('CHANNEL_PUBLIC')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    // enum
    const [notifyModes, setNotifyModes] = useState([])
    const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit} = useForm()
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
        getEnum()
    }, [])

    const getEnum = async () => {
        let enumResult = await enumGet();
        console.log("enumResult", enumResult);
        if(enumResult.Success) {
            setNotifyModes(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_values)
            setNotifyModeDescriptions(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_description)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")

        let result;

        if(data.accesstype == 'CHANNEL_PRIVATE' || data.accesstype == 'CHANNEL_PUBLIC') {
            result = await chatChannelPost({
                chatChannelCategoryId: data.chatchannelcategoryid,
                chatChannelName: data.name,
                chatChannelType: data.channeltype,
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
        }
        else if(data.accesstype == 'DIRECT') {
            result = await chatChannelDirectPost({
                senderMemberId: data.sendermemberid,
                receiverMemberId: data.receivermemberid
            })
        }
        else if(data.accesstype == 'GROUP_DIRECT') {
            let _receiverMemberIds = [];
            if(data.receivermemberid1) _receiverMemberIds.push(data.receivermemberid1);
            if(data.receivermemberid2) _receiverMemberIds.push(data.receivermemberid2);
            if(data.receivermemberid3) _receiverMemberIds.push(data.receivermemberid3);
            if(data.receivermemberid4) _receiverMemberIds.push(data.receivermemberid4);
            if(data.receivermemberid5) _receiverMemberIds.push(data.receivermemberid5);
            if(data.receivermemberid6) _receiverMemberIds.push(data.receivermemberid6);
            if(data.receivermemberid7) _receiverMemberIds.push(data.receivermemberid7);
            if(data.receivermemberid8) _receiverMemberIds.push(data.receivermemberid8);
            if(data.receivermemberid9) _receiverMemberIds.push(data.receivermemberid9);

            console.log("_receiverMemberIds", _receiverMemberIds);
            
            result = await chatChannelGroupDirectPost({
                name: data.name,
                senderMemberId: data.sendermemberid,
                receiverMemberIds: _receiverMemberIds
            })
        }
        else {
            throw new Error ("Unsupported access type")
        }

        console.log("createChatChannel result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Chat Channel created successfully")

            router.push("/chat/channel")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to create Chat Channel")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW CHAT CHANNEL</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Access Type<span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    value={accessType} 
                                    {...register("accesstype", {required: true, onChange: (e) => setAccessType(e.target.value)})}>
                                <option value="CHANNEL_PUBLIC">Public Channel</option>
                                <option value="CHANNEL_PRIVATE">Private Channel</option>
                                <option value="DIRECT">Direct Message</option>
                                <option value="GROUP_DIRECT">Group Direct Message</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    {
                        (accessType == 'CHANNEL_PUBLIC' || accessType == 'CHANNEL_PRIVATE') &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Category Id</label>
                                    <input type="text" 
                                        placeholder="Category Id" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("chatchannelcategoryid", {required: false})} />
                                    {/* {errors.name?.type === 'required' && <p className="text-red-500">Category Id is required</p>} */}
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
                            {
                                accessType == 'CHANNEL_PRIVATE' &&
                                <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
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
                                            {JSON.stringify(sampleChannelPermission, null, 2)}
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
                        </>
                    }
                    {
                        accessType == 'DIRECT' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <label>First Member Id<span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="First Member Id" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("sendermemberid", {required: true})} />
                                    {errors.sendermemberid?.type === 'required' && <p className="text-red-500">First Member Id is required</p>}
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Second Member Id<span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Second Member Id" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("receivermemberid", {required: true})} />
                                    {errors.receivermemberid?.type === 'required' && <p className="text-red-500">Second Member Id is required</p>}
                                </div>
                            </div>
                            <br/>
                        </>
                    }
                    {
                        accessType == 'GROUP_DIRECT' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Group Channel Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Group Channel Name" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("name", {required: true})} />
                                    {errors.name?.type === 'required' && <p className="text-red-500">Group Channel Name is required</p>}
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Group Creator Member Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="First Member Id" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("sendermemberid", {required: true})} />
                                    {errors.sendermemberid?.type === 'required' && <p className="text-red-500">Group Creator Member Id is required</p>}
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Group Member Ids (Maximum 9 members)<span className="text-xs"></span></label>
                                    <input type="text" 
                                        placeholder="Group Member Id 1" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid1", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 2" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid2", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 3" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid3", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 4" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid4", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 5" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid5", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 6" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid6", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 7" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid7", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 8" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid8", {required: false})} />
                                    <input type="text" 
                                        placeholder="Group Member Id 9" 
                                        className="input input-bordered w-full max-w-lg mt-1"
                                        {...register("receivermemberid9", {required: false})} />
                                </div>
                            </div>
                            <br/>
                        </>
                    }
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Channel Type<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/6" 
                                    {...register("channeltype", {required: true})}>
                                    <option selected={true} value={"TEXT"}>Text</option>
                            </select>
                            {errors.channeltype?.type === 'required' && <p className="text-red-500">Channel Type is required</p>}
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
                    <br/>*/}
                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/channel")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ChatChannelNew