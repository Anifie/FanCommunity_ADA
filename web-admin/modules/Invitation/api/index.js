const invitationListingPost = async(params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/invitation/listing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
        },
        body: JSON.stringify(params)
    })
    let jsonResult = response.json()
    console.log('invitationListingPost jsonResult', jsonResult)
    return jsonResult
}

export {invitationListingPost}