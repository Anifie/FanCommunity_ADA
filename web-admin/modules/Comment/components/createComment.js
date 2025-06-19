import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { commentPost } from "../api";
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
import { useForm } from "react-hook-form";

const CommentCreate = () => {

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

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    useEffect(() => {
        

    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Creating..")

        let result = await commentPost({
                                            senderId: data.senderid,
                                            artworkId: data.artworkid,
                                            message: data.message,
                                            replyToCommentId: data.replycommentid
                                        })

        console.log("post comment result", result);
        if(result.Success) {
            showSuccess("Comment created")
            router.push("/comment")
        }
        else {
            console.error(result.Message)
            showFailed("Failed to create comment")
        }

        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW COMMENT</h2>                        
                </div>
                <div className="p-4 w-full">

                    <label className="mt-5">Sender ID</label>
                    <br/>
                    <input type="text" 
                                        placeholder="Sender ID" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("senderid", {required: true})} />
                    {errors.senderid?.type === 'required' && <p className="text-red-500">senderid is required</p>}

                    <br/>
                    <br/>
                    <label>Artwork Id</label>
                    <br/>
                    <input type="text" 
                                        placeholder="Artwork ID" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("artworkid", {required: true})} />
                    {errors.artworkid?.type === 'required' && <p className="text-red-500">artworkid is required</p>}
                    

                    <br/>
                    <br/>
                    <label>Message</label>
                    <br/>
                    <input type="text" 
                                        placeholder="Message" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("message", {required: true})} />
                    {errors.message?.type === 'required' && <p className="text-red-500">message is required</p>}
                    
                    <br/>
                    <br/>
                    <label>Reply Comment Id</label>
                    <br/>
                    <input type="text" 
                                        placeholder="Reply Comment Id" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("replycommentid", {required: false})} />
                    <br/>
                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/comment")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CommentCreate