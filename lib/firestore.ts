import admin from "firebase-admin"

let serviceAccount = JSON.parse(process.env.FIREBASE_CONNECTION)

if(!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

const firestore = admin.firestore()
export {firestore }