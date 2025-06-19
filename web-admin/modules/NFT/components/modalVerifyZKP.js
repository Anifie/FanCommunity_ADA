import { forwardRef, useState, useImperativeHandle, useRef, useContext } from "react"
import { ToastContext } from "../../../common/context/ToastContext";
import { chatDataZKPGenerate, chatDataZKPVerify } from "../api";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ModalUpload = forwardRef((props, _ref) => {

    const {showSuccess, showFailed} = useContext(ToastContext)

    const [keyword, setKeyword] = useState()
    const [chatMemberId, setChatMemberId] = useState()
    const [artistCode, setArtistCode] = useState()
    const [loading, setLoading] = useState(false)
    


    // const callbackFn = useRef(null)



    useImperativeHandle(_ref, () => ({
        show: (_chatMemberId, _artistCode) => {
            // callbackFn.current = actionCallback
            setChatMemberId(_chatMemberId)
            setArtistCode(_artistCode)
            document.getElementById('lnkOpenModalVerifyZKP').click();
        }
    }));

    const close = () => {
        document.getElementById('btnCloseVerifyZKP').click();
    }

    const verify = async () => {
        console.log(keyword);
        setLoading(true);
        let zkpResult = await chatDataZKPGenerate({artistCode: artistCode, keyword: keyword, chatMemberId: chatMemberId});
        console.log("zkpResult", zkpResult);

        if(zkpResult.Success) {

            let verifyZKPResult = await chatDataZKPVerify({
                callData: zkpResult.Data.callData, 
                chatDataHash: zkpResult.Data.chatDataHash, 
                tokenId: zkpResult.Data.tokenId,
                artistCode: artistCode
            });

            console.log("verifyZKPResult", verifyZKPResult);

            if(verifyZKPResult.Success) {
                if(verifyZKPResult.Data.verifyResult.isValid) 
                    showSuccess('Chat Data contains character : ' + keyword);
                else 
                    showFailed('Chat Data does not contain character : ' + keyword)
            }
            else 
                showFailed('Failed to verify ZK proof')
            
        }
        else {
            showFailed('Failed to generate ZK proof')
        }

        setLoading(false);

        setKeyword('')
    }

    return (
        <div>
            <label id="lnkOpenModalVerifyZKP" htmlFor="modal-verifyZKP" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-verifyZKP" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-verifyZKP" id="btnCloseVerifyZKP" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">Verify Word in Chat Data with ZKP</h3>
                    <p className="py-4">
                        <label className="mt-5">Character</label>
                        <input type="text" 
                            name="txtKeyword"
                            value={keyword} 
                            onChange={(e) => setKeyword(e.target.value)} 
                            placeholder="Character" 
                            //maxLength={1}
                            className="input input-bordered w-full max-w-lg" />                    
                    </p>

                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => verify()} disabled={loading}>{loading ? 'Verifying..' : 'Verify'} {loading && <span className="ml-2"><FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>}</label>
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                        {/* <label htmlFor="my-modal-5" className="btn" onClick={() => upload()}>{uploading ? 'Uploading..' : 'Upload'}</label> */}
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalUpload