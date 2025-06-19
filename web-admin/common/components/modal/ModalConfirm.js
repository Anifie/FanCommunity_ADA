import { forwardRef, useState, useImperativeHandle, useRef } from "react"

const ModalConfirm = forwardRef((props, _ref) => {

    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [action, setAction] = useState('')
    //const [callbackFn, setCallbackFn] = useState('')
    const [callbackParam, setCallbackParam] = useState('')
    
    const callbackFn = useRef(null);

    useImperativeHandle(_ref, () => ({
        show: (titleString, msg, actionMsg, actionCallback, actionParam) => {
            setTitle(titleString)
            setMessage(msg)
            setAction(actionMsg)
            //setCallbackFn(actionCallback)
            callbackFn.current = actionCallback
            setCallbackParam(actionParam)

            document.getElementById('lnkOpenModalConfirmation').click();
        }
    }));

    const close = () => {
        document.getElementById('btnCloseConfirm').click();
    }

    const callback = async () => {
        close();

        if(callbackParam && callbackParam !== '')
            await callbackFn.current(callbackParam);
        else
            await callbackFn.current();
    }

    return (
        <div>

            <label id="lnkOpenModalConfirmation" htmlFor="modal-confirm" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-confirm" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-confirm" id="btnCloseConfirm" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="py-4">{message}</p>
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                        <label htmlFor="my-modal-5" className="btn" onClick={() => callback()}>{action}</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalConfirm