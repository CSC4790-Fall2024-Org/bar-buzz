import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './config/firebaseConfig'; // adjust the path based on your file location

const IconPng = require('../assets/images/icon.png');

export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDobChange = (input: string) => {
    const cleaned = input.replace(/[^\d]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
    setDob(formatted);
  };

const SERVER_URL = 'https://barbuzz.co/custom-signup';

async function handleSignUp() {
  if (!email || !firstName || !lastName || !password || !dob) {
    Alert.alert('Missing Information', 'Please complete all required fields.');
    return;
  }
  if (!email.endsWith('@villanova.edu')) {
    Alert.alert('Invalid Email', 'Please use a Villanova email address.');
    return;
  }
  const birthYear = parseInt(dob.split('/')[2]);
  const currentYear = new Date().getFullYear();
  if (currentYear - birthYear < 21) {
    Alert.alert('Age Restriction', 'You must be 21+ to sign up.');
    return;
  }

  try {
    // POST all the sign-up info to your backend
    const response = await fetch(`${SERVER_URL}/custom-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        dob
      }),
    });

    if (!response.ok) {
      // If the server sends an error, display it
      const errorData = await response.json();
      Alert.alert('Error', errorData.error || 'Sign-up failed. Please try again.');
      return;
    }

    // On success, let the user know to check their email
    Alert.alert(
      'Verification Required',
      'A verification email has been sent. Please check your inbox and confirm your account before signing in.'
    );

    // Redirect them to sign-in
    router.replace('/signin');
  } catch (error) {
    Alert.alert('Error', 'Sign-up failed. Please try again.');
  }
}

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image source={IconPng} style={styles.logo} />
        <Text style={styles.title}>Sign Up for BarBuzz</Text>

        <View style={styles.inputContainer}>
          <Text>First Name*</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Your first name" />
        </View>

        <View style={styles.inputContainer}>
          <Text>Last Name*</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Your last name" />
        </View>

        <View style={styles.inputContainer}>
          <Text>Date of Birth (MM/DD/YYYY)*</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={handleDobChange}
            placeholder="MM/DD/YYYY"
            maxLength={10}
            keyboardType="number-pad"
          />
          <Text style={styles.hintText}>You must be 21+ to sign up</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text>Villanova Email*</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Your Villanova Email"
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
          <Text style={styles.hintText}>Password must be at least 6 characters.</Text>
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Let’s Go!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/signin')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#1E90FF' }}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  logo: { width: 115, height: 115, alignSelf: 'center', marginBottom: 15 },
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
  hintText: { fontSize: 12, color: 'grey', marginTop: 5 },
  button: {
    backgroundColor: '#6FCF97',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});