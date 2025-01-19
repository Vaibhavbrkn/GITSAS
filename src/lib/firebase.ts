// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { error } from "console";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "gitsas-144c9.firebaseapp.com",
  projectId: "gitsas-144c9",
  storageBucket: "gitsas-144c9.firebasestorage.app",
  messagingSenderId: "455203977584",
  appId: "1:455203977584:web:b32bc03e8581f4356f37b5",
  measurementId: "G-YWLR5KF4Y9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export  async function uploadFile(file:File, setProgress?:(progress:number)=>void){
    return new Promise((resolve, reject)=>{
        try{
            const storageRef = ref(storage, file.name)
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on('state_changed', snapshot=>{
                const progress = Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100)
                if(setProgress) setProgress(progress)
                switch(snapshot.state){
                    case'paused':
                        console.log('pause')
                        break;
                    case 'running':
                        console.log('running')
                }
            },
        error=>{

            reject(error)
        }, ()=>{
            getDownloadURL(uploadTask.snapshot.ref)
            .then(downloadUrl=>{
                resolve(downloadUrl as string)
            })
        })
        }catch(err){

            reject(err)
        }
    })
}