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

const memberPut = async (param) => {
    console.log("memberPut", param);
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/member', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('memberPut jsonResult', jsonResult)
    return jsonResult
}

const memberListingGet = async ({memberId, walletAddress, smartWalletAddress, discordUserId, lastKey, pageSize}) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/member/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({pageSize: pageSize, 
                                                        lastKey: lastKey, 
                                                        discordUserId: discordUserId, 
                                                        memberId: memberId,
                                                        walletAddress: walletAddress,
                                                        smartWalletAddress: smartWalletAddress
                                                    })
                            })
    let jsonResult = response.json()
    console.log('memberListingGet jsonResult', jsonResult)
    return jsonResult
}

const membershipQRListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/member/qr/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('membershipQRListingPost jsonResult', jsonResult)
    return jsonResult
}

const membershipQRPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/member/qr', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('membershipQRPost jsonResult', jsonResult)
    return jsonResult
}

const membershipQRDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/member/qr', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('membershipQRDelete jsonResult', jsonResult)
    return jsonResult
}

const memberDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/member', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('memberDelete jsonResult', jsonResult)
    return jsonResult
}

export {memberListingGet, memberPut, membershipQRListingPost, membershipQRPost, membershipQRDelete, memberDelete}