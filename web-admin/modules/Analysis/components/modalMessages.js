import { forwardRef, useState, useImperativeHandle, useRef, useContext } from "react"
import { ToastContext } from "../../../common/context/ToastContext";

const ModalMessages = forwardRef((props, _ref) => {
    
    const [message, setMessages] = useState();

    const callbackFn = useRef(null)
    
    useImperativeHandle(_ref, () => ({
        show: (actionCallback) => {
            callbackFn.current = actionCallback
            document.getElementById('lnkOpenModalAnalysisMessage').click();
        },
        assignMessages: (_result) => {
            setMessages(_result)
        }
    }));

    const close = () => {
        document.getElementById('btnCloseAnalyzeMessage').click();
    }

    return (
        <div>

            <label id="lnkOpenModalAnalysisMessage" htmlFor="modal-analysisMessage" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-analysisMessage" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-analysisMessage" id="btnCloseAnalyzeMessage" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">User Chat Messages</h3>
                    <textarea readOnly={true}>
                        {JSON.stringify(message, null, 2)}
                    </textarea>
                    <pre className="text-xs"><br/><br/><code>{JSON.stringify(message, null, 2)}</code></pre>
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalMessages