import { useContext, useEffect, useState, useRef } from "react";
import { faGear, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ToastContext } from "../../../common/context/ToastContext";
import ModalLoading from "../../../common/components/modal/ModalLoading";
import useHelper from "../../../common/hooks/useHelper";
import useStateCallback from "../../../common/hooks/useStateCallback";
import { useForm } from "react-hook-form";
import { proposalPost, voteDiscordQuestionPost } from "../api";
import EmojiPicker from 'emoji-picker-react';

const CreateVoteDiscordQuestion = () => {


    const {register, formState: {errors}, handleSubmit, setValue, watch} = useForm()
    const {showSuccess, showFailed, showInfo} = useContext(ToastContext)
    const router = useRouter()
    const mdLoading = useRef(null)

    // const [choiceBoxes, setChoiceBoxes] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    //const [currentTextboxId, setCurrentTextboxId] = useState(null);
    // const [isEmojiBox, setIsEmojiBox] = useState(false);
    // const [isTextArea, setIsTextArea] = useState(false);

    const isEmojiBoxRef = useRef(false);
    const isTextAreaRef = useRef(false);
    const currentTextboxIdRef = useRef(null);
    const choiceBoxesRef = useRef([]);
    const [id, setId] = useState(0)

    useEffect(()=> {
        setId(id+1)
    }, [])

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
            console.log(11);
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
            console.log(22);
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

    const onSubmit = async (data) => {
        
        console.log("data", data);

        mdLoading.current.show("Updating database")
        
        let result = await voteDiscordQuestionPost({
                                        description: data.description,
                                        choices: choiceBoxesRef.current.map(x => ({label: x.label, emoji: x.emoji})),
                                        sendToDiscordImmediately: data.postdiscord == 'true',
                                        discordChannelId: data.discordchannelid,
                                        isMultiSelect: data.ismultiselect == 'true',
                                        multiSelectLabel: data.multiselectlabel,
                                        title: data.title,
                                        projectName: data.projectname
                                    })

        console.log("question result", result)
        
        if(result.Success) {
            console.log('question posted successfully')
            showSuccess("Vote question added successfully");
            mdLoading.current.close()
            router.push("/vote/discord/question")
        }
        else {
            mdLoading.current.close()
            showFailed(result.Message)
        }
    }

    return (
        <div className="flex flex-col justify-start items-start h-full w-full text-slate-100">
            <ModalLoading ref={mdLoading} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className={`h-12 flex items-center w-full ${process.env.IS_TEST == 'true' ? 'bg-[#00224B]' : 'bg-[#212529]'}`}>
                    <h2 className="ml-3 text-sm font-bold">NEW VOTE QUESTION</h2>                        
                </div>
                <div className="w-full flex">
                    <div className="p-4 w-full">
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
                        <div className="">
                            <div className="flex flex-col">
                                <label>Question <span className="text-red-400">*</span><span className="ml-5 text-xs">(You can copy emoji from <a className="link" target="_blank" href="https://getemoji.com/">Emoji</a>)</span></label>
                                <textarea className="p-1" {...register("description", {required: true})} rows={10} onFocus={() => handleTextAreaFocus()}>
                                </textarea>
                                {errors.description?.type === 'required' && <p className="text-red-500">Description is required</p>}
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
                                <label>Answer Choices <span className="text-red-400">*</span><span className="ml-2">(Maximum 25 choices)</span><span className="ml-5 text-xs">(You can copy emoji from <a className="link" target="_blank" href="https://getemoji.com/">Emoji</a>)</span></label>
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
                                                onKeyUp={() => {setId(id+1); return;}}
                                                onKeyDown={() => {setId(id+1); return;}}
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
                        {/* <div className="">
                            <div className="flex flex-col">
                                <label>Start Date</label>
                                <input type="text" 
                                    placeholder="Start Date" 
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("startdate", {required: true})} />
                                {errors.isopen?.type === 'startdate' && <p className="text-red-500">Start Date is required</p>}
                            </div>
                        </div>
                        <br/>
                        <div className="">
                            <div className="flex flex-col">
                                <label>End Date</label>
                                <input type="text" 
                                    placeholder="End Date"
                                    className="input input-bordered w-full max-w-lg"
                                    {...register("enddate", {required: true})} />
                                {errors.isopen?.type === 'enddate' && <p className="text-red-500">End Date is required</p>}
                            </div>
                        </div>
                        <br/> */}
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
                        <button className="mt-5 btn btn-primary btn-sm" type="submit">Create</button>
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

export default CreateVoteDiscordQuestion