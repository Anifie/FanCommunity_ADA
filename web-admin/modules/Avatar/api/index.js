const avatarListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarListing jsonResult', jsonResult)
    return jsonResult
}

const avatarGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarGet jsonResult', jsonResult)
    return jsonResult
}

const avatarPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarPost jsonResult', jsonResult)
    return jsonResult
}

const avatarPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarPut jsonResult', jsonResult)
    return jsonResult
}

export {avatarListing, avatarGet, avatarPost, avatarPut}