import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { metaverseRoomCheckIn, metaverseRoomCheckOut, metaverseRoomGet, metaverseRoomPut, eventGet } from "../api";
import { de, th } from "date-fns/locale";
import { set } from "date-fns";

const MetaverseRoomEdit = () => {

    const [roomId, setRoomId] = useState()
    // const [maxUsers, setMaxUsers] = useState()
    // const [usersCount, setUsersCount] = useState()
    // const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(true)
    // const [status, setStatus] = useState()
    const [checkInMemberId, setCheckInMemberId] = useState()
    const [room, setRoom] = useState()
    const [players, setPlayers] = useState()
    const [loading, setLoading] = useState(false)

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {roomid} = router.query
        setRoomId(roomid)
        getRoom(roomid)

    }, [])

    const getRoom = async (roomId) => {
        setLoading(true)
        // let eventResult = await eventGet()
        // if(!eventResult.Success) {
        //     showFailed("Failed to get active event")
        // }

        let roomResult = await metaverseRoomGet({roomId: roomId})
        console.log("roomResult", roomResult)
        if(roomResult.Success) {

            setLoading(false)
            setRoom(roomResult.Data.Room)
            setPlayers(roomResult.Data.Members)
            
            // setMaxUsers(roomResult.Data.Room.MaxUsers)
            setValue("maxusers", roomResult.Data.Room.MaxUsers)

            // setUsersCount(roomResult.Data.Room.UsersCount)
            // setValue("userscount", roomResult.Data.Room.UsersCount)

            // setIsVoiceChatEnabled(roomResult.Data.Room.IsVoiceChatEnabled)
            setValue("isvoicechatenabled", roomResult.Data.Room.IsVoiceChatEnabled)

            // setStatus(roomResult.Data.Room.Status)
            setValue("status", roomResult.Data.Room.Status)

            setValue("roomindex", roomResult.Data.Room.RoomIndex)

            setValue("name", roomResult.Data.Room.Name)
            setValue("description", roomResult.Data.Room.Description)
            setValue("thumbnailurl", roomResult.Data.Room.ThumbnailURL)
            setValue("roomtype", roomResult.Data.Room.RoomType)
            setValue("roomdata", roomResult.Data.Room.RoomData)
        }

        setLoading(false)
    }

    const checkInRoom = async (memberId) => {
        if(!memberId) {            
            return
        }

        mdLoading.current.show("Checking in")

        let checkInResult = await metaverseRoomCheckIn({eventId: room.EventId, roomId: roomId, memberId: memberId})
        console.log("checkInResult", checkInResult)
        mdLoading.current.close()
        if(checkInResult.Success) {
            showSuccess("Checkin successfully")
            await getRoom(roomId)            
        }
        else
            showFailed("Checkin failed")
    }
    
    const checkOutRoom = async (memberId) => {
        mdLoading.current.show("Checking out")

        let checkOutResult = await metaverseRoomCheckOut({eventId: room.EventId, memberId: memberId})
        console.log("checkOutResult", checkOutResult)
        mdLoading.current.close()
        if(checkOutResult.Success) {
            showSuccess("Checkout successfully")
            await getRoom(roomId)            
        }
        else 
            showFailed("Checkout failed")
    }

    const updatePosition = async (memberId) => {
        mdLoading.current.show("Updating position")

        let checkOutResult = await metaverseRoomCheckOut({eventId: room.EventId, memberId: memberId})
        console.log("checkOutResult", checkOutResult)
        mdLoading.current.close()
        if(checkOutResult.Success) {
            showSuccess("Checkout successfully")
            await getRoom(roomId)            
        }
        else 
            showFailed("Checkout failed")
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await metaverseRoomPut({
                                        roomId: roomId,
                                        maxUsers: data.maxusers,
                                        isVoiceChatEnabled: data.isvoicechatenabled,
                                        roomIndex: data.roomindex,
                                        status: data.status,
                                        name: data.name,
                                        description: data.description,
                                        thumbnailURL: data.thumbnailurl,
                                        roomType: data.roomtype,
                                        roomData: data.roomdata
                                    })

        console.log("update room result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Room edited successfully")
            router.push("/metaverse/room")
        }            
        else
            showFailed("Room edit failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT METAVERSE ROOM</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Room Id</label>
                            <input type="text" 
                                disabled 
                                value={roomId} 
                                placeholder="Room Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("roomId", {required: false})} />
                            {/* {errors.collectionId?.type === 'required' && <p className="text-red-500">Collection Id is required</p>} */}
                        </div>
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
                    <div className="flex flex-col col-span-2 mt-2">
                            <label>Max Users</label>
                            <input type="number" 
                                placeholder="Max Users" 
                                className="input input-bordered w-full max-w-[150px]"
                                {...register("maxusers", {required: true})} />
                            {errors.maxusers?.type === 'required' && <p className="text-red-500">Max Users is required</p>}
                        </div>
                        {/* <div className="flex flex-col col-span-2 mt-2">
                            <label>Current Users</label>
                            <input type="text" 
                                disabled
                                placeholder="Users count" 
                                className="input input-bordered w-full max-w-[150px]"
                                {...register("userscount", {required: false})}/>
                        </div> */}
                        <div className="flex flex-col mt-2">
                            <label>Room Index</label>
                            <input type="number" 
                                placeholder="Max Users" 
                                className="input input-bordered w-full max-w-[150px]"
                                {...register("roomindex", {required: true})} />
                            {errors.roomindex?.type === 'required' && <p className="text-red-500">Room Index is required</p>}
                        </div>
                        <div className="flex flex-col mt-2">
                            <label>Voice Chat</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isvoicechatenabled", {required: true})}>
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                            {errors.isvoicechatenabled?.type === 'required' && <p className="text-red-500">IsVoiceChatEnabled is required</p>}
                        </div>
                        <div className="flex flex-col mt-2">
                            <label>Status</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("status", {required: true})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                        </div>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Metaverse Room</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/room")}>Cancel</button>
                </div>
            </form>
            <br/>
            <br/>
            <div className="flex items-center w-full">
                <h2 className="ml-3 text-sm font-bold">CURRENT ROOM AUDIENCE</h2>
                <div className="flex items-center justify-between w-full mr-10">
                    <button className="ml-10 btn btn-secondary btn-sm" onClick={async() => await getRoom(roomId)}>Refresh</button>
                    <div className="flex items-center">
                        <button className="ml-10 btn btn-secondary btn-sm" onClick={async() => await checkInRoom(checkInMemberId)}>Check In Member</button>
                        <span className="ml-2">:</span>
                        <input type="text" 
                                        value={checkInMemberId} 
                                        placeholder="Check In Member Id" 
                                        className="ml-5 input input-bordered w-[300px]" onChange={(e) => setCheckInMemberId(e.target.value)}/>
                    </div>
                </div>                
            </div>
            <br/>
            <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                    <tr>
                        <th>#</th>
                        <th>MEMBER PROFILE</th>
                        <th>AVATAR</th>
                        <th>POSITION</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        players && players.length > 0
                        ?
                        players
                                .map(
                                    (x, index) => (
                                        <tr key={`room_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                            <td>
                                                {index + 1}
                                            </td>
                                            <td>
                                                {x.profile && JSON.stringify(x.profile).substring(0, 50)}
                                            </td>
                                            <td>
                                                {x.avatar && x.avatar.substring(0, 50)}
                                            </td>
                                            <td>
                                                {x.position && x.position.substring(0, 50)}
                                            </td>
                                            <td>
                                                <div className="dropdown dropdown-down">
                                                    <label tabIndex="0" className="btn btn-sm m-1">
                                                        <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                        &nbsp;
                                                        Manage
                                                    </label>
                                                    <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                        <li>
                                                            <a onClick={() => router.push("/metaverse/room/editposition/" + roomId + "_" + x.profile.MemberId)}>Edit Position</a>
                                                        </li>
                                                        <li>
                                                            <a onClick={async() => await checkOutRoom(x.profile.MemberId)}>Check Out</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                        : <tr>
                            <td colSpan={5} className="text-center">
                                {
                                    loading
                                        ?   <span className="flex justify-center">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>
                                        :   <span>No Result</span>
                                }
                            </td>
                        </tr>
                    }                         
                </tbody>
            </table>
        </div>
    );
};

export default MetaverseRoomEdit