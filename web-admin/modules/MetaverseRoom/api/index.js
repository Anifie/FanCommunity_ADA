const metaverseRoomListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomListing jsonResult', jsonResult)
    return jsonResult
}

const metaverseRoomGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomGet jsonResult', jsonResult)
    return jsonResult
}

const metaverseRoomPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomPost jsonResult', jsonResult)
    return jsonResult
}

const metaverseRoomPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomPut jsonResult', jsonResult)
    return jsonResult
}

const eventGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/event/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('eventGet jsonResult', jsonResult)
    return jsonResult
}

const metaverseRoomCheckIn = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room/checkin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomCheckIn jsonResult', jsonResult)
    return jsonResult
}

const metaverseRoomCheckOut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/metaverse/room/checkout', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomCheckOut jsonResult', jsonResult)
    return jsonResult
}

const avatarPositionUpdate = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/avatar/position', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('metaverseRoomCheckOut jsonResult', jsonResult)
    return jsonResult
}

export {metaverseRoomCheckIn, metaverseRoomCheckOut, metaverseRoomListing, metaverseRoomGet, metaverseRoomPost, metaverseRoomPut, avatarPositionUpdate, eventGet}