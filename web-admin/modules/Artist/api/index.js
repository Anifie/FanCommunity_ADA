const artistListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artist/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artistListingPost jsonResult', jsonResult)
    return jsonResult
}

const artistPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artist', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artistPost jsonResult', jsonResult)
    return jsonResult
}

const artistPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artist', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artistPut jsonResult', jsonResult)
    return jsonResult
}

const artistDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artist', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artistDelete jsonResult', jsonResult)
    return jsonResult
}

export {artistListingPost, artistPut, artistDelete, artistPost}