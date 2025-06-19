const paymentListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/sales/payment/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('paymentListingPost jsonResult', jsonResult)
    return jsonResult
}

export {paymentListingPost}