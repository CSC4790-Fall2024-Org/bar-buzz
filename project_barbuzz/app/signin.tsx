import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './config/firebaseConfig'; // adjust the path based on your file location


const IconPng = require('../assets/images/icon.png');

const SERVER_URL = 'https://barbuzz.co';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    try {
      // 1) Sign in with Firebase Auth
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2) Get the ID token
      const idToken = await user.getIdToken(true);

      // 3) POST to your server
      const response = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Login failed', errorData.error || 'Unknown error');
        return;
      }

      const data = await response.json();
      Alert.alert('Success', data.message); // e.g. "Login successful! User is verified."
      // Navigate to your home/tabs
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials or an issue with sign-in.');
    }
  }

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image source={IconPng} style={styles.logo} />
        <Text style={styles.title}>Sign In to BarBuzz</Text>

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
          <Text style={{ color: '#1E90FF', marginBottom: 20 }}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
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

