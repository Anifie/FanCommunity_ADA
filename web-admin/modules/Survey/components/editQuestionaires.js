import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { surveyListingPost, surveyPut } from "../api";

const SurveyEdit = () => {

    const [surveyId, setSurveyId] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {surveyid} = router.query
        setSurveyId(surveyid)
        getSurvey(surveyid)

    }, [])

    const getSurvey = async (sid) => {
        let surveyResult = await surveyListingPost({surveyId: sid})
        console.log("surveyResult", surveyResult)
        if(surveyResult.Success) {
            setValue("title", surveyResult.Data[0].Title)
            setValue("description", surveyResult.Data[0].Description)
            setValue("questions", JSON.stringify(surveyResult.Data[0].Questions, null, 2))
            setValue("isopen", surveyResult.Data[0].IsOpen)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await surveyPut({
                                        surveyId: surveyId,
                                        title: data.title,
                                        description: data.description,
                                        isOpen: data.isopen === 'true',
                                        questions: data.questions
                                    })

        console.log("update survey result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Survey edited successfully")
            router.push("/survey/questionaires")
        }            
        else {
            mdLoading.current.close()
            showFailed("Survey edit failed with message: " + result.Message)
        }
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT SURVEY</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Survey Id</label>
                            <input type="text" 
                                disabled 
                                value={surveyId} 
                                placeholder="Survey Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("surveyid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Title <span className="text-red-500">*</span></label>
                            <input type="text" 
                                placeholder="Title" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("title", {required: true})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Description</label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Is Open</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isopen", {required: true})}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Questions</label>
                            <textarea {...register("questions", {required: true})} rows={40}>
                            </textarea>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Survey</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/survey/questionaires")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default SurveyEdit