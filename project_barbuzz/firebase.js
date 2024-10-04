// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQ0fM91zbHtscOYfkmTmvDnIedFWKueVw",
    authDomain: "barbuzz-29b1a.firebaseapp.com",
    projectId: "barbuzz-29b1a",
    storageBucket: "barbuzz-29b1a.appspot.com",
    messagingSenderId: "789864164143",
    appId: "1:789864164143:web:dd17f0fe1be425512b0fda",
    measurementId: "G-HLLP1H2B65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db };
