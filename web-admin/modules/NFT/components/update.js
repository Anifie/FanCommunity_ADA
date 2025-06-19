import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { assetGet, queuePost} from "../api";

const NFTUpdate = () => {

    const [tokenId, setTokenId] = useState('')
    const [nftType, setNftType] = useState()
    const [artistCode, setArtistCode] = useState()

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    useEffect(() => {
        //setValue('metadata', JSON.stringify(sampleMetadata, null, 2))
    }, [])

    useEffect(() => {
        // if(nftType === 'STORE_FAN')
        //     setForSale('Y');
        // else
        //     setForSale('N');
    }, [nftType])

    useEffect(() => {

    }, [])

    // useEffect(() => {
    //     getMemberStores()
    // }, [])

    const sleep = (ms) => {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await queuePost({
                                        nftType: data.nfttype,
                                        tokenId: data.tokenid,
                                        artworkId: data.artworkid,
                                        artworkId2: data.artworkidv2,
                                        metadata: data.metadata,
                                        memberId: data.memberid,
                                        queueType: 'UPDATE_QUEUE',
                                        artistCode: data.artistcode
                                    })

        console.log("queuePost result", result)
        
        if(result.Success) {
            
            console.log('Queue item posted successfully')

            mdLoading.current.close()

            setValue("artworkid", "");
            setValue("artworkidv2", "");
            setValue("tokenid", "");
            setValue("metadata", "");
        }
        else {
            mdLoading.current.close()
            showFailed(result.Message)
        }
    }

    const loadOriginalMetadata = async (_tokenId, artistCode) => {
        let contract;
        switch(nftType) {
            // case 'ART':
            //     contract = process.env.CONTRACT_ADDRESS_METAVERSE;
            //     break;
            case 'CHATDATA':
                if(artistCode == 'IMARITONES') {
                    contract = process.env.CONTRACT_ADDRESS_CHATDATA;
                }
                else if (artistCode == 'STELLINASAYURI') {
                    contract = process.env.CONTRACT_ADDRESS_CHATDATA_SS;
                }
                else {
                    throw new Error ('Invalid artist code ' + artistCode)
                }
                break;
            case 'SUPERCHAT':
                if(artistCode == 'IMARITONES') {
                    contract = process.env.CONTRACT_ADDRESS_SUPERCHAT;
                }
                else if (artistCode == 'STELLINASAYURI') {
                    contract = process.env.CONTRACT_ADDRESS_SUPERCHAT_SS;
                }
                else {
                    throw new Error ('Invalid artist code ' + artistCode)
                }
                break;
            case 'MEMBER':
                if(artistCode == 'IMARITONES') {
                    contract = process.env.CONTRACT_ADDRESS_DIGITAL_ID;
                }
                else if (artistCode == 'STELLINASAYURI') {
                    contract = process.env.CONTRACT_ADDRESS_DIGITAL_ID_SS;
                }
                else {
                    throw new Error ('Invalid artist code ' + artistCode)
                }
                break;
        }
        let assetFound = await assetGet({
            contractAddress: contract,
            tokenId: _tokenId,
            status: "NOTFORSALE"
        });

        setValue('memberid', assetFound.Data.Owner.UserId)
        setValue('metadata', JSON.stringify(JSON.parse(assetFound.Data.Metadata), null, 2))
    }
    
    const sampleMetadata =  {
        "name": "Membership:9461f7f711ee1ad802cbc29484505002",
        //"image": "https://arweave.net/Vj9DKP_pr-zQZyKHpXdqxvYXzHkUufWiQCQl2w3RBxc",
        "description": "Membership:9461f7f711ee1ad802cbc29484505002",
        "publisher": "ABC Co. Ltd.",
        "attributes": [
          {
            "trait_type": "Community",
            "value": "PaleBlueDot."
          },
          {
            "trait_type": "ID",
            "value": "1"
          },
          {
            "trait_type": "Rarity",
            "value": "Common"
          },
          {
            "trait_type": "Title",
            "value": "Innovator"
          },
          {
            "trait_type": "Rank",
            "value": "Bronze"
          }
        ]
      }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">UPDATE NFT</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>NFT Type <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    value={nftType} 
                                    {...register("nfttype", {required: true, onChange: (e) => setNftType(e.target.value)})}>
                                {/* <option value="ART">ART</option> */}
                                <option value="CHATDATA">CHATDATA</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="SUPERCHAT">SUPERCHAT</option>
                            </select>
                            {errors.nfttype?.type === 'required' && <p className="text-red-500">NFT Type is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork Id</label>
                            <input type="text"
                                placeholder="Artwork Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artworkid", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Artwork Id V2</label>
                            <input type="text"
                                placeholder="Artwork Id V2" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("artworkidv2", {required: false})} />
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Token Id <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                value={tokenId} 
                                placeholder="Token Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("tokenid", {required: true, onChange: (e) => setTokenId(e.target.value)})} />
                            {errors.memberid?.type === 'required' && <p className="text-red-500">Token Id is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Artist Code <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <select className="select select-bordered max-w-sm" 
                                    value={artistCode} 
                                    {...register("artistcode", {required: true, onChange: (e) => setArtistCode(e.target.value)})}>
                                <option value="IMARITONES">IMARITONES</option>
                                <option value="STELLINASAYURI">STELLINASAYURI</option>
                            </select>
                            {errors.artistcode?.type === 'required' && <p className="text-red-500">Artist Code is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="button" onClick={async() => await loadOriginalMetadata(tokenId)}>Load NFT Data</button>
                    <br/>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Member Id <span className="text-red-400">*</span><span className="text-xs"></span></label>
                            <input type="text" 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("memberid", {required: true})} />
                            {errors.memberid?.type === 'required' && <p className="text-red-500">Member Id is required</p>}
                        </div>
                    </div>
                    <br/>
                    <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label>Metadata</label>
                            <textarea {...register("metadata", {required: true})} rows={30}>
                            </textarea>
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Post to Update Queue</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/nft/listing")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default NFTUpdate