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

const playerListingGet = async ({playerId, displayName, status, role, lastKey, pageSize}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/player/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({pageSize: pageSize, 
                                                        lastKey: lastKey, 
                                                        status: status, 
                                                        playerId: playerId,
                                                        displayName: displayName,
                                                        role: role
                                                    })
                            })
    let jsonResult = response.json()
    console.log('playerListingGet jsonResult', jsonResult)
    return jsonResult
}

const celebrityPost = async ({token, playerId}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/celebrity', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify({playerId: playerId})
                            })
    let jsonResult = response.json()
    console.log('celebrityPost jsonResult', jsonResult)
    return jsonResult
}

export {playerListingGet, celebrityPost}