import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memberPut, memberListingGet } from "../api";
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
import { lanternGet, lanternPut } from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const EditMember = () => {

    const [collectionId, setCollectionId] = useState()
    // const [PlayerId, setPlayerId] = useState()
    const [message, setMessage] = useState()
    const [music, setMusic] = useState()
    const [position, setPosition] = useState()
    const [memberId, setMemberId] = useState()
    const [nickName, setNickName] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        const {memberid} = router.query
        setMemberId(memberid)
        getMember(memberid)
    }, [])

    const getMember = async (pid) => {
        let memberResult = await memberListingGet({memberId: pid, pageSize: 1})
        console.log("memberResult", memberResult)
        if(memberResult.Success) {
            setValue("displayname", memberResult.Data.members[0].display_name ? memberResult.Data.members[0].display_name : '')
            setValue("xptotal", memberResult.Data.members[0].xptotal ? memberResult.Data.members[0].xptotal : '')
            setValue("xplevel", memberResult.Data.members[0].xplevel ? memberResult.Data.members[0].xplevel : '')
            setValue("settings", memberResult.Data.members[0].settings ? memberResult.Data.members[0].settings : '')
            setValue("discordroles", memberResult.Data.members[0].discord_roles ? memberResult.Data.members[0].discord_roles : '')
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await memberPut({
                                        memberId: memberId,
                                        // roles: data.roles,
                                        xpTotal: data.xptotal == '' ? undefined : data.xptotal,
                                        xpLevel: data.xplevel == '' ? undefined : data.xplevel,
                                        settings: data.settings == '' ? undefined : data.settings,
                                        displayName: data.displayname,
                                        discordRoles: data.discordroles
                                    })

        console.log("member update result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Member edited successfully")
            router.push("/member")
        }            
        else
            alert(result.Message)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT MEMBER</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Member Id</label>
                            <input type="text" 
                                disabled 
                                value={memberId} 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("memberid", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Display Name</label>
                            <input type="text" 
                                placeholder="Display Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("displayname", {required: false})} />
                        </div>
                        {/* <div className="flex flex-col">
                            <label>Settings</label>
                            <textarea className="textarea textarea-bordered max-w-lg" cols="100" 
                                    {...register("settings", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>XP Total</label>
                            <input type="text"
                                placeholder="XP Total" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("xptotal", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>XP Level</label>
                            <input type="text"
                                placeholder="XP Level" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("xplevel", {required: false})} />
                        </div> */}
                        <div className="flex flex-col col-span-2">
                            <label>Discord Roles</label>
                            <div className="flex">
                                <input type="text"
                                    placeholder="Discord Roles" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("discordroles", {required: false})} />
                                <table cellPadding={10} cellSpacing={10} className="text-xs">
                                    <tr><td>
                                        IMARITONES
                                    </td><td>
                                        IMARITONES_ADMIN
                                    </td></tr>
                                    <tr><td>
                                        ME
                                    </td><td>
                                        ME_ADMIN
                                    </td></tr>
                                    <tr><td>
                                    DENISUSAFATE
                                    </td><td>
                                    DENISUSAFATE_ADMIN
                                    </td></tr>
                                    <tr><td>
                                    TITLEMITEI
                                    </td><td>
                                    TITLEMITEI_ADMIN
                                    </td></tr>
                                    <tr><td>
                                    KASUMISOUTOSUTERA
                                    </td><td>
                                    KASUMISOUTOSUTERA_ADMIN
                                    </td></tr>
                                    <tr><td>
                                    BABABABAMPI
                                    </td><td>
                                    BABABABAMPI_ADMIN
                                    </td></tr>
                                    <tr><td>
                                    2I2
                                    </td><td>
                                    2I2_ADMIN
                                    </td></tr>
                                    <tr><td>
                                        UKKA
                                    </td><td>
                                    UKKA_ADMIN
                                    </td></tr>
                                    <tr><td>
                                        STELLINASAYURI
                                    </td><td>
                                    STELLINASAYURI_ADMIN
                                    </td></tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Member</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/member")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditMember