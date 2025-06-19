import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { administratorPost, lanternDetailsGet } from "../api";
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
  
const EditIlluminateLantern = () => {

    const [collectionId, setCollectionId] = useState()
    const [PlayerId, setPlayerId] = useState()
    const [message, setMessage] = useState()
    const [music, setMusic] = useState()
    const [position, setPosition] = useState()
    const [lanternId, setLanternId] = useState()
    const [nickName, setNickName] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        const {lanternid} = router.query
        setLanternId(lanternid)
        getLantern(lanternid)
    }, [])

    const getLantern = async (lid) => {
        let lanternResult = await lanternDetailsGet(lid)
        console.log("lanternResult", lanternResult)
        if(lanternResult.Success) {
            setCollectionId(lanternResult.Data.CollectionId)
            setValue("collectionId", lanternResult.Data.CollectionId)

            setPlayerId(lanternResult.Data.PlayerId)
            setValue("PlayerId", lanternResult.Data.PlayerId)

            setMessage(lanternResult.Data.Message)
            setValue("message", lanternResult.Data.Message)

            setMusic(lanternResult.Data.Music)
            setValue("music", lanternResult.Data.Music)

            setPosition(lanternResult.Data.Position)
            setValue("position", lanternResult.Data.Position)

            setNickName(lanternResult.Data.NickName)
            setValue("nickName", lanternResult.Data.NickName)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await lanternPut({
                                        lanternId: lanternId,
                                        nickName: data.nickName,
                                        message: data.message,
                                        music: data.music,
                                        position: data.position
                                    })

        console.log("illuminateLantern result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Lantern edited successfully")
            router.push("/lantern/illuminated")
        }            
        else
            alert(result.Message)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT LANTERN</h2>                        
                </div>
                <div className="p-4 w-full">                    
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Collection Id</label>
                            <input type="text" 
                                disabled 
                                value={collectionId} 
                                placeholder="Collection Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("collectionId", {required: true})} />
                            {errors.collectionId?.type === 'required' && <p className="text-red-500">Collection Id is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>On Behave of PlayerId</label>
                            <input type="text" 
                                disabled 
                                value={PlayerId} 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("PlayerId", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Nick Name</label>
                            <input type="text" 
                                value={nickName} 
                                placeholder="Nick Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("nickName", {required: false, onChange: (e) => setNickName(e.target.value)})} />
                        </div>
                        <div className="flex flex-col">
                            <label>Message</label>
                            <textarea className="textarea textarea-bordered max-w-lg" cols="100" 
                                    value={message} 
                                    {...register("message", {required: false, onChange : (e) => setMessage(e.target.value)})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Position</label>
                            <input type="text"                                 
                                value={position} 
                                placeholder="Position" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("position", {required: false, onChange : (e) => setPosition(e.target.value)})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Music</label>
                            <select className="select select-bordered w-fit" 
                                    value={music} 
                                    {...register("music", {required: false, onChange : (e) => setMusic(e.target.value)})}>
                                <option value="SNOW_LAKE">Snow Lake</option>
                                <option value="SECRET_GARDEN">Secret Garden</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Lantern</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/lantern/illuminated")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditIlluminateLantern