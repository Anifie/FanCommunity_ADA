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
import { threadMessagePut, threadMessageListingPost, enumGet } from "../api";
  
const ThreadMessageEdit = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    const [isEphemeral, setIsEphemeral] = useState('NO')
    const [isPinned, setIsPinned] = useState('NO')
    const [messageType, setMessageType] = useState('TEXT')

    const [threadMessageId, setThreadMessageId] = useState()
    const [message, setMessage] = useState()

    // // enum
    // const [notifyModes, setNotifyModes] = useState([])
    // const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleMessageInJSON =  [
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

    const sampleActionOptions =  [
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

        

        const {threadmessageid} = router.query
        if(!threadMessageId) {
            setThreadMessageId(threadmessageid)
            getThreadMessage(threadmessageid)
        }

    }, [])

    // const getEnum = async () => {
    //     let enumResult = await enumGet();
    //     console.log("enumResult", enumResult);
    //     if(enumResult.Success) {
    //         setNotifyModes(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_values)
    //         setNotifyModeDescriptions(enumResult.Data.filter(x => x.enum_name == 'NOTIFY_MODE')[0].enum_description)
    //     }
    // }

    const getThreadMessage = async (aid) => {
        // await getEnum()
        
        let messageResult = await threadMessageListingPost({threadMessageId: aid})
        console.log("getThreadMessage", messageResult)
        if(messageResult.Success) {
            let obj = messageResult.Data.threadMessages[0];
            setMessage(obj)
            setThreadMessageId(obj.ThreadMessageId)
            setValue("message", obj.Message)
            setValue("ispinned", obj.IsPinned ? 'YES' : 'NO')
            setIsPinned(obj.IsPinned ? 'YES' : 'NO')
            setValue("messagetype", obj.MessageType)
            setMessageType(obj.MessageType)
            if(obj.MessageType == 'JSON') {
                setValue("actionoptions", obj.ActionOptions ? JSON.stringify(obj.ActionOptions, null, 2): JSON.stringify(sampleActionOptions, null, 2))
            }
            setValue("isephemeral", obj.IsEphemeral ? 'YES' : 'NO')
            setIsEphemeral(obj.IsEphemeral ? 'YES' : 'NO')
            setValue("ephemeralrecipientid", obj.EphemeralRecipientId)
            setValue("status", obj.Status)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await threadMessagePut({
                                        threadMessageId: threadMessageId,
                                        message: data.messagetype == 'JSON' ? JSON.parse(data.message) : data.message,
                                        isPinned: data.ispinned == 'YES',
                                        messageType: data.messagetype,
                                        actionOptions: data.actionoptions
                                                            ? JSON.parse(data.actionoptions)
                                                            : undefined,
                                        actionResults: data.actionresults
                                                        ? JSON.parse(data.actionresults)
                                                        : undefined,
                                        isEphemeral: data.isephemeral == 'YES',
                                        ephemeralRecipientId: data.ephemeralrecipientid,
                                        status: data.status,
                                        reactionResults: data.reactionResults
                                                            ? JSON.parse(reactionResults)
                                                            : undefined
                                    })

        console.log("edit Thread Message result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Thread Message updated successfully")

            router.push("/chat/thread-message")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to update Thread Message")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT THREAD MESSAGE</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Thread Message Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Message Id" 
                                disabled={true}
                                value={threadMessageId}
                                className="input input-bordered w-full max-w-lg"
                                {...register("threadmessageid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Message Type<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/6" 
                                    {...register("messagetype", {required: true, onChange: (e) => setMessageType(e.target.value)})}>
                                    <option value={"TEXT"}>Text</option>
                                    <option value={"JSON"}>Json</option>
                            </select>
                            {errors.messagetype?.type === 'required' && <p className="text-red-500">Message Type is required</p>}
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Message</label>
                            <div className="flex">
                                <textarea {...register("message", {required: true})} rows={5} className="w-1/2">
                                </textarea>
                                {
                                    messageType == 'JSON' &&
                                    <pre className="text-xs"><br/><br/><code>{JSON.stringify(sampleMessageInJSON, null, 2)}</code></pre>
                                }
                            </div>
                            {errors.message?.type === 'required' && <p className="text-red-500">Message is required</p>}
                        </div>
                    </div>
                    {
                        messageType == 'JSON' &&
                        <>
                            <br/>               
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col w-full">
                                    <label>Action Options<span className="text-xs"></span></label>
                                    <div className="flex">
                                        <textarea {...register("actionoptions", {required: false})} rows={5} className="w-1/2">
                                        </textarea>
                                        <pre className="text-xs"><br/><br/><code>{JSON.stringify(sampleActionOptions, null, 2)}</code></pre>
                                    </div>
                                </div>
                            </div>   
                        </>
                    }
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Is Ephemeral ?<span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isephemeral", {required: true, onChange: (e) => setIsEphemeral(e.target.value)})}>
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                            </select>
                        </div>
                    </div>
                    {
                        isEphemeral == 'YES' &&
                        <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                            <br/>
                            <div className="flex flex-col">
                                <label>Ephemeral Recipient Member Id<span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Ephemeral Recipient Member Id" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("ephemeralrecipientid", {required: false})} />
                            </div>
                        </div>
                    }
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Status<span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/6" 
                                    {...register("status", {required: true})}>
                                    <option value={"NEW"}>NEW</option>
                                    <option value={"INACTIVE"}>INACTIVE</option>
                            </select>
                            {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/thread-message")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ThreadMessageEdit