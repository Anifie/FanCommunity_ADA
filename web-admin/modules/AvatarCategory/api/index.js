const avatarCategoryListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/category/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarCategoryListing jsonResult', jsonResult)
    return jsonResult
}

const avatarCategoryGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/category/get', {
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

const avatarCategoryPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/category', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarCategoryPost jsonResult', jsonResult)
    return jsonResult
}

const avatarCategoryPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/category', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarCategoryPut jsonResult', jsonResult)
    return jsonResult
}

export {avatarCategoryListing, avatarCategoryPost, avatarCategoryPut, avatarCategoryGet}