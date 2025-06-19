import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { avatarPositionUpdate, metaverseRoomGet } from "../api";

const MetaverseRoomEditPosition = () => {

    const [roomId, setRoomId] = useState()
    const [room, setRoom] = useState()
    const [playerId, setPlayerId] = useState()
    const [loading, setLoading] = useState(false)

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {roomidplayerid} = router.query
        setRoomId(roomidplayerid.split('_')[0])
        setPlayerId(roomidplayerid.split('_')[1])

    }, [])

    useEffect(() => {
      if(roomId && playerId) {
        getRoom()
      }
    }, [roomId, playerId])    

    const getRoom = async () => {
        setLoading(true)
        let roomResult = await metaverseRoomGet({roomId: roomId})
        console.log("roomResult", roomResult)
        if(roomResult.Success) {
            setLoading(false)
            setRoom(roomResult.Data.Room)
            let player = roomResult.Data.Members.find(x => x.profile.MemberId === playerId)
            console.log("player", player);
            setValue("position", player && player.position ? player.position : JSON.stringify({"posX":"0","posY":"0","posZ":"0","rotX":"0","rotY":"0","rotZ":"0"}))
        }
        setLoading(false)
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await avatarPositionUpdate({
                                        memberId: playerId,
                                        ...JSON.parse(data.position)
                                    })

        console.log("update position result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Position edited successfully")
            router.push("/metaverse/room/edit/" + roomId)
        }            
        else
            showFailed("Position edit failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT POSITION</h2>                        
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
                                {...register("roomid", {required: false})} />
                        </div>
                    </div>
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Member Id</label>
                            <input type="text" 
                                disabled 
                                value={playerId} 
                                placeholder="Player Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("playerid", {required: false})} />
                        </div>
                    </div>
                    <div className="flex flex-col col-span-2 mt-2">
                        <label>Position</label>
                        <input type="text" 
                            placeholder="Position" 
                            className="input input-bordered w-full max-w-[600px]"
                            {...register("position", {required: true})} />
                        {errors.maxusers?.type === 'required' && <p className="text-red-500">Position is required</p>}
                    </div>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Position</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/room/edit/" + roomId)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default MetaverseRoomEditPosition