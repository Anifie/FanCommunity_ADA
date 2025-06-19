const proposalListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/proposal/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('proposalListingPost jsonResult', jsonResult)
    return jsonResult
}

const proposalPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/proposal', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('proposalPost jsonResult', jsonResult)
    return jsonResult
}

const proposalDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/proposal', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('proposalDelete jsonResult', jsonResult)
    return jsonResult
}

const proposalPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/proposal', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('proposalPut jsonResult', jsonResult)
    return jsonResult
}

const voteReport = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteReport jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/question/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionListing jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/question', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionPost jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/question', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionPut jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/question', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionDelete jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionPostDiscord = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/channel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionPostDiscord jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordQuestionDeleteDiscord = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/channel', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordQuestionDeleteDiscord jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordAnswerListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/answer/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordAnswerListing jsonResult', jsonResult)
    return jsonResult
}

const voteDiscordAnswerStat = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/vote/discord/answer/statistic', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('voteDiscordAnswerStat jsonResult', jsonResult)
    return jsonResult
}


export { proposalListingPost, proposalPost, proposalDelete, proposalPut, voteReport, voteDiscordQuestionListing, voteDiscordQuestionPost, voteDiscordQuestionPut, voteDiscordQuestionDelete, voteDiscordQuestionPostDiscord, voteDiscordQuestionDeleteDiscord, voteDiscordAnswerListing, voteDiscordAnswerStat }

