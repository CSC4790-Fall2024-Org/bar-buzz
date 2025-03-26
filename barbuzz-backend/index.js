// index.js
console.log(__dirname);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');  // Add Firebase Admin SDK
const functions = require('firebase-functions');
const app = express();
const crypto = require('crypto');
const { sendVerificationEmail } = require('./sendEmail'); // or wherever you defined it

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

app.post('/custom-signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, dob } = req.body;

    // 1) Create the user in Firebase Auth via Admin SDK
    console.log('[custom-signup] About to create user in Firebase Auth...');
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false, // Force unverified initially
    });

    const uid = userRecord.uid;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // 2) Store user info in Firestore
    await db.collection('users').doc(uid).set({
      name: fullName,
      email,
      dob,
      profileIcon: 'default',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3) Generate a custom verification token (or random string)
    const token = crypto.randomBytes(32).toString('hex');
    console.log(`[custom-signup] Storing verification token under UID: ${uid}`);

    // Save token in a `verificationTokens` collection (or your own logic)
    await db.collection('verificationTokens').doc(uid).set({
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4) Send Mailjet email with your custom link
    //    Use userRecord.uid instead of an undefined uid variable
    const verifyUrl = `https://barbuzz.co/verify?uid=${uid}&token=${token}`;
    console.log(`[custom-signup] Verification URL: ${verifyUrl}`);
    
    await sendVerificationEmail(email, verifyUrl);

    return res.status(200).json({ message: 'Sign-up successful, verification email sent!' });
  } catch (error) {
    console.error('Custom signup error:', error);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.get('/verify', async (req, res) => {
  try {
    const { uid, token } = req.query; // ✅ FIRST THING: define uid & token

    if (!uid || !token) {
      return res.status(400).send('Missing uid or token');
    }

    console.log(`[verify] Verifying UID: ${uid}, Token: ${token}`);

    const docRef = db.collection('verificationTokens').doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.send(`
        <html>
          <head><title>Welcome to BarBuzz!</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>✅ You’re In!</h1>
            <p>Thanks for signing up. Time to Buzz In and Create the Scene.</p>
            <p>You can now return to the app and log in.</p>
            <br/>
            <p style="font-size: 14px; color: #888;">– The BarBuzz Team 🐝</p>
          </body>
        </html>
      `);
    }

    const data = docSnap.data();

    if (data.token !== token) {
      console.log('[verify] Token mismatch.');
      return res.status(400).send('Invalid or expired token');
    }

    // ✅ Mark email as verified
    await admin.auth().updateUser(uid, { emailVerified: true });
    console.log(`[verify] Email marked as verified for UID: ${uid}`);

    // ✅ Delete token so it can’t be reused
    await docRef.delete();
    console.log(`[verify] Token deleted for UID: ${uid}`);

    return res.send('Your email has been verified! You can now close this page and sign in.');
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).send('An error occurred while verifying your email.');
  }
});


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
      message: 'Login successful!',
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