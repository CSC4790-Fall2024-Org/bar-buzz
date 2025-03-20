// app/signup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IconPng = require('../assets/images/icon.png');

export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Helper to format DOB as MM/DD/YYYY (like your handleDobChange)
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

  const handleSignUp = async () => {
    console.log('Attempting to sign up...');

    // Basic validation
    if (!email || !firstName || !lastName || !password || !dob) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;

    // Villanova email check
    if (!email.endsWith('@villanova.edu')) {
      Alert.alert('Invalid Email', 'Please use a Villanova email address.');
      return;
    }

    // Age restriction check
    const birthYear = parseInt(dob.split('/')[2]);
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 21) {
      Alert.alert('Age Restriction', 'You must be 21+ to sign up.');
      return;
    }

    try {
      const auth = getAuth();
      console.log('Creating user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        console.log('User created:', user.uid);
        await sendEmailVerification(user);
        console.log('Verification email sent to:', email);

        // Sign out to prevent unverified access
        await signOut(auth);
        console.log('User signed out after registration.');
        Alert.alert(
          'Verification Required',
          'A verification email has been sent to your email address. Please verify before signing in. Allow up to 10 minutes.'
        );

        // Save user data to Firestore
        const db = getFirestore();
        const [month, day, year] = dob.split('/');
        const formattedDob = `${year}-${month}-${day}`;

        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          dob: formattedDob,
          profileIcon: 'default',
        });
      }

      if (user && !user.emailVerified) {
        // sign them out or redirect to signIn
        router.replace('/signin');
      }      
    } catch (error) {
      Alert.alert('Error', 'Sign-up failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image source={IconPng} style={styles.logo} />
      <Text style={styles.title}>Sign Up for BarBuzz</Text>

      {/* First Name */}
      <View style={styles.inputContainer}>
        <Text>First Name*</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Your first name"
        />
      </View>

      {/* Last Name */}
      <View style={styles.inputContainer}>
        <Text>Last Name*</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Your last name"
        />
      </View>

      {/* DOB */}
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

      {/* Email */}
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
        <Text style={styles.hintText}>Password must be at least 6 characters.</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Let’s Go!</Text>
      </TouchableOpacity>

      {/* Link to Sign In */}
      <TouchableOpacity
        onPress={() => router.replace('/signin')}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: '#1E90FF' }}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: {
    width: 115,
    height: 115,
    alignSelf: 'center',
    marginBottom: 15,
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
  hintText: { fontSize: 12, color: 'grey', marginTop: 5 },
  button: {
    backgroundColor: '#6FCF97',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: -7,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});