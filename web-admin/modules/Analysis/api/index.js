const batchListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('batchListingPost jsonResult', jsonResult)
    return jsonResult
}

const batchPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('batchPost jsonResult', jsonResult)
    return jsonResult
}

const batchDelete = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('batchDelete jsonResult', jsonResult)
    return jsonResult
}

const batchMessageListingPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('batchMessageListingPost jsonResult', jsonResult)
    return jsonResult
}

const batchVisualize = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/data/visualize', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    console.log("response", response);    
    let jsonResult = response.json()
    console.log('batchVisualize jsonResult', jsonResult)
    return jsonResult
}

const batchReactionListingPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/reaction/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('batchReactionListingPost jsonResult', jsonResult)
    return jsonResult
}

const batchUserListingPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/user/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('batchUserListingPost jsonResult', jsonResult)
    return jsonResult
}

const heatMapPost = async (param) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/analytic/chat/data/visualize/heatmap', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(param)
                            })
    let jsonResult = response.json()
    console.log('heatMapPost jsonResult', jsonResult)
    return jsonResult
}

export {batchListingPost, batchPost, batchMessageListingPost, batchDelete, batchVisualize, batchUserListingPost, batchReactionListingPost, heatMapPost}