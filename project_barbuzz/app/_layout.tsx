import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Image, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (loaded) {
      // Hide the splash screen after 2 seconds
      setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('@/assets/images/BBlogo.png')} style={styles.splashImage} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          {/* Hide header for (tabs) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Define other screens with headers */}
          <Stack.Screen name="detail" options={{ title: 'Friends' }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Change this color to match your app's theme if needed
  },
  splashImage: {
    width: 300, 
    height: 300, 
    resizeMode: 'contain', // Ensures the logo maintains its aspect ratio
  },
});




