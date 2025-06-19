import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MemberContext } from "../../../common/context/MemberContext";
import { collectionListingGet, collectionDelete } from "../api";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import moment from "moment";
import { useRouter } from 'next/router'
import useStateCallback from "../../../common/hooks/useStateCallback";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import Tooltip from "../../../common/components/tooltip";

const CollectionListings = () => {

    const {member} = useContext (MemberContext)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [collections, setCollections] = useState([])
    const [status, setStatus] = useState()
    const [collectionId, setCollectionId] = useState()
    const [name, setName] = useState()
    const [metadata, setMetadata] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getCollections()
    }, [pageIndex, pageSize])

    const getCollections = async () => {
        setLoading(true)
        setCollections([]);
        let result = await collectionListingGet({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            status: status, 
            name: name, 
            collectionId: collectionId, 
            //shadowPattern: null, 
            metadata: metadata
        })
        console.log("collections result", result);
        if(result.Success) {
            setCollections(result.Data.collections)
            setLastPageIndex(null);
            if(result.Data.collections.length > 0 && result.Data.lastKey) {
                //console.log("got data", pageIndex, lastPageIndex);
                if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
                    setPages([...pages, result.Data.lastKey.created_date.S], x => setLoading(false))
                }
            }
            else {
                //console.log("setLastPageIndex");
                setLastPageIndex(pageIndex)
            }
        }
        setLoading(false)
    }

    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getCollections()
    }

    const deleteCollection = (collectionId) => {
        mdConfirm.current.show("Confirm", "Confirm Delete Collection with Id '" + collectionId + "' ?", "Delete", confirmDeleteCollection, collectionId)
    }

    const confirmDeleteCollection = async (collectionId) => {
        mdLoading.current.show("Deleting..")
        let result = await collectionDelete(collectionId)
        console.log("delete result", result);
        if(result?.Success){
            showSuccess("Collection deleted")
            await getCollections()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">LANTERN - COLLECTION</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/lantern/collection/create")}>+ CREATE NEW</button>
                    </div>
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label>Collection Id</label>
                                    <input type="text" 
                                        placeholder="Collection Id" 
                                        value={collectionId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setCollectionId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Name</label>
                                    <input type="text" 
                                        placeholder="Name" 
                                        value={name}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Metadata</label>
                                    <input type="text" 
                                        placeholder="Metadata" 
                                        value={metadata}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setMetadata(e.target.value)} />
                                </div>
                            </div>
                            {/* <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Join Date From" className="input input-bordered w-full" />
                                <input type="text" placeholder="Join Date To" className="input input-bordered w-full" />
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end w-full mb-2">
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs"
                                    value={pageSize} 
                                    onChange={(e) => changePageSize(e.target.value)}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>#</th>
                                <th>COLLECTION ID</th>
                                <th>NAME</th>
                                <th>STATUS</th>
                                <th>METADATA</th>
                                <th>Ranking</th>
                                <th>2D FILE (Plain)</th>
                                <th>2D FILE</th>
                                <th>3D FILE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                collections && collections.length > 0
                                ?
                                    collections
                                        .map(
                                            (x, index) => (
                                                <tr key={`collection_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {x.CollectionId}
                                                    </td>
                                                    <td>
                                                        {x.Name}
                                                    </td>
                                                    <td>
                                                        { x.Status}
                                                    </td>
                                                    <td>
                                                        <Tooltip tooltipText={x.Metadata}>
                                                            <span>{x.Metadata.substring(0, 19) + (x.Metadata.length > 20 ? "..." : "")}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td>
                                                        {x.Ranking}
                                                    </td>
                                                    <td>
                                                        {x.File3DURL && <a href={x.File3DURL}><img src={x.File3DURL} className="w-[50px]" /></a>}
                                                    </td>
                                                    <td>
                                                        {x.File2DURL && <a href={x.File2DURL}><img src={x.File2DURL} className="w-[50px]" /></a>}
                                                    </td>
                                                    <td>
                                                        <a href={x.File3DFBXURL}>Download</a>
                                                    </td>
                                                    <td>
                                                        <div className="dropdown dropdown-down">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                <li>
                                                                    <a onClick={() => deleteCollection(x.CollectionId)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={9} className="text-center">
                                        {
                                            loading
                                                ?   <span className="flex justify-center">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>
                                                :   <span>No Result</span>
                                        }
                                    </td>
                                  </tr>
                            }                         
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionListings