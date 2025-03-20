// PushNotificationHandler.js
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './config/firebaseConfig.js'; // Adjust path as needed

export function usePushNotifications(userId) {
  useEffect(() => {
    console.log('[PushNotificationHandler] useEffect triggered, userId =', userId);

    if (!userId) {
      console.log('[PushNotificationHandler] No userId, skipping push token registration.');
      return;
    }

    async function registerForPushNotificationsAsync() {
      try {
        console.log('[PushNotificationHandler] Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('[PushNotificationHandler] Permissions not granted. No push token generated.');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const expoPushToken = tokenData.data;
        console.log('[PushNotificationHandler] Got expo push token =>', expoPushToken);

        console.log('[PushNotificationHandler] Saving push token to Firestore...');
        await setDoc(doc(db, 'users', userId), { pushToken: expoPushToken }, { merge: true });
        console.log('[PushNotificationHandler] pushToken saved successfully to Firestore!');
      } catch (error) {
        console.error('[PushNotificationHandler] Error registering for notifications =>', error);
      }
    }

    registerForPushNotificationsAsync();
  }, [userId]);
}