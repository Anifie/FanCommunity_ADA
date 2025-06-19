const collectionListingGet = async (params) => {
    let {pageSize, lastKey, status, lanternId, collectionId, PlayerId, metadata, name} = params
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/collection/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({pageSize: pageSize, 
                                                        lastKey: lastKey, 
                                                        status: status, 
                                                        lanternId: lanternId, 
                                                        collectionId: collectionId,
                                                        PlayerId: PlayerId,
                                                        metadata: metadata,
                                                        name: name
                                                    })
                            })
    let jsonResult = response.json()
    console.log('collectionListingGet jsonResult', jsonResult)
    return jsonResult
}

const collectionPost = async (params) => {
    console.log("collectionPost params", params)
    //const {name, description, ranking, metadata} = params
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/collection', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('collectionPost jsonResult', jsonResult)
    return jsonResult
}

const collectionDelete = async (collectionId) => {
    console.log("collectionDelete collectionId", collectionId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/collection', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({collectionId: collectionId})
                            })
    let jsonResult = response.json()
    console.log('collectionDelete jsonResult', jsonResult)
    return jsonResult
}

const lanternListingGet = async (params) => {
    console.log("lanternListingGet", params, JSON.stringify(params));
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = await response.json()
    console.log('lanternListingGet jsonResult', jsonResult)
    return jsonResult
}

const lanternGet = async (lanternId) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern?lanternid=' + lanternId, {
                                method: 'GET'
                            })
    let jsonResult = response.json()
    console.log('lanternGet jsonResult', jsonResult)
    return jsonResult
}

const lanternDetailsGet = async (lanternId) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/details', {
                                method: 'POST',
                                body: JSON.stringify({lanternid: lanternId})
                            })
    let jsonResult = response.json()
    console.log('lanternGet jsonResult', jsonResult)
    return jsonResult
}

const lanternPost = async (params) => {
    console.log("lanternPost params", params)
    //const {name, description, ranking, metadata} = params
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('lanternPost jsonResult', jsonResult)
    return jsonResult
}

const lanternPut = async (params) => {
    console.log("lanternPut params", params)
    //const {name, description, ranking, metadata} = params
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('lanternPut jsonResult', jsonResult)
    return jsonResult
}

const lanternDelete = async (lanternId) => {
    console.log("lanternDelete lanternId", lanternId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({lanternId: lanternId})
                            })
    let jsonResult = response.json()
    console.log('lanternDelete jsonResult', jsonResult)
    return jsonResult
}

const lanternApprove = async (lanternId, PlayerId) => {
    console.log("lanternApprove lanternId", lanternId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/approve', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({lanternId: lanternId, lanternPlayerId: PlayerId})
                            })
    let jsonResult = response.json()
    console.log('lanternApprove jsonResult', jsonResult)
    return jsonResult
}

const lanternReject = async (lanternId, PlayerId) => {
    console.log("lanternReject lanternId", lanternId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/reject', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({lanternId: lanternId, lanternPlayerId: PlayerId})
                            })
    let jsonResult = response.json()
    console.log('lanternReject jsonResult', jsonResult)
    return jsonResult
}

const lanternReset = async (lanternId, PlayerId) => {
    console.log("lanternReset lanternId", lanternId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/reset', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify({lanternId: lanternId, lanternPlayerId: PlayerId})
                            })
    let jsonResult = response.json()
    console.log('lanternReset jsonResult', jsonResult)
    return jsonResult
}

const combinationGet = async () => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/combine', {
                                method: 'POST'
                            })
    let jsonResult = response.json()
    console.log('combinationGet jsonResult', jsonResult)
    return jsonResult
}

const combinationPost = async (PlayerId) => {
    console.log("combinationPost ", PlayerId)
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/combine', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                            },
                            body: JSON.stringify({PlayerId: PlayerId})
                        })
    let jsonResult = response.json()
    console.log('combinationPost jsonResult', jsonResult)
    return jsonResult
}

const combinationListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/combine/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('combinationListingGet jsonResult', jsonResult)
    return jsonResult
}

const enumGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/enum', {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('enumGet jsonResult', jsonResult)
    return jsonResult
}

const uploadCensoredLanterns = async (lanterns) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/upload', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(lanterns)
                            })
    let jsonResult = response.json()
    console.log('uploadCensoredLanterns jsonResult', jsonResult)
    return jsonResult
}

export {
            lanternListingGet, 
            collectionListingGet, 
            collectionPost, 
            collectionDelete, 
            lanternPost, 
            lanternDelete, 
            lanternApprove, 
            lanternReject, 
            lanternReset,
            lanternGet, 
            lanternPut, 
            combinationListingGet, 
            combinationPost, 
            combinationGet, 
            enumGet, 
            uploadCensoredLanterns,
            lanternDetailsGet
        }