const chatChannelCategoryListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/category/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelCategoryListingGet jsonResult', jsonResult)
    return jsonResult
}

const chatChannelCategoryPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/category', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelCategoryPost jsonResult', jsonResult)
    return jsonResult
}

const chatChannelCategoryPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/category', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelCategoryPut jsonResult', jsonResult)
    return jsonResult
}

const chatChannelCategoryDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/category', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelCategoryDelete jsonResult', jsonResult)
    return jsonResult
}



const chatChannelListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelListingGet jsonResult', jsonResult)
    return jsonResult
}

const chatChannelPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelPost jsonResult', jsonResult)
    return jsonResult
}

const chatChannelPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelPut jsonResult', jsonResult)
    return jsonResult
}

const chatChannelDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelDelete jsonResult', jsonResult)
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

const chatChannelMessageListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelMessageListingGet jsonResult', jsonResult)
    return jsonResult
}

const chatChannelMessagePut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelMessagePut jsonResult', jsonResult)
    return jsonResult
}

const chatChannelMessagePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelMessagePost jsonResult', jsonResult)
    return jsonResult
}

const chatChannelMessageDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelMessageDelete jsonResult', jsonResult)
    return jsonResult
}

const chatChannelGroupDirectPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/group/direct', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelGroupDirectPost jsonResult', jsonResult)
    return jsonResult
}

const chatChannelDirectPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/direct', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('chatChannelDirectPost jsonResult', jsonResult)
    return jsonResult
}

const threadListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadListingGet jsonResult', jsonResult)
    return jsonResult
}

const threadPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadPost jsonResult', jsonResult)
    return jsonResult
}

const threadDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadDelete jsonResult', jsonResult)
    return jsonResult
}

const threadMessageListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadMessageListingPost jsonResult', jsonResult)
    return jsonResult
}

const threadMessageDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadMessageDelete jsonResult', jsonResult)
    return jsonResult
}

const threadMessagePut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadMessagePut jsonResult', jsonResult)
    return jsonResult
}

const reactChannelMessagePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message/reaction', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('reactChannelMessagePost jsonResult', jsonResult)
    return jsonResult
}

const reactChannelMessageDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message/reaction', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('reactChannelMessageDelete jsonResult', jsonResult)
    return jsonResult
}

const reactThreadMessageDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message/reaction', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('reactThreadMessageDelete jsonResult', jsonResult)
    return jsonResult
}

const messageReactionListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/message/reaction/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('messageReactionListing jsonResult', jsonResult)
    return jsonResult
}

const threadMessageReactionListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message/reaction/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadMessageReactionListing jsonResult', jsonResult)
    return jsonResult
}

const connectionListing = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/connection/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('connectionListing jsonResult', jsonResult)
    return jsonResult
}

const memberChannelListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/member/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('memberChannelListingGet jsonResult', jsonResult)
    return jsonResult
}

const memberMessageListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/member/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('memberMessageListingGet jsonResult', jsonResult)
    return jsonResult
}

const memberThreadMessageListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/member/message/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('memberThreadMessageListingGet jsonResult', jsonResult)
    return jsonResult
}

const memberThreadListingGet = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/member/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('memberThreadListingGet jsonResult', jsonResult)
    return jsonResult
}

const threadMessagePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/chat/channel/thread/message', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('threadMessagePost jsonResult', jsonResult)
    return jsonResult
}

export {chatChannelCategoryListingGet, chatChannelCategoryPost, chatChannelCategoryPut, chatChannelCategoryDelete, 
    chatChannelDelete, chatChannelPut, enumGet, chatChannelPost, chatChannelListingGet, chatChannelMessageListingGet,
    chatChannelMessagePut, chatChannelMessageDelete, chatChannelDirectPost, chatChannelGroupDirectPost, threadListingGet,
    threadPost, threadDelete, threadMessageListingPost, threadMessageDelete, reactChannelMessageDelete, reactChannelMessagePost,
    threadMessagePut, threadMessageReactionListing, messageReactionListing, reactThreadMessageDelete, connectionListing, 
    memberChannelListingGet, memberMessageListingGet, memberThreadMessageListingGet, chatChannelMessagePost,
    memberThreadListingGet, threadMessagePost}