// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCJw0rl_VEb-qJ_-4SdmYLiWSBidC0I_bY",
    authDomain: "calisthenic-braz-3b73a.firebaseapp.com",
    projectId: "calisthenic-braz-3b73a",
    storageBucket: "calisthenic-braz-3b73a.firebasestorage.app",
    messagingSenderId: "856707744435",
    appId: "1:856707744435:web:0786601015f6557f04a6c6",
    measurementId: "G-E2M5XX2LWF"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);