// app/signin.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// If you want the "retry 3 times" logic, we can replicate it.

const IconPng = require('../assets/images/icon.png');

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const auth = getAuth();
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        // Wait up to 3 times for email verification
        let retryCount = 0;
        while (!user.emailVerified && retryCount < 3) {
          console.log('User email not verified. Retrying...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          await user.reload();
          retryCount++;
        }

        if (user.emailVerified) {
          console.log('Email verified. Proceeding with login...');
          await AsyncStorage.setItem('userId', user.uid);
          Alert.alert('Success', 'Logged in successfully!');
          router.push('/(tabs)'); // Go to main screen (index) or wherever
        } else {
          console.log('User email not verified after retries. Signing out...');
          await signOut(auth);
          Alert.alert('Email Not Verified', 'Please verify your email to access the app.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials or an issue with sign-in. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first.');
      return;
    }
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password Reset', 'A password reset email has been sent.');
    } catch (error) {
      Alert.alert('Error', 'Could not send password reset email.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image source={IconPng} style={styles.logo} />

      <Text style={styles.title}>Sign In to BarBuzz</Text>
      {/* Email */}
      <View style={styles.inputContainer}>
        <Text>Email*</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Your Email"
          keyboardType="email-address"
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Text>Password*</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Your Password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity onPress={handleSignIn} style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: 10 }}>
        <Text style={{ color: '#1E90FF', marginBottom: -8 }}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/signup')}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: '#1E90FF', marginBottom: 20,}}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
    padding: 0,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#E0E0E0',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#6FCF97',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});