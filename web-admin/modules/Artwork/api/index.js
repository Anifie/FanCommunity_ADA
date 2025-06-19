const artworkListingPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artwork/listing', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artworkListingPost jsonResult', jsonResult)
    return jsonResult
}

const artworkCreatePost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artwork', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artworkCreatePost jsonResult', jsonResult)
    return jsonResult
}

const artworkPut = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artwork', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artworkPut jsonResult', jsonResult)
    return jsonResult
}

const artworkDelete = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/artwork', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artworkPut jsonResult', jsonResult)
    return jsonResult
}

const artworkMintPost = async (params) => {
    let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/nft/queue', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
                                },
                                body: JSON.stringify(params)
                            })
    let jsonResult = response.json()
    console.log('artworkMintPost jsonResult', jsonResult)
    return jsonResult
}

// const enumGet = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/enum', {
//                                 method: 'GET',
//                                 headers: {
//                                     'Content-Type': 'application/json'
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('enumGet jsonResult', jsonResult)
//     return jsonResult
// }

// const categoryGet = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/category', {
//                                 method: 'GET',
//                                 headers: {
//                                     'Content-Type': 'application/json'
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('categoryGet jsonResult', jsonResult)
//     return jsonResult
// }

// const storeListing = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/store/listing', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json'
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('storeListing jsonResult', jsonResult)
//     return jsonResult
// }


// const assetGet = async (params ) => {
//     console.log("assetGet", params);

//     if(!params.contractAddress)
//         throw new Error("contractAddress is required");

//     let uri = "/asset?contractaddress=" + params.contractAddress;

//     if(params.walletAddress)
//         uri = uri + "&walletaddress=" + params.walletAddress;

//     if(params.assetId)
//         uri = uri + "&assetid=" + params.assetId;

//     if(params.status)
//         uri = uri + "&status=" + params.status;

//     if(params.tokenId)
//         uri = uri + "&tokenid=" + params.tokenId;

//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + uri)
//     let jsonResult = response.json()
//     console.log('assetGet jsonResult', jsonResult)
//     return jsonResult
// }

// const announceRevealPost = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/asset/reveal/announce', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('announceRevealPost jsonResult', jsonResult)
//     return jsonResult
// }

// const revealPost = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/asset/reveal', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('revealPost jsonResult', jsonResult)
//     return jsonResult
// }

// const batchRevealPost = async (params) => {
//     let response = await fetch(process.env.ADA_FAN_COMM_API_URL + '/asset/reveal/batch', {
//                                 method: 'POST',
//                                 headers: {
//                                     'Content-Type': 'application/json',
//                                     'Authorization': 'Bearer ' + localStorage.getItem("tokyodome_admin_access_token")
//                                 },
//                                 body: JSON.stringify(params)
//                             })
//     let jsonResult = response.json()
//     console.log('batchRevealPost jsonResult', jsonResult)
//     return jsonResult
// }

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

export {artworkListingPost, enumGet, artworkCreatePost, artworkPut, artworkDelete, artworkMintPost}