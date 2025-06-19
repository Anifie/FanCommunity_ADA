import Link from 'next/link'
import { useContext} from 'react'
import { MemberContext } from '../../../common/context/MemberContext'
//import { Web3Context } from '../../../common/context/Web3Context'
import { useRouter } from 'next/router'

const ConnectedDropDown = () => {

    const router = useRouter()
    const {member, signOut} = useContext(MemberContext)
    //const {chainId, account, disconnectWallet} = useContext(Web3Context)
    const logOut = async () => {
        //await disconnectWallet()
        signOut()
        //router.push("/login")
        //window.location.href = "/"
        router.push("/")
    }

    return (
        <div className="flex justify-end items-center">
            <div className="dropdown dropdown-end">
            <label tabIndex="0" className="btn btn-ghost btn-circle avatar btn-sm">
                <div className="w-8 rounded-full">
                {
                    member && member.ProfilePictureURL
                        ? <img src={member.ProfilePictureURL} alr="Picture"></img>
                        : <img src="/images/avatar.png" alr="avatar"></img>
                }
                </div>
            </label>
            <ul tabIndex="0" className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-[#212529] rounded-box w-52">
                {/* <li>
                <Link href="/mycollection/nftassets" className="justify-between">
                    My Collection
                </Link>
                </li> */}
                {/* <li>
                    <Link href="/mycollection/settings" className="justify-between">
                        Settings
                    </Link>
                </li> */}
                <li><a className='text-slate-100' onClick={logOut}>Logout</a></li>
            </ul>
            </div>
            { member &&
                <div className="ml-2 text-slate-100">
                    <span>{member.DisplayName}</span>
                </div>
            }
        </div>
    )
}

export default ConnectedDropDown