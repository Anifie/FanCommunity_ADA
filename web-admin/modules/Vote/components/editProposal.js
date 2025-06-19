import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { proposalListingPost, proposalPut } from "../api";

const ProposalEdit = () => {

    const [proposalId, setProposalId] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {
        
        const {proposalid} = router.query
        setProposalId(proposalid)
        getProposal(proposalid)

    }, [])

    const getProposal = async (pid) => {
        let proposalResult = await proposalListingPost({voteProposalId: pid})
        console.log("proposalResult", proposalResult)
        if(proposalResult.Success) {
            setValue("title", proposalResult.Data[0].Title)
            setValue("description", proposalResult.Data[0].Description)
            setValue("startdate", proposalResult.Data[0].StartDate)
            setValue("enddate", proposalResult.Data[0].EndDate)
            setValue("isopen", proposalResult.Data[0].IsOpen)
            setValue("contractaddress", proposalResult.Data[0].ContractAddress)
            setValue("tokenids", proposalResult.Data[0].TokenIds)
            setValue("artworkids", proposalResult.Data[0].ArtworkIds)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await proposalPut({
                                        voteProposalId: proposalId,
                                        title: data.title,
                                        description: data.description,
                                        isOpen: data.isopen === 'true',
                                        startDate: data.startdate,
                                        endDate: data.enddate,
                                        contractAddress: data.contractaddress,
                                        tokenIds: data.tokenids,
                                        artworkIds: data.artworkids
                                    })

        console.log("update proposal result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Proposal edited successfully")
            router.push("/vote/proposals")
        }            
        else {
            mdLoading.current.close()
            showFailed("Proposal edit failed with message: " + result.Message)
        }
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT VOTE PROPOSAL</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="form-control">
                        <div className="flex flex-col">
                            <label>Vote Proposal Id</label>
                            <input type="text" 
                                disabled 
                                value={proposalId} 
                                placeholder="Vote Proposal Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("voteproposalid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Title <span className="text-red-500">*</span></label>
                            <input type="text" 
                                placeholder="Title" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("title", {required: true})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Description</label>
                            <input type="text" 
                                placeholder="Description" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("description", {required: false})} />
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Is Open</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("isopen", {required: true})}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
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
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Proposal</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/vote/proposals")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ProposalEdit