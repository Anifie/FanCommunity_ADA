const avatarItemListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/item/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarItemListing jsonResult', jsonResult)
    return jsonResult
}

const avatarItemGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/item/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarItemGet jsonResult', jsonResult)
    return jsonResult
}

const avatarItemPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/item', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarItemPost jsonResult', jsonResult)
    return jsonResult
}

const avatarItemPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/item', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarItemPut jsonResult', jsonResult)
    return jsonResult
}

export {avatarItemListing, avatarItemGet, avatarItemPost, avatarItemPut}