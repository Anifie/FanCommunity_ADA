import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { issueStableCoinPost } from "../api";

const StableCoinIssue = () => {

    const {register, formState: {errors}, handleSubmit} = useForm()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {

    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await issueStableCoinPost({
                                        amount: data.amount
                                    })

        console.log("mintStaleCoin result", result)
        
        if(result.Success) {
            

            console.log('Stable coin issued successfully')

            mdLoading.current.close()

            router.push("/stablecoin/issue")
        } 
        else
            showFailed(result.Message)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ISSUE STABLE COIN</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Amount</label>
                            <input type="number" 
                                placeholder="Amount" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("amount", {required: true})} />
                            {errors.amount?.type === 'required' && <p className="text-red-500">amount is required</p>}
                        </div>
                    </div>
                    <br/>         
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Issue</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/stablecoin/issue")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default StableCoinIssue