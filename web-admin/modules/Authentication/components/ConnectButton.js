import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext} from 'react'
import { Web3Context } from '../../../common/context/Web3Context'

const ConnectButton = () => {

    const {connectWallet} = useContext(Web3Context)

    return (
        <button className="from-purple-500 to-pink-500 bg-gradient-to-l hover:bg-gradient-to-r ring-0 p-2 btn-sm rounded-3xl flex items-center justify-center"
                onClick={connectWallet}>
            <FontAwesomeIcon icon={faWallet} className="w-4" />
            <div className="flex items-center justify-center font-extrabold">
                <span>&nbsp;Connect</span>
                <span className="hidden lg:block">&nbsp;Wallet</span>
            </div>
        </button>
    )
}

export default ConnectButton