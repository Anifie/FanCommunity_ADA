
const pointSettingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/settings/get', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('pointSettingGet jsonResult', jsonResult)
    return jsonResult
}

const leaderboardListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/leaderboard/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('leaderboardListingPost jsonResult', jsonResult)
    return jsonResult
}

const enumGet = async () => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/enum', {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
    let jsonResult = response.json()
    console.log('enumGet jsonResult', jsonResult)
    return jsonResult
}

const reCalculatePointAwardsPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/awards/recalculate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('reCalculatePointAwardsPost jsonResult', jsonResult)
    return jsonResult
}

const pointSettingsListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/settings/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('pointSettingsListing jsonResult', jsonResult)
    return jsonResult
}

const pointSettingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/settings', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('pointSettingPost jsonResult', jsonResult)
    return jsonResult
}

const pointSettingPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/settings', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('pointSettingPut jsonResult', jsonResult)
    return jsonResult
}

const pointSettingDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/point/settings', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('pointSettingDelete jsonResult', jsonResult)
    return jsonResult
}

export {leaderboardListingPost, pointSettingGet, enumGet, reCalculatePointAwardsPost, pointSettingsListing, pointSettingPost, pointSettingPut, pointSettingDelete }