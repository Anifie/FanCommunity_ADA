const voucherGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/voucher/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voucherGet jsonResult', jsonResult)
    return jsonResult
}

const voucherPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/voucher', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voucherPost jsonResult', jsonResult)
    return jsonResult
}

const voucherPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/voucher', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voucherPut jsonResult', jsonResult)
    return jsonResult
}

const voucherDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/voucher', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voucherDelete jsonResult', jsonResult)
    return jsonResult
}

const voucherListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/voucher/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voucherListing jsonResult', jsonResult)
    return jsonResult
}

export {voucherGet, voucherDelete, voucherPost, voucherPut, voucherListing}