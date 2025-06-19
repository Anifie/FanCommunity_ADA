
const signInPost = async (email, password) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({username: email, password: password})
    })
    let jsonResult = await response.json()
    console.log("admin member signin response", response, jsonResult)
    return jsonResult
}

// const signInLanternPost = async (mId) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/member/signin', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: JSON.stringify({PlayerId: mId})
//     })
//     let jsonResult = await response.json()
//     console.log("lantern member signin response", response, jsonResult)
//     return jsonResult
// }

const memberProfileGet = async (token) => {
    console.log("token", token);
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin', {
                                                                                        method: 'GET',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            "Authorization": "Bearer " + token,
                                                                                        }
                                                                                    })
    let jsonResult = await response.json()
    console.log("memberProfileGet response", response, jsonResult)
    return jsonResult
}

export {
    signInPost, 
    //signInLanternPost, 
    memberProfileGet
}
