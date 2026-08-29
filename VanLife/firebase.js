import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore/lite"

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)



// import { initializeApp } from "firebase/app";


// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: "vanlife-94431.firebaseapp.com",
//     projectId: "vanlife-94431",
//     storageBucket: "vanlife-94431.firebasestorage.app",
//     messagingSenderId: "31081506016",
//     appId: "1:31081506016:web:85de37c927a7fe68f35c85"
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);

// export { firebaseApp }