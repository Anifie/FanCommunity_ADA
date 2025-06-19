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
import {superChatTemplateListingPost, superChatTemplateEdit} from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const SuperChatTemplateEdit = () => {

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {getFileMIME} = useHelper()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const [superchatTemplateId, setSuperchatTemplateId] = useState()



    useEffect(() => {

        const {superchattemplateid} = router.query
        if(superchattemplateid) {
            setSuperchatTemplateId(superchattemplateid)
            getSuperchatTemplate(superchattemplateid)
        }
        
    }, [])

    const getSuperchatTemplate = async (sid) => {
        let templateResult = await superChatTemplateListingPost()
        console.log("templateResult", templateResult);
        
        if(templateResult.Success) {

            let template = templateResult.Data.superChatTemplates.find(t => t.SuperChatTemplateId == sid)

            if(!template) {
                showFailed("SuperChat Template not found")
                router.push("/superchat/templates")
                return;
            }

            setValue("name", template.Name)
            setValue("color", template.Color)
            setValue("minamount", template.MinAmount)
            setValue("maxamount", template.MaxAmount)
            setValue("currency", template.Currency)
            setValue("superchattemplateid", template.SuperChatTemplateId)
            setValue("durationinminutes", template.DurationInMinutes)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await superChatTemplateEdit({
                                        superChatTemplateId: superchatTemplateId,
                                        name: data.name,
                                        color: data.color,
                                        currency: data.currency,
                                        minAmount: data.minamount,
                                        maxAmount: data.maxamount,
                                        durationInMinutes: data.durationinminutes
                                        //artworkId: data.artworkid
                                    })

        console.log("SuperChatTemplate result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            showSuccess("SuperChat Template created successfully")

            router.push("/superchat/templates")
        }            
        else
            alert(result.Message)
    }

    const uploadToS3 = async (preSignedURL, fileURL, fileReader) => {
        let binary = atob(fileReader.split(',')[1])
        let array = []
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i))
        }
  
        const ext = fileURL.split(/[#?]/)[0].split('.').pop().trim(); //getURLExtension(fileURL)
        
        const mimeType = getFileMIME(ext)
        console.log("mimeType", mimeType, ext);
        
        let blobData = new Blob([new Uint8Array(array)], {type: mimeType})
        console.log("blobData", blobData)

        const result = await fetch(preSignedURL, {
          method: 'PUT',
          body: blobData
        })
        console.log("result", result)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT SUPERCHAT TEMPLATE</h2>                        
                </div>
                <div className="p-4 w-full">    
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Super Chat Template Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Name" 
                                disabled
                                className="input input-bordered w-full max-w-lg"
                                {...register("superchattemplateid", {required: true})} />
                        </div>
                    </div>
                    <br/>  
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Name<span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/>                
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Color<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Color" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("color", {required: true})} />
                                {errors.color?.type === 'required' && <p className="text-red-500">Color is required</p>}
                        </div>
                    </div>
                    <br/>
                    {/* <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork Id<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Artwork Id" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("artworkid", {required: true})} />
                                {errors.artworkid?.type === 'required' && <p className="text-red-500">ArtworkId is required</p>}
                        </div>
                    </div>
                    <br/> */}
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Currency<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Currency" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("currency", {required: true})} />
                                {errors.currency?.type === 'required' && <p className="text-red-500">Currency is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Minimum Amount<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Minimum Amount" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("minamount", {required: true})} />
                                {errors.minamount?.type === 'required' && <p className="text-red-500">Minimum Amount is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Maximum Amount<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Maximum Amount" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("maxamount", {required: true})} />
                                {errors.maxamount?.type === 'required' && <p className="text-red-500">Maximum Amount is required</p>}
                        </div>
                    </div>
                    <br/>           
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Duration In Minutes<span className="text-red-400">*</span><span className="text-xs"></span></label>
                                <input type="text" 
                                    placeholder="Duration In Minutes" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("durationinminutes", {required: true})} />
                                {errors.durationinminutes?.type === 'required' && <p className="text-red-500">Duration In Minutes is required</p>}
                        </div>
                    </div>
                    <br/>           
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/superchat/templates")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default SuperChatTemplateEdit