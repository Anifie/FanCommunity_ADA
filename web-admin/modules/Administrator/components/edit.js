import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { administratorPut } from "../api";
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
  
const AdministratorEdit = () => {

    const [adminPlayerId, setAdminPlayerId] = useState()
    //const [adminstrator, setAdminstrator] = useState()
    const [password, setPassword] = useState({value: "", dirty: false})
    //const [content, setContent] = useState({value: "", dirty: false})
    //const [status, setStatus] = useState({value: 1, dirty: false})
    //const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    //const {account} = useContext(Web3Context)
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        setAdminPlayerId(query.adminPlayerId)
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

        mdLoading.current.show("Updating..")

        let result = await administratorPut({
                                            token: localStorage.getItem("tokyodome_admin_access_token"), 
                                            PlayerId: adminPlayerId,
                                            password: password.value
                                        })

        console.log("updateAdministrator result", result);
        if(result.Success) {
            showSuccess("Administrator updated")
            router.push("/administrator")
        }
        else {
            console.error(result.Message)
            showFailed("Failed to update administrator")
        }

        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleFormSubmit}>
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">CHANGE ADMINISTRATOR PASSWORD</h2>                        
                </div>
                <div className="p-4 w-full">

                    <input type="password" 
                        name="txtPassword"
                        value={adminPlayerId && password && password.value} 
                        onChange={(e) => setPassword({value: e.target.value, dirty: true})} 
                        placeholder="Password" 
                        className="mt-5 input input-bordered w-full max-w-lg" />
                    {password.dirty && password.value == "" && <p className="text-red-500">Password is required</p>}
{/*                 
                    <input type="password" 
                        name="txtConfirmPassword"
                        onChange={(e) => setPassword({value: e.target.value, dirty: true})} 
                        placeholder="Confirm Password" 
                        className="mt-5 input input-bordered w-full max-w-lg" />
                    {subject.dirty && subject.value == "" && <p className="text-red-500">Confirm Password is required</p>} */}

                    <br/>
                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/administrator")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AdministratorEdit