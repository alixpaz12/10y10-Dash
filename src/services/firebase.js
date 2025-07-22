import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Configuración de Firebase que ya tenías.
export const firebaseConfig = {
    apiKey: "AIzaSyCO43T1_qQAsSuXlAfQa4-OFtRO01CE3Os",
    authDomain: "y10-watchstore-online.firebaseapp.com",
    projectId: "y10-watchstore-online",
    storageBucket: "y10-watchstore-online.appspot.com",
    messagingSenderId: "690513216862",
    appId: "1:690513216862:web:a18538047d4f650862bbcf",
    measurementId: "G-Y07CP6NPKL"
};

// Inicializamos y exportamos los servicios para usarlos en toda la app.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
