import { createContext, useEffect, useState } from "react"
import { signInPost, 
    //signInLanternPost, 
    memberProfileGet } from "../../modules/Authentication/api/member";

const MemberContext = createContext();

const MemberProvider = props => {

    const [member, setMember] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (email, password) => {
        console.log("MemberContext signIn");
        
        setLoading(true);
        let resp = await signInPost(email, password)
        if(resp.Success) {
            console.log("resp", resp);
            let profile = resp.Data.profile
            console.log("profile", profile);
            setError(null)
            setMember(profile)
            localStorage.setItem("tokyodome_admin_access_token", resp.Data.token)
            localStorage.setItem("member_id", profile.MemberId)
            localStorage.setItem("role", profile.Role)

            // let resLanternLogin = await signInLanternPost(profile.PlayerId)
            // if(resLanternLogin.Success) {
            //     setError(null)
            //     setMember(profile)
            //     localStorage.setItem("tokyodome_admin_access_token", resp.Data.token)
            //     //localStorage.setItem("illuminati_lantern_access_token", resLanternLogin.Data.token)
            //     localStorage.setItem("player_id", profile.PlayerId)
            // }
        }            
        else if (resp.Message)
            setError(resp.Message)
        else {
            resp.Success = false
            setError(resp.message + ". Please try again.")
        }            

        setLoading(false);
        return resp.Success
    }

    const signOut = () => {
        localStorage.removeItem("tokyodome_admin_access_token")
        localStorage.removeItem("member_id")
        setMember(null)
    }

    const getProfile = async () => {
        return await memberProfileGet(localStorage.getItem("tokyodome_admin_access_token"))
    }

    return (
        <MemberContext.Provider value={{member, error, loading, signIn, signOut, getProfile, setMember}}>
            {props.children}
        </MemberContext.Provider>
    )
}

export { MemberContext, MemberProvider }