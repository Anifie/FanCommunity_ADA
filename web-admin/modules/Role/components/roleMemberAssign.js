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
import { roleMemberPost, roleListingGet } from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const RoleMemberAssign = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    // const [isPrivate, setIsPrivate] = useState('NO')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    // enum
    const [roleNames, setRoleNames] = useState([])
    const [roleDescriptions, setRoleDescriptions] = useState([])


    const {register, formState: {errors}, handleSubmit} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        getRoles()
    }, [])

    const getRoles = async () => {
        let roleResult = await roleListingGet();
        console.log("roleResult", roleResult);
        if(roleResult.Success) {
            setRoleNames(roleResult.Data.map(x => x.Name))
            setRoleDescriptions(roleResult.Data.map(x => x.Label))
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await roleMemberPost({
                                        roleName: data.name,
                                        memberId: data.memberid
                                    })

        console.log("create role member result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Role member created successfully")

            router.push("/role/member")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to assign Member Role")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ASSIGN ROLE TO MEMBER</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Role Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered w-1/2" 
                                    {...register("name", {required: false})}>
                                    <option value={""}>--Please Select--</option>
                                    {
                                        roleNames 
                                        && roleNames.length > 0
                                        && roleNames.map((x, index) => <option value={x}>{roleDescriptions[index]}</option>)
                                    }
                            </select>
                            {/* <input type="text" 
                                placeholder="Role Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} /> */}
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Member Id</label>
                            <input type="text" 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("memberid", {required: false})} />
                        </div>
                    </div>
                    <br/>          
                    {/* <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Permissions<span className="text-xs"></span></label>
                            <textarea {...register("permissions", {required: false})} rows={10}>
                                {JSON.stringify(sampleRolePermission, null, 2)}
                            </textarea>
                        </div>
                    </div>
                    <br/> */}
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/role/member")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default RoleMemberAssign