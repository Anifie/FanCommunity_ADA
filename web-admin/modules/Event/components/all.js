import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { eventGet, eventPut, messagePost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";

const AllEvent = () => {

    const [eventStatus, setEventStatus] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)
    const mdLoading = useRef(null)
    useEffect(() => {
        getEvent();
    }, [])

    const getEvent = async () => {
        let result = await eventGet();
        console.log("result", result);
        if(result.Success) {
            setEventStatus(result.Data.Status);
        }
    }

    const updateStatus = async(status) => {
        mdLoading.current.show("Updating event status..")
        let result = await eventPut(status);
        console.log("update result", result);

        if(result.Success) {
            showSuccess("Event status updated")
            //router.push("/chat/message")
        }
        else {
            console.error(result.Message)
            showFailed("Failed to update event status")
        }

        mdLoading.current.close()
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <div className="p-4 w-full">
                <div className="flex flex-col">
                    <label>Event Status</label>
                    <select className="select select-bordered w-[300px]" 
                            value={eventStatus} 
                            onChange={(e) => setEventStatus(e.target.value)}>
                        <option value="NOTOPEN">NOTOPEN</option>
                        <option value="STREAMSTARTED">STREAMSTARTED</option>
                        <option value="STREAMRUNNING">STREAMRUNNING</option>
                        <option value="STREAMINTERRUPTED">STREAMINTERRUPTED</option>
                        <option value="STREAMEND">STREAMEND</option>
                        <option value="FORCERELOAD">FORCERELOAD</option>                         
                    </select>
                    <br/>
                    <button className="mt-5 btn btn-primary btn-sm w-[100px]" type="button" onClick={() => updateStatus(eventStatus)}>Update</button>
                </div>
            </div>
            
            {/* <div className="relative">
                <img src="/images/heart.png" className=""/>
                <div className="absolute top-2 w-full h-full">
                    <div className="flex justify-start w-full">
                        <div className="flex justify-start w-full">
                            <div className="flex justify-between w-full ml-32 mr-16">
                                {arrayRange(1, 4, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end w-full">
                            <div className="flex justify-between w-full mr-32 ml-16">
                                {arrayRange(5, 8, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start w-full">
                            <div className="flex justify-between w-full ml-20 mr-10">
                                {arrayRange(9, 13, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end w-full">
                            <div className="flex justify-between w-full mr-20 ml-10">
                                {arrayRange(14, 18, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start top-10 w-full">
                            <div className="flex justify-between w-full ml-16 mr-8">
                                {arrayRange(19, 24, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end top-10 w-full">
                            <div className="flex justify-between w-full mr-16 ml-8">
                                {arrayRange(25, 30, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-8 mr-8">
                                {arrayRange(31, 42, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-6 mr-6">
                                {arrayRange(43, 54, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-4 mr-4">
                                {arrayRange(55, 66, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-3 mr-3">
                                {arrayRange(67, 78, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-2 mr-2">
                                {arrayRange(79, 90, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-4 mr-4">
                                {arrayRange(91, 101, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-6 mr-6">
                                {arrayRange(102, 111, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-12 mr-12">
                                {arrayRange(112, 121, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-20 mr-20">
                                {arrayRange(122, 130, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-28 mr-28">
                                {arrayRange(131, 138, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-32 mr-32">
                                {arrayRange(139, 146, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-40 mr-40">
                                {arrayRange(147, 152, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-48 mr-48">
                                {arrayRange(153, 156, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-between w-full ml-52 mr-52">
                                {arrayRange(157, 160, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-evenly w-full ml-56 mr-56">
                                {arrayRange(161, 162, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start w-full mt-1">
                        <div className="flex justify-start  w-full">
                            <div className="flex justify-evenly w-full ml-60 mr-60">
                                {arrayRange(163, 164, 1).map((x, i) =>
                                    <a href="#" className="underline" onClick={() => selectedLocation(x)}>{x}</a>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div> */}
        </div>
    );
};

export default AllEvent