const roleListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('roleListingGet jsonResult', jsonResult)
    return jsonResult
}

const rolePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('rolePost jsonResult', jsonResult)
    return jsonResult
}

const rolePut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('rolePut jsonResult', jsonResult)
    return jsonResult
}

const roleDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('roleDelete jsonResult', jsonResult)
    return jsonResult
}

const roleMemberDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role/member', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('roleMemberDelete jsonResult', jsonResult)
    return jsonResult
}

const roleMemberPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role/member', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('roleMemberPost jsonResult', jsonResult)
    return jsonResult
}

const roleMemberListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/role/member/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('roleMemberListingPost jsonResult', jsonResult)
    return jsonResult
}

export {roleListingGet, rolePost, rolePut, roleDelete, roleMemberDelete, roleMemberPost, roleMemberListingPost }