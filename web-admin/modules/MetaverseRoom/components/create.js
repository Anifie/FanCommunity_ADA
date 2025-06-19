import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { metaverseRoomGet, metaverseRoomPut, metaverseRoomPost, eventGet } from "../api";

const MetaverseRoomCreate = () => {

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {

    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await metaverseRoomPost({
                                        eventId: data.eventid,
                                        maxUsers: data.maxusers,
                                        status: data.status,
                                        roomIndex: data.roomindex,
                                        isVoiceChatEnabled: data.isvoicechatenabled,
                                        name: data.name,
                                        description: data.description,
                                        thumbnailURL: data.thumbnailurl,
                                        roomType: data.roomtype,
                                        roomData: data.roomdata
                                    })

        console.log("create metaverse room result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Metaverse Room created successfully")
            router.push("/metaverse/room")
        }            
        else
            showFailed("Metaverse Room created failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">CREATE METAVERSE ROOM</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Event Id</label>
                            <input type="text" 
                                placeholder="Event Id" 
                                className="input input-bordered w-full max-w-[300px]"
                                {...register("eventid", {required: true})} />
                            {errors.eventid?.type === 'required' && <p className="text-red-500">Event Id is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Name</label>
                            <input type="text" 
                                placeholder="Name" 
                                className="input input-bordered w-full max-w-[300px]"
                                {...register("name", {required: false})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Description</label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-[300px]"
                                {...register("description", {required: false})} />
                            {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Thumbnail URL</label>
                            <input type="text" 
                                placeholder="Thumbnail URL" 
                                className="input input-bordered w-full max-w-[300px]"
                                {...register("thumbnailurl", {required: false})} />
                            {errors.thumbnailurl?.type === 'required' && <p className="text-red-500">Thumbnail URL is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Room Type</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("roomtype", {required: false})}>
                                <option value="CHURCH">Church</option>
                                <option value="JAZZ_CLUB">Jazz Club</option>
                                <option value="CONCERT_HALL">Concert Hall</option>
                            </select>
                            {errors.roomtype?.type === 'required' && <p className="text-red-500">Room Type is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Room Data</label>
                            <input type="text" 
                                placeholder="Room Data" 
                                className="input input-bordered w-full max-w-[300px]"
                                {...register("roomdata", {required: false})} />
                            {errors.roomdata?.type === 'required' && <p className="text-red-500">Room Data is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Max Users</label>
                            <input type="number" 
                                placeholder="Max Users" 
                                className="input input-bordered w-full max-w-[150px]"
                                {...register("maxusers", {required: true})} />
                            {errors.maxusers?.type === 'required' && <p className="text-red-500">Max Users is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Room Index</label>
                            <input type="number" 
                                placeholder="Room Index" 
                                className="input input-bordered w-full max-w-[150px]"
                                {...register("roomindex", {required: true})} />
                            {errors.roomindex?.type === 'required' && <p className="text-red-500">Room Index is required</p>}
                        </div>
                        <div className="flex flex-col">
                            <label>Voice Chat</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isvoicechatenabled", {required: true})}>
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                            {errors.isvoicechatenabled?.type === 'required' && <p className="text-red-500">IsVoiceChatEnabled is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Status</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("status", {required: true})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create Metaverse Room</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/room")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default MetaverseRoomCreate