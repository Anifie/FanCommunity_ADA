import { useContext, useEffect, useState } from "react"
//import { Web3Context } from "../../../common/context/Web3Context"
//import ConnectButton from "./ConnectButton"
//import Image from 'next/image'
//import VerifySignatureButton from "./VerifySignatureButton"
import { MemberContext } from "../../../common/context/MemberContext"
import { useRouter } from 'next/router'

const LoginForm = () => {

    //const {account} = useContext(Web3Context)
    const {member, error, loading, signIn, signOut} = useContext(MemberContext)
    const router = useRouter()
    //let jwt = localStorage.getItem("tokyodome_admin_access_token")
    const [jwt, setJWT] = useState();

    useEffect(() => {
        let token = localStorage.getItem("tokyodome_admin_access_token")
        if(token)  {
            const jwtPayload = JSON.parse(window.atob(token.split('.')[1]))
            console.log("jwtPayload", jwtPayload)
            
            if (Date.now() >= jwtPayload.exp * 1000) {
                signOut()
                router.push("/login")
                return
            }
        }

        setJWT(token)
    }, [])
    

  // if(account) {
  //   let signature = localStorage.getItem("AnifieAdminSignature")
  //   if(signature) {
  //     isAuthorized = await signIn(account, signature)
  //   }
  // }

    const formSubmitted = async (e) => {
        e.preventDefault();
        let success = await signIn(e.target.email.value, e.target.password.value);
        if(success) {
            router.push("/");
        }
    }

    return (
        <div className="relative min-h-screen bg-black w-full h-full">
            <div className="bg-[url('/images/DJ-Dancing.png')] relative bg-center bg-cover top-0 left-0 right-0 bottom-0 w-full h-[1020px]">
                {/* <div className="absolute top-0 left-0 right-0 w-full h-[380px] opacity-70 bg-slate-400"></div> */}
                {/* <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1440 120">
                        <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
                    </svg>
                </div>            */}
            </div>           
            <div className="absolute -top-28 right-0 left-0 flex flex-col justify-center h-full">
                <div className="flex flex-col items-center p-3 transition-all ease-out duration-100 h-14">
                    <img src="/images/logo.png" height="30px" width="96px" />
                    <h4 className="mt-3 font-extrabold text-slate-100">{process.env.TITLE} Admin Portal</h4>
                </div>
                <div className="mx-auto mt-14">
                    <div className="flex flex-col items-center bg-slate-800 rounded-sm p-4 w-96">
                        <h4 className="text-blue-300 font-semibold m-4">Welcome Back!</h4>
                        {/* <span className="text-sm mb-10">Connect your wallet to continue to Illuminati Tomorrow Admin Portal</span> */}
                        {
                            !member && !jwt
                                ? (
                                    <form className="Auth-form text-slate-100" onSubmit={(e)=> formSubmitted(e)}>
                                        <div className="Auth-form-content">
                                            <h3 className="Auth-form-title">Sign In</h3>
                                            <div className="form-group mt-3">
                                                <input name="email" type="email" placeholder="Enter email" className="input input-bordered w-[300px]" />
                                            </div>
                                            <div className="form-group mt-3">
                                                <input name="password" type="password" placeholder="Enter password" className="input input-bordered w-[300px]" />
                                            </div>
                                            <br/>
                                            <div className="d-grid gap-2 mt-3">
                                                <button type="submit" className="btn">Submit</button>
                                            </div>
                                            {/* <p className="forgot-password text-right mt-2">
                                                <a href="#" className="link">Forgot password?</a>
                                            </p> */}
                                        </div>
                                    </form>
                                )
                                : (
                                   <span className="text-sm text-slate-100">Signed in succesfully. Redirecting..</span>
                                )
                        } 
                        <span className="mt-4 text-slate-100">{loading && "Authenticating.."}</span>
                        <span className="mt-4 text-red-600">{error}</span>
                    </div>
                </div>
            </div> 
        </div>
    )
}

export default LoginForm