import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { ticketPost } from "../api";

const TicketCreate = () => {

    const [subject, setSubject] = useState()
    const [content, setContent] = useState()
    const [status, setStatus] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        
    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await ticketPost({
                                        eventId: data.eventid,
                                        playerId: data.playerid,
                                        voucherCode: data.vouchercode,
                                        ticketPrice: data.ticketprice,
                                        ticketPriceCurrencyCode: data.ticketpricecurrencycode,
                                        paymentMethod: data.paymentmethod,
                                        status: data.status
                                    })

        console.log("create ticket result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Ticket created successfully")
            router.push("/event/ticket")
        }            
        else
            showFailed("Ticket created failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">CREATE TICKET</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Event Id <span className="text-red-500">*</span></label>
                            <input type="text" 
                                placeholder="Event Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("eventid", {required: true})} />
                            {errors.eventid?.type === 'required' && <p className="text-red-500">Event Id is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Player Id <span className="text-red-500">*</span></label>
                            <input type="text" 
                                placeholder="Player Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("playerid", {required: true})} />
                            {errors.playerid?.type === 'required' && <p className="text-red-500">Player Id is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Voucher Code</label>
                            <input type="text" 
                                placeholder="Voucher Code" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("vouchercode", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Ticket Price</label>
                            <input type="text" 
                                placeholder="Ticket Price" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("ticketprice", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Ticket Price Currency Code</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("ticketpricecurrencycode", {required: false})}>
                                <option value="">-</option>
                                <option value="JPY">JPY</option>
                                <option value="XRP">XRP</option>
                            </select>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Status</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("status", {required: true})}>
                                <option value="PAID">PAID</option>
                                <option value="PENDING_PAYMENT">PENDING PAYMENT</option>
                            </select>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Payment Method</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("paymentmethod", {required: false})}>
                                <option value="">-</option>
                                <option value="STRIPE">STRIPE</option>
                                <option value="XUMM">XUMM</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create Ticket</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/event/ticket")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default TicketCreate