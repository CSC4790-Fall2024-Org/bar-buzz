// Touch this
console.log(__dirname);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');  // Add Firebase Admin SDK

const app = express();
const PORT = 8082;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./barbuzz-29b1a-firebase-adminsdk-srfma-75e610b615.json');  // Path to your service account JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/*
// Firebase Web SDK Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ0fM91zbHtscOYfkmTmvDnIedFWKueVw",
  authDomain: "barbuzz-29b1a.firebaseapp.com",
  projectId: "barbuzz-29b1a",
  storageBucket: "barbuzz-29b1a.appspot.com",
  messagingSenderId: "789864164143",
  appId: "1:789864164143:web:dd17f0fe1be425512b0fda",
  measurementId: "G-HLLP1H2B65"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
*/ 

const db = admin.firestore();  // Firestore reference


// Route to handle "Buzzed" submission with user UID
app.post('/buzzed', async (req, res) => {
  console.log('Received buzzed request:', req.body);
  const { currentlyHere, planningToAttend, timestamp, userId, location } = req.body;

  if (!userId) {
    console.error("User ID is missing.");
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const attendanceRef = db.collection('tracking').doc();
    await attendanceRef.set({
      userId,
      currentlyHere,
      planningToAttend,
      timestamp,
      location // Now location is defined as part of req.body
    });

    return res.status(200).json({ message: 'Attendance recorded successfully!' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return res.status(500).json({ error: 'An error occurred while recording attendance.' });
  }
});

// Login API with Firebase Firestore
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).where('password', '==', password).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful!', user: snapshot.docs[0].data() });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
});

app.get('/attendance/:location', async (req, res) => {
  const { location } = req.params;

  try {
    const snapshot = await db.collection('tracking').where('location', '==', location).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No attendance data found for this location.' });
    }

    const attendanceData = snapshot.docs.map(doc => doc.data());
    return res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return res.status(500).json({ error: 'An error occurred while fetching attendance data.' });
  }
});

app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userSnapshot = await db.collection('users').doc(userId).get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(userSnapshot.data());
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'An error occurred while fetching user data.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});




