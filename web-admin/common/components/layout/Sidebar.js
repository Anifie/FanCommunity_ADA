//import Image from 'next/image'
import Link from 'next/link'
import { faDashboard, faAngleRight, faAngleDown, faLightbulb, faUserTie, faUser, faMessage, faPhotoFilm, faCoins, faWallet, faGear, faGamepad, faCar, faQuestion, faPen, faFaceSmile, faQuestionCircle, faPaintBrush, faToolbox, faCity, faIdCard, faJpy, faUserShield, faIdBadge, faPhotoVideo, faHandshake, faStar, faTrophy, faMoneyBill, faYenSign } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { faArtstation, faDiscord, faSalesforce, faSuperpowers } from '@fortawesome/free-brands-svg-icons'
import { useRouter } from 'next/router';

const Sidebar = () => {

    // const [chatCollapse, setChatCollapse] = useState(false)
    const [metaverseCollapse, setMetaverseCollapse] = useState(true)
    const [nftCollapse, setNftCollapse] = useState(true)
    const [memberCollapse, setMemberCollapse] = useState(true)
    const [salesCollapse, setSalesCollapse] = useState(true)
    const [eventCollapse, setEventCollapse] = useState(false)
    const [surveyCollapse, setSurveyCollapse] = useState(false)
    const [chatCollapse, setChatCollapse] = useState(true)
    const [roleCollapse, setRoleCollapse] = useState(true)
    const [artworkCollapse, setArtworkCollapse] = useState(true)
    const [analysisCollapse, setAnalysisCollapse] = useState(true)
    const [superChatCollapse, setSuperChatCollapse] = useState(true)
    const [role, setRole] = useState(true)
    const [pointCollapse, setPointCollapse] = useState(true)

    const router = useRouter();
    const currentPath = router.pathname;  // Get current path

    useEffect(()=> {
        let _role = localStorage.getItem("role")
        console.log("role", _role);
        setRole(_role)
    }, [])

    return (
        <div className={`z-10 fixed top-0 bottom-0 mt-0 w-60 ${process.env.IS_TEST == 'true' ? 'bg-[#001540]' : 'bg-[#212529]'} `}>
            <div className="text-center p-3 transition-all ease-out duration-100 h-14">
                <img src="/images/logo.png" height="30px" width="96px" />
            </div>
            <div className='overflow-auto mx-3 text-slate-100'>
                <ul className=''>
                    <li className='text-[12px] mb-4'>
                        <Link href="/">MENU</Link>
                    </li>
                    {
                        role === 'ADMIN' &&
                        <>
                            <li className={`${currentPath === '/' ? 'bg-primary p-1' : 'hover:text-white'} text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold`}>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faDashboard} className="h-4 w-4"/>
                                    <Link href="/">Dashboard</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li>
                            <li className={`${currentPath === '/administrator' ? 'bg-primary p-1' : 'hover:text-white'} text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold`}>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faUserTie} className="h-4 w-4"/>
                                    <Link href="/administrator">Adminstrator</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li>
                            {/* <li className={`${currentPath === '/member' ? 'bg-primary p-1' : 'hover:text-white'} text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold`}>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faUser} className="h-4 w-4"/>
                                    <Link href="/member">Member</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li> */}
                            <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            memberCollapse 
                                                ? document.getElementById("dvMember").classList.remove("hidden")
                                                : document.getElementById("dvMember").classList.add("hidden")
                                            setMemberCollapse(!memberCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faUser} className="h-4 w-4"/>
                                        <span>Member</span>
                                    </div>
                                    <FontAwesomeIcon icon={memberCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${memberCollapse ? 'hidden' : ''}`} id='dvMember'>
                                    <li className={currentPath === '/member' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/member">- Member Listing</Link></li>
                                    <li className={currentPath === '/member/qr' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/member/qr">- Membership QRs</Link></li>
                                    {/* <li className={currentPath === '/stickerid/announcement' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/stickerid">- Sticker Ids</Link></li> */}
                                </ul>
                            </li>

                            {/* <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            roleCollapse 
                                                ? document.getElementById("dvRole").classList.remove("hidden")
                                                : document.getElementById("dvRole").classList.add("hidden")
                                            setRoleCollapse(!roleCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faIdBadge} className="h-4 w-4"/>
                                        <span>Role</span>
                                    </div>
                                    <FontAwesomeIcon icon={roleCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${roleCollapse ? 'hidden' : ''}`} id='dvRole'>
                                    <li className={currentPath === '/role' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/role" className='p-2'>- Listing</Link></li>
                                    <li className={currentPath === '/role/member' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/role/member" className='p-2'>- Role Member</Link></li>
                                </ul>
                            </li> */}

                            {/* <li className={`${currentPath === '/role' ? 'bg-primary p-1' : 'hover:text-white'} text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold`}>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faIdBadge} className="h-4 w-4"/>
                                    <Link href="/role">Role</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li> */}
                            {/* <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            chatCollapse 
                                                ? document.getElementById("dvChat").classList.remove("hidden")
                                                : document.getElementById("dvChat").classList.add("hidden")
                                            setChatCollapse(!chatCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faMessage} className="h-4 w-4"/>
                                        <span>Chat</span>
                                    </div>
                                    <FontAwesomeIcon icon={chatCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${chatCollapse ? 'hidden' : ''}`} id='dvChat'>
                                    <li className={currentPath === '/chat/connections' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/connections" className='p-2'>- Connections</Link></li>
                                    <li className={currentPath === '/chat/channel-category' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/channel-category" className='p-2'>- Channel Category</Link></li>
                                    <li className={currentPath === '/chat/channel' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/channel" className='p-2'>- Channel</Link></li>
                                    
                                    <li className={currentPath === '/chat/channel-message' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/channel-message" className='p-2'>- Channel Message</Link></li>
                                    <li className={currentPath === '/chat/channel-message-reaction' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/channel-message-reactions" className='p-2'>- Channel Message Reaction</Link></li>
                                    <li className={currentPath === '/chat/thread' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/thread" className='p-2'>- Thread</Link></li>
                                    <li className={currentPath === '/chat/thread-message' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/thread-message" className='p-2'>- Thread Message</Link></li>
                                    
                                    <li className={currentPath === '/chat/member-channel' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/member-channel" className='p-2'>- Member Channel</Link></li>
                                    <li className={currentPath === '/chat/member-message' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/member-message" className='p-2'>- Member Channel Message</Link></li>
                                    <li className={currentPath === '/chat/member-thread' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/member-thread" className='p-2'>- Member Thread</Link></li>
                                    <li className={currentPath === '/chat/member-thread-message' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/member-thread-message" className='p-2'>- Member Thread Message</Link></li>
                                    
                                </ul>
                            </li> */}
                            {/* <li className={currentPath === '/chat/thread' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/thread" className='p-2'>- Thread</Link></li> */}
                                    {/* <li className={currentPath === '/chat/thread-message-reaction' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/thread-message-reactions" className='p-2'>- Thread Message Reaction</Link></li> */}
                                    {/* <li className={currentPath === '/chat/member-settings' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/member-settings" className='p-2'>- Member Settings</Link></li> */}
                                    {/* <li className={currentPath === '/chat/notification' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/chat/notification" className='p-2'>- Notification</Link></li> */}

                            <li className={`${currentPath === '/role' ? 'bg-primary p-1' : 'hover:text-white'} text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold`}>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faStar} className="h-4 w-4"/>
                                    <Link href="/artist">Artist</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li>
                            {/* <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            metaverseCollapse 
                                                ? document.getElementById("dvMetaverse").classList.remove("hidden")
                                                : document.getElementById("dvMetaverse").classList.add("hidden")
                                            setMetaverseCollapse(!metaverseCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faCity} className="h-4 w-4"/>
                                        <span>Metaverse</span>
                                    </div>
                                    <FontAwesomeIcon icon={metaverseCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${metaverseCollapse ? 'hidden' : ''}`} id='dvMetaverse'>
                                    <li className={currentPath === '/event/events' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/event/events">- Events</Link></li>
                                    <li className={currentPath === '/event/ticket' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/event/ticket">- Tickets</Link></li>
                                    <li className={currentPath === '/metaverse/room' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/metaverse/room">- Rooms</Link></li>
                                    <li className={currentPath === '/metaverse/avatar' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/metaverse/avatar">- Avatars</Link></li>
                                    <li className={currentPath === '/metaverse/announcement' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/metaverse/announcement">- Announcements</Link></li>
                                    <li className={currentPath === '/metaverse/invitation' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/metaverse/invitation">- Invitations</Link></li>
                                </ul>
                            </li> */}
                            <li className='text-white flex items-center justify-between ml-2 my-5 text-sm font-semibold'>
                                <div className='flex items-center gap-2'>
                                    <FontAwesomeIcon icon={faPaintBrush} className="h-4 w-4"/>
                                    <Link href="/artwork">Artwork</Link>
                                </div>
                                <FontAwesomeIcon icon={faAngleRight} className="h-3"/>
                            </li>
                            <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            nftCollapse 
                                                ? document.getElementById("dvNFT").classList.remove("hidden")
                                                : document.getElementById("dvNFT").classList.add("hidden")
                                            setNftCollapse(!nftCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faPhotoVideo} className="h-4 w-4"/>
                                        <span>NFT</span>
                                    </div>
                                    <FontAwesomeIcon icon={nftCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${nftCollapse ? 'hidden' : ''}`} id='dvNFT'>
                                    <li className={currentPath === '/nft/listing' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/nft/listing">- All NFTs</Link></li>
                                    <li className={currentPath === '/nft/queue' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/nft/queue">- NFT Queue Listing</Link></li>
                                    {/* <li className={currentPath === '/nft/update' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/nft/update">- NFT Update</Link></li> */}
                                </ul>
                            </li>
                            <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            superChatCollapse 
                                                ? document.getElementById("dvSuperChat").classList.remove("hidden")
                                                : document.getElementById("dvSuperChat").classList.add("hidden")
                                            setSuperChatCollapse(!superChatCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faSuperpowers} className="h-4 w-4"/>
                                        <span>SuperChat</span>
                                    </div>
                                    <FontAwesomeIcon icon={superChatCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${superChatCollapse ? 'hidden' : ''}`} id='dvSuperChat'>
                                    <li className='hover:text-white'><Link href="/superchat/templates">- Templates</Link></li>
                                </ul>
                            </li>
                            <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            salesCollapse 
                                                ? document.getElementById("dvSales").classList.remove("hidden")
                                                : document.getElementById("dvSales").classList.add("hidden")
                                            setSalesCollapse(!salesCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faYenSign} className="h-4 w-4"/>
                                        <span>Sales</span>
                                    </div>
                                    <FontAwesomeIcon icon={salesCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${salesCollapse ? 'hidden' : ''}`} id='dvSales'>
                                    <li className={currentPath === '/sales/payments' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/sales/payments">- Payments</Link></li>
                                </ul>
                            </li>
                            <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            analysisCollapse 
                                                ? document.getElementById("dvAnalysis").classList.remove("hidden")
                                                : document.getElementById("dvAnalysis").classList.add("hidden")
                                            setAnalysisCollapse(!analysisCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faDiscord} className="h-4 w-4"/>
                                        <span>Discord</span>
                                    </div>
                                    <FontAwesomeIcon icon={analysisCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${analysisCollapse ? 'hidden' : ''}`} id='dvAnalysis'>
                                    <li className={currentPath === '/analysis/discord' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/analysis/discord">- Analysis</Link></li>
                                    <li className={currentPath === '/analysis/heatmap' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/analysis/heatmap">- Heat Map Visualization</Link></li>
                                    <li className={currentPath === '/analysis/message' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/analysis/message">- Discord Chat Messages</Link></li>
                                </ul>
                            </li>
                            {/* <li className="text-sm font-semibold">
                                <div className='hover:text-white flex items-center justify-between ml-2 my-5'
                                        onClick={() => {
                                            pointCollapse 
                                                ? document.getElementById("dvPoints").classList.remove("hidden")
                                                : document.getElementById("dvPoints").classList.add("hidden")
                                                setPointCollapse(!pointCollapse);
                                        }
                                    }>
                                    <div className='flex items-center gap-2'>
                                        <FontAwesomeIcon icon={faTrophy} className="h-4 w-4"/>
                                        <span>Discord Points</span>
                                    </div>
                                    <FontAwesomeIcon icon={pointCollapse ? faAngleRight: faAngleDown} className="h-3"/>
                                </div>
                                <ul className={`ml-7 flex flex-col gap-4 ${pointCollapse ? 'hidden' : ''}`} id='dvPoints'>
                                    <li className={currentPath === '/point' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/point">- Points</Link></li>
                                    <li className={currentPath === '/point/settings' ? 'bg-primary p-1' : 'hover:text-white'}><Link href="/point/settings">- Point Settings</Link></li>
                                </ul>
                            </li> */}
                            
                        </>
                    }
                </ul>
            </div>
        </div>
    );
}

export default Sidebar