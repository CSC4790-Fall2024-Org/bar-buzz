import React, { useState, useEffect } from 'react';
import { Alert, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Setup notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function PushNotificationHandler() {
  const [planningToAttend, setPlanningToAttend] = useState(false);
  const [currentlyHere, setCurrentlyHere] = useState(false);
  const notificationTimer = useRef(null);

  // Schedule a notification
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Are you here yet?",
        body: "Tap 'Yes' if you're here, or 'No' to be reminded again in a minute.",
        actions: [
          { identifier: "yes", title: "Yes" },
          { identifier: "no", title: "No" },
        ],
      },
      trigger: { seconds: 60 },
    });
  };

  // Handle notification responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const actionId = response.actionIdentifier;

      if (actionId === "yes") {
        clearTimeout(notificationTimer.current);
        setCurrentlyHere(true);
        Alert.alert("Thanks for letting us know!", "Enjoy your time!");
      } else if (actionId === "no") {
        scheduleNotification(); // Reschedule notification
      }
    });

    return () => subscription.remove();
  }, []);

  // Monitor the planningToAttend state
  useEffect(() => {
    if (planningToAttend && !currentlyHere) {
      scheduleNotification();
    }

    return () => {
      clearTimeout(notificationTimer.current);
    };
  }, [planningToAttend]);

  const handlePlanningToAttendChange = async () => {
    setPlanningToAttend(true);
    const userId = await AsyncStorage.getItem("userId");
    console.log(`User ${userId} set planningToAttend to true.`);
  };

  return (
    <>
      <Button
        title="Plan to Attend"
        onPress={handlePlanningToAttendChange}
        disabled={planningToAttend}
      />
      <Button
        title="Currently Here"
        onPress={() => setCurrentlyHere(true)}
        disabled={currentlyHere}
      />
    </>
  );
}
