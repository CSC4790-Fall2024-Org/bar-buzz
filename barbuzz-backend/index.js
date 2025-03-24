// Touch this
console.log(__dirname);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');  // Add Firebase Admin SDK
const functions = require('firebase-functions');
const app = express();

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccountJson = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
});

// Firestore reference
const db = admin.firestore();

// -----------------------------
// 1) BUZZED SUBMISSION ROUTE
// -----------------------------
app.post('/buzzed', async (req, res) => {
  console.log('Received buzzed request:', req.body);
  const { currentlyHere, planningToAttend, userId, location } = req.body;

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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      location
    });
    return res.status(200).json({ message: 'Attendance recorded successfully!' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return res.status(500).json({ error: 'An error occurred while recording attendance.' });
  }
});

// -------------------------------------------------
// 2) REPLACE OLD /login (FIRESTORE) WITH TOKEN LOGIN
// -------------------------------------------------
app.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing ID token' });
    }

    // Verify the ID token with the Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Now fetch the user record from Firebase Auth
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    // Check if the user's email is verified
    if (!userRecord.emailVerified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email before logging in.' });
    }

    // (Optional) fetch additional user data from Firestore if needed
    // e.g., db.collection('users').doc(decodedToken.uid).get()...
    // but do NOT store plaintext passwords in Firestore.

    return res.status(200).json({
      message: 'Login successful! User is verified.',
      uid: decodedToken.uid,
      email: userRecord.email,
      // any other data you want to return
    });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(401).json({ error: 'Invalid or expired ID token.' });
  }
});

// ----------------------------------
// 3) GET ATTENDANCE BY LOCATION
// ----------------------------------
app.get('/attendance/:location', async (req, res) => {
  const { location } = req.params;
  try {
    const snapshot = await db.collection('tracking')
      .where('location', '==', location)
      .get();
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

// ----------------------------------
// 4) GET USER DATA
// ----------------------------------
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




