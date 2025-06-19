import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { announcementGet, announcementPut } from "../api";

const AnnouncementEdit = () => {

    const [announcementId, setAnnouncementId] = useState()
    const [subject, setSubject] = useState()
    const [content, setContent] = useState()
    const [status, setStatus] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {announcementid} = router.query
        setAnnouncementId(announcementid)
        getAnnouncement(announcementid)

    }, [])

    const getAnnouncement = async (aid) => {
        let announcementResult = await announcementGet(aid)
        console.log("announcementResult", announcementResult)
        if(announcementResult.Success) {
            setSubject(announcementResult.Data.Announcements[0].Subject)
            setValue("subject", announcementResult.Data.Announcements[0].Subject)

            setContent(announcementResult.Data.Announcements[0].Content)
            setValue("content", announcementResult.Data.Announcements[0].Content)

            setStatus(announcementResult.Data.Announcements[0].Status)
            setValue("status", announcementResult.Data.Announcements[0].Status)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await announcementPut({
                                        announcementId: announcementId,
                                        subject: data.subject,
                                        content: data.content,
                                        status: data.status
                                    })

        console.log("update announcement result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Announcement edited successfully")
            router.push("/metaverse/announcement")
        }            
        else
            showFailed("Announcement edit failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT ANNOUNCEMENT</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Announcement Id</label>
                            <input type="text" 
                                disabled 
                                value={announcementId} 
                                placeholder="Announcement Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("announcementId", {required: false})} />
                            {/* {errors.collectionId?.type === 'required' && <p className="text-red-500">Collection Id is required</p>} */}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Subject</label>
                            <input type="text" 
                                value={subject} 
                                placeholder="Subject" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("subject", {required: true, onChange: (e) => setSubject(e.target.value)})} />
                            {errors.subject?.type === 'required' && <p className="text-red-500">Subject is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Content</label>
                            <textarea className="textarea textarea-bordered max-w-lg" cols="100" 
                                    value={content} 
                                    {...register("content", {required: true, onChange : (e) => setContent(e.target.value)})} />
                            {errors.content?.type === 'required' && <p className="text-red-500">Content is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Status</label>
                            <select className="select select-bordered w-fit" 
                                    value={status} 
                                    {...register("status", {required: true, onChange : (e) => setStatus(e.target.value)})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Announcement</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/announcement")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AnnouncementEdit