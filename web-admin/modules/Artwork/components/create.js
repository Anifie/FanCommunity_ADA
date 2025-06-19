import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { artworkCreatePost, enumGet} from "../api";

const ArtworkCreate = () => {

    const [category, setCategory] = useState()
    const [artworkType, setArtworkType] = useState()
    const [componentNamesENs, setComponentNamesENs] = useState([])
    const [componentNamesJPs, setComponentNamesJPs] = useState([])
    const [componentNameEN, setComponentNameEN] = useState([])
    const [componentNameJP, setComponentNameJP] = useState([])

    const [twoDURL, setTwoDURL] = useState()
    const [twoDFile, setTwoDFile] = useStateCallback()
    // const [nftBlobURL, setNFTBlobURL] = useState()
    // const [nftFileReaderResult, setNFTFileReaderResult] = useState()
    const twoDFileRef = useRef()
    const [twoDFileBase64, setTwoDFileBase64] = useState();

    const [twoDURL2, setTwoDURL2] = useState()
    const [twoDFile2, setTwoDFile2] = useStateCallback()
    // const [nftBlobURL, setNFTBlobURL] = useState()
    // const [nftFileReaderResult, setNFTFileReaderResult] = useState()
    const twoDFileRef2 = useRef()
    const [twoDFileBase642, setTwoDFileBase642] = useState();

    const [twoDURL3, setTwoDURL3] = useState()
    const [twoDFile3, setTwoDFile3] = useStateCallback()
    // const [nftBlobURL, setNFTBlobURL] = useState()
    // const [nftFileReaderResult, setNFTFileReaderResult] = useState()
    const twoDFileRef3 = useRef()
    const [twoDFileBase643, setTwoDFileBase643] = useState();

    const [threeDURL, setThreeDURL] = useState()
    const [threeDFile, setThreeDFile] = useStateCallback()
    // const [nftBlobURL, setNFTBlobURL] = useState()
    // const [nftFileReaderResult, setNFTFileReaderResult] = useState()
    const threeDFileRef = useRef()
    const [threeDFileBase64, setThreeDFileBase64] = useState();

    const {register, formState: {errors}, handleSubmit} = useForm()
    const {getFileMIME} = useHelper()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const [enums, setEnums] = useState([])

    useEffect(() => {

    }, [])

    // useEffect(() => {
    //     // if(nftType === 'STORE_FAN')
    //     //     setForSale('Y');
    //     // else
    //     //     setForSale('N');
    // }, [nftType])

    useEffect(() => {
        setCategory('ART')  // default category
        getEnums()
        setArtworkType('FULL_TEMPLATE')
        // getCategories()
    }, [])
    
    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await artworkCreatePost({
                                        artworkType: 'FULL_TEMPLATE',   //data.artworktype,
                                        category: data.category,
                                        subCategory: data.subcategory,
                                        name: data.name,
                                        description: data.description,
                                        memberId: data.memberid,
                                        twoDFileName: twoDURL ? twoDURL.replace("C:\\fakepath\\", "") : undefined,
                                        twoDBase64: twoDFileBase64,
                                        twoDFileName_2: twoDURL2 ? twoDURL2.replace("C:\\fakepath\\", "") : undefined,
                                        twoDBase64_2: twoDFileBase642,
                                        twoDFileName_3: twoDURL3 ? twoDURL3.replace("C:\\fakepath\\", "") : undefined,
                                        twoDBase64_3: twoDFileBase643,
                                        threeDFileName: threeDURL ? threeDURL.replace("C:\\fakepath\\", "") : undefined,
                                        threeDBase64: threeDFileBase64,
                                        componentNameEN: data.componentnameen2 ? data.componentnameen2 : data.componentnameen1,
                                        componentValueEN: data.componentvalueen2 ? data.componentvalueen2 : data.componentvalueen1,
                                        componentNameJP: data.componentnamejp2 ? data.componentnamejp2 : data.componentnamejp1,
                                        componentValueJP: data.componentvaluejp2 ? data.componentvaluejp2 : data.componentvaluejp1,
                                        components: data.components ? JSON.parse(data.components) : undefined,
                                        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
                                    })

        console.log("artworkCreate result", result)
        
        if(result.Success) {
            console.log('Artwork added successfully')
            mdLoading.current.close()
            router.push("/artwork")
        }
        else
            alert(result.Message)
    }

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
    
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
    
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const getEnums = async () => {
        let result = await enumGet();
        console.log("getEnum result", result);
        if(result.Success) {
            setEnums(result.Data);

            let _componentsNameENArray = result.Data.filter(x => x.sk && x.sk.includes('COMPONENT_EN')).map(x => x.enum_name);
            console.log("_componentsNameENArray", result.Data);
            setComponentNamesENs(_componentsNameENArray);

            let _componentsNameJPArray = result.Data.filter(x => x.sk && x.sk.includes('COMPONENT_JP')).map(x => x.enum_name);
            console.log("_componentsNameJPArray", _componentsNameJPArray);
            setComponentNamesJPs(_componentsNameJPArray);
        }
    }
    
    const upload2DFile = async (event) => {
        console.log("upload2DFile", event)
  
        if(event.target.files[0] == undefined)
          return;

        let filePath = event.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.mp4|\.mp3|\.jpeg|\.jpg|\.gif|\.png|\.txt|\.json)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: gif,jpeg,jpg,png,txt,mp3,mp4,json")
            setTwoDFile(null)
            twoDFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setTwoDURL(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setTwoDFile(null)
            twoDFileRef.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setTwoDFileBase64(base64);
        console.log("base64", base64);
    };

    const upload2DFile2 = async (event) => {
        console.log("upload2DFile2", event)
  
        if(event.target.files[0] == undefined)
          return;

        let filePath = event.target.value
        console.log("filePath2", filePath)
        var allowedExtensions = /(\.mp4|\.mp3|\.jpeg|\.jpg|\.gif|\.png|\.txt|\.json)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: gif,jpeg,jpg,png,txt,mp3,mp4,json")
            setTwoDFile2(null)
            twoDFileRef2.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setTwoDURL2(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setTwoDFile2(null)
            twoDFileRef2.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setTwoDFileBase642(base64);
        console.log("base64", base64);
    };

    const upload2DFile3 = async (event) => {
        console.log("upload2DFile3", event)
  
        if(event.target.files[0] == undefined)
          return;

        let filePath = event.target.value
        console.log("filePath3", filePath)
        var allowedExtensions = /(\.mp4|\.mp3|\.jpeg|\.jpg|\.gif|\.png|\.txt|\.json)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: gif,jpeg,jpg,png,txt,mp3,mp4,json")
            setTwoDFile3(null)
            twoDFileRef3.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setTwoDURL3(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setTwoDFile3(null)
            twoDFileRef3.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setTwoDFileBase643(base64);
        console.log("base64", base64);
    };

    const upload3DFile = async (event) => {
        console.log("upload3DFile", event)
  
        if(event.target.files[0] == undefined)
          return;

        let filePath = event.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.gltf|\.glb|\.fbx)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: gltf,glb,fbx")
            setThreeDFile(null)
            threeDFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setThreeDURL(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 100 MB')
            setThreeDFile(null)
            threeDFileRef.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setThreeDFileBase64(base64);
        console.log("base64", base64);
    };

    const sampleMetadata =  [
        {
          "trait_type": "Base", 
          "value": "Starfish"
        }, 
        {
          "trait_type": "Eyes", 
          "value": "Big"
        }
    ]

    const sampleComponents = [
        {
            "ComponentName": "ComponentValue"   
        },
        {
            "ComponentName2": "ComponentValue2"   
        }
    ];

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">CREATE NEW ARTWORK</h2>                        
                </div>
                <div className="p-4 w-full">
                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("artworktype", {required: true, onChange: (e) => setArtworkType(e.target.value), validate: {isNotEmpty: (value, formValues) => value != ''}})}>
                                <option value="FULL_TEMPLATE">Full (Template)</option>
                                <option value="FULL_USER">Full (User Customized)</option>
                                <option value="COMPONENT">Component</option>
                            </select>
                            {errors.artworktype?.type === 'required' && <p className="text-red-500">Artwork Type is required</p>}
                        </div>
                    </div> */}
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Category <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("category", {required: true, onChange: (e) => setCategory(e.target.value), validate: {isNotEmpty: (value, formValues) => value != ''}})}>
                                <option value="ART">ART</option>
                                <option value="MEMBERSHIP">MEMBERSHIP</option>
                                <option value="SUPERCHAT">SUPERCHAT</option>
                                <option value="VIDEO">VIDEO</option>
                            </select>
                            {errors.category?.type === 'required' && <p className="text-red-500">Category is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Sub Category </label>
                            <input type="text" 
                                placeholder="Sub Category" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("subcategory", {required: false})} />
                            {errors.subcategory?.type === 'required' && <p className="text-red-500">Subcategory is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Name <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Description <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: true})} />
                            {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
                        </div>
                    </div>
                    {
                        artworkType !== 'COMPONENT' &&
                        <>
                            <br/>
                            <div className="grid sm:grid-cols-2 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Metadata</label>
                                    <textarea {...register("metadata", {required: false})} rows={7}>
                                    </textarea>
                                </div>
                                <pre className="text-xs"><br/><br/><code>{JSON.stringify(sampleMetadata, null, 2)}</code></pre>
                            </div>
                            {/* <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Components</label>
                                    <textarea {...register("components", {required: false})} rows={7}>
                                    </textarea>
                                </div>
                                <pre className="text-xs"><br/><br/><code>{JSON.stringify(sampleComponents, null, 2)}</code></pre>
                            </div>    */}
                        </>
                    }
                    {
                        artworkType === 'FULL_USER' &&
                        <>
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
                        </>
                    }                    
                    <br/>
                    {
                        artworkType === 'COMPONENT' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div>
                                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <label>Component Name (EN)</label>
                                            <select className="select select-bordered max-w-sm" 
                                                    {...register("componentnameen1", {required: false, onChange: (e) => setComponentNameEN(e.target.value)})}>
                                                    <option value={''}>--Select Component--</option>
                                                    {
                                                        componentNamesENs && componentNamesENs.length > 0 
                                                        && componentNamesENs.map(x => <option value={x}>{x}</option>)
                                                    }
                                            </select>
                                        </div>
                                    </div>
                                    Or, Enter new component name:
                                    <br/>
                                    <div className="flex flex-col">
                                        <label>Component Name (EN)</label>
                                        <input type="text" 
                                            placeholder="Component Name (EN)" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("componentnameen2", {required: false})} />
                                    </div>
                                </div>
                                <div>
                                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <label>Component Value (EN)</label>
                                            <select className="select select-bordered max-w-sm" 
                                                    {...register("componentvalueen1", {required: false})}>
                                                <option value={''}>--Select Component--</option>
                                                {
                                                    enums && enums.length > 0 && componentNameEN
                                                    && enums.find(x=>x.enum_name == componentNameEN) 
                                                    && enums.find(x=>x.enum_name == componentNameEN).enum_values.map(x => <option value={x}>{x}</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    Or, Enter new component value: */}
                                    <div className="flex flex-col">
                                        <label>Component Value (EN)</label>
                                        <input type="text" 
                                            placeholder="Component Value (EN)" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("componentvalueen2", {required: false})} />
                                    </div>
                                </div>
                                
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div>
                                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <label>Component Name (JP)</label>
                                            <select className="select select-bordered max-w-sm" 
                                                    {...register("componentnamejp1", {required: false, onChange: (e) => setComponentNameJP(e.target.value)})}>
                                                        <option value={''}>--Select Component--</option>
                                                    {
                                                        componentNamesJPs && componentNamesJPs.length > 0 
                                                        && componentNamesJPs.map(x => <option value={x.component_name}>{x.component_name}</option>)
                                                    }
                                            </select>
                                            {/* {errors.subcategory?.type === 'required' && <p className="text-red-500">Component Name (EN) is required</p>} */}
                                        </div>
                                    </div>
                                    Or, Enter new component name:
                                    <br/>
                                    <div className="flex flex-col">
                                        <label>Component Name (JP)</label>
                                        <input type="text" 
                                            placeholder="Component Name (JP)" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("componentnamejp2", {required: false})} />
                                        {/* {errors.memberid?.type === 'required' && <p className="text-red-500">MemberId is required</p>} */}
                                    </div>
                                </div>
                                <div>
                                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <label>Component Value (JP)</label>
                                            <select className="select select-bordered max-w-sm" 
                                                    {...register("componentvaluejp1", {required: false})}>
                                                <option value={''}>--Select Component--</option>
                                                {
                                                    enums && enums.length > 0 && componentNameJP
                                                    && enums.find(x=>x.enum_name == componentNameJP) 
                                                    && enums.find(x=>x.enum_name == componentNameJP).enum_values.map(x => <option value={x}>{x}</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    Or, Enter new component value: */}
                                    <div className="flex flex-col">
                                        <label>Component Value (JP)</label>
                                        <input type="text" 
                                            placeholder="Component Value (JP)" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("componentvaluejp2", {required: false})} />
                                        {/* {errors.memberid?.type === 'required' && <p className="text-red-500">MemberId is required</p>} */}
                                    </div>
                                </div>

                            </div>
                        </>
                    }
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File</label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={twoDFileRef}
                                        accept=".gif,.jpeg,.jpg,.png,.txt,.mp3,.mp4,.json,.txt"
                                        {...register("twodfile", {required: false, onChange: (e) => upload2DFile(e)})}/>
                                {twoDURL ? twoDURL.replace("C:\\fakepath\\", "") : "Choose File"}
                            </div>
                            {twoDFileBase64 && <img src={twoDFileBase64}></img>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File V2</label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={twoDFileRef2}
                                        accept=".gif,.jpeg,.jpg,.png,.txt,.mp3,.mp4,.json,.txt"
                                        {...register("twodfile2", {required: false, onChange: (e) => upload2DFile2(e)})}/>
                                {twoDURL2 ? twoDURL2.replace("C:\\fakepath\\", "") : "Choose File"}
                            </div>
                            {twoDFileBase642 && <img src={twoDFileBase642}></img>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File V3</label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={twoDFileRef3}
                                        accept=".gif,.jpeg,.jpg,.png,.txt,.mp3,.mp4,.json,.txt"
                                        {...register("twodfile3", {required: false, onChange: (e) => upload2DFile3(e)})}/>
                                {twoDURL3 ? twoDURL3.replace("C:\\fakepath\\", "") : "Choose File"}
                            </div>
                            {twoDFileBase643 && <img src={twoDFileBase643}></img>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 3D File</label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={threeDFileRef}
                                        accept=".gltf,.glb,.fbx"
                                        {...register("threedfile", {required: false, onChange: (e) => upload3DFile(e)})}/>
                                {threeDURL ? threeDURL.replace("C:\\fakepath\\", "") : "Choose File"}
                            </div>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/artwork")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ArtworkCreate