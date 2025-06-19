// const playerPost = async (param) => {
//     console.log("playerPost", param);
//     const {token, userName, password} = param
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + token
//                                 },
//                                 body: JSON.stringify({username: userName, password: password})
//                             })
//     let jsonResult = response.json()
//     console.log('playerPost jsonResult', jsonResult)
//     return jsonResult
// }

// const playerPut = async (param) => {
//     console.log("playerPut", param);
//     const {token, PlayerId, password} = param
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/password', {
//                                 method: 'PUT',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + token
//                                 },
//                                 body: JSON.stringify({PlayerId: PlayerId, password: password})
//                             })
//     let jsonResult = response.json()
//     console.log('playerPut jsonResult', jsonResult)
//     return jsonResult
// }

const commentGet = async ({commentId, senderId, chatId, isCelebrity, status, lastKey, pageSize}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/comment/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({pageSize: pageSize, 
                                                        lastKey: lastKey, 
                                                        senderId: senderId, 
                                                        chatId: chatId,
                                                        commentId: commentId,
                                                        isCelebrity: isCelebrity,
                                                        status: status
                                                    })
                            })
    let jsonResult = response.json()
    console.log('commentGet jsonResult', jsonResult)
    return jsonResult
}

const commentPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/comment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('commentPost jsonResult', jsonResult)
    return jsonResult
}

const commentInactivePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/comment/deactivate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('commentInactivePost jsonResult', jsonResult)
    return jsonResult
}

const commentActivePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/comment/activate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('commentActivePost jsonResult', jsonResult)
    return jsonResult
}

export {commentGet, commentPost, commentInactivePost, commentActivePost}