import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { messagePost } from "../api";
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

// const toolbarPlugin = createToolbarPlugin();
  
const MessageCreate = () => {

    const [senderId, setSenderId] = useState({value: "", dirty: false})
    //const [adminstrator, setAdminstrator] = useState()
    const [chatId, setChatId] = useState({value: "", dirty: false})
    const [message, setMessage] = useState({value: "", dirty: false})
    //const [content, setContent] = useState({value: "", dirty: false})
    //const [status, setStatus] = useState({value: 1, dirty: false})
    //const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    //const {account} = useContext(Web3Context)
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        //setAdminUserName(query.adminUserName)
        //getAdministrator(query.adminUserName)

    }, [])

    // const getAdministrator = async (adminUserName) => {
    //     let result = await announcementGet({
    //                                             //walletAddress: account, 
    //                                             //signature: localStorage.getItem("AnifieAdminSignature"), 
    //                                             //announcementId: announcement_Id

    //                                         })
    //     console.log("getAdministrator result", result);
    //     if(result.Success) {
    //         setAdminstrator(result.Data.announcement)
    //         //setStatus({value: result.Data.announcement.is_active == 'true', dirty: false})
    //         //setSubject({value: result.Data.announcement.subject, dirty: false})
    //         //setContent({value: result.Data.announcement.content, dirty: false})
    //         //setContent({value: JSON.parse(result.Data.announcement.content.replaceAll('\\"', '"')).blocks[0].text, dirty: false})
    //         //console.log("content", JSON.parse(result.Data.announcement.content.replaceAll('\\"', '"')).blocks[0].text, content);
    //     }
    // }
    
    // console.log(editorState);
    // const editor = useRef(null);
    // function focusEditor() {
    //     editor.current.focus();
    // // }

    // const inlineToolbarPlugin = createInlineToolbarPlugin();

    // const styles = {
    //     editor: {
    //       border: '1px solid gray',
    //       minHeight: '6em',
    //       minWidth: '6em'
    //     }
    //   };

    const handleFormSubmit = async (event) => {
        
        event.preventDefault()

        mdLoading.current.show("Creating..")

        let result = await messagePost({
                                            token: localStorage.getItem("tokyodome_admin_access_token"), 
                                            senderId: senderId.value,
                                            chatId: chatId.value,
                                            message: message.value
                                        })

        console.log("createMessage result", result);
        if(result.Success) {
            showSuccess("Message created")
            router.push("/chat/message")
        }
        else {
            console.error(result.Message)
            showFailed("Failed to create Message")
        }

        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleFormSubmit}>
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW MESSAGE</h2>                        
                </div>
                <div className="p-4 w-full">

                    <label className="mt-5">Sender ID</label>
                    <input 
                        name="txtSenderId"
                        value={senderId && senderId.value} 
                        onChange={(e) => setSenderId({value: e.target.value, dirty: true})} 
                        placeholder="Sender Id" 
                        className="input input-bordered w-full max-w-lg" />
                    {senderId.dirty && senderId.value == "" && <p className="text-red-500">SenderId is required</p>}

                    <br/>
                    <br/>
                    <label>Chat Id</label>
                    <input  
                        name="txtChatId"
                        value={chatId && chatId.value} 
                        onChange={(e) => setChatId({value: e.target.value, dirty: true})} 
                        placeholder="Chat Id" 
                        className="input input-bordered w-full max-w-lg" />
                    {chatId.dirty && chatId.value == "" && <p className="text-red-500">ChatId is required</p>}

                    <br/>
                    <br/>
                    <label>Message</label>
                    <input  
                        name="txtMessage"
                        value={message && message.value} 
                        onChange={(e) => setMessage({value: e.target.value, dirty: true})} 
                        placeholder="Message" 
                        className="input input-bordered w-full max-w-lg" />
                    {message.dirty && message.value == "" && <p className="text-red-500">Message is required</p>}
                    {/*                 
                    <input type="password" 
                        name="txtConfirmPassword"
                        onChange={(e) => setPassword({value: e.target.value, dirty: true})} 
                        placeholder="Confirm Password" 
                        className="mt-5 input input-bordered w-full max-w-lg" />
                    {subject.dirty && subject.value == "" && <p className="text-red-500">Confirm Password is required</p>} */}

                    <br/>
                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/chat/message")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default MessageCreate