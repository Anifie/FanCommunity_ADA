import { useContext} from 'react'
//import { Web3Context } from '../../../common/context/Web3Context'
import { MemberContext } from "../../../common/context/MemberContext"
import ConnectButton from './ConnectButton'
import ConnectedDropDown from './ConnectedDropDown'

const AuthButton = () => {

    const {member} = useContext(MemberContext)

    return (
        <ul className="mx-4 list-reset flex justify-end flex-1 lg:flex-none items-center">
            {
                member 
                ?   <li className="w-full">
                        <ConnectedDropDown/>
                    </li>
                :   <li className="w-full">
                        <ConnectButton/>
                    </li>
            }        
        </ul>
    )
}

export default AuthButton