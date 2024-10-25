// Touch this
console.log(__dirname);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');  // Add Firebase Admin SDK
const { sendOtp, verifyOtp } = require('./otp'); // Import the OTP functions from otp.js

const app = express();
const PORT = 8082;

/*
const mapButtons = require('./mapButtons');

// Use the mapButtons routes
app.use('/api/map', mapButtons);
*/

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

const db = admin.firestore();  // Firestore reference

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await sendOtp(email); // Call the async function from otp.js
    res.status(200).json(result);
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Route to handle verifying OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const result = await verifyOtp(email, otp); // Call the async function from otp.js
    res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Sign up API with Firebase Firestore
app.post('/signup', async (req, res) => {
  const { name, email, dob, password } = req.body;

  if (!name || !email || !dob || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const userRef = db.collection('users').doc();  // Create a new document in 'users' collection
    await userRef.set({
      name,
      email,
      dob,
      password
    });
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error adding document:', error);
    return res.status(500).json({ error: 'An error occurred while signing up.' });
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

// Start the server
app.listen(PORT, () => {
  console.log('Server running on http://localhost:${8002}/');
});