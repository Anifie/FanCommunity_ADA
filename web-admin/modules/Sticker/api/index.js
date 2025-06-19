const stickerIdListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/sticker/id/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('stickerIdListingGet jsonResult', jsonResult)
    return jsonResult
}

const stickerIdPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/sticker/id', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('stickerIdPost jsonResult', jsonResult)
    return jsonResult
}

export {stickerIdListingGet, stickerIdPost }