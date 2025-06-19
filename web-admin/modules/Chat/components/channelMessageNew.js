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
import { chatChannelMessagePost, chatChannelMessageListingGet, enumGet } from "../api";
  
const ChatChannelMessageNew = () => {

    const [isEphemeral, setIsEphemeral] = useState('NO')
    const [isPinned, setIsPinned] = useState('NO')
    const [messageType, setMessageType] = useState('TEXT')

    // // enum
    // const [notifyModes, setNotifyModes] = useState([])
    // const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleMessageInJSON =  {
        color: "#000000",
        title: 'Some title',
        url: 'https://test.org',
        author: {
            name: 'Some name',
            icon_url: 'https://i.imgur.com/AfFp7pu.png',
            url: 'https://test.com',
        },
        description: 'Some description here',
        thumbnail: {
            url: 'https://i.imgur.com/AfFp7pu.png',
        },
        fields: [
            {
                name: 'Regular field title',
                value: 'Some value here',
            },
            {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true,
            },
            {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true,
            },
        ],
        image: {
            url: 'https://i.imgur.com/AfFp7pu.png',
        },
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Some footer text here',
            icon_url: 'https://i.imgur.com/AfFp7pu.png',
        }
    }

    const sampleActionOptions =  [
        {
            action_type: "ACTION_ROW", 
            components: [
                {
                    component_type: "BUTTON",
                    label: "Vote 1",
                    style: "PRIMARY",
                    custom_id: "VOTE#1",
                    emoji_id: "HEART",
                },
                {
                    component_type: "BUTTON",
                    label: "Vote 2",
                    style: "SECONDARY",
                    custom_id: "VOTE#2",
                    emoji_id: "SMILE",
                }
            ]
        },
        {
            action_type: "ACTION_ROW", 
            components: [
                {
                    component_type: "MULTI_SELECT",
                    placeholder_label: "Please select one or more options",
                    custom_id: "VOTE#QUESTION#01JB8E9GT8011S01W1FTGSNC5S",
                    min_values: 1,
                    max_values: 2,
                    options: [
                        {
                            label: "Option 1",
                            emoji_id: "GOOD",
                            value: "VOTE#QUESTION#01JB8E9GT8011S01W1FTGSNC5S#1"
                        },
                        {
                            label: "Option 2",
                            emoji_id: "NICE",
                            value: "VOTE#QUESTION#01JB8E9GT8011S01W1FTGSNC5S#2"
                        }
                    ]
                }
            ]
        }
    ]

    useEffect(() => {
        setValue("isephemeral", 'NO')
        setValue("ispinned", 'NO')
    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await chatChannelMessagePost({
                                        chatChannelId: data.channelid,
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
                                                            : undefined,
                                        creatorId: data.creatorid
                                    })

        console.log("post ChatChannel Message result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Chat Channel Message posted successfully")

            router.push("/chat/channel-message")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to post Chat Channel Message")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">POST NEW CHAT CHANNEL MESSAGE</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="flex flex-col">
                        <label>Channel Id<span className="text-red-400"> *</span></label>
                        <input type="text" 
                                    placeholder="Channel Id" 
                                    className="input input-bordered max-w-lg"
                                    {...register("channelid", {required: false})} />
                        {errors.channelid?.type === 'required' && <p className="text-red-500">Channel Id is required</p>}
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
                            <label>Is Pinned ?<span className="text-xs"></span></label>
                            <select className="select select-bordered w-fit" 
                                    {...register("ispinned", {required: true, onChange: (e) => setIsPinned(e.target.value)})}>
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                            </select>
                        </div>
                    </div>
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
                    <div className="flex flex-col">
                        <label>Created By MemberId<span className="text-red-400"> *</span></label>
                        <input type="text" 
                                    placeholder="Creator MemberId" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("creatorid", {required: false})} />
                        {errors.creatorid?.type === 'required' && <p className="text-red-500">Creator MemberId is required</p>}
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Submit</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/channel-message")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ChatChannelMessageNew