import { createContext, useState } from "react";

const ToastContext = createContext()

const ToastProvider = props => {

    const [infoMessage, setInfoMessage] = useState('')
    const [failedMessage, setFailedMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const showInfo = (message, timeout) => {
        setInfoMessage(message)
        document.getElementById("alrInfo").classList.remove("hidden");

        if(timeout == null || timeout == undefined)
            timeout = 5000;

        if(timeout != 0) {
            const myTimeout = setTimeout(() => {
                document.getElementById("alrInfo").classList.add("hidden");
                clearTimeout(myTimeout);
            }, timeout);
        }
        else {
            document.getElementById("alrInfoClose").classList.remove("hidden");
        }
    }

    const showFailed = (message) => {
        setFailedMessage(message)
        document.getElementById("alrFailed").classList.remove("hidden");

        const myTimeout = setTimeout(() => {
            document.getElementById("alrFailed").classList.add("hidden");
            clearTimeout(myTimeout);
        }, 5000);
    }

    const showSuccess = (message) => {
        setSuccessMessage(message)
        document.getElementById("alrSuccess").classList.remove("hidden");

        const myTimeout = setTimeout(() => {
            document.getElementById("alrSuccess").classList.add("hidden");
            clearTimeout(myTimeout);
        }, 5000);
    }

    const closeInfo = () => {
        if(document.getElementById("alrInfo").classList.contains("hidden") == false)
          document.getElementById("alrInfo").classList.add("hidden");
    };

    return (
        <ToastContext.Provider value={{infoMessage, failedMessage, successMessage, closeInfo, showInfo, showFailed, showSuccess}}>
            {props.children}
        </ToastContext.Provider>
    )

}

export {ToastContext, ToastProvider}