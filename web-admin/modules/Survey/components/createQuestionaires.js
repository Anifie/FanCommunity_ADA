import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { surveyPost } from "../api";

const CreateSurvey = () => {

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

    const sleep = (ms) => {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await surveyPost({
                                        title: data.title,
                                        description: data.description,
                                        isOpen: data.isopen,
                                        questions: JSON.parse(data.questions)
                                    })

        console.log("surveyPost result", result)
        
        if(result.Success) {
            console.log('Survey posted successfully')
            showSuccess("Survey posted successfully");
            mdLoading.current.close()
            router.push("/survey/questionaires")
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
    
    const sampleQuestions = [
        {
            "index": 0,
            "text_en": "Test Question",
            "text_jp": "Test Question",
            "answers": [
                {
                    "index": 0,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 1,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 2,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 3,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                }
            ]
        },
        {
            "index": 1,
            "text_en": "Test Question",
            "text_jp": "Test Question",
            "answers": [
                {
                    "index": 0,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 1,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 2,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                },
                {
                    "index": 3,
                    "text_en": "Test Answer",
                    "text_jp": "Test Answer"
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW QUESTIONAIRE</h2>                        
                </div>
                <div className="p-4 w-full">
                    {/* <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>NFT Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    value={nftType} 
                                    {...register("nftType", {required: true, onChange: (e) => setNftType(e.target.value)})}>
                                <option value="CAR">CAR</option>
                                <option value="CHARACTER">CHARACTER</option>
                                <option value="MEMBERSHIP">MEMBERSHIP</option>
                            </select>
                            {errors.nftType?.type === 'required' && <p className="text-red-500">NFT Type is required</p>}
                        </div>
                    </div>
                    <br/> */}
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Title <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Title" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("title", {required: true})} />
                            {errors.title?.type === 'required' && <p className="text-red-500">Title is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Description</label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: false})} />
                            {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Is Open</label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("isopen", {required: true})}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            {errors.isopen?.type === 'required' && <p className="text-red-500">Is Open is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Questions (See sample questions JSON format at the right)</label>
                            <textarea {...register("questions", {required: true})} rows={40}>
                            </textarea>
                        </div>
                        <pre className="text-xs"><code>{JSON.stringify(sampleQuestions, null, 2)}</code></pre>
                    </div>
                    <br/>             
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/survey/questionaires")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateSurvey