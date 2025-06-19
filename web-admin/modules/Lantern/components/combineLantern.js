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
import { combinationGet, combinationPost } from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const CombineLantern = () => {

    const [combination, setCombination] = useState()
    //const [shadowPattern, setShadowPattern] = useState()
    const [PlayerId, setPlayerId] = useState()
    //const [message, setMessage] = useState()
    //const [music, setMusic] = useState()

    const {register, formState: {errors}, handleSubmit} = useForm()
    
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        getCombination()
    }, [])

    const getCombination = async() => {
        let result = await combinationGet()
        if(result.Success) {
            setCombination(result.Data)
        }
        else {
            showFailed("Failed to get combination")
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await combinationPost(data.PlayerId)

        console.log("combinationPost result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Lantern combined successfully")
            router.push("/lantern/combination")
        }            
        else
            alert(result.Message)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">POST LANTERN COMBINATION</h2>                        
                </div>
                <div className="p-4 w-full">                    
                    {/* <div className="form-control">
                        <div className="flex flex-col">
                            <label>Collection Id</label>
                            <input type="text" 
                                value={collectionId} 
                                onChange={(e) => setCollectionId(e.target.value)} 
                                placeholder="Collection Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("collectionId", {required: true})} />
                            {errors.collectionId?.type === 'required' && <p className="text-red-500">Collection Id is required</p>}
                        </div>
                    </div>
                    <br/> */}
                    {
                        combination && combination.GroupId && (
                            <div className="flex flex-col col-span-2">
                                <label>Group Id</label>
                                <input type="text" 
                                    value={combination.GroupId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    {
                        combination && combination.FearLanternId && (
                            <div className="flex flex-col col-span-2">
                                <label>Fear Lantern Id</label>
                                <input type="text" 
                                    value={combination.FearLanternId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    {
                        combination && combination.PainLanternId && (
                            <div className="flex flex-col col-span-2">
                                <label>Pain Lantern Id</label>
                                <input type="text" 
                                    value={combination.PainLanternId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    {
                        combination && combination.FeverLanternId && (
                            <div className="flex flex-col col-span-2">
                                <label>Fever Lantern Id</label>
                                <input type="text" 
                                    value={combination.FeverLanternId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    {
                        combination && combination.LonelyLanternId && (
                            <div className="flex flex-col col-span-2">
                                <label>Lonely Lantern Id</label>
                                <input type="text" 
                                    value={combination.LonelyLanternId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    {
                        combination && combination.PusBlisterLanternId && (
                            <div className="flex flex-col col-span-2">
                                <label>Pus Blister Lantern Id</label>
                                <input type="text" 
                                    value={combination.PusBlisterLanternId} 
                                    disabled
                                    className="input input-bordered w-full max-w-lg"/>
                                <br/>
                            </div>
                        )
                    }
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>On Behave of PlayerId</label>
                            <input type="text" 
                                value={PlayerId} 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("PlayerId", {required: false, onChange: (e) => setPlayerId(e.target.value)})} />
                        </div>
                        {/* <div className="flex flex-col col-span-2">
                            <label>Shadow Pattern</label>
                            <select className="select select-bordered w-fit" 
                                    value={shadowPattern} 
                                    onChange={(e) => setShadowPattern(e.target.value)}
                                    {...register("shadowPattern", {required: false})}>
                                <option value="PAIN">Pain</option>
                                <option value="FEVER">Fever</option>
                                <option value="FEAR">Fear</option>
                                <option value="LONELY">Lonely</option>
                                <option value="PUS_BLISTER">Pus Blister</option>
                            </select>
                        </div> */}
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Combine Lantern</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/lantern/combination")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CombineLantern