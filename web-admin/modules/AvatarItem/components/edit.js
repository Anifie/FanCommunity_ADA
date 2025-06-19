import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { avatarItemGet, avatarItemPut } from "../api";
import { avatarCategoryListing } from "../../AvatarCategory/api";
import { avatarSubCategoryListing } from "../../AvatarSubCategory/api";

const AvatarItemEdit = () => {

    const [avatarItemId, setAvatarItemId] = useState()
    const [avatarItem, setAvatarItem] = useState()
    const [avatarCategoryId, setAvatarCategoryId] = useState()
    const [avatarCategories, setAvatarCategories] = useState()
    const [avatarSubCategoriesSelected, setSubAvatarCategoriesSelected] = useState()
    const [avatarSubCategories, setAvatarSubCategories] = useState()
    
    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {

        const {avataritemid} = router.query
        if(!avatarItemId) {
            setAvatarItemId(avataritemid)
            getAvatarItem(avataritemid)
        }
        
    }, [])

    useEffect(() => {
        if(avatarCategories && avatarCategories.length > 0) {
            console.log("filterSubCategory on effect of avatarCategories");
            filterSubCategory(avatarCategories[0].AvatarCategoryId)
        }
    }, [avatarCategories])

    useEffect(() => {
        if(avatarCategoryId) {
            console.log("filterSubCategory on effect of avatarCategoryId");
            filterSubCategory(avatarCategoryId)
        }
    }, [avatarCategoryId])

    // useEffect(() => {
    //     if(avatarCategories && avatarItem) {
    //         setValue("avatarcategoryid", avatarItem.AvatarCategoryId)
    //     }
    // }, [avatarCategories, avatarItem])

    useEffect(() => {
        if(avatarSubCategoriesSelected && avatarItem) {
            setValue("avatarsubcategoryid", avatarItem.AvatarSubCategoryId)
        }
    }, [avatarSubCategoriesSelected, avatarItem])

    const getAvatarItem = async (aid) => {
        let avatarItemResult = await avatarItemGet({avatarItemId: aid})
        console.log("avatarItemResult", avatarItemResult)
        if(avatarItemResult.Success) {

            if(!avatarCategories)
                await getAvatarCategories()

            if(!avatarSubCategories)
                await getAvatarSubCategories()

            // filterSubCategory(avatarItemResult.Data.AvatarItem.AvatarCategoryId)

            setAvatarItem(avatarItemResult.Data.AvatarItem)
            setAvatarCategoryId(avatarItemResult.Data.AvatarItem.AvatarCategoryId)
            setValue("name", avatarItemResult.Data.AvatarItem.Name)
            setValue("price", avatarItemResult.Data.AvatarItem.Price)
            setValue("currency", avatarItemResult.Data.AvatarItem.PriceCurrencyCode)
            setValue("status", avatarItemResult.Data.AvatarItem.Status)
            setValue("avatarcategoryid", avatarItemResult.Data.AvatarItem.AvatarCategoryId)
            setValue("avatarsubcategoryid", avatarItemResult.Data.AvatarItem.AvatarSubCategoryId)
            console.log("avatarItemResult.Data.AvatarItem.AvatarCategoryId", avatarItemResult.Data.AvatarItem.AvatarCategoryId);
        }
    }

    const getAvatarCategories = async () =>  {
        let result = await avatarCategoryListing();
        if(result.Success) {
            setAvatarCategories(result.Data.AvatarCategories);
        }
        else {
            showFailed("Failed to load avatar categories")
        }
    }

    const getAvatarSubCategories = async () =>  {
        if(avatarSubCategories && avatarSubCategories.length > 0)
            return

        let result = await avatarSubCategoryListing();
        if(result.Success) {
            setAvatarSubCategories(result.Data.AvatarSubCategories);
        }
        else {
            showFailed("Failed to load avatar sub categories")
        }
    }

    const filterSubCategory = (avatarCategoryId) => {
        if(avatarSubCategories && avatarSubCategories.length > 0)
            setSubAvatarCategoriesSelected(avatarSubCategories.filter(x => x.AvatarCategoryId == avatarCategoryId))
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await avatarItemPut({
                                        avatarItemId: avatarItemId,
                                        categoryId: data.avatarcategoryid,
                                        subCategoryId: data.avatarsubcategoryid,
                                        name: data.name,
                                        status: data.status,
                                        price: data.price,
                                        priceCurrencyCode: data.currency,
                                    })

        console.log("update avatar item result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Avatar Item updated successfully")
            router.push("/metaverse/avataritem")
        }            
        else
            showFailed("Avatar Item update failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT AVATAR ITEM</h2>                        
                </div>
                <div className="p-4 w-full">
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                        <div className="flex flex-col col-span-2">
                            <label>Name</label>
                            <input type="text" 
                                placeholder="Name" 
                                disabled
                                className="input input-bordered w-full max-w-lg"
                                {...register("name", {required: true})} />
                            {errors.name?.type === 'required' && <p className="text-red-500">Name is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Avatar Category</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("avatarcategoryid", {required: true, onChange : (e) => setAvatarCategoryId(e.target.value)})}>
                                {
                                    avatarCategories && avatarCategories.length > 0 
                                    && avatarCategories.map(x => <option value={x.AvatarCategoryId}>{x.Name}</option>)
                                }
                            </select>
                            {errors.avatarcategoryid?.type === 'required' && <p className="text-red-500">Avatar Category is required</p>}
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Avatar Sub Category</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("avatarsubcategoryid", {required: true})}>
                                {
                                    avatarSubCategoriesSelected && avatarSubCategoriesSelected.length > 0 
                                    && avatarSubCategoriesSelected.sort((a, b) => a.ClassName.localeCompare(b.ClassName)).map(x => <option value={x.AvatarSubCategoryId}>{`${x.ClassName} - ${x.Name}`}</option>)
                                }
                            </select>
                            {errors.avatarsubcategoryid?.type === 'required' && <p className="text-red-500">Avatar Sub Category is required</p>}
                        </div>
                        <div className="flex flex-row col-span-2 gap-2">
                            <div className="flex flex-col">
                                <label>Currency</label>
                                <select className="select select-bordered w-fit" 
                                        {...register("currency", {required: true})}>
                                    <option value="JPY">JPY</option>
                                </select>
                                {errors.currency?.type === 'required' && <p className="text-red-500">Currency is required</p>}
                            </div>
                            <div className="flex flex-col">
                                <label>Price</label>
                                <input type="text" 
                                    placeholder="Price" 
                                    className="input input-bordered w-full max-w-[300px]"
                                    {...register("price", {required: true})} />
                                {errors.price?.type === 'required' && <p className="text-red-500">Price is required</p>}
                            </div>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label>Status</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("status", {required: true})}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status?.type === 'required' && <p className="text-red-500">Status is required</p>}
                        </div>
                    </div>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Avatar Item</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/avataritem")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AvatarItemEdit