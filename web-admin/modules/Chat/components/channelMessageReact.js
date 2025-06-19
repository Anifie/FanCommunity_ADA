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
import { reactChannelMessagePost, chatChannelMessageListingGet, enumGet } from "../api";
  
const ChatChannelMessageEdit = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    const [isEphemeral, setIsEphemeral] = useState('NO')
    const [isPinned, setIsPinned] = useState('NO')
    const [messageType, setMessageType] = useState('TEXT')

    const [messageId, setMessageId] = useState()
    const [message, setMessage] = useState()

    // // enum
    // const [notifyModes, setNotifyModes] = useState([])
    // const [notifyModeDescriptions, setNotifyModeDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {

        

        const {messageid} = router.query
        if(!messageId) {
            setMessageId(messageid)
            getChatChannelMessage(messageid)
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

    const getChatChannelMessage = async (aid) => {
        // await getEnum()
        
        let messageResult = await chatChannelMessageListingGet({messageId: aid})
        console.log("getChatChannelMessage", messageResult)
        if(messageResult.Success) {
            let obj = messageResult.Data.messages[0];
            setMessage(obj)
            setMessageId(obj.MessageId)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await reactChannelMessagePost({
                                        messageId: messageId,
                                        emojiId: data.emojiid,
                                        reactorId: data.reactorid
                                    })

        console.log("react ChatChannel Message result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Chat Channel Message reacted successfully")

            router.push("/chat/channel-message")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to react Chat Channel Message")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">REACT CHAT CHANNEL MESSAGE</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Message Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Message Id" 
                                disabled={true}
                                value={messageId}
                                className="input input-bordered w-full max-w-lg"
                                {...register("messageid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Emoji Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Emoji Id"
                                className="input input-bordered w-full max-w-lg"
                                {...register("emojiid", {required: true})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>React By Member Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="React By Member Id"
                                className="input input-bordered w-full max-w-lg"
                                {...register("reactorid", {required: true})} />
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">React</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/channel-message")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ChatChannelMessageEdit