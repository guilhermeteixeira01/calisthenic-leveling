// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDDioADDJtYLD3n9qvMxR23vTNx-79mPWg",
    authDomain: "calisthenic-braz.firebaseapp.com",
    projectId: "calisthenic-braz",
    storageBucket: "calisthenic-braz.firebasestorage.app",
    messagingSenderId: "471522177016",
    appId: "1:471522177016:web:41a006428e232cfbecf00d",
    measurementId: "G-CMQJNH1MCD"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
