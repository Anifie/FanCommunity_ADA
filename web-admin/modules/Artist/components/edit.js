import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { artistListingPost, artistPut } from "../api";
import useStateCallback from "../../../common/hooks/useStateCallback";

const ArtistEdit = () => {

    const [artistCode, setArtistCode] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        // getEnums()
        const {artistcode} = router.query
        setArtistCode(artistcode)
    }, [])

    useEffect(() => {
        if(artistCode)
            getArtist(artistCode)
    }, [artistCode])
    
    const getArtist = async (sid) => {
        let artistResult = await artistListingPost({artistCode: sid, pageSize: 1})
        console.log("artistResult", artistResult)
        if(artistResult.Success) {
            let _artist = artistResult.Data.artist[0];
            setValue("artistname", _artist.ArtistName)
            setValue("videourls", _artist.VideoURLs)
            setValue("configs", _artist.Configs)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await artistPut({
                                        artistCode: artistCode,
                                        artistName: data.artistname,
                                        videoURLs: data.videourls ? JSON.parse(data.videourls) : undefined,
                                        configs: data.configs ? JSON.parse(data.configs) : undefined
                                    })

        console.log("update artist result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Artist edited successfully")
            router.push("/artist")
        }            
        else {
            mdLoading.current.close()
            showFailed("Artist edit failed with message: " + result.Message)
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT ARTIST</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Artist Code</label>
                            <input type="text" 
                                disabled 
                                value={artistCode} 
                                placeholder="Artist Code" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artistcode", {required: false})} />
                        </div>
                    </div>                          
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Artist Name</label>
                            <input type="text" 
                                placeholder="Artist Name" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artistname", {required: false})} />
                            {/* {errors.artistname?.type === 'required' && <p className="text-red-500">Name is required</p>} */}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Video URLs</label>
                            <input type="text" 
                                placeholder="Video URLs" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("videourls", {required: false})} />
                            {/* {errors.videourls?.type === 'required' && <p className="text-red-500">Description is required</p>} */}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Configs</label>
                            <input type="text" 
                                placeholder="Configs" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("configs", {required: false})} />
                            {/* {errors.videourls?.type === 'required' && <p className="text-red-500">Description is required</p>} */}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">UPDATE</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/artist")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ArtistEdit