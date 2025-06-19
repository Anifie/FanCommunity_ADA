const assetListingGet = async (params) => {
    let response = await fetch('https://bprg6fkvv0.execute-api.us-west-1.amazonaws.com/asset/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('assetListingGet jsonResult', jsonResult)
    return jsonResult
}

export {assetListingGet}