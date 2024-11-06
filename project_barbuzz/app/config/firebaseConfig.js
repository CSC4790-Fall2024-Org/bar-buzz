// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
      apiKey: "AIzaSyBQ0fM91zbHtscOYfkmTmvDnIedFWKueVw",
      authDomain: "barbuzz-29b1a.firebaseapp.com",
      projectId: "barbuzz-29b1a",
      storageBucket: "barbuzz-29b1a.appspot.com",
      messagingSenderId: "789864164143",
      appId: "1:789864164143:web:dd17f0fe1be425512b0fda",
      measurementId: "G-HLLP1H2B65"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Firebase
/*
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
//const auth = firebase.auth(); // Initialize Firebase Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
*/
export { auth , db}; // Export auth for use in your appphprtpp