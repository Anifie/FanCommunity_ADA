import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { voteDiscordAnswerListing } from "../api";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { CSVLink } from "react-csv";

const VoteDiscordAnswerListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [voteAnswers, setVoteAnswers] = useState([])
    const [status, setStatus] = useState()
    const [questionId, setQuestionId] = useState()
    const [discordUserId, setDiscordUserId] = useState()
    // const [displayName, setDisplayName] = useState()
    // const [role, setRole] = useState()
    const {showSuccess, showFailed} = useContext(ToastContext)

    const [pages, setPages] = useStateCallback([null])
    const [pageIndex, setPageIndex] = useState(0)
    const [lastPageIndex, setLastPageIndex] = useState()
    const [pageSize, setPageSize] = useState(10)

    const mdLoading = useRef(null)
    const mdConfirm = useRef(null)
    
    useEffect(() => {        
        getVoteAnswers()
    }, [])

    // const getPlayers = async () => {
    //     setLoading(true)
    //     let result = await playerListingGet(null, null, null, null, null, 5)
    //     console.log("players result", result);
    //     if(result.Success) {
    //         setPlayers(result.Data.players)
    //     }
    //     setLoading(false)
    // }

    useEffect(() => {
        console.log("load page pageIndex", pageIndex);
        getVoteAnswers()
    }, [pageIndex, pageSize])

    const getVoteAnswers = async () => {
        setLoading(true)
        setVoteAnswers([]);
        let result = await voteDiscordAnswerListing({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            questionId: questionId,
            discordUserId: discordUserId
        })
        console.log("events result", result);
        if(result.Success) {
            setVoteAnswers(result.Data.votes)
            setLastPageIndex(null);
            if(result.Data.votes.length > 0 && result.Data.lastKey) {
                //console.log("got data", pageIndex, lastPageIndex);
                if(pages.indexOf(result.Data.lastKey.created_date.S) < 0) {
                    setPages([...pages, result.Data.lastKey.created_date.S], x => setLoading(false))
                }
            }
            else {
                //console.log("setLastPageIndex");
                setLastPageIndex(pageIndex)
            }
        }
        setLoading(false)
    }

    const changePageSize = (newSize) => {
        setPages([null])
        setPageIndex(0)
        setPageSize(newSize)
    }

    const search = () => {
        setPages([null])
        setPageIndex(0)
        getVoteAnswers()
    }

    
    const postDiscord = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm post to discord for question id '" + questionId + "' ?", "Post Discord", confirmPostDiscord, questionId)
    }

    const confirmPostDiscord = async (questionId) => {
        mdLoading.current.show("Post to discord..")
        let result = await voteDiscordQuestionPostDiscord({questionId: questionId })
        console.log("Post to discord result", result);
        if(result?.Success){
            showSuccess("Posted to Discord.")
            await getVoteAnswers()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const removeDiscord = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm remove from discord for question id '" + questionId + "' ?", "Post Discord", confirmRemoveDiscord, questionId)
    }

    const confirmRemoveDiscord = async (questionId) => {
        mdLoading.current.show("Remove from discord..")
        let result = await voteDiscordQuestionDeleteDiscord({questionId: questionId })
        console.log("Remove from discord result", result);
        if(result?.Success){
            showSuccess("Removed from Discord.")
            await getVoteAnswers()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const deleteQuestion = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm Delete Vote Question with Id '" + questionId + "' ?", "Delete", confirmDeleteQuestion, questionId)
    }

    const confirmDeleteQuestion = async (questionId) => {
        mdLoading.current.show("Deleting..")
        let result = await voteDiscordQuestionDelete({questionId : questionId})
        console.log("delete result", result);
        if(result?.Success){
            showSuccess("Vote Discord Question deleted")
            await getVoteAnswers()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <ModalConfirm ref={mdConfirm} />
            <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                <h2 className="ml-3 text-sm font-bold">VOTE ANSWERS</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    {/* <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/vote/discord/question/new")}>+ CREATE NEW</button>
                    </div> */}
                    <div className={`card w-full shadow- mb-4 ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                        <div className="card-body">
                            <div className="grid grid-cols-4 gap-2">
                                {/* <div className="flex flex-col">
                                    <label>Status</label>
                                    <select className="select select-bordered"
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">ALL</option>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="TAKEN">TAKEN</option>
                                    </select>
                                </div> */}
                                <div className="flex flex-col">
                                    <label>Question Id</label>
                                    <input type="text" 
                                        placeholder="Question Id" 
                                        value={questionId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setQuestionId(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label>Discord User Id</label>
                                    <input type="text" 
                                        placeholder="Discord User Id" 
                                        value={discordUserId}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDiscordUserId(e.target.value)} />
                                </div>
                                {/* <div className="flex flex-col">
                                    <label>Role</label>
                                    <select className="select select-bordered"
                                            value={role} 
                                            onChange={(e) => setRole(e.target.value)}>
                                        <option value="PLAYER">PLAYER</option>
                                        <option value="CELEBRITY">CELEBRITY</option>
                                    </select>
                                </div> */}
                            </div>
                            {/* <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Join Date From" className="input input-bordered w-full" />
                                <input type="text" placeholder="Join Date To" className="input input-bordered w-full" />
                            </div> */}
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm" onClick={() => search()}>Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between w-full mb-2">
                        <div className="flex gap-5 ml-10">
                            <CSVLink filename={"vote.csv"}
                                     data={voteAnswers}
                                     headers={[
                                                {label: "QuestionId", key: "QuestionId"},
                                                {label: "DiscordUserId", key: "DiscordUserId"},
                                                {label: "Question", key: "QuestionStatement"},
                                                {label: "IsMultiSelect", key: "IsMultiSelect"},
                                                {label: "AnswerIndex", key: "ChoiceIndex"},
                                                {label: "AnswerEmoji", key: "ChoiceEmoji"},
                                                {label: "AnswerLabel", key: "ChoiceLabel"},
                                                {label: "CreatedDate", key: "CreatedDate"}
                                            ]}>
                                <button className="btn btn-primary btn-sm" >Download CSV</button>
                            </CSVLink>
                        </div>
                        <div className="flex items-center mr-5">
                            Show&nbsp;
                            <select className="select select-ghost select-sm max-w-xs"
                                    value={pageSize} 
                                    onChange={(e) => changePageSize(e.target.value)}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            &nbsp;Entries
                        </div>
                    </div>
                    <table className={`table table-compact w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#242933]'}`}>
                        <thead className={`${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#242933]'}`}>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>SELECTION TYPE</th>
                                <th>ANSWER</th>
                                <th>CREATED DATE</th>
                                {/* <th>ACTIONS</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                voteAnswers && voteAnswers.length > 0
                                ?
                                voteAnswers
                                        .map(
                                            (x, index) => (
                                                <tr key={`voteanswer_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    {/* <td>
                                                        {x.TwoDURL && <a href={x.TwoDURL}><img src={x.TwoDURL} className="max-w-[100px]" /></a>}
                                                    </td> */}
                                                    <td>
                                                        <>Question Id: {x.QuestionId} </>
                                                        <br/>
                                                        <>Discord User Id: {x.DiscordUserId} </>
                                                        {x.ProjectName && <><br/>Project Name: {x.ProjectName}</>}
                                                        {x.Title && <><br/><>Title: {x.Title}</></>}
                                                        <br/>
                                                        <>Question: {x.QuestionStatement}</>
                                                    </td>
                                                    <td>
                                                        {x.IsMultiSelect ? 'MULTIPLE' : 'SINGLE'}
                                                    </td>
                                                    <td>
                                                        {
                                                            x.IsMultiSelect &&
                                                            x.ChoiceStatement.map((c, index) => (
                                                            <>{c.label} {c.emoji}<br/></>
                                                            ))
                                                            // <>{x.ChoiceStatement.emoji} {x.ChoiceStatement.label}</>
                                                        }
                                                        {
                                                            !x.IsMultiSelect &&
                                                            <>{x.ChoiceStatement.emoji} {x.ChoiceStatement.label}</>
                                                        }
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    {/* <td>
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex="0" className="btn btn-sm m-1">
                                                                <FontAwesomeIcon icon={faGear} className="h-4"/>
                                                                &nbsp;
                                                                Manage
                                                            </label>
                                                            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-[#212529] rounded-box w-52">
                                                                {
                                                                     !x.IsPostedToDiscord &&
                                                                     <li>
                                                                        <a onClick={() => postDiscord(x.QuestionId)}>Post To Discord</a>
                                                                    </li>
                                                                }
                                                                {
                                                                    x.IsPostedToDiscord &&
                                                                    <li>
                                                                        <a onClick={() => removeDiscord(x.QuestionId)}>Remove From Discord</a>
                                                                    </li>
                                                                }
                                                                <li>
                                                                    <a onClick={() => router.push("/vote/discord/question/edit/" + x.QuestionId)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a onClick={() => deleteQuestion(x.QuestionId)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td> */}
                                                </tr>
                                            ))
                                : <tr>
                                    <td colSpan={9} className="text-center">
                                        {
                                            loading
                                                ?   <span className="flex justify-center">Loading.. <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin"/></span>
                                                :   <span>No Result</span>
                                        }
                                    </td>
                                  </tr>
                            }                         
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center gap-2 w-full mr-4 h-full">
                        { pageIndex !== 0 && <button onClick={() => setPageIndex(pageIndex - 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Previous Page</button>}
                        { pageIndex !== lastPageIndex && <button onClick={() => setPageIndex(pageIndex + 1)} disabled={loading} className="carosel-btn btn btn-active btn-xs active:bg-slate-300 active:text-slate-700">Next Page</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoteDiscordAnswerListing