import { forwardRef, useState, useImperativeHandle, useRef } from "react"
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';

const ModalCalendar = forwardRef((props, _ref) => {

    
    const [title, setTitle] = useState('')
    const [state, setState] = useState([
        {
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          key: 'selection'
        }
      ]);

    const callbackFn = useRef(null);
    

    useImperativeHandle(_ref, () => ({
        show: (titleString, actionCallback) => {
            setTitle(titleString)
            // setMessage(msg)
            // setAction(actionMsg)
            //setCallbackFn(actionCallback)
            callbackFn.current = actionCallback
            //setCallbackParam(actionParam)

            document.getElementById('lnkOpenModalCalendar').click();
        }
    }));

    const close = () => {
        document.getElementById('btnCloseCalendar').click();
    }

    const callback = async () => {
        close();
        await callbackFn.current({startDate: state[0].startDate, endDate: state[0].endDate});
    }

    const clear = async () => {
        close();
        await callbackFn.current({startDate: null, endDate: null});
    }

    return (
        <div>

            <label id="lnkOpenModalCalendar" htmlFor="modal-calendar" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-calendar" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <label htmlFor="modal-calendar" id="btnCloseCalendar" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">{title}</h3>
                    
                    <DateRangePicker
                        onChange={item => setState([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={state}
                        direction="horizontal"
                        className="my-5"
                        />
                    
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                        <label htmlFor="my-modal-5" className="btn" onClick={() => clear()}>Clear</label>
                        <label htmlFor="my-modal-5" className="btn" onClick={() => callback()}>Select</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalCalendar