import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { avatarCategoryPost } from "../../AvatarCategory/api";
import { avatarPost } from "../api";
import { avatarCategoryListing } from "../../AvatarCategory/api";
import { avatarSubCategoryListing } from "../../AvatarSubCategory/api";
import { avatarItemListing } from "../../AvatarItem/api";

const AvatarCreate = () => {

    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    const [avatarCategoryId, setAvatarCategoryId] = useState()
    const [avatarCategories, setAvatarCategories] = useState()
    const [avatarSubCategoryId, setAvatarSubCategoryId] = useState()
    const [avatarSubCategories, setAvatarSubCategories] = useState()
    const [avatarItemId, setAvatarItemId] = useState()
    const [avatarItems, setAvatarItems] = useState()

    useEffect(() => {
        getAvatarCategories()
        getAvatarSubCategories()
        getAvatarItems()
    }, [])

    const getAvatarCategories = async () =>  {
        let result = await avatarCategoryListing();
        if(result.Success) {
            setAvatarCategories(result.Data.AvatarCategories);
            setAvatarCategoryId(result.Data.AvatarCategories[0].AvatarCategoryId)   // set to first category by default
        }
        else {
            showFailed("Failed to load avatar categories")
        }
    }

    const getAvatarSubCategories = async () =>  {
        let result = await avatarSubCategoryListing();
        if(result.Success) {
            setAvatarSubCategories(result.Data.AvatarSubCategories);
        }
        else {
            showFailed("Failed to load avatar sub categories")
        }
    }

    const getAvatarItems = async () =>  {
        let result = await avatarItemListing();
        if(result.Success) {
            setAvatarItems(result.Data.AvatarItems);
        }
        else {
            showFailed("Failed to load avatar items")
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await avatarPost({
                                        memberId: data.playerid,
                                        status: data.status,
                                        itemIdHead: data.itemidhead,
                                        itemIdBody: data.itemidbody,
                                        itemIds: [data.itemidtop, data.itemidbottom, data.itemidshoes, data.itemidhair, data.itemidglasses]
                                    })

        console.log("create avatar result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Avatar created successfully")
            router.push("/metaverse/avatar")
        }            
        else
            showFailed("Avatar created failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">CREATE AVATAR</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Member Id</label>
                            <input type="text" 
                                placeholder="Member Id" 
                                className="input input-bordered w-full max-w-lg"
                                {...register("playerid", {required: true})} />
                            {errors.playerid?.type === 'required' && <p className="text-red-500">Member Id is required</p>}
                        </div>
                        <div className="flex">
                            <div className="flex flex-col">
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Head</label>
                                    <input type="text" 
                                        placeholder="Item Id Head" 
                                        className="input input-bordered w-[300px] max-w-lg"
                                        {...register("itemidhead", {required: true})} />
                                    {errors.itemidhead?.type === 'required' && <p className="text-red-500">Item Id for Head is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Body</label>
                                    <input type="text" 
                                        placeholder="Item Id Body" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidbody", {required: true})} />
                                    {errors.itemidbody?.type === 'required' && <p className="text-red-500">Item Id for Body is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Top</label>
                                    <input type="text" 
                                        placeholder="Item Id Top" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidtop", {required: false})} />
                                    {errors.itemidtop?.type === 'required' && <p className="text-red-500">Item Id for Top is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Bottom</label>
                                    <input type="text" 
                                        placeholder="Item Id Bottom" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidbottom", {required: false})} />
                                    {errors.itemidbottom?.type === 'required' && <p className="text-red-500">Item Id for Bottom is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Shoes</label>
                                    <input type="text" 
                                        placeholder="Item Id Shoes" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidshoes", {required: false})} />
                                    {errors.itemidshoes?.type === 'required' && <p className="text-red-500">Item Id for Shoes is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Hair</label>
                                    <input type="text" 
                                        placeholder="Item Id Hair" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidhair", {required: false})} />
                                    {errors.itemidhair?.type === 'required' && <p className="text-red-500">Item Id for Hair is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Item Id Glasses</label>
                                    <input type="text" 
                                        placeholder="Item Id Glasses" 
                                        className="input input-bordered w-full max-w-lg"
                                        {...register("itemidglasses", {required: false})} />
                                    {errors.itemidglasses?.type === 'required' && <p className="text-red-500">Item Id for Glasses is required</p>}
                                </div>
                                <div className="flex flex-col col-span-2 mt-2">
                                    <label>Status</label>
                                    <select className="select select-bordered w-fit" 
                                            {...register("status", {required: true})}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                    {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center w-full">
                                <div className="flex items-center justify-center w-full">
                                    <div>Item Navigator</div>
                                    <div className="ml-5 flex gap-5">
                                        <div className="flex flex-col">
                                            <label>Avatar Category</label>
                                            <select className="select select-bordered w-full" 
                                                    value={avatarCategoryId}
                                                    onChange={(e) => setAvatarCategoryId(e.target.value)}>
                                                {
                                                    avatarCategories && avatarCategories.length > 0 
                                                    && avatarCategories.map(x => <option value={x.AvatarCategoryId}>{x.Name}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label>Avatar Sub Category</label>
                                            <select className="select select-bordered w-full" 
                                                    value={avatarSubCategoryId}
                                                    onChange={(e) => setAvatarSubCategoryId(e.target.value)}>
                                                {
                                                    avatarSubCategories && avatarSubCategories.length > 0 && avatarCategoryId != undefined
                                                    && avatarSubCategories.filter(x => x.AvatarCategoryId === avatarCategoryId).sort((a, b) => a.ClassName.localeCompare(b.ClassName)).map(x => <option value={x.AvatarSubCategoryId}>{`${x.ClassName} - ${x.Name}`}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label>Avatar Item</label>
                                            <select className="select select-bordered w-full" 
                                                    value={avatarItemId}
                                                    onChange={(e) => setAvatarItemId(e.target.value)}>
                                                {
                                                    avatarItems && avatarItems.length > 0 && avatarCategoryId != undefined && avatarSubCategoryId != undefined
                                                    && avatarItems.filter(x => x.AvatarCategoryId === avatarCategoryId && x.AvatarSubCategoryId == avatarSubCategoryId).sort((a, b) => a.Name.localeCompare(b.Name)).map(x => <option value={x.AvatarItemId}>{`${x.Name}`}</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <br/>
                                    <br/>
                                    <div>Selected Avatar Item Id : {avatarItemId}</div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Create Avatar</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/avatar")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AvatarCreate