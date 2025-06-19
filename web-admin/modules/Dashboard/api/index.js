const statisticLanternCountGet = async () => {
    console.log("statisticLanternCountGet request")
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/lantern/count', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let jsonResult = await response.json()
    console.log("statisticLanternCountGet response", response, jsonResult)
    return jsonResult
}

export {statisticLanternCountGet}