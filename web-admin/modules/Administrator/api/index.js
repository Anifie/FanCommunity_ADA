const administratorPost = async (param) => {
    console.log("administratorPost", param);
    const {token, userName, password} = param
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify({username: userName, password: password})
                            })
    let jsonResult = response.json()
    console.log('administratorPost jsonResult', jsonResult)
    return jsonResult
}

const administratorPut = async (param) => {
    console.log("administratorPut", param);
    const {token, PlayerId, password} = param
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/password', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify({PlayerId: PlayerId, password: password})
                            })
    let jsonResult = response.json()
    console.log('administratorPut jsonResult', jsonResult)
    return jsonResult
}

const administratorListingGet = async (token, pageSize) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/admin/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                }
                            })
    let jsonResult = response.json()
    console.log('administratorListingGet jsonResult', jsonResult)
    return jsonResult
}

export {administratorPost, administratorListingGet, administratorPut}