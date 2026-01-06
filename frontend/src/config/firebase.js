import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaRITSWbOX4upediTMzM2BV0ahRDzltIc",
    authDomain: "sjg-ecom.firebaseapp.com",
    databaseURL: "https://sjg-ecom-default-rtdb.firebaseio.com",
    projectId: "sjg-ecom",
    storageBucket: "sjg-ecom.firebasestorage.app",
    messagingSenderId: "723767976840",
    appId: "1:723767976840:web:25736ad49b340c12a3103d",
    measurementId: "G-B9LVW7WF13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
