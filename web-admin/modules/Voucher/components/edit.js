import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { voucherGet, voucherPut } from "../api";

const VoucherEdit = () => {

    const [voucherId, setVoucherId] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {voucherid} = router.query
        setVoucherId(voucherid)
        getVoucher(voucherid)

    }, [])

    const getVoucher = async (aid) => {
        let voucherResult = await voucherGet({voucherId: aid})
        console.log("voucherResult", voucherResult)
        if(voucherResult.Success) {
            setValue("eventid", voucherResult.Data.EventId)
            setValue("playerid", voucherResult.Data.PlayerId)
            setValue("vouchercode", voucherResult.Data.VoucherCode)
            setValue("isavailable", voucherResult.Data.IsAvailable ? 'true' : 'false')
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await voucherPut({
                                        voucherId: voucherId,
                                        playerId: data.playerid,
                                        isAvailable: data.isavailable === 'true'
                                    })

        console.log("update voucher result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Voucher edited successfully")
            router.push("/event/voucher")
        }            
        else
            showFailed("Voucher edit failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT VOUCHER</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Voucher Id</label>
                            <input type="text" 
                                disabled 
                                value={voucherId} 
                                placeholder="Voucher Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("voucherid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Event Id <span className="text-red-500">*</span></label>
                            <input type="text" 
                                disabled
                                placeholder="Event Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("eventid", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Voucher Code <span className="text-red-500">*</span></label>
                            <input type="text" 
                                disabled
                                placeholder="Voucher Code" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("vouchercode", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Is Available</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isavailable", {required: true})}>
                                <option value="true">AVAILABLE</option>
                                <option value="false">NOT AVAILABLE</option>
                            </select>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Player Id</label>
                            <input type="text" 
                                placeholder="Player Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("playerid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Voucher</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/event/voucher")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default VoucherEdit