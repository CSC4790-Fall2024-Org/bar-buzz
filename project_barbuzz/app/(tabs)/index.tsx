import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { StatusBar } from 'expo-status-bar';
import MapView, {Marker, Region} from 'react-native-maps';

let showLocationsOfInterest = [
  {
    title:"Grog",
    location:{
      latitude: 40.0221,
      longitude: -75.3204
    },
    description: "My first marker"
  },
  {
    title:"Kellys",
    location:{
      latitude: 40.02458,
      longitude: -75.32429
    },
    description: "My second marker"
  }
]

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');

  const [draggableMarkerCoord, setDraggableMarkerCoord] = useState({
    longitude: -75.3188,
    latitude: 40.0219
  });

  const onRegionChange = (region: Region) => {
    console.log(region);
  };

  // Check if the user is already signed up when the component mounts
  useEffect(() => {
    const checkUserSignUpStatus = async () => {
      try {
        const isSignedUp = await AsyncStorage.getItem('isSignedUp');
        if (!isSignedUp) {
          setModalVisible(true);
        }
      } catch (error) {
        console.error('Error checking sign-up status', error);
      }
    };
    checkUserSignUpStatus();
  }, []);

  // Function to format date as MM/DD/YYYY automatically
  // Update the function definition to include the input type
const handleDobChange = (input: string) => {
  // Remove all non-digit characters
  const cleaned = input.replace(/[^\d]/g, '');

  // Format date as MM/DD/YYYY
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
    console.log("Button Clicked!"); // Check if the button press is registering

    

    // Validate the email and date of birth before proceeding
    if (!email.endsWith('@villanova.edu')) {
      Alert.alert('Invalid Email', 'Please use a Villanova email address.');
      return;
    }

    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 21) {
      Alert.alert('Age Restriction', 'You must be 21+ to sign up.');
      return;
    }

    // Format the date to 'YYYY-MM-DD'
    const [month, day, year] = dob.split('/');
    const formattedDob = `${year}-${month}-${day}`;


    try {
      console.log("Sending request to backend...", name, email, formattedDob, password);
      const response = await axios.post('http://localhost:8082/signup', {
        name,
        email,
        dob: formattedDob, // Use the formatted date here
        password
      });
      console.log("Response from backend:", response);

      if (response.status === 201) {
        await AsyncStorage.setItem('isSignedUp', 'true');
        setModalVisible(false);
        Alert.alert('Success', `Welcome to BarBuzz, ${name}!`);
      } else {
        Alert.alert('Sign-Up Failed', 'Please try again later.');
      }
    } catch (error) {
      console.error('Error signing up', error);
      Alert.alert('Error', 'An error occurred while signing up. Please try again later.');
    }
  };

  return (
    <>
      {/* map */}

      <View style={styles.container}>
              <MapView 
                  style ={styles.map}
                  onRegionChange={onRegionChange}
                  initialRegion={{
                    latitude: 40.0219,
                    latitudeDelta: 0.01,
                    longitude: -75.3188,
                    longitudeDelta: 0.01,
                  }}
                >
              </MapView>
              <StatusBar style="auto"/>
      </View>


      {/* Sign-up modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.welcomeText}>Welcome to BarBuzz</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your name*</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Your name"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your Villanova E-mail*</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                placeholder="Your Villanova Email"
              />
            </View>

            {/* Date of Birth Input with Auto-Formatting */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your Date of Birth*</Text>
              <TextInput
                value={dob}
                onChangeText={handleDobChange}
                style={styles.input}
                placeholder="MM/DD/YYYY"
                maxLength={10} // Limit to MM/DD/YYYY
                keyboardType="number-pad"
              />
              <Text style={styles.ageRestrictionText}>You must be 21+ to sign up</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your Password*</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                placeholder="Your password"
              />
            </View>

      
            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
              <Text style={styles.submitButtonText}>Let’s Go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%', 
    height: '100%'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'normal', // Unbold the label
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  ageRestrictionText: {
    fontSize: 12,
    color: 'grey',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#6FCF97', // Yellow submit button
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
