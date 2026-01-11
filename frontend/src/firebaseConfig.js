import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDev_XXXXXXXXXXXX",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "dummy-project",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:00000000000:web:00000000000000"
};

if (!process.env.REACT_APP_FIREBASE_API_KEY) {
    console.warn("WARNING: Firebase Keys are missing! Using dummy keys. Auth will not work.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
