// app/index.tsx
import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Wait one “tick” so the root layout can mount
    setTimeout(() => {
      if (!user) {
        // Not logged in => go to signup
        router.replace('/signup');
      } else {
        // Already logged in => go to tabs or map
        router.replace('/(tabs)'); 
      }
    }, 0);
  }, []);

  return null; // Renders nothing
}