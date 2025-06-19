const announcementGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/announcement/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('announcementGet jsonResult', jsonResult)
    return jsonResult
}

const announcementPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/announcement', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('announcementPost jsonResult', jsonResult)
    return jsonResult
}

const announcementPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/announcement', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('announcementPut jsonResult', jsonResult)
    return jsonResult
}

export {announcementGet, announcementPost, announcementPut}