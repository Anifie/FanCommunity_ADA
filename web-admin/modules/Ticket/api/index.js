const ticketGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/ticket/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('ticketGet jsonResult', jsonResult)
    return jsonResult
}

const ticketPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/ticket', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('ticketPost jsonResult', jsonResult)
    return jsonResult
}

const ticketPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/ticket', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('ticketPut jsonResult', jsonResult)
    return jsonResult
}

const ticketDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/ticket', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('ticketDelete jsonResult', jsonResult)
    return jsonResult
}

const ticketListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/ticket/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('ticketListing jsonResult', jsonResult)
    return jsonResult
}

export {ticketGet, ticketPut, ticketPost, ticketDelete, ticketListing}