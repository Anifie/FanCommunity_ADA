import { forwardRef, useState, useImperativeHandle } from "react"

const ModalLoading = forwardRef((props, _ref) => {

    const [message, setMessage] = useState('')
    const [visible, setVisible] = useState(false)

    useImperativeHandle(_ref, () => ({
        show: (msg) => {
            setMessage(msg)
            setVisible(true)
            document.getElementById('lnkOpenModalLoading').click();
        },
        close: () => {
            setVisible(false)
            document.getElementById('btnCloseLoading').click();
        },
        isVisible: () => {
            return visible
        }
    }));

    return (
        <div>
            <label id="lnkOpenModalLoading" htmlFor="modal-loading" className="modal-button invisible"></label>
            <input type="checkbox" id="modal-loading" className="modal-toggle invisible"/>
            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-loading" id="btnCloseLoading" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h2 className="font-bold text-lg w-full flex justify-center">{message}</h2>
                    <br/>
                    <div className="flex w-full justify-center">
                        <img src="/images/icon-hourglass.png" alt="loading" className="m-10" />
                    </div>
                </div>
            </div>
        </div>
    )
})

export default ModalLoading