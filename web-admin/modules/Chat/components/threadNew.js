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
import { threadPost, enumGet } from "../api";
  
const ThreadNew = () => {

    const [threadType, setThreadType] = useState('MESSAGE')
    const [accessType, setAccessType] = useState('THREAD_PUBLIC')

    const {register, formState: {errors}, handleSubmit} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const sampleThreadPermission =  [
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


    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")

        let result;

        result = await threadPost({
            memberId: data.memberid,
            channelMessageId: data.messageid,
            threadName: data.threadname,
            threadType: data.threadtype,
            accessType: data.accesstype,
            threadMemberIds: data.memberids,
            chatChannelId: data.chatchannelid,
            rolesAndMembers: data.accesstype == 'THREAD_PRIVATE'  
                                    ? {
                                        roles: data.roles,
                                        members: data.members
                                    }
                                    : undefined,
            threadPermissions: data.accesstype == 'THREAD_PRIVATE'  && data.threadpermissions
                                ? JSON.parse(data.threadpermissions)
                                : undefined
        })

        console.log("createThread result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Thread created successfully")

            router.push("/chat/thread")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to create Thread")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW THREAD</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Thread Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("threadtype", {required: true, onChange: (e) => setThreadType(e.target.value), validate: {isNotEmpty: (value, formValues) => value != ''}})}>
                                <option value="MESSAGE">Thread On Message</option>
                                <option value="SOLO">Standalone</option>
                            </select>
                            {errors.threadtype?.type === 'required' && <p className="text-red-500">Thread Type is required</p>}
                        </div>
                        <br/>
                        <div className="flex flex-col">
                            <label>Access Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("accesstype", {required: true, onChange: (e) => setAccessType(e.target.value), validate: {isNotEmpty: (value, formValues) => value != ''}})}>
                                <option value="THREAD_PUBLIC">Public Thread</option>
                                <option value="THREAD_PRIVATE">Private Thread</option>
                            </select>
                            {errors.accesstype?.type === 'required' && <p className="text-red-500">Access Type is required</p>}
                        </div>
                        <br/>
                        <div className="flex flex-col">
                            <label>Chat Channel Id<span className="text-red-400"> *</span></label>
                            <input type="text" 
                                        placeholder="Chat Channel Id" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("chatchannelid", {required: true})} />
                            {errors.chatchannelid?.type === 'required' && <p className="text-red-500">Chat Channel Id is required</p>}
                        </div>
                        <br/>
                        {
                            threadType === 'MESSAGE' &&
                            <div className="flex flex-col">
                                <label>Message Id<span className="text-red-400"> *</span></label>
                                <input type="text" 
                                            placeholder="Target Message Id for Thread Start" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("messageid", {required: false})} />
                                {errors.messageid?.type === 'required' && <p className="text-red-500">Message Id is required</p>}
                            </div>
                        }
                        <br/>
                        {
                            threadType === 'SOLO' &&
                            <>
                            <div className="flex flex-col">
                                <label>Thread Name<span className="text-red-400"> *</span></label>
                                <input type="text" 
                                            placeholder="Thread Name" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("threadname", {required: true})} />
                                {errors.threadname?.type === 'required' && <p className="text-red-500">Thread name is required</p>}
                            </div>
                            </>
                        }
                        <br/>
                        {
                            accessType === 'THREAD_PRIVATE' && 
                            <>
                                {/* <div className="flex flex-col">
                                    <label>Member Ids<span className="text-red-400"> *</span></label>
                                    <input type="text" 
                                                placeholder="Comma separated list of member id allowed to visit this thread" 
                                                className="input input-bordered w-full max-w-lg"
                                                {...register("memberids", {required: false})} />
                                    {errors.memberids?.type === 'required' && <p className="text-red-500">Member Ids is required</p>}
                                    <br/>
                                </div> */}
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
                                        <label>Thread Permissions<span className="text-xs"></span></label>
                                        <textarea {...register("threadpermissions", {required: false})} rows={10}>
                                            {JSON.stringify(sampleThreadPermission, null, 2)}
                                        </textarea>
                                    </div>
                                </div>
                            </>
                            
                        }
                        <br/>
                        <div className="flex flex-col">
                            <label>Thread Created By MemberId<span className="text-red-400"> *</span></label>
                            <input type="text" 
                                        placeholder="Creator MemberId" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("memberid", {required: false})} />
                            {errors.memberid?.type === 'required' && <p className="text-red-500">Creator MemberId is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/thread")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ThreadNew