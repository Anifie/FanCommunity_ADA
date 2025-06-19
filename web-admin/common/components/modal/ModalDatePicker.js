import { forwardRef, useState, useImperativeHandle, useRef } from "react"
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays } from 'date-fns';
import { Calendar } from 'react-date-range';

const ModalCalendar = forwardRef((props, _ref) => {

    
    const [title, setTitle] = useState('')
    const [date, setDate] = useState();

    const callbackFn = useRef(null);
    

    useImperativeHandle(_ref, () => ({
        show: (titleString, actionCallback) => {
            setTitle(titleString)
            // setMessage(msg)
            // setAction(actionMsg)
            //setCallbackFn(actionCallback)
            callbackFn.current = actionCallback
            //setCallbackParam(actionParam)

            document.getElementById('lnkOpenModalDatePicker').click();
        }
    }));

    const close = () => {
        document.getElementById('btnCloseDatePicker').click();
    }

    const callback = async () => {
        close();
        await callbackFn.current(date);
    }

    const clear = async () => {
        close();
        await callbackFn.current(date);
    }

    return (
        <div>

            <label id="lnkOpenModalDatePicker" htmlFor="modal-calendar" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-calendar" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box w-[380px]">
                    <label htmlFor="modal-calendar" id="btnCloseDatePicker" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">{title}</h3>
                    
                    <Calendar
                        onChange={item => setDate(item)}
                        date={date}
                        //className="my-5"
                        />
                    
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                        {/* <label htmlFor="my-modal-5" className="btn" onClick={() => clear()}>Clear</label> */}
                        <label htmlFor="my-modal-5" className="btn" onClick={() => callback()}>Select</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalCalendar