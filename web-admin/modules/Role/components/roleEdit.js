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
import { rolePut, roleListingGet } from "../api";
  
const RoleEdit = () => {

    // const [name, setName] = useState()
    // const [muteMinutes, setMuteMinutes] = useState()
    // const [notifyMode, setNotifyMode] = useState()
    // const [isPrivate, setIsPrivate] = useState('NO')
    //const [rolesAndMembers, setRolesAndMembers] = useState([])

    const [roleName, setRoleName] = useState()
    const [role, setRole] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    const sampleRolePermission = [{"view_channel":true},{"send_messages":true}];

    useEffect(() => {

        const {rolename} = router.query
        if(!roleName) {
            setRoleName(rolename)
            getRole(rolename)
        }

    }, [])

    const getRole = async (aid) => {
        
        let roleResult = await roleListingGet({roleName: aid})
        console.log("getRole", roleResult)
        if(roleResult.Success) {
            let obj = roleResult.Data[0];
            setRole(obj)
            setRoleName(obj.Name)
            
            setValue("name", obj.Name)
            setValue("rolelabel", obj.Label)
            setValue("color", obj.Color)
            setValue("icon", obj.Icon)
            setValue("permissions", obj.Permissions ? JSON.stringify(obj.Permissions, null, 2): JSON.stringify(sampleRolePermission, null, 2))
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await rolePut({
                                        roleName: roleName,
                                        roleLabel: data.rolelabel,
                                        color: data.color,
                                        icon: data.icon,
                                        permissions: data.permissions ? data.permissions : undefined
                                    })

        console.log("rolePut result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("Role updated successfully")

            router.push("/role")
        }            
        else {
            console.error(result.Message)
            showFailed("Failed to update role")
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT ROLE</h2>                        
                </div>
                <div className="p-4 w-full">    
                <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Role Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Role Name" 
                                readOnly={true}
                                disabled={true}
                                value={roleName}
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Role Label</label>
                            <input type="text" 
                                placeholder="Role Label" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("rolelabel", {required: false})} />
                        </div>
                    </div>
                    <br/> 
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Color</label>
                            <input type="text" 
                                placeholder="Color" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("color", {required: false})} />
                        </div>
                    </div>
                    <br/>               
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Icon<span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Icon" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("icon", {required: false})} />
                        </div>
                    </div>
                    <br/>    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/role")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default RoleEdit