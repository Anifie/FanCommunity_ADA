import { useContext, useEffect, useState, useRef } from "react";
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import { useForm } from "react-hook-form";
import { voteDiscordQuestionListing, voteDiscordQuestionPut } from "../api";
import EmojiPicker from 'emoji-picker-react';

const EditVoteDiscordQuestion = () => {

    const [questionId, setQuestionId] = useState()

    const {register, formState: {errors}, handleSubmit, setValue, watch} = useForm()

    const {showSuccess, showFailed} = useContext(ToastContext)
    const router = useRouter()
    const query = router.query
    const mdLoading = useRef(null)

    // const [choiceBoxes, setChoiceBoxes] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    // const [currentTextboxId, setCurrentTextboxId] = useState(null);
    // const [isEmojiBox, setIsEmojiBox] = useState(false);
    // const [isTextArea, setIsTextArea] = useState(false);

    const isEmojiBoxRef = useRef(false);
    const isTextAreaRef = useRef(false);
    const currentTextboxIdRef = useRef(null);
    const choiceBoxesRef = useRef([]);
    const [id, setId] = useState(0)

    const addChoiceBox = () => {
        if(choiceBoxesRef.current.length == 25) {
            showFailed("Discord only support maximum 25 buttons")
            return
        }
        isEmojiBoxRef.current = true;
        isTextAreaRef.current = false;
        currentTextboxIdRef.current = choiceBoxesRef.current.length - 1
        choiceBoxesRef.current = [...choiceBoxesRef.current, { id: choiceBoxesRef.current.length, label: '', emoji: '' }]
        setId(id+1);
    };

    const removeChoiceBox = (id) => {
        setId(id+1);
        choiceBoxesRef.current = choiceBoxesRef.current.filter(box => box.id !== id)
        setId(id+1);
    };

    const handleChange = (id, value) => {
        choiceBoxesRef.current = choiceBoxesRef.current.map(box =>
            box.id === id ? { ...box, label: value } : box
        )
    };

    const handleEmojiChange = (id, value) => {
        choiceBoxesRef.current = choiceBoxesRef.current.map(box =>
            box.id === id ? { ...box, emoji: value } : box
        )
    };

    const handleEmojiClick = (emojiObject, event) => {
        if(isEmojiBoxRef.current) {
            choiceBoxesRef.current = choiceBoxesRef.current.map(box => {
                console.log("box", box);
                if (box.id === currentTextboxIdRef.current) {
                    if(isEmojiBoxRef.current) {
                        //return { ...box, emoji: box.emoji + emojiObject.emoji };
                        return { ...box, emoji: emojiObject.emoji };
                    }
                    // else {
                    //     return { ...box, label: box.label + emojiObject.emoji };
                    // }
                }
                return box;
            })
        }
        else if(isTextAreaRef.current) {
            const currentText = watch('description', '');
            const newText = currentText + emojiObject.emoji;
            setValue("description", newText)
        }
        setShowPicker(false);
    };

    const handleTextboxFocus = (id) => {
        isEmojiBoxRef.current = true;
        console.log("isEmojiBox 1", isEmojiBoxRef.current);
        isTextAreaRef.current = false;
        currentTextboxIdRef.current = id
        setShowPicker(true);
    };

    const handleTextAreaFocus = () => {
        isEmojiBoxRef.current = false;
        console.log("isEmojiBox 3", isEmojiBoxRef.current);
        isTextAreaRef.current = true;
        setShowPicker(true);
    };

    useEffect(() => {        
        const {questionid} = router.query
        setQuestionId(questionid)
        getQuestion(questionid)
    }, [])

    const getQuestion = async (qid) => {
        let questionResult = await voteDiscordQuestionListing({questionId: qid})
        console.log("questionResult", questionResult)
        if(questionResult.Success) {
            setValue("description", questionResult.Data.votes[0].Description)
            setValue("discordchannelid", questionResult.Data.votes[0].DiscordChannelId)
            setValue("isopen", questionResult.Data.votes[0].IsOpen ? 'true' : 'false')
            setValue("ismultiselect", questionResult.Data.votes[0].IsMultiSelect ? 'true' : 'false')
            setValue("multiselectlabel", questionResult.Data.votes[0].MultiSelectLabel)
            setValue("title", questionResult.Data.votes[0].Title)
            setValue("projectname", questionResult.Data.votes[0].ProjectName)
            let _choiceBoxes = [];
            for (let i = 0; i < questionResult.Data.votes[0].Choices.length; i++) {
                const choice = questionResult.Data.votes[0].Choices[i];
                _choiceBoxes.push({ id: i, label: choice.label, emoji: choice.emoji })
            }
            choiceBoxesRef.current = _choiceBoxes
            setId(id+1)
        }
    }

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await voteDiscordQuestionPut({
                                        questionId: questionId,
                                        description: data.description,
                                        choices: choiceBoxesRef.current.map(x => ({label: x.label, emoji: x.emoji})),
                                        sendToDiscordImmediately: data.postdiscord == 'true',
                                        discordChannelId: data.discordchannelid,
                                        isOpen: data.isopen == 'true',
                                        isMultiSelect: data.ismultiselect == 'true',
                                        multiSelectLabel: data.multiselectlabel,
                                        title: data.title,
                                        projectName: data.projectname
                                    })

        console.log("update question result", result)
        
        if(result.Success) {
            mdLoading.current.close()
            showSuccess("Vote question edited successfully")
            router.push("/vote/discord/question")
        }            
        else {
            mdLoading.current.close()
            showFailed("Vote question edit failed with message: " + result.Message)
        }
    }
    
    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">EDIT VOTE QUESTION</h2>                        
                </div>
                <div className="w-full flex">
                    <div className="p-4 w-1/2">
                        <div className="form-control">
                            <div className="flex flex-col">
                                <label>Vote Question Id</label>
                                <input type="text" 
                                    disabled 
                                    value={questionId} 
                                    placeholder="Vote Question Id" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("questionid", {required: false})} />
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Discord Channel Id <span className="text-red-400">*</span><span className="ml-5 text-xs">(Example: 1263288181877506110)</span></label>
                                <input
                                    type="number"
                                    placeholder="Discord Channel Id"
                                    onKeyUp={() => setId(id+1)}
                                    onKeyDown={() => setId(id+1)}
                                    className="input input-bordered w-[380px] max-w-lg mb-2"
                                    {...register("discordchannelid", {required: true})}
                                />
                                {errors.discordchannelid?.type === 'required' && <p className="text-red-500">Discord Channel Id is required</p>}
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Project Name</label>
                                <textarea
                                        className="p-3 resize-none"
                                        placeholder="Project Name"
                                        wrap="off"
                                        rows="1"
                                        style={{ marginRight: '8px' }}
                                        {...register("projectname", {required: false})}>
                                    </textarea>
                                {/* {errors.title?.type === 'required' && <p className="text-red-500">Title is required</p>} */}
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Title</label>
                                <textarea
                                        className="p-3 resize-none"
                                        placeholder="Title"
                                        wrap="off"
                                        rows="1"
                                        style={{ marginRight: '8px' }}
                                        {...register("title", {required: false})}>
                                    </textarea>
                                {/* {errors.title?.type === 'required' && <p className="text-red-500">Title is required</p>} */}
                            </div>
                        </div>
                        <br/>
                        <div className="grid sm:grid-cols-1 grid-cols-1 gap-2">
                            <div className="flex flex-col col-span-2">
                                <label>Description<span className="ml-5 text-xs">(You can copy emoji from <a className="link" target="_blank" href="https://getemoji.com/">Emoji</a>)</span></label>
                                <textarea {...register("description", {required: true})} className="p-1" rows={10} onFocus={() => handleTextAreaFocus()}>
                                </textarea>
                            </div>                        
                        </div>
                        <br/>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Answer Selection Type <span className="text-red-400">*</span></label>
                                <select className="select select-bordered max-w-sm" 
                                        {...register("ismultiselect", {required: true})}>
                                            <option value="false">Single Answer</option>
                                            <option value="true">Multiple Answers</option>
                                </select>
                                {errors.ismultiselect?.type === 'required' && <p className="text-red-500">ismultiselect is required</p>}
                            </div>
                        </div>
                        <br/>
                        {
                            watch('ismultiselect', 'false') === 'true' &&
                            <div className="">
                                <div className="flex flex-col w-[400px]">
                                    <label>Multi Select Label  <span className="text-red-400">*</span><span className="ml-5 text-xs">(Example: Select Your Options)</span></label>
                                    <textarea
                                        className="p-3 resize-none"
                                        placeholder="Multi Select Label"
                                        wrap="off"
                                        rows="1"
                                        style={{ marginRight: '8px' }}
                                        {...register("multiselectlabel", {required: true})}>
                                    </textarea>
                                    {errors.multiselectlabel?.type === 'required' && <p className="text-red-500">multiselectlabel is required</p>}
                                </div>
                                <br/>
                            </div>
                        }
                        <br/>
                        <div className="">
                            <div className="flex flex-col items-start">
                                <label>Answer Choices<span className="ml-2">(Maximum 25 choices)</span><span className="ml-5 text-xs">(You can copy emoji from <a className="link" target="_blank" href="https://getemoji.com/">Emoji</a>)</span></label>
                                <div className="w-full">
                                    {choiceBoxesRef.current.map((box) => (
                                        <div key={box.id} style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="Emoji"
                                                value={box.emoji}
                                                onFocus={() => handleTextboxFocus(box.id)}
                                                onKeyUp={() => setId(id+1)}
                                                onKeyDown={() => setId(id+1)}
                                                className="input input-bordered w-[75px] max-w-lg mb-2"
                                                onChange={(e) => handleEmojiChange(box.id, e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            <textarea
                                                className="p-3 resize-none"
                                                placeholder="Label"
                                                wrap="off"
                                                rows="1"
                                                cols="100"
                                                onChange={(e) => handleChange(box.id, e.target.value)}
                                                style={{ marginRight: '8px' }}>
                                                {box.label}
                                            </textarea>
                                            {/* <input
                                                type="text"
                                                placeholder="Label"
                                                value={box.label}
                                                onKeyUp={() => setId(id+1)}
                                                onKeyDown={() => setId(id+1)}
                                                //onFocus={() => handleTextboxFocus2(box.id)}
                                                className="input input-bordered w-full max-w-lg mb-2"
                                                onChange={(e) => handleChange(box.id, e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            /> */}
                                            <button type="button" onClick={() => removeChoiceBox(box.id)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="btn btn-primary btn-xs" onClick={addChoiceBox}>Add Choice</button><span className="text-transparent">{id}</span>
                                <br/>
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Post to Discord Immediately</label>
                                <select className="select select-bordered max-w-sm" 
                                        {...register("postdiscord", {required: true})}>
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                </select>
                                {errors.postdiscord?.type === 'required' && <p className="text-red-500">postdiscord is required</p>}
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>Voting Status</label>
                                <select className="select select-bordered max-w-sm" 
                                        {...register("isopen", {required: true})}>
                                            <option value="true">Open</option>
                                            <option value="false">Close</option>
                                </select>
                                {errors.isopen?.type === 'required' && <p className="text-red-500">isopen is required</p>}
                            </div>
                        </div>
                        <br/>
                        <button className="mt-5 btn btn-primary btn-sm" type="submit">Update Vote Question</button>
                        <button className="ml-4 mt-5 btn btn-ghost btn-sm" type="button" onClick={() => router.push("/vote/discord/question")}>Cancel</button>
                    </div>
                    <div className="p-4 w-1/2 pt-5">
                        {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditVoteDiscordQuestion