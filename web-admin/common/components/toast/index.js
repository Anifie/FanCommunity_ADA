import { useContext } from "react";
import { ToastContext } from "../../context/ToastContext";

const Toast = () => {

    const {infoMessage, failedMessage, successMessage, closeInfo} = useContext(ToastContext)

    return (
        <div>
            <div className="fixed bottom-0 left-0 right-0 alert shadow-lg hidden z-20" id="alrInfo">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{ infoMessage }</span>
                </div>
                <div className="flex-none">
                    <button className="btn btn-sm hidden" id="alrInfoClose" onClick={closeInfo}>Close</button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 alert alert-success shadow-lg hidden z-20" id="alrSuccess">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{ successMessage }</span>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 alert alert-error shadow-lg hidden z-20" id="alrFailed">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{ failedMessage }</span>
                </div>
            </div>
        </div>
    )
}

export default Toast