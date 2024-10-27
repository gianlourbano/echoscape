import * as FileSystem from 'expo-file-system';

export const  uploadAudioToBackend = async (uri: string, ) =>  {
    // load file from uri into memory
    

    // upload file to backend

    const res = await fetch(`${process.env.BACKEND_BASE_URL}`)
}