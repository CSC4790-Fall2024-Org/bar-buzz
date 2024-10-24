const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
const db = admin.firestore();

// API route to store attendance data when a user interacts with a radio circle
router.post('/attendance', async (req, res) => {
  const { userId, barId, planningToAttend, currentlyHere } = req.body;

  // Validate that the required fields are present
  if (!userId || !barId || planningToAttend === undefined || currentlyHere === undefined) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const attendanceRef = db.collection('barAttendance').doc();  // Create a new document in the 'barAttendance' collection

    await attendanceRef.set({
      userId,
      barId,
      planningToAttend,  // Boolean: true if the user plans to attend
      currentlyHere,     // Boolean: true if the user is currently there
      timestamp: admin.firestore.FieldValue.serverTimestamp()  // Save the timestamp of the action
    });

    return res.status(201).json({ message: 'Attendance status updated successfully!' });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return res.status(500).json({ error: 'An error occurred while updating attendance status.' });
  }
});

module.exports = router;
