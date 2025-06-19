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

const messageGet = async ({messageId, senderId, chatId, isCelebrity, status, lastKey, pageSize}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({pageSize: pageSize, 
                                                        lastKey: lastKey, 
                                                        senderId: senderId, 
                                                        chatId: chatId,
                                                        messageId: messageId,
                                                        isCelebrity: isCelebrity,
                                                        status: status
                                                    })
                            })
    let jsonResult = response.json()
    console.log('messageGet jsonResult', jsonResult)
    return jsonResult
}

const messagePost = async ({token, senderId, chatId, message}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/message', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify({senderId: senderId, chatId: chatId, message: message})
                            })
    let jsonResult = response.json()
    console.log('messagePost jsonResult', jsonResult)
    return jsonResult
}

const messageInactivePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/message/inactivate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('messageInactivePost jsonResult', jsonResult)
    return jsonResult
}

const messageActivePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/message/activate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('messageActivePost jsonResult', jsonResult)
    return jsonResult
}

export {messageGet, messagePost, messageInactivePost, messageActivePost}