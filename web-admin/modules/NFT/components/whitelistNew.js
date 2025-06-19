import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { whitelistPost } from "../api";

const CreateWhiteList = () => {

    // const [name, setName] = useState('')
    // const [description, setDescription] = useState('')
    // const [nftType, setNftType] = useState()

    const {register, formState: {errors}, handleSubmit} = useForm()
    // const {getFileMIME} = useHelper()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    // const [enums, setEnums] = useState([])
    // const [categoryId, setCategoryId] = useState(null)
    // const [categories, setCategories] = useState([])
    // const [licenseId, setLicenseId] = useState()
    // const [memberStores, setMemberStores] = useState([])

    useEffect(() => {

    }, [])

    // useEffect(() => {
    //     // if(nftType === 'STORE_FAN')
    //     //     setForSale('Y');
    //     // else
    //     //     setForSale('N');
    // }, [nftType])

    useEffect(() => {
        // getEnums()
        // getCategories()
    }, [])

    // useEffect(() => {
    //     getMemberStores()
    // }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await whitelistPost({
                                        memberId: data.memberid,
                                        discordUserId: data.discordid,
                                        walletAddress: data.walletaddress,
                                        whiteListType: data.whitelisttype
                                    })

        console.log("whitelistPost result", result)
        
        if(result.Success) {
            console.log('Whitelist posted successfully')
            showSuccess("Whitelist posted successfully");
            mdLoading.current.close()
            router.push("/nft/whitelist")
        }
        else
            showFailed(result.Message)
    }

    // const getCategories = async () => {
    //     let result = await categoryGet();
    //     console.log("getCategories result", result);
    //     if(result.Success) {
    //         setCategories(result.Data);
    //     }
    // }


    // const getEnums = async () => {
    //     let result = await enumGet();
    //     console.log("getEnum result", result);
    //     if(result.Success) {
    //         setEnums(result.Data);
    //     }
    // }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW WHITELIST</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Member Id <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("memberid", {required: false})} />
                        </div>
                    </div>
                    <span>OR</span>  
                    <br/>      
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Discord Id <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Discord Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("discordid", {required: false})} />
                        </div>
                    </div>
                    <span>OR</span>  
                    <br/>      
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Wallet Address <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Wallet Address" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("walletaddress", {required: false})} />
                        </div>
                    </div>
                    <br/>    
                    <br/>    
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Whitelist Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("whitelisttype", {required: true})}>
                                {/* <option value="WHITELIST_MEMBER_BRONZE">MEMBERSHIP BRONZE</option> */}
                                <option value="WHITELIST_MEMBER_SILVER_PALEBLUEDOT">MEMBERSHIP SILVER for PaleBlueDot.</option>
                                <option value="WHITELIST_MEMBER_SILVER_METAGARAGE">MEMBERSHIP SILVER for MetaGarage</option>
                                <option value="WHITELIST_MEMBER_GOLD_PALEBLUEDOT">MEMBERSHIP GOLD for PaleBlueDot.</option>
                                <option value="WHITELIST_MEMBER_GOLD_METAGARAGE">MEMBERSHIP GOLD for MetaGarage</option>
                            </select>
                            {errors.nftType?.type === 'required' && <p className="text-red-500">Whitelist Type is required</p>}
                        </div>
                    </div>
                    <br/>  
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/nft/whitelist")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateWhiteList