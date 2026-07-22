import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "vanlife-94431.firebaseapp.com",
    projectId: "vanlife-94431",
    storageBucket: "vanlife-94431.firebasestorage.app",
    messagingSenderId: "31081506016",
    appId: "1:31081506016:web:85de37c927a7fe68f35c85"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export { firebaseApp }