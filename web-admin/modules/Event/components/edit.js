import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { eventGet, eventPost, eventPut, eventListing } from "../api";
import useStateCallback from "../../../common/hooks/useStateCallback";

const EventEdit = () => {

    const [eventId, setEventId] = useState()
    const [event, setEvent] = useState()
    const [loading, setLoading] = useState(false)

    const [posterURL, setPosterURL] = useState()
    const [posterFile, setPosterFile] = useStateCallback()
    const [posterBlobURL, setPosterBlobURL] = useState()
    const [posterFileReaderResult, setPosterFileReaderResult] = useState()
    const posterFileRef = useRef()
    const [posterFileBase64, setPosterFileBase64] = useState();

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    let sampleSettings = {
        "CHANNEL_ID_LEFT_SCREEN": "",
    };

    useEffect(() => {
        
        const {eventid: eventid} = router.query
        setEventId(eventid)
        getEvent(eventid)

    }, [])

    const getEvent = async (eventId) => {
        setLoading(true)

        let eventResult = await eventGet({eventId: eventId})
        console.log("roomResult", eventResult)
        if(eventResult.Success) {

            setLoading(false)
            setEvent(eventResult.Data.Event)
            
            setValue("eventid", eventResult.Data.Event.EventId)
            setValue("title", eventResult.Data.Event.Title)
            setValue("artistid", eventResult.Data.Event.ArtistId)
            setValue("starttime", eventResult.Data.Event.StartTime)
            setValue("endtime", eventResult.Data.Event.EndTime)
            setValue("videourl", eventResult.Data.Event.VideoURL)
            setValue("eventtype", eventResult.Data.Event.EventType)
            setValue("botsspawnspeed", eventResult.Data.Event.BotsSpawnSpeed)
            setValue("maxbotsperroom", eventResult.Data.Event.MaxBotsPerRoom)
            setValue("currency", eventResult.Data.Event.TicketPriceCurrencyCode)
            setValue("ticketprice", eventResult.Data.Event.TicketPrice)
            setValue("status", eventResult.Data.Event.Status)
            setValue("settings", typeof eventResult.Data.Event.Settings == 'string' ? eventResult.Data.Event.Settings : JSON.stringify(eventResult.Data.Event.Settings, null, 2))
            

            // setMaxUsers(eventResult.Data.Room.MaxUsers)
            // setValue("maxusers", eventResult.Data.Room.MaxUsers)

            // setUsersCount(eventResult.Data.Room.UsersCount)

            // setIsVoiceChatEnabled(eventResult.Data.Room.IsVoiceChatEnabled)
            // setValue("isvoicechatenabled", eventResult.Data.Room.IsVoiceChatEnabled)

            // setStatus(eventResult.Data.Room.Status)
            // setValue("status", eventResult.Data.Room.Status)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await eventPut({
                                        eventId: eventId,
                                        title: data.title,
                                        startTime: data.starttime,
                                        endTime: data.endtime,
                                        videoURL: data.videourl,
                                        artistId: data.artistid,
                                        botsSpawnSpeed: data.botsspawnspeed,
                                        maxBotsPerRoom: data.maxbotsperroom,
                                        ticketCurrencyCode: data.currency,
                                        ticketPrice: data.ticketprice,
                                        eventType: data.eventtype,
                                        status: data.status,
                                        imageBase64: posterFileBase64,
                                        settings: data.settings ? JSON.parse(data.settings) : '',
                                    })

        console.log("update event result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Event edited successfully")
            router.push("/event/events")
        }            
        else
            showFailed("Event edit failed with message: " + result.Message)
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
            setPosterFile(null)
            posterFileRef.current = null
            return false
        }
        else {
            console.log("file: " + filePath)
            setPosterURL(filePath)
        }

        let fileSize = event.target.files[0].size / 1024 / 1024
        if(fileSize > 30) {
            showFailed('File size exceeeded 30 MB')
            setPosterFile(null)
            posterFileRef.current = null
            return false
        }

        const file = event.target.files[0];
        const base64 = await convertBase64(file);
        setPosterFileBase64(base64);
        console.log("base64", base64);
    };
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT EVENT</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Event Id</label>
                            <input type="text" 
                                disabled
                                placeholder="Event Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("eventid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <div className="flex flex-row col-span-2 gap-2">
                                <div className="flex flex-col col-span-2">
                                    <label>Title</label>
                                    <input type="text" 
                                        placeholder="Title" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("title", {required: true})} />
                                    {errors.title?.type === 'required' && <p className="text-red-500">Title is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2">
                                    <label>Artist Id</label>
                                    <input type="text" 
                                        placeholder="Artist Id" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("artistid", {required: false})} />
                                    {errors.artistid?.type === 'required' && <p className="text-red-500">Artist Id is required</p>}
                                </div>
                            </div>                        
                            <div className="flex flex-row col-span-2 gap-2">
                                <div className="flex flex-col col-span-2">
                                    <label>Start Time (UTC)</label>
                                    <input type="text" 
                                        placeholder="Start Time" 
                                        className="input input-bordered w-full max-w-[200px]"
                                        {...register("starttime", {required: true})} />
                                    {errors.starttime?.type === 'required' && <p className="text-red-500">Start Time is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2">
                                    <label>End Time (UTC)</label>
                                    <input type="text" 
                                        placeholder="End Time" 
                                        className="input input-bordered w-full max-w-[200px]"
                                        {...register("endtime", {required: true})} />
                                    {errors.endtime?.type === 'required' && <p className="text-red-500">End Time is required</p>}
                                </div>
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label>Video URL</label>
                                <input type="text" 
                                    placeholder="Video URL" 
                                    className="input input-bordered w-full max-w-[700px]"
                                    {...register("videourl", {required: true})} />
                                {errors.videourl?.type === 'required' && <p className="text-red-500">Video URL is required</p>}
                            </div>
                            <div className="flex flex-row col-span-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Currency</label>
                                    <select className="select select-bordered w-fit" 
                                            {...register("currency", {required: true})}>
                                        <option value="JPY">JPY</option>
                                    </select>
                                    {errors.currency?.type === 'required' && <p className="text-red-500">Currency is required</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label>Ticket Price</label>
                                    <input type="text" 
                                        placeholder="Ticket Price" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("ticketprice", {required: true})} />
                                    {errors.ticketprice?.type === 'required' && <p className="text-red-500">Ticket Price is required</p>}
                                </div>
                            </div>
                            <div className="flex flex-row col-span-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Bots Spawn Speed</label>
                                    <input type="text" 
                                        placeholder="BotsSpawnSpeed" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("botsspawnspeed", {required: true})} />
                                    {errors.botsspawnspeed?.type === 'required' && <p className="text-red-500">BotsSpawnSpeed is required</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label>Max Bots Per Room</label>
                                    <input type="text" 
                                        placeholder="Max Bots Per Room" 
                                        className="input input-bordered w-full max-w-[300px]"
                                        {...register("maxbotsperroom", {required: true})} />
                                    {errors.maxbotsperroom?.type === 'required' && <p className="text-red-500">Max Bots Per Room is required</p>}
                                </div>
                            </div>
                            <div className="flex col-span-2 gap-2">
                                <div className="flex flex-col">
                                    <label>Event Type</label>
                                    <select className="select select-bordered w-fit" 
                                            {...register("eventtype", {required: true})}>
                                        <option value="CONCERT">CONCERT</option>
                                    </select>
                                    {errors.eventtype?.type === 'required' && <p className="text-red-500">Event Type is required</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered w-fit" 
                                            {...register("status", {required: true})}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                    {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    <label>Settings</label>
                                    <textarea {...register("settings", {required: false})} rows={10} className="textarea textarea-bordered w-full max-w-[700px]">
                                    </textarea>
                                    {errors.settings?.type === 'required' && <p className="text-red-500">Settings is required</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label>Poster Image</label>
                            <div className="relative overflow-hidden btn bg-slate-600">
                                <input type="file"
                                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                                        ref={posterFileRef}
                                        accept=".gif,.jpeg,.jpg,.png,.txt,.mp3,.mp4,.json,.txt"
                                        {...register("poster", {required: false, onChange: (e) => uploadImage(e)})}/>
                                Choose File
                            </div>
                            {errors.poster?.type === 'required' && <p className="text-red-500">Poster image file is required</p>}
                            {posterFileBase64 && <img src={posterFileBase64}></img>}
                            {!posterFileBase64 && event && event.ImageURL && <img src={event.ImageURL}></img>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Event</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/event/events")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EventEdit