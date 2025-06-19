import AppHeader from './AppHeader'
import AppFooter from './AppFooter'
import Sidebar from './Sidebar'
import { useContext, useEffect, useState} from 'react'
//import { Web3Context } from '../../context/Web3Context'
import { MemberContext } from '../../context/MemberContext'
import LoginForm from '../../../modules/Authentication/components/LoginForm'

const Layout = (props) => {

    //const {account} = useContext(Web3Context)
    const {member, getProfile, setMember} = useContext(MemberContext)

    //restore member profile state
    useEffect(() => {
        const getMemberProfile = async () => {
            console.log("getMemberProfile");
            let tokyodome_admin_access_token = localStorage.getItem("tokyodome_admin_access_token")
            console.log("tokyodome_admin_access_token", tokyodome_admin_access_token);
            if(!member && tokyodome_admin_access_token) {
                console.log("Signing in..");                
                console.log("sign in from layout");
                let memberProfile = await getProfile();
                setMember(memberProfile.Data.profile);
            }
        }
        
        getMemberProfile().catch(console.error)

    }, [member])

    return (
        <div className="w-full">
            {
                member
                ? 
                    <>
                        <AppHeader></AppHeader>
                        <Sidebar></Sidebar>
                        <main className={`${process.env.IS_TEST == 'true' ? 'bg-[#001B3A]' : 'bg-[#1a1d21]'} mt-14 ml-60 flex flex-col items-start`} data-theme="dark">
                            {props.children}
                            {/* <AppFooter></AppFooter> */}
                        </main>
                    </>
                : 
                    <>
                        <main className='bg-[#1a1d21] flex flex-col items-start' data-theme="dark">
                            <LoginForm/>
                            {/* <AppFooter></AppFooter> */}
                        </main>
                    </>
            }
        </div>
    );
}

export default Layout;