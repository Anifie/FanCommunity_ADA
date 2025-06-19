import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { avatarCategoryListing } from "../../AvatarCategory/api";
import { avatarSubCategoryGet, avatarSubCategoryPut } from "../../AvatarSubCategory/api";

const AvatarSubCategoryEdit = () => {

    const [avatarSubCategoryId, setAvatarSubCategoryId] = useState()
    const [avatarSubCategory, setAvatarSubCategory] = useState()
    const [avatarCategoryId, setAvatarCategoryId] = useState()
    const [avatarCategories, setAvatarCategories] = useState()
    
    const {register, formState: {errors}, handleSubmit, setValue} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    useEffect(() => {

        const {avatarsubcategoryid} = router.query
        if(!avatarSubCategoryId) {
            setAvatarSubCategoryId(avatarsubcategoryid)
            getAvatarSubCategory(avatarsubcategoryid)
        }
        
    }, [])

    const getAvatarSubCategory = async (aid) => {
        let avatarSubCategoryResult = await avatarSubCategoryGet({subCategoryId: aid})
        console.log("getAvatarSubCategory", avatarSubCategoryResult)
        if(avatarSubCategoryResult.Success) {

            if(!avatarCategories)
                await getAvatarCategories()

            setAvatarSubCategory(avatarSubCategoryResult.Data.AvatarSubCategory)
            setAvatarCategoryId(avatarSubCategoryResult.Data.AvatarSubCategory.AvatarCategoryId)
            setValue("name", avatarSubCategoryResult.Data.AvatarSubCategory.Name)
            setValue("classname", avatarSubCategoryResult.Data.AvatarSubCategory.ClassName)
            setValue("price", avatarSubCategoryResult.Data.AvatarSubCategory.Price)
            setValue("currency", avatarSubCategoryResult.Data.AvatarSubCategory.PriceCurrencyCode)
            setValue("status", avatarSubCategoryResult.Data.AvatarSubCategory.Status)
            setValue("avatarcategoryid", avatarSubCategoryResult.Data.AvatarSubCategory.AvatarCategoryId)
            console.log("avatarItemResult.Data.AvatarItem.AvatarCategoryId", avatarSubCategoryResult.Data.AvatarSubCategory.AvatarCategoryId);
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

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await avatarSubCategoryPut({
                                        subCategoryId: avatarSubCategoryId,
                                        categoryId: data.avatarcategoryid,
                                        name: data.name,
                                        status: data.status,
                                        price: data.price,
                                        priceCurrencyCode: data.currency,
                                        className: data.classname
                                    })

        console.log("update avatar sub category result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Avatar Sub Category updated successfully")
            router.push("/metaverse/avatarsubcategory")
        }            
        else
            showFailed("Avatar Sub Category update failed with message: " + result.Message)
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT AVATAR SUB CATEGORY</h2>                        
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
                            <label>Class Name</label>
                            <select className="select select-bordered w-fit" 
                                    {...register("classname", {required: true})}>
                                <option value="HEAD">Head</option>
                                <option value="BODY">Body</option>
                                <option value="HAIR">Hair</option>
                                <option value="GLASSES">Glasses</option>
                                <option value="TOP">Top</option>
                                <option value="BOTTOM">Bottom</option>
                                <option value="SHOES">Shoes</option>
                            </select>
                            {errors.classname?.type === 'required' && <p className="text-red-500">Class Name is required</p>}
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
                    <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Avatar Sub Category</button>
                    <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/metaverse/avatarsubcategory")}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AvatarSubCategoryEdit