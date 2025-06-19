import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext} from 'react'
import { Web3Context } from '../../../common/context/Web3Context'
//import { signIn } from '../api/member'
import { useRouter } from 'next/router'
import { MemberContext } from '../../../common/context/MemberContext'

const VerifySignatureButton = () => {

    const {error, signIn} = useContext(MemberContext)
    const {account, signMessage} = useContext(Web3Context)
    const router = useRouter()

    const verifySignature = async () => {
        let signature = await signMessage("This is just extra security that you own this wallet address " + account)
        let authorized = await signIn(account, signature)
        if(authorized){
            localStorage.setItem("AnifieAdminAddress", account)
            localStorage.setItem("AnifieAdminSignature", signature)
            //router.push("/")
            //window.location.reload()
            //window.location.href = "/"
        }
        else {
            console.error(error);
        }

    }

    return (
        <button className="from-purple-500 to-pink-500 bg-gradient-to-l hover:bg-gradient-to-r ring-0 p-2 btn-sm rounded-3xl flex items-center justify-center"
                onClick={verifySignature}>
            <FontAwesomeIcon icon={faWallet} className="w-4" />
            <div className="flex items-center justify-center font-extrabold">
                <span>&nbsp;Verify Signature</span>
            </div>
        </button>
    )
}

export default VerifySignatureButton