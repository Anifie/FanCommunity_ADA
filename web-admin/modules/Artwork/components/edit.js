import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { artworkListingPost, artworkPut, enumGet } from "../api";
import useStateCallback from "../../../common/hooks/useStateCallback";

const ArtworkEdit = () => {

    const [artworkId, setArtworkId] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const [category, setCategory] = useState()
    const [artworkType, setArtworkType] = useState()
    const [componentNamesENs, setComponentNamesENs] = useState([])
    const [componentNamesJPs, setComponentNamesJPs] = useState([])
    const [componentNameEN, setComponentNameEN] = useState([])
    const [componentNameJP, setComponentNameJP] = useState([])
    const [current2DURL, setCurrent2DURL] = useState()
    const [current2DURL2, setCurrent2DURL2] = useState()
    const [current2DURL3, setCurrent2DURL3] = useState()
    const [current3DURL, setCurrent3DURL] = useState()

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

    const [enums, setEnums] = useState([])

    useEffect(() => {
        getEnums()
        const {artworkid} = router.query
        setArtworkId(artworkid)
    }, [])

    useEffect(() => {
        if(artworkId)
            getArtwork(artworkId)
    }, [enums, artworkId])
    
    const getArtwork = async (sid) => {
        let artworkResult = await artworkListingPost({artworkId: sid, pageSize: 1})
        console.log("artworkResult", artworkResult)
        if(artworkResult.Success) {
            let _artwork = artworkResult.Data.artworks[0];
            setValue("artworktype", _artwork.ArtworkType)
            setArtworkType(_artwork.ArtworkType)
            setValue("category", _artwork.Category)
            setCategory(_artwork.Category)
            setValue("subcategory", _artwork.SubCategory)
            setValue("name", _artwork.Name)
            setValue("description", _artwork.Description)
            if(_artwork.MemberId)
                setValue("memberid", _artwork.MemberId)
            if(_artwork.Components)
                setValue("components", JSON.stringify(_artwork.Components, null, 2))
            
            
            if(_artwork.Metadata) {
                console.log("_artwork.Metadata", _artwork.Metadata);
                setValue("metadata", JSON.stringify(_artwork.Metadata, null, 2))
            }
                
            if(_artwork.TwoDURL)
                setCurrent2DURL(_artwork.TwoDURL)
            if(_artwork.TwoDURL_2)
                setCurrent2DURL2(_artwork.TwoDURL_2)
            if(_artwork.TwoDURL_3)
                setCurrent2DURL3(_artwork.TwoDURL_3)
            if(_artwork.ThreeDURL)
                setCurrent3DURL(_artwork.ThreeDURL)
            if(_artwork.NameEN)
                setValue("componentnameen1", _artwork.NameEN);
            if(_artwork.ValueEN)
                setValue("componentvalueen2", _artwork.ValueEN);
            if(_artwork.NameJP)
                setValue("componentnamejp1", _artwork.NameJP);
            if(_artwork.ValueJP)
                setValue("componentvaluejp2", _artwork.ValueJP);
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await artworkPut({
                                        artworkId: artworkId,
                                        artworkType: data.artworktype,
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

        console.log("update artwork result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Artwork edited successfully")
            router.push("/artwork")
        }            
        else {
            mdLoading.current.close()
            showFailed("Artwork edit failed with message: " + result.Message)
        }
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
                    <h2 className="ml-3 text-sm font-bold">EDIT ARTWORK</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Artwork Id</label>
                            <input type="text" 
                                disabled 
                                value={artworkId} 
                                placeholder="Artwork Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artworkid", {required: false})} />
                        </div>
                    </div>
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
                            <label>Sub Category <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Sub Category" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("subcategory", {required: false})} />
                            {errors.subcategory?.type === 'required' && <p className="text-red-500">Sub Category is required</p>}
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
                    <br/>
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
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File</label>
                            {current2DURL && <label>Current 2D Image File: {current2DURL}</label>}
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
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File V2</label>
                            {current2DURL2 && <label>Current 2D Image File V2: {current2DURL2}</label>}
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
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork 2D Image File V3</label>
                            {current2DURL3 && <label>Current 2D Image File V3: {current2DURL3}</label>}
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
                            {current3DURL && <label>Current 3D File: {current3DURL}</label>}
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
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">UPDATE</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/artwork")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ArtworkEdit