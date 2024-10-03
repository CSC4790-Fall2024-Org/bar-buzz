import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Region } from 'react-native-maps';

let showLocationsOfInterest = [
  {
    title: "The Grog Bar & Grill",
    location: {
      latitude: 40.02257990031775,
      longitude: -75.32031440725875
    },
    description: "Buzz in"
  },
  {
    title: "Kelly's Taproom",
    location: {
      latitude: 40.02458,
      longitude: -75.32429
    },
    description: "Buzz in"
  },
  {
    title: "McSoreley's Ale House",
    location: {
      latitude: 39.993037576566806,
      longitude: -75.29751787647021
    },
    description: "Buzz in"
  },
  {
    title: "Flip & Bailey's",
    location: {
      latitude: 40.02547645051331,
      longitude: -75.33737617922777
    },
    description: "Buzz in"
  }
]

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false); 
  const [currentlyHere, setCurrentlyHere] = useState(false); // State for "Are you currently here?"
  const [planningToAttend, setPlanningToAttend] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const onRegionChange = (region: Region) => {
    console.log(region);
  };

  const moveToLocation = (location: { latitude: number, longitude: number }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };
  const handleMarkerPress = () => {
    setPinModalVisible(true); // Show the blank box modal
  };

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

    const [month, day, year] = dob.split('/');
    const formattedDob = `${year}-${month}-${day}`;

    try {
      const response = await axios.post('http://localhost:8082/signup', {
        name,
        email,
        dob: formattedDob,
        password
      });

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
      {/* Map with markers */}
      <View style={styles.container}>
        <MapView 
          ref={mapRef}
          style={styles.map}
          onRegionChange={onRegionChange}
          initialRegion={{
            latitude: 40.01551675895906,
            latitudeDelta: 0.06980335542762361,
            longitude: -75.31918823899272,
            longitudeDelta: 0.05196722949045807,
          }}
        >
          {showLocationsOfInterest.map((location, index) => (
            <Marker
              key={index}
              coordinate={location.location}
              title={location.title}
              description={location.description}
              pinColor={
                index % 4 === 0 
                  ? 'green'  
                  : index % 4 === 1 
                  ? 'blue'   
                  : index % 4 === 2 
                  ? 'red'    
                  : 'orange' 
              }
              onPress={handleMarkerPress}
            />
          ))}
        </MapView>

        {/* List of locations */}
        <View style={styles.listContainer}>
          <FlatList
            data={showLocationsOfInterest}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => moveToLocation(item.location)}>
                <Text style={styles.listItem}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <StatusBar style="auto" />
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
                maxLength={10}
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


      {/* Blank Box Modal when a pin is clicked */}
<Modal
  animationType="slide"
  transparent={true}
  visible={pinModalVisible}
  onRequestClose={() => setPinModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.blankBox}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => setPinModalVisible(false)}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {/* Container for Questions */}
      <View style={styles.questionsStack}>
        {/* Question 1 Container */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you currently here?</Text>
          <TouchableOpacity 
            style={styles.yesButton} 
            onPress={() => {
              setCurrentlyHere(true); // Set state to true for currently here
              setPinModalVisible(false); // Close the modal
            }}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
        </View>

        {/* Separate container for Question 2 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you planning to attend?</Text>
          <TouchableOpacity 
            style={styles.yesButton} 
            onPress={() => {
              setPlanningToAttend(true); // Set state to true for planning to attend
              setPinModalVisible(false); // Close the modal
            }}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  listContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  questionsStack: {
    flexDirection: 'column', // Stack questions vertically
    alignItems: 'center', // Center questions horizontally
    justifyContent: 'center', // Center questions vertically within the stack
    width: '100%', // Take full width of blank box
  },
  listItem: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
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
    fontWeight: 'normal',
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
    backgroundColor: '#6FCF97',
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
  questionText: {
    flex: 1, // Allow the text to take up available space
   // fontSize: 15,
    textAlign: 'left', // Align text to the left
    //marginRight: 5, // Space between text and button
    fontWeight: 'bold',
    marginRight:10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  noButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    //flex: 1, // Reduced font size for button text
    textAlign: 'center', // Ensure text is centered
    //lineHeight: 40,
  },
  blankBox: {
    width: 300,
    //height: 150,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#1E90FF',
    width: 75, // Set a fixed width
    height: 40, // Set the same height to make it a square
    //marginTop: 10,
    //marginBottom: -20,
    borderRadius: 5,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
  },
  questionContainer: {
    width: '100%',
    flexDirection: 'row', // Use row layout for questions and buttons
    justifyContent: 'space-between', // Space between question text and button
    alignItems: 'center', // Align items in the center vertically
    marginBottom: 15, // Space between questions
    marginTop: 15
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    //padding: 5, // Add padding to make it clickable
  },
  closeButtonText: {
    fontSize: 24, // Make the "X" larger
    color: 'black', // Set the color for the "X"
  },
});