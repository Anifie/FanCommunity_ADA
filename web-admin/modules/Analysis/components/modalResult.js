import { forwardRef, useState, useImperativeHandle, useRef, useContext } from "react"
import { ToastContext } from "../../../common/context/ToastContext";

const ModalResult = forwardRef((props, _ref) => {
    
    const [result, setResult] = useState();

    const callbackFn = useRef(null)
    
    useImperativeHandle(_ref, () => ({
        show: (actionCallback) => {
            callbackFn.current = actionCallback
            document.getElementById('lnkOpenModalAnalysisResult').click();
        },
        assignResult: (_result) => {
            setResult(_result)
        }
    }));

    const close = () => {
        document.getElementById('btnCloseAnalyzeResult').click();
    }

    return (
        <div>

            <label id="lnkOpenModalAnalysisResult" htmlFor="modal-analysisResult" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-analysisResult" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-analysisResult" id="btnCloseAnalyzeResult" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">Analysis Result</h3>
                    <pre className="text-xs"><br/><br/><code>{JSON.stringify(result, null, 2)}</code></pre>
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Close</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalResult