const useHelper = () => {

    const toShortHash = (hash) => {
        return hash.substring(0, 6) + '...' + hash.slice(-4)
    };

    const toShortString = (str, maxLength) => {
        if(str == undefined)
          return '';
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    };

    const getFileMIME = (fileExtension) =>  {
        console.log("fileExtension", fileExtension);
        console.log("fileExtension", fileExtension.toLowerCase());
        var mimeType;
        switch (fileExtension.toLowerCase()) {
    
            case 'gltf':
                mimeType = 'application/octet-stream';
                break;

            case 'glb':
                mimeType = 'application/octet-stream';
                break;

            case 'fbx':
                mimeType = 'application/octet-stream';
                break;
                
            case 'png':
                mimeType = 'image/png';
                break;
    
            case 'gif':
                mimeType = 'image/gif';
                break;
    
            case 'jpe':
            case 'jpg':
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
    
            case 'webp':
                mimeType = 'image/webp';
                break;
    
            case 'svg':
                mimeType = 'image/svg+xml';
                break;
    
            case 'unity3d':
                mimeType = 'application/vnd.unity';
                break;
    
            case 'mp3':
                mimeType = 'audio/mp3';
                break;
    
            case 'mp4':
                mimeType = 'video/mp4';
                break;
    
            default:
                throw Error('Unexpected file type');
        }
    
        return mimeType;
    }

    return {
        toShortHash,
        toShortString,
        getFileMIME
    }
}

export default useHelper