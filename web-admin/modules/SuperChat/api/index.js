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

const superChatTemplateListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/super/template/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('superChatTemplateListingPost jsonResult', jsonResult)
    return jsonResult
}

const superChatTemplatePost = async (params) => {
    console.log("superChatTemplatePost", params);
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/super/template', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('superChatTemplatePost jsonResult', jsonResult)
    return jsonResult
}

const superChatTemplateEdit = async (params) => {
    console.log("superChatTemplateEdit", params);
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/super/template', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('superChatTemplateEdit jsonResult', jsonResult)
    return jsonResult
}

const superChatTemplateDelete = async (params) => {
    console.log("superChatTemplateDelete", params);
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/super/template', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('superChatTemplateDelete jsonResult', jsonResult)
    return jsonResult
}

export {superChatTemplateListingPost, superChatTemplatePost, superChatTemplateEdit, superChatTemplateDelete}