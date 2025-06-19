
// const eventGet = async () => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/check/live/get', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json'
//                                 }
//                             })
//     let jsonResult = response.json()
//     console.log('eventGet jsonResult', jsonResult)
//     return jsonResult
// }

const eventGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/event/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('eventGet jsonResult', jsonResult)
    return jsonResult
}

// const eventPut = async (status) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/check/live', {
//                                 method: 'PUT',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
//                                 },
//                                 body: JSON.stringify({status: status})
//                             })
//     let jsonResult = response.json()
//     console.log('eventPut jsonResult', jsonResult)
//     return jsonResult
// }

const eventPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/event', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('eventPost jsonResult', jsonResult)
    return jsonResult
}

const eventPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/event', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('eventPut jsonResult', jsonResult)
    return jsonResult
}

const eventListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/event/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('eventListing jsonResult', jsonResult)
    return jsonResult
}

export {eventGet, eventPost, eventPut, eventListing}