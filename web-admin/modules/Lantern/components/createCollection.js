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
import { collectionPost, enumGet } from "../api";

// const toolbarPlugin = createToolbarPlugin();
  
const CollectionCreate = () => {

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [ranking, setRanking] = useState('0')
    //const [music, setMusic] = useState("SNOW_LAKE")
    const [lightPattern, setLightPattern] = useState()
    const [lightPatternColor, setLightPatternColor] = useState()
    const [lanternSideLightColor, setLanternSideLightColor] = useState()
    const [lanternHook, setLanternHook] = useState()
    const [lanternColor, setLanternColor] = useState()
    const [lanternLightColor, setLanternLightColor] = useState()
    const [lanternShape, setLanternShape] = useState()

    //enums
    const [lightPatterns, setLightPatterns] = useState([])
    const [lightPatternColors, setLightPatternColors] = useState([])
    const [lanternSideLightColors, setLanternSideLightColors] = useState([])
    const [lanternHooks, setLanternHooks] = useState([])
    const [lanternColors, setLanternColors] = useState([])
    const [lanternLightColors, setLanternLightColors] = useState([])
    const [lanternShapes, setLanternShapes] = useState([])

    const [threeDURL, setThreeDURL] = useState()
    const [threeDFile, setThreeDFile] = useStateCallback()
    const [threeDBlobURL, setThreeDBlobURL] = useState()
    const [threeDFileReaderResult, setThreeDFileReaderResult] = useState()
    const threeDFileRef = useRef()

    const [threeDFBXURL, setThreeDFBXURL] = useState()
    const [threeDFBXFile, setThreeDFBXFile] = useStateCallback()
    const [threeDFBXBlobURL, setThreeDFBXBlobURL] = useState()
    const [threeDFBXFileReaderResult, setThreeDFBXFileReaderResult] = useState()
    const threeDFBXFileRef = useRef()

    const [twoDURL, setTwoDURL] = useState()    
    const [twoDFile, setTwoDFile] = useStateCallback()
    const [twoDBlobURL, setTwoDBlobURL] = useState()
    const [twoDFileReaderResult, setTwoDFileReaderResult] = useState()
    const twoDFileRef = useRef()

    const {register, formState: {errors}, handleSubmit} = useForm()
    const {getFileMIME} = useHelper()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    //const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        getEnum()
    }, [])

    const getEnum = async () => {
        let enumResult = await enumGet();
        console.log("enumResult", enumResult);
        if(enumResult.Success) {
            setLightPatterns(enumResult.Data.filter(x => x.enum_name == 'LIGHT_PATTERN')[0].enum_values)
            setLightPatternColors(enumResult.Data.filter(x => x.enum_name == 'LIGHT_PATTERN_COLOR')[0].enum_values)
            setLanternSideLightColors(enumResult.Data.filter(x => x.enum_name == 'LANTERN_SIDE_LIGHT_COLOR')[0].enum_values)
            setLanternHooks(enumResult.Data.filter(x => x.enum_name == 'LANTERN_HOOK')[0].enum_values)
            setLanternColors(enumResult.Data.filter(x => x.enum_name == 'LANTERN_COLOR')[0].enum_values)
            setLanternLightColors(enumResult.Data.filter(x => x.enum_name == 'LANTERN_LIGHT_COLOR')[0].enum_values)
            setLanternShapes(enumResult.Data.filter(x => x.enum_name == 'LANTERN_SHAPE')[0].enum_values)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await collectionPost({
                                        name: data.name,
                                        description: data.description,
                                        ranking: data.ranking,
                                        mainURL: threeDURL,
                                        mainFBXURL: threeDFBXURL,
                                        thumbnailURL: twoDURL,
                                        metadata: {
                                            LANTERN_SHAPE: data.lanternShape,
                                            LIGHT_PATTERN: data.lightPattern,
                                            LIGHT_PATTERN_COLOR: data.lightPatternColor,
                                            LANTERN_SIDE_LIGHT_COLOR: data.lanternSideLightColor,
                                            LANTERN_HOOK: data.lanternHook,
                                            LANTERN_COLOR: data.lanternColor,
                                            LANTERN_LIGHT_COLOR: data.lanternLightColor
                                        },
                                    })

        console.log("createCollection result", result)
        
        if(result.Success) {

            mdLoading.current.close()
            mdLoading.current.show("Uploading 3D file..")

            if(result.Data && result.Data.MainPresignedURL) {
                await uploadToS3(result.Data.MainPresignedURL, threeDURL, threeDFileReaderResult)
            }

            mdLoading.current.close()
            mdLoading.current.show("Uploading 2D file..")

            if(result.Data && result.Data.ThumbnailPresignedURL) {
                await uploadToS3(result.Data.ThumbnailPresignedURL, twoDURL, twoDFileReaderResult)
            }

            mdLoading.current.close()
            mdLoading.current.show("Uploading 3D FBX file..")

            if(result.Data && result.Data.MainFBXPresignedURL) {
                await uploadToS3(result.Data.MainFBXPresignedURL, threeDFBXURL, threeDFBXFileReaderResult)
            }

            mdLoading.current.close()
            showSuccess("Collection created successfully")

            router.push("/lantern/collection")
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

    const handleThreeDFileUpload = (e) => {
        console.log(e)
  
        if(e.target.files[0] == undefined)
          return;
  
        let filePath = e.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.fbx|\.glb|\.gltf|\.png)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: fbx,glb,gltf,png")
            setThreeDFile(null)
            threeDFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setThreeDURL(filePath)
        }

        let fileSize = e.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setThreeDFile(null)
            threeDFileRef.current = null
            return false
        }

        console.log("e.target.files[0]", e.target.files[0])        
        setThreeDFile(e.target.files[0], (f) => {
                                                    setThreeDBlobURL(URL.createObjectURL(f));    
                                                    let reader = new FileReader()
                                                    reader.onload = (event) => { setThreeDFileReaderResult(event.target.result) }
                                                    reader.readAsDataURL(f)
                                                })
    }

    const handleTwoDFileUpload = (e) => {
        console.log(e)
  
        if(e.target.files[0] == undefined)
          return;
  
        let filePath = e.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp|\.gif)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: jpg,jpeg,png,webp,gif")
            setTwoDFile(null)
            twoDFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setTwoDURL(filePath)
        }

        let fileSize = e.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setTwoDFile(null)
            twoDFileRef.current = null
            return false
        }

        console.log("e.target.files[0]", e.target.files[0])        
        setTwoDFile(e.target.files[0], (f) => {
                                                    setTwoDBlobURL(URL.createObjectURL(f));    
                                                    let reader = new FileReader()
                                                    reader.onload = (event) => { setTwoDFileReaderResult(event.target.result) }
                                                    reader.readAsDataURL(f)
                                                })
    }

    const handleThreeDFBXFileUpload = (e) => {
        console.log(e)
  
        if(e.target.files[0] == undefined)
          return;
  
        let filePath = e.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.fbx|\.glb|\.gltf)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: fbx,glb,gltf")
            setThreeDFBXFile(null)
            threeDFBXFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setThreeDFBXURL(filePath)
        }

        let fileSize = e.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setThreeDFBXFile(null)
            threeDFBXFileRef.current = null
            return false
        }

        console.log("e.target.files[0]", e.target.files[0])        
        setThreeDFBXFile(e.target.files[0], (f) => {
                                                    setThreeDFBXBlobURL(URL.createObjectURL(f));    
                                                    let reader = new FileReader()
                                                    reader.onload = (event) => { setThreeDFBXFileReaderResult(event.target.result) }
                                                    reader.readAsDataURL(f)
                                                })
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW COLLECTION</h2>                        
                </div>
                <div className="p-4 w-full">                    
                    <div className="form-control">
                        <label>Ranking</label>
                        <select className="select select-bordered w-fit" 
                                value={ranking.value} 
                                {...register("ranking", {required: true, onChange: (e) => setRanking(e.target.value)})}>
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Name</label>
                            <input type="text" 
                                value={name}
                                placeholder="Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true, onChange: (e) => setName(e.target.value)})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Description</label>
                            <input type="text" 
                                value={description} 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: false, onChange: (e) => setDescription(e.target.value)})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>2D (Plain) <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={threeDFileRef}
                                        accept=".glb,.gltf,.fbx,.png"
                                        {...register("threeD", {required: true, onChange: (e) => handleThreeDFileUpload(e)})}/>
                                Choose File
                            </div>
                            {errors.threeD?.type === 'required' && <p className="text-red-500">3D file is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>2D <span className="text-red-400">*</span><span className="text-xs"> (We recommend an image of at least 400x400px.)</span></label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={twoDFileRef}
                                        accept=".jpg,.jpeg,.png,.webp,.gif"
                                        {...register("twoD", {required: true, onChange: (e) => handleTwoDFileUpload(e)})}/>
                                Choose File
                            </div>
                            {twoDBlobURL && <img src={twoDBlobURL} className="w-80" />}
                            {errors.twoD?.type === 'required' && <p className="text-red-500">2D file is required</p>}
                        </div>
                    </div>                    
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>3D FBX <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={threeDFBXFileRef}
                                        accept=".glb,.gltf,.fbx"
                                        {...register("threeDFBX", {required: true, onChange: (e) => handleThreeDFBXFileUpload(e)})}/>
                                Choose File
                            </div>
                            {errors.threeDFBX?.type === 'required' && <p className="text-red-500">3D FBX file is required</p>}
                        </div>
                    </div>                    
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        {/* <div className="flex flex-col">
                            <label>Music</label>
                            <select className="select select-bordered w-full" 
                                    value={music.value} 
                                    onChange={(e) => setMusic(e.target.value)}
                                    {...register("music", {required: true})}>
                                <option value="SNOW_LAKE">Snow Lake</option>
                                <option value="MORNING_MOOD">Morning Mood</option>
                            </select>
                        </div> */}
                        <div className="flex flex-col">
                            <label>Lantern Shape</label>
                            <select className="select select-bordered w-full" 
                                    value={lanternShape} 
                                    {...register("lanternShape", {required: true, onChange: (e) => setLanternShape(e.target.value)})}>

                                <option value={""}>--Please Select--</option>
                                {
                                    lanternShapes 
                                    && lanternShapes.length > 0
                                    && lanternShapes.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lanternShape?.type === 'required' && <p className="text-red-500">Lantern Shape is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Light Pattern</label>
                            <select className="select select-bordered w-full" 
                                    value={lightPattern} 
                                    {...register("lightPattern", {required: true, onChange: (e) => setLightPattern(e.target.value)})}>

                                <option value={""}>--Please Select--</option>
                                {
                                    lightPatterns 
                                    && lightPatterns.length > 0
                                    && lightPatterns.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lightPattern?.type === 'required' && <p className="text-red-500">Light Pattern is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Light Pattern Color</label>
                            <select className="select select-bordered w-full" 
                                    value={lightPatternColor} 
                                    {...register("lightPatternColor", {required: true, onChange: (e) => setLightPatternColor(e.target.value)})}>
                                <option value={""}>--Please Select--</option>
                                {
                                    lightPatternColors 
                                    && lightPatternColors.length > 0
                                    && lightPatternColors.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lightPatternColor?.type === 'required' && <p className="text-red-500">Light Pattern Color is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Lantern Side Light Color</label>
                            <select className="select select-bordered w-full" 
                                    value={lanternSideLightColor} 
                                    {...register("lanternSideLightColor", {required: true, onChange: (e) => setLanternSideLightColor(e.target.value)})}>
                                <option value={""}>--Please Select--</option>
                                {
                                    lanternSideLightColors 
                                    && lanternSideLightColors.length > 0
                                    && lanternSideLightColors.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lanternSideLightColor?.type === 'required' && <p className="text-red-500">Lantern Side Light Color is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Lantern Hook</label>
                            <select className="select select-bordered w-full" 
                                    value={lanternHook} 
                                    {...register("lanternHook", {required: true, onChange: (e) => setLanternHook(e.target.value)})}>
                                <option value={""}>--Please Select--</option>
                                {
                                    lanternHooks 
                                    && lanternHooks.length > 0
                                    && lanternHooks.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lanternHook?.type === 'required' && <p className="text-red-500">Lantern Hook is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Lantern Color</label>
                            <select className="select select-bordered w-full" 
                                    value={lanternColor} 
                                    {...register("lanternColor", {required: true, onChange: (e) => setLanternColor(e.target.value)})}>
                                <option value={""}>--Please Select--</option>
                                {
                                    lanternColors 
                                    && lanternColors.length > 0
                                    && lanternColors.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lanternColor?.type === 'required' && <p className="text-red-500">Lantern Color is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Lantern Light Color</label>
                            <select className="select select-bordered w-full" 
                                    value={lanternLightColor} 
                                    {...register("lanternLightColor", {required: true, onChange: (e) => setLanternLightColor(e.target.value)})}>
                                <option value={""}>--Please Select--</option>
                                {
                                    lanternLightColors 
                                    && lanternLightColors.length > 0
                                    && lanternLightColors.map(x => <option value={x}>{x}</option>)
                                }
                            </select>
                            {errors.lanternLightColor?.type === 'required' && <p className="text-red-500">Lantern Light Color is required</p>}
                        </div>
                    </div>
                    <br/>                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/lantern/collection")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CollectionCreate