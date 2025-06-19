import { useContext, useEffect, useRef, useState } from "react";
import { faGear, faRefresh, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { voteDiscordQuestionListing, voteDiscordQuestionDelete, voteDiscordQuestionPostDiscord, voteDiscordQuestionDeleteDiscord, voteDiscordAnswerStat, voteDiscordQuestionPut } from "../api";
import { useRouter } from 'next/router'
import moment from "moment";
import ModalConfirm from "../../../common/components/modal/ModalConfirm";
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useStateCallback from "../../../common/hooks/useStateCallback";

const VoteDiscordQuestionListing = () => {

    //const {account} = useContext(Web3Context)

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [voteQuestions, setVoteQuestions] = useState([])
    const [status, setStatus] = useState()
    const [questionId, setQuestionId] = useState()
    const [voteStats, setVoteStats] = useState([])
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
        getVoteQuestions()
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
        getVoteQuestions()
    }, [pageIndex, pageSize])

    const getVoteQuestions = async () => {
        setLoading(true)
        setVoteQuestions([]);
        let result = await voteDiscordQuestionListing({
            pageSize: pageSize, 
            lastKey: pages[pageIndex], 
            questionId: questionId
        })
        console.log("events result", result);
        if(result.Success) {
            setVoteQuestions(result.Data.votes)
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
        getVoteQuestions()
    }

    const getVoteStat = async (questionId) => {
        let result = await voteDiscordAnswerStat({questionId: questionId })
        console.log("getVoteStat", result);

        setVoteStats([...voteStats, result.Data.choices])

        const lines = result.Data.choices.map(choice => 
            `${choice.emoji} ${choice.label} : ${choice.count}`
        );

        let currentVoteQuestion = voteQuestions.find(x=> x.QuestionId == questionId);
        let updatedVoteQuestion = {...currentVoteQuestion, VoteStat: lines};

        let _voteQuestions = []
        for (let i = 0; i < voteQuestions.length; i++) {
            const voteQuestion = voteQuestions[i];
            if(voteQuestion.QuestionId == questionId)
                _voteQuestions.push(updatedVoteQuestion)
            else
                _voteQuestions.push(voteQuestion)
        }

        setVoteQuestions(_voteQuestions);

        // setVoteQuestions(prevRows => 
        //     prevRows.map(row => row.QuestionId === questionId ? updatedVoteQuestion : row)
        // );
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
            await getVoteQuestions()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const removeDiscord = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm remove from discord for question id '" + questionId + "' ?", "Remove from Discord", confirmRemoveDiscord, questionId)
    }

    const confirmRemoveDiscord = async (questionId) => {
        mdLoading.current.show("Remove from discord..")
        let result = await voteDiscordQuestionDeleteDiscord({questionId: questionId })
        console.log("Remove from discord result", result);
        if(result?.Success){
            showSuccess("Removed from Discord.")
            await getVoteQuestions()
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
            await getVoteQuestions()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const closeVoting = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm Close Voting for Question with Id '" + questionId + "' ?", "Close", confirmCloseVoting, questionId)
    }

    const confirmCloseVoting = async (questionId) => {
        mdLoading.current.show("Closing..")
        let result = await voteDiscordQuestionPut({
            questionId: questionId,
            isOpen: false,
        })
        console.log("close result", result);
        if(result?.Success){
            showSuccess("Vote Discord Question closed")
            await getVoteQuestions()
        }
        else {
            showFailed(result.Message)
        }
        mdLoading.current.close()
    }

    const openVoting = (questionId) => {
        mdConfirm.current.show("Confirm", "Confirm Open Voting for Question with Id '" + questionId + "' ?", "Open", confirmOpenVoting, questionId)
    }

    const confirmOpenVoting = async (questionId) => {
        mdLoading.current.show("Opening..")
        let result = await voteDiscordQuestionPut({
            questionId: questionId,
            isOpen: true,
        })
        console.log("open result", result);
        if(result?.Success){
            showSuccess("Vote Discord Question opened")
            await getVoteQuestions()
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
                <h2 className="ml-3 text-sm font-bold">VOTE QUESTIONS</h2>   
            </div>
            <div className="p-4 w-full">
                <div className={`relative flex flex-col break-words rounded-sm min-w-0 items-center ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <div className="w-full justify-start">
                        <button className="btn btn-primary btn-sm my-2 ml-2" onClick={() => router.push("/vote/discord/question/new")}>+ CREATE NEW</button>
                    </div>
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
                                {/* <div className="flex flex-col">
                                    <label>Display Name</label>
                                    <input type="text" 
                                        placeholder="Display Name" 
                                        value={displayName}
                                        className="input input-bordered w-full"
                                        onChange={(e) => setDisplayName(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
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
                    <div className="flex justify-end w-full mb-2">
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
                                <th>CHOICES</th>
                                {/* <th>VOTED</th> */}
                                <th>SELECTION TYPE</th>
                                <th>DISCORD CHANNEL ID</th>
                                <th>POSTED TO DISCORD</th>
                                <th>VOTING CLOSED</th>
                                {/* <th>PLAYER ID</th> */}
                                <th>CREATED DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                voteQuestions && voteQuestions.length > 0
                                ?
                                voteQuestions
                                        .map(
                                            (x, index) => (
                                                <tr key={`votequestion_` + index} className={`${process.env.IS_TEST == 'true' ? 'bg-[#00316E]' : 'bg-[#2a303c]'}`}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    {/* <td>
                                                        {x.TwoDURL && <a href={x.TwoDURL}><img src={x.TwoDURL} className="max-w-[100px]" /></a>}
                                                    </td> */}
                                                    <td>
                                                        <>QuestionId: {x.QuestionId} </>
                                                        {x.ProjectName && <><br/>Project Name: {x.ProjectName}</>}
                                                        {x.Title && <><br/><>Title: {x.Title}</></>}
                                                        <><br/>Description: {x.Description}</>
                                                        <br/>
                                                        {x.ArtworkIds && <>ArtworkId: {x.ArtworkIds}</>}
                                                    </td>
                                                    <td>
                                                        {x.Choices && JSON.stringify(x.Choices)}
                                                        <br/>
                                                        <br/>
                                                        <FontAwesomeIcon icon={faRefresh} className="h-4 cursor-pointer" onClick={()=> getVoteStat(x.QuestionId)}/><span className="link ml-2" onClick={()=> getVoteStat(x.QuestionId)}>Vote Summary</span>
                                                        <div className="flex flex-col">
                                                            <div className="flex">
                                                                {
                                                                    x.VoteStat && 
                                                                    x.VoteStat.map(s=> (
                                                                        <>{s}<br/></>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        { x.IsMultiSelect ? 'MULTIPLE' : 'SINGLE' }
                                                    </td>
                                                    <td>
                                                        { x.DiscordChannelId }
                                                    </td>
                                                    <td>
                                                        { x.IsPostedToDiscord ? 'POSTED' : '' }
                                                    </td>
                                                    <td>
                                                        { x.IsOpen ? '' : 'CLOSED' }
                                                    </td>
                                                    <td>
                                                        { moment(x.CreatedDate).format('YYYY-MM-DD')}
                                                        <br />
                                                        { moment(x.CreatedDate).format('HH:mm')}
                                                    </td>
                                                    <td>
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
                                                                {
                                                                     x.IsOpen &&
                                                                     <li>
                                                                        <a onClick={() => closeVoting(x.QuestionId)}>Close Voting</a>
                                                                    </li>
                                                                }
                                                                {
                                                                     !x.IsOpen &&
                                                                     <li>
                                                                        <a onClick={() => openVoting(x.QuestionId)}>Open Voting</a>
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
                                                    </td>
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

export default VoteDiscordQuestionListing