import { forwardRef, useState, useImperativeHandle, useRef, useContext } from "react"
import { ToastContext } from "../../../common/context/ToastContext";
import { whitelistUploadPost } from "../api";
import Papa from "papaparse";

const ModalUpload = forwardRef((props, _ref) => {

    const {showSuccess, showFailed} = useContext(ToastContext)

    const [uploading, setUploading] = useState(false)
    const [parsedData, setParsedData] = useState([]);   // State to store parsed data
    const [tableRows, setTableRows] = useState([]);     // State to store table Column name
    const [values, setValues] = useState([]);   //State to store the values
    
    const callbackFn = useRef(null)
    const fileInputRef = useRef()

    useImperativeHandle(_ref, () => ({
        show: (actionCallback) => {
            callbackFn.current = actionCallback
            document.getElementById('lnkOpenModalUploadCensoredLanterns').click();
        }
    }));

    const close = () => {
        document.getElementById('btnCloseUploadWhitelists').click();
    }

    const upload = async () => {

        if(parsedData.length == 0)
            return

        setUploading(true);

        if(tableRows.length < 2)
            showFailed("CSV must contains at least 2 columns in order of DiscordId, WhiteListType")

        if(tableRows[0] != "DiscordId")
            showFailed("First column must be DiscordId")

        if(tableRows[1] != "WhiteListType")
            showFailed("Second column must be WhiteListType")

        let result = await whitelistUploadPost({
                                                    whiteLists: parsedData
                                                })

        if(result.Success) {
            await callbackFn.current();
            showSuccess("Uploaded all whitelists")
        }
        else  {
            showFailed("Failed to upload:  " + result.Message)
        }

        fileInputRef.current.value = null
                              
        setUploading(false)

        close();
    }

    const changeHandler = (event) => {
        console.log(event.target.files[0])
        // Passing file data (event.target.files[0]) to parse using Papa.parse
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                console.log(results.data)

                const rowsArray = [];
                const valuesArray = [];

                // Iterating data to get column name and their values
                results.data.map((d) => {
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });

                // Parsed Data Response in array format
                setParsedData(results.data);

                // Filtered Column Names
                setTableRows(rowsArray[0]);

                // Filtered Values
                setValues(valuesArray);
            },
        });
    };

    return (
        <div>

            <label id="lnkOpenModalUploadCensoredLanterns" htmlFor="modal-uploadLanterns" className="modal-button invisible"></label>
            
            <input type="checkbox" id="modal-uploadLanterns" className="modal-toggle invisible"/>

            <div className="modal">
                <div className="modal-box relative">
                    <label htmlFor="modal-uploadLanterns" id="btnCloseUploadWhitelists" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">Upload White List CSV</h3>
                    <p className="py-4">
                        Example of CSV:
                        <table className="text-sm">
                            <tr><td>
                                DiscordId
                            </td><td>
                                WhiteListType
                            </td></tr>
                            <tr><td>
                            1250683550299324569
                            </td><td>
                            WHITELIST_MEMBER_SILVER_METAGARAGE
                            </td></tr>
                            <tr><td>
                            1250683550299324569
                            </td><td>
                            WHITELIST_MEMBER_GOLD_PALEBLUEDOT
                            </td></tr>
                        </table>
                    </p>

                    <div className="mt-10 mb-10">
                        <input
                            type="file"
                            name="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={changeHandler}
                            style={{ display: "block", margin: "10px auto" }}
                        />
                    </div>

                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn" onClick={() => close()}>Cancel</label>
                        <label htmlFor="my-modal-5" className="btn" onClick={() => upload()}>{uploading ? 'Uploading..' : 'Upload'}</label>
                    </div>
                </div>
            </div>

        </div>
    )
});

export default ModalUpload