import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { membershipQRPost } from "../api";
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
  
const NewMemberQRs = () => {

    const [collectionId, setCollectionId] = useState()
    // const [PlayerId, setPlayerId] = useState()
    const [message, setMessage] = useState()
    const [music, setMusic] = useState()
    const [position, setPosition] = useState()
    const [memberId, setMemberId] = useState()
    const [nickName, setNickName] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    
    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        setValue("artistcode", "IMARITONES")
        setValue("baseurl", process.env.IS_TEST == 'true' ? "https://ttd.anifie.com/imari-tones/" : "https://td.anifie.com/imari-tones/")
    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await membershipQRPost({
                                        artistCode: data.artistcode,
                                        baseURL: data.baseurl,
                                        quantity: data.quantity,
                                    })

        console.log("member qr result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Membership QRs added successfully")
            router.push("/member/qr")
        }            
        else
            alert(result.Message)
    }
    
    const artistCodeChanged = (artistCode) => {
        let domainName = process.env.IS_TEST == 'true' ? "https://ttd.anifie.com" : "https://td.anifie.com";

        switch(artistCode) {
            case 'IMARITONES':
                setValue('baseurl', domainName + "/imari-tones/");
                break;
            case 'ME':
                setValue('baseurl', domainName + "/notequal-me/");
                break;
            case '2I2':
                setValue('baseurl', domainName + "/2i2/");
                break;
            case 'UKKA':
                setValue('baseurl', domainName + "/ukka/");
                break;
            case 'DENISUSAFATE':
                setValue('baseurl', domainName + "/dennis-sarfate/");
                break;
            case 'TITLEMITEI':
                setValue('baseurl', domainName + "/taitorumitei/");
                break;
            case 'KASUMISOUTOSUTERA':
                setValue('baseurl', domainName + "/kastella/");
                break;
            case 'BABABABAMPI':
                setValue('baseurl', domainName + "/babababambi/");
                break;
            case 'STELLINASAYURI':
                setValue('baseurl', domainName + "/stellinasayuri/");
                break;
            default:
                throw new Error('Artist code not found')
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">NEW MEMBERSHIP QRs</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Artist Code</label>                
                            <select className="select select-bordered max-w-sm" 
                                    {...register("artistcode", {required: true, onChange: (e) => artistCodeChanged(e.target.value)})}>
                                <option value="IMARITONES">IMARITONES</option>
                                <option value="ME">ME</option>
                                <option value="2I2">2I2</option>
                                <option value="UKKA">UKKA</option>
                                <option value="DENISUSAFATE">DENISUSAFATE</option>
                                <option value="TITLEMITEI">TITLEMITEI</option>
                                <option value="KASUMISOUTOSUTERA">KASUMISOUTOSUTERA</option>
                                <option value="BABABABAMPI">BABABABAMPI</option>
                                <option value="STELLINASAYURI">STELLINASAYURI</option>
                            </select>
                            {errors.artistcode?.type === 'required' && <p className="text-red-500">Artist Code is required</p>}
                        </div>
                        <br/>
                        <div className="flex flex-col col-span-2">
                            <label>Base URL</label>
                            <input type="text" 
                                placeholder="Base URL" 
                                className="input input-bordered w-1/2 max-w-sm"
                                {...register("baseurl", {required: true})} />
                            {errors.baseurl?.type === 'required' && <p className="text-red-500">Base URL is required</p>}
                        </div>
                        <br/>
                        <div className="flex flex-col col-span-2">
                            <label>Quantity</label>
                            <input type="number" 
                                placeholder="Quantity" 
                                className="input input-bordered w-1/2 max-w-sm"
                                {...register("quantity", {required: true})} />
                            {errors.quantity?.type === 'required' && <p className="text-red-500">Quantity is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create QR(s)</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/member/qr")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default NewMemberQRs