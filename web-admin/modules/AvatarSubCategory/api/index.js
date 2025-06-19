const avatarSubCategoryListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/subcategory/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarSubCategoryListing jsonResult', jsonResult)
    return jsonResult
}

const avatarSubCategoryGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/subcategory/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarSubCategoryGet jsonResult', jsonResult)
    return jsonResult
}


const avatarSubCategoryPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/subcategory', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarSubCategoryPost jsonResult', jsonResult)
    return jsonResult
}

const avatarSubCategoryPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/subcategory', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('avatarSubCategoryPut jsonResult', jsonResult)
    return jsonResult
}

export {avatarSubCategoryListing, avatarSubCategoryPost, avatarSubCategoryPut, avatarSubCategoryGet}