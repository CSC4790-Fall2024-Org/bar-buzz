import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        // fallback for dev only
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) {
          router.replace('/(tabs)');
        } else {
          router.replace('/signup');
        }
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}