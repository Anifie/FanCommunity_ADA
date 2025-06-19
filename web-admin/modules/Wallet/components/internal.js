import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { messagePost } from "../api";
//import { Web3Context } from "../../../common/context/Web3Context";
import { useRouter } from 'next/router'

const InternalWallet = () => {

    const [walletPurchaser, setWalletPurchaser] = useState()
    const [walletPurchaserBalance, setWalletPurchaserBalance] = useState()
    const [walletStore, setWalletStore] = useState()
    const [walletStoreBalance, setWalletStoreBalance] = useState()

    useEffect(() => {
        
    }, [])

    const arrayRange = (start, stop, step) =>
        Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

    const selectedLocation = (index) => {
        alert(index)
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <div className="p-4 w-full">
                <label className="mt-5">Purchaser Wallet</label>
                <label className="mt-5">{walletPurchaser}</label>
                <label className="mt-5">{walletPurchaserBalance}</label>
            </div>
            <br/>
            <br/>
            <div className="p-4 w-full">
                <label className="mt-5">Store Wallet</label>
                <label className="mt-5">{walletStore}</label>
                <label className="mt-5">{walletStoreBalance}</label>
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

export default InternalWallet