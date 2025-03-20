const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { Expo } = require("expo-server-sdk");

// Initialize Admin SDK
admin.initializeApp();

// Get Firestore reference
const db = getFirestore();

// Create a new Expo SDK client
const expo = new Expo();

// Schedule: 7:30 PM Friday & Saturday => "30 19 * * 5,6"
exports.sendWeekendReminder = functions.pubsub
  .schedule("30 19 * * 5,6")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    console.log("Starting weekend push notification...");

    try {
      // 1) Fetch all user docs
      const snapshot = await db.collection("users").get();
      if (snapshot.empty) {
        console.log("No users found.");
        return null;
      }

      // 2) Build a list of push messages
      const messages = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const pushToken = userData.pushToken;
        // Only send if it's a valid Expo push token
        if (pushToken && Expo.isExpoPushToken(pushToken)) {
          messages.push({
            to: pushToken,
            sound: "default",
            title: "Time to Buzz In!",
            body: "Where are you going tonight? Tap to let us know!",
          });
        }
      });

      if (messages.length === 0) {
        console.log("No valid Expo tokens found.");
        return null;
      }

      // 3) Send push notifications in chunks
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("Expo push tickets:", ticketChunk);
      }

      console.log("Weekend push notifications sent successfully!");
      return null;
    } catch (error) {
      console.error("Error sending notifications:", error);
      return null;
    }
  });

/**
 * clearDailySubmissions:
 * Runs every day at 3:00 AM (America/New_York).
 * - Archives each document from "tracking" into "historicalTracking".
 * - Resets "currentlyHere" and "planningToAttend" to false in "tracking".
 */
exports.clearDailySubmissions = functions.pubsub
  // Use CRON syntax for 3:00 AM daily: "0 3 * * *"
  .schedule("0 3 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    console.log("Starting daily submission reset...");

    try {
      const trackingRef = db.collection("tracking");
      const historicalTrackingRef = db.collection("historicalTracking");

      // Fetch all docs from "tracking"
      const snapshot = await trackingRef.get();
      if (snapshot.empty) {
        console.log("No submissions to clear.");
        return null;
      }

      // Use a batch for atomic writes
      const batch = db.batch();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data) {
          console.error(`Skipping doc ${doc.id} - no data found.`);
          return; 
        }

        // 1) Archive data into "historicalTracking"
        const archivedDocRef = historicalTrackingRef.doc();
        batch.set(archivedDocRef, {
          ...data,
          archivedAt: FieldValue.serverTimestamp(),
        });

        // 2) Reset fields in the original "tracking" doc
        batch.update(doc.ref, {
          currentlyHere: false,
          planningToAttend: false,
        });
      });

      // Commit the batch
      await batch.commit();
      console.log("Daily submissions cleared successfully.");
    } catch (error) {
      console.error("Error clearing submissions:", error);
    }

    return null;
  });