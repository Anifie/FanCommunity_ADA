import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { proposalPost } from "../api";

const CreateProposal = () => {


    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)


    useEffect(() => {
        setValue("startdate", new Date().toISOString())
        setValue("enddate", new Date().toISOString())
    }, [])

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await proposalPost({
                                        title: data.title,
                                        description: data.description,
                                        isOpen: data.isopen,
                                        startDate: data.startdate,
                                        endDate: data.enddate,
                                        contractAddress: data.contractaddress,
                                        tokenIds: data.tokenids,
                                        artworkIds: data.artworkids
                                    })

        console.log("proposalPost result", result)
        
        if(result.Success) {
            console.log('Proposal posted successfully')
            showSuccess("Proposal posted successfully");
            mdLoading.current.close()
            router.push("/vote/proposals")
        }
        else
            showFailed(result.Message)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">ADD NEW VOTE PROPOSAL</h2>                        
                </div>
                <div className="p-4 w-full">
                    {/* <div className="">
                        <div className="flex flex-col">
                            <label>NFT Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    value={nftType} 
                                    {...register("nftType", {required: true, onChange: (e) => setNftType(e.target.value)})}>
                                <option value="CAR">CAR</option>
                                <option value="CHARACTER">CHARACTER</option>
                                <option value="MEMBERSHIP">MEMBERSHIP</option>
                            </select>
                            {errors.nftType?.type === 'required' && <p className="text-red-500">NFT Type is required</p>}
                        </div>
                    </div>
                    <br/> */}
                    <div className="">
                        <div className="flex flex-col">
                            <label>Title <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Title" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("title", {required: true})} />
                            {errors.title?.type === 'required' && <p className="text-red-500">Title is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Description</label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: false})} />
                            {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Start Date</label>
                            <input type="text" 
                                placeholder="Start Date" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("startdate", {required: true})} />
                            {errors.isopen?.type === 'startdate' && <p className="text-red-500">Start Date is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>End Date</label>
                            <input type="text" 
                                placeholder="End Date"
                                className="input input-bordered w-full max-w-lg"
                                {...register("enddate", {required: true})} />
                            {errors.isopen?.type === 'enddate' && <p className="text-red-500">End Date is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Is Open</label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("isopen", {required: true})}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            {errors.isopen?.type === 'required' && <p className="text-red-500">Is Open is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Contract Address</label>
                            <select className="select select-bordered max-w-sm" 
                                    {...register("contractaddress", {required: false})}>
                                <option value="0xfEe39A71B5e8A5bd0C2aAA91d9248Ada863F88D3">Car (0xfEe39A71B5e8A5bd0C2aAA91d9248Ada863F88D3)</option>
                                <option value="0x0ACd7edfc770122E46b45F9A0D2A8304Aee5cA8C">Character (0x0ACd7edfc770122E46b45F9A0D2A8304Aee5cA8C)</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Token Ids</label>
                            <input type="text" 
                                placeholder="Token Ids" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("tokenids", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="">
                        <div className="flex flex-col">
                            <label>Artwork Ids</label>
                            <input type="text" 
                                placeholder="Artwork Ids" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artworkids", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/vote/proposals")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateProposal