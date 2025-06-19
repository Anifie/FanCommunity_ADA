import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { discordAnalyzerPost } from "../api";

const PrivateChannelAnalyzer = () => {

    const [subject, setSubject] = useState()
    const [content, setContent] = useState()
    const [status, setStatus] = useState()
    const [result, setResult] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        
    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Analyzing database")
        let lines = data.discordids.split('\n')
        console.log(lines);
        let result = await discordAnalyzerPost({
            "role": data.role,
            "discordIds": lines
        })

        console.log("analyze result", result)
        
        if(result.Success) {
            mdLoading.current.close()

            delete result.Data.missingDiscordUser;
            delete result.Data.missingDiscordUserWithWallet;
            setResult(result.Data);
            // showSuccess("Ticket created successfully")
            // router.push("/event/ticket")
        }            
        // else
        //     showFailed("Ticket created failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">PRIVATE CHANNEL ANALYZER</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Role</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("role", {required: false})}>
                                <option value="PALEBLUEDOT">PALEBLUEDOT</option>
                                <option value="METAGARAGE">METAGARAGE</option>
                                <option value="WALLET">WALLET</option>
                            </select>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Discord Ids</label>
                            <textarea {...register("discordids", {required: true})} rows={20}>
                            </textarea>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Analyze</button>
                    {/* <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/event/ticket")}>Cancel</button> */}
                </div>
            </form>
            <p>
                {result && <pre className="text-xs"><code>{JSON.stringify(result, null, 2)}</code></pre>}
            </p>
        </div>
    );
};

export default PrivateChannelAnalyzer