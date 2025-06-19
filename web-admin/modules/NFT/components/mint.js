import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { nftMintPost, storeListing, categoryGet, enumGet, assetGet} from "../api";

const NFTMint = () => {

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [nftType, setNftType] = useState()

    const [nftURL, setNFTURL] = useState()
    const [nftFile, setNFTFile] = useStateCallback()
    const [nftBlobURL, setNFTBlobURL] = useState()
    const [nftFileReaderResult, setNFTFileReaderResult] = useState()
    const nftFileRef = useRef()

    const [nftFileBase64, setNFTFileBase64] = useState();

    const {register, formState: {errors}, handleSubmit} = useForm()
    const {getFileMIME} = useHelper()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const [enums, setEnums] = useState([])
    const [categoryId, setCategoryId] = useState(null)
    const [categories, setCategories] = useState([])
    const [licenseId, setLicenseId] = useState()
    // const [memberStores, setMemberStores] = useState([])

    useEffect(() => {

    }, [])

    useEffect(() => {
        // if(nftType === 'STORE_FAN')
        //     setForSale('Y');
        // else
        //     setForSale('N');
    }, [nftType])

    useEffect(() => {
        getEnums()
        getCategories()
    }, [])

    // useEffect(() => {
    //     getMemberStores()
    // }, [])

    const sleep = (ms) => {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await nftMintPost({
                                        nftType: data.nftType,
                                        name: data.name === '' ? undefined : data.name,
                                        description: data.description == '' ? undefined : data.description,
                                        memberId: data.memberid,
                                        fileName: nftURL?.replace("C:\\fakepath\\", ""),
                                        nftURLBase64: nftFileBase64 ? nftFileBase64 : '',
                                        storeId: data.storeid === '' ? undefined : data.storeid,
                                        category: data.category ===  '' ? undefined : data.category,
                                        subCategory: data.subcategory === '--Select Sub Category--' ? undefined : data.subcategory,
                                        licenseId: data.license === '' ? undefined : data.license,
                                        royalty: data.royalty === '' ? undefined : data.royalty,
                                        metadata: data.metadata === '' ? undefined : data.metadata,
                                        artworkId: data.artworkid === '' ? undefined : data.artworkid,
                                        campaignCode: data.campaigncode === '' ? undefined : data.campaigncode
                                    })

        console.log("nftMint result", result)
        
        if(result.Success) {
            
            let attempt = 0;
            let assetFound;
            while (attempt < 30) {
                assetFound = await assetGet({
                                                //walletAddress: account,
                                                contractAddress: result.Data.contractAddress,
                                                assetId: result.Data.assetId,
                                                tokenId: result.Data.tokenId,
                                                status: "NOTFORSALE"
                                            });
                console.log("assetFound", assetFound);
                if(assetFound.Success) {
                    return {
                        Success: true,
                        Data: {
                            tokenId: assetFound.Data.TokenId,
                            contractAddress: contractAddr,
                            assetId: assetId
                        }
                    }
                }
                await sleep(2000);
                attempt++;
            }
            if(!assetFound.Success) {
                console.log("Failed to sync NFT");
            }

            console.log('Asset minted successfully')

            mdLoading.current.close()

            router.push("/nft/listing")
        }            
        else if (result.message == 'Service Unavailable') {
            console.log('Service Unavailable');
            mdLoading.current.close()
            showInfo("NFT creation in progress. Please check again after 1 minute.")
            router.push("/nft/listing")
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

    const getCategories = async () => {
        let result = await categoryGet();
        console.log("getCategories result", result);
        if(result.Success) {
            setCategories(result.Data);
        }
    }

    // const getMemberStores = async () => {
    //     let result = await storeListing({pageSize: 1000});
    //     console.log("getMemberStores result", result);
    //     if(result.Success) {
    //         setMemberStores(result.Data.stores);
    //     }
    // }

    const getEnums = async () => {
        let result = await enumGet();
        console.log("getEnum result", result);
        if(result.Success) {
            setEnums(result.Data);
        }
    }
    
    
    const getLicenseLongDescription = (_licenseId) => {
        switch(_licenseId) {
            case 'CC0':
                return 'СС0 (aka CC Zero) is a public dedication tool, which allows creators to give up their copyright and put their works into the worldwide public domain. CC0 allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, with no conditions.'
            case 'CC':
                return 'This license lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.'
            case 'CCND':
                return 'This license lets others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you.'
            case 'CCSA':
                return 'This license lets others remix, adapt, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms.'
            case 'CCNC':
                return 'This license lets others remix, adapt, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to license their derivative works on the same terms.'
            case 'CCNCSA':
                return 'This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms.'
            case 'CCNCND':
                return 'This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator. The license allows for commercial use.'
            default:
                return "";
        }
    }

    const getLicenseURL = (_licenseId) => {
        switch(_licenseId) {
            case 'CC0':
                return 'https://creativecommons.org/publicdomain/zero/1.0/'
            case 'CC':
                return 'https://creativecommons.org/licenses/by/4.0/'
            case 'CCND':
                return 'https://creativecommons.org/licenses/by-nd/4.0/'
            case 'CCSA':
                return 'https://creativecommons.org/licenses/by-sa/4.0/'
            case 'CCNC':
                return 'https://creativecommons.org/licenses/by-nc/4.0/'
            case 'CCNCSA':
                return 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
            case 'CCNCND':
                return 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
            default:
                return "";
        }
    }

    const uploadImage = async (event) => {
        console.log(event)
  
        if(event.target.files[0] == undefined)
          return;

        let filePath = event.target.value
        console.log("filePath", filePath)
        var allowedExtensions = /(\.mp4|\.mp3|\.jpeg|\.jpg|\.gif|\.png|\.txt|\.json)$/i
        if (!allowedExtensions.exec(filePath)) {
            console.log("file path not allowed" + filePath)
            showFailed("File types only supported: gif,jpeg,jpg,png,txt,mp3,mp4,json")
            setNFTFile(null)
            nftFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setNFTURL(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setNFTFile(null)
            nftFileRef.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setNFTFileBase64(base64);
        console.log("base64", base64);
    };

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">MINT NEW NFT</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>NFT Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    value={nftType} 
                                    {...register("nftType", {required: true, onChange: (e) => setNftType(e.target.value)})}>
                                <option value="CAR">CAR</option>
                                <option value="CHARACTER">CHARACTER</option>
                                <option value="MEMBER_A">MEMBERSHIP A</option>
                                <option value="MEMBER_B">MEMBERSHIP B</option>
                            </select>
                            {errors.nftType?.type === 'required' && <p className="text-red-500">NFT Type is required</p>}
                        </div>
                    </div>
                    <br/>
                    {
                        nftType != 'MEMBER_A' && nftType != 'MEMBER_B' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Name <span className="text-red-400">*</span><span className="text-xs"></span></label>
                                    <input type="text" 
                                        value={name}
                                        placeholder="Name" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("name", {required: true, onChange: (e) => setName(e.target.value)})} />
                                    {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Description</label>
                                    <input type="text" 
                                        value={description}
                                        placeholder="Description" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("description", {required: false, onChange: (e) => setDescription(e.target.value)})} />
                                    {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
                                </div>
                            </div>
                            <br/>
                        </>
                    }
                    {
                        (nftType == 'MEMBER_A' || nftType == 'MEMBER_B') &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Campaign Code</label>
                                    <input type="text" 
                                        placeholder="Campaign Code" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("campaigncode")} />
                                </div>
                            </div>
                            <br/>
                        </>
                    }
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Member Id</label>
                            <input type="text" 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("memberid", {required: true})} />
                            {errors.memberid?.type === 'required' && <p className="text-red-500">MemberId is required</p>}
                        </div>
                    </div>
                    <br/>
                    {
                        nftType != 'MEMBER_A' && nftType != 'MEMBER_B' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Category</label>
                                    <select className="select select-bordered w-[255px]"
                                            {...register("category", {required: true, onChange: (e) => setCategoryId(e.target.value), validate: {isNotEmpty: (value, formValues) => value != ''}})}>
                                        <option value={''}>--Select Category--</option>
                                        {
                                            categories && categories.length > 0 
                                            && categories.map(x => <option value={x.category_name}>{x.category_description}</option>)
                                        }
                                    </select>
                                    {(errors.category) && <p className="text-red-500">Category is required</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label>Sub Category</label>
                                    <select className="select select-bordered w-[255px]"
                                            {...register("subcategory", {required: false})}>
                                            <option value={null}>--Select Sub Category--</option>
                                            {
                                                enums && enums.length > 0 && categoryId
                                                && enums.find(x=>x.enum_name == categoryId) 
                                                && enums.find(x=>x.enum_name == categoryId).enum_values.map(x => <option value={x}>{x}</option>)
                                            }
                                        </select>
                                </div>
                            </div>
                            <br/>   
                        </>
                    }
                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Store Id</label>
                            <select className="select select-bordered w-[510px]"
                                {...register("storeid", {required: true})}>
                                    <option value={'HONDA_CAR'}>HONDA_CAR</option>
                                    <option value={'HONDA_CHARACTER'}>HONDA_CHARACTER</option>
                                    <option value={'HONDA_MEMBERSHIP_A'}>HONDA_MEMBERSHIP_A</option>
                                    <option value={'HONDA_MEMBERSHIP_B'}>HONDA_MEMBERSHIP_B</option>
                            </select>
                            {errors.storeid?.type === 'required' && <p className="text-red-500">StoreId is required</p>}
                        </div>
                    </div> */}
                    <br/>
                    {
                        nftType != 'MEMBER_A' && nftType != 'MEMBER_B' &&
                        <>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>License</label>
                                    <select className="select select-bordered w-full" 
                                            {...register("license", {required: true, onChange: (e) => setLicenseId(e.target.value), validate: {isNotEmpty: (v) => v !== ''}})}>
                                            <option value={''}>--Select License--</option>
                                            {
                                                enums && enums.length > 0 
                                                && enums.find(x=>x.enum_name === 'LICENSE').enum_values.map((x, index) => <option value={x}>{enums?.find(x=>x.enum_name === 'LICENSE')?.enum_description[index]}</option>)
                                            }
                                        </select>
                                        {(errors.license) && <p className="text-red-500">License is required</p>}
                                        <div className="text-slate-700">
                                            {licenseId &&  getLicenseLongDescription(licenseId)}
                                        </div>
                                        <div>
                                            <a href="https://creativecommons.org/licenses/" target="_blank" className="link link-primary"><span className="flex items-center">About CC Licenses<FontAwesomeIcon className="ml-2 w-[15px]" icon={faExternalLink}/></span></a>
                                        </div>
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Royalty</label>
                                    <input type="text" 
                                        placeholder="Royalty" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("royalty", {required: true})} />
                                    {errors.royalty?.type === 'required' && <p className="text-red-500">Royalty is required</p>}
                                </div>
                            </div>
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <label>Metadata</label>
                                    <input type="text" 
                                        placeholder="Metadata" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("metadata", {required: false})} />
                                </div>
                            </div>
                            <br/>
                                <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                                    <div className="flex flex-col">
                                        <label>ArtworkId</label>
                                        <input type="text" 
                                            placeholder="ArtworkId" 
                                            className="input input-bordered w-full max-w-lg"
                                            {...register("artworkid", {required: false})} />
                                    </div>
                                </div> 
                            <br/>
                            <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <label>NFT Image File</label>
                                    <div className="relative overflow-hidden btn bg-slate-600">
                                        <input type="file"
                                                className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                                ref={nftFileRef}
                                                accept=".gif,.jpeg,.jpg,.png,.txt,.mp3,.mp4,.json,.txt"
                                                {...register("nft", {required: false, onChange: (e) => uploadImage(e)})}/>
                                        Choose File
                                    </div>
                                    {errors.nft?.type === 'required' && <p className="text-red-500">NFT file is required</p>}
                                    {nftFileBase64 && <img src={nftFileBase64}></img>}
                                </div>
                            </div>
                            <br/>
                        </>
                    }                    
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Mint</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/nft/listing")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default NFTMint