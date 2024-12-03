// Touch this
console.log(__dirname);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');  // Add Firebase Admin SDK
const functions = require('firebase-functions');
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
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

/*
// Schedule the clear-daily-submissions endpoint to run at a specific time
const scheduleClearSubmissions = () => {
  const now = new Date();
  const targetTime = new Date().setHours(11, 22, 0, 0); // 11:00 AM
  const millisUntilTargetTime = targetTime - now.getTime();

  console.log(`Current time: ${now}`);
  console.log(`Target time (11:00 AM): ${new Date(targetTime)}`);
  console.log(`Milliseconds until target time: ${millisUntilTargetTime}`);

  if (millisUntilTargetTime > 0) {
    console.log(`Scheduled to trigger at 11:00 AM in ${millisUntilTargetTime / 1000} seconds`);
    setTimeout(() => {
      console.log('Triggering /clear-daily-submissions POST request...');
      fetch('http://localhost:8082/clear-daily-submissions', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => console.log('Clear daily submissions response:', data))
        .catch((err) => console.error('Error triggering clearing logic:', err));

      // Set interval to repeat daily
      setInterval(() => {
        console.log('Triggering daily /clear-daily-submissions POST request...');
        fetch('http://localhost:8082/clear-daily-submissions', { method: 'POST' })
          .then((res) => res.json())
          .then((data) => console.log('Clear daily submissions response:', data))
          .catch((err) => console.error('Error triggering clearing logic:', err));
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, millisUntilTargetTime);
  } else {
    console.log('Missed today’s target time. Will schedule for tomorrow.');
  }
};

scheduleClearSubmissions();

// Route to reset daily submissions
app.post('/clear-daily-submissions', async (req, res) => {
  try {
    console.log('Archiving and resetting daily submissions...');
    const trackingRef = db.collection('tracking');
    const historicalTrackingRef = db.collection('historicalTracking');

    const snapshot = await trackingRef.get();
    if (snapshot.empty) {
      console.log('No documents found for reset.');
      return res.status(200).json({ message: 'No records to reset.' });
    }

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const docData = doc.data();
      console.log('Archiving document:', docData); // Debug log

      // Archive to historicalTracking
      const historicalDocRef = historicalTrackingRef.doc();
      batch.set(historicalDocRef, {
        ...docData,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Reset real-time fields in tracking
      batch.update(doc.ref, {
        currentlyHere: false,
        planningToAttend: false, // Make sure to reset planningToAttend as well
      });

      updateCount++;
    });

    await batch.commit();
    console.log(`Daily submissions archived and reset successfully for ${updateCount} documents.`);
    res.status(200).json({ message: `Daily submissions archived and reset successfully for ${updateCount} records.` });
  } catch (error) {
    console.error('Error during reset:', error);
    res.status(500).json({ error: 'An error occurred during reset.' });
  }
});
*/

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});




