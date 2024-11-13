import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Region } from 'react-native-maps';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { ScrollView } from 'react-native';
// Import Firestore and Auth from firebase.js
// index.tsx
import { auth, db } from '../config/firebaseConfig.js';
//import { auth } from '../../../barbuzz-backend/firebaseConfig.js'; // Ensure the path is correct
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['@firebase/auth']);


//import { auth } from 'firebase/auth';
//import { auth } from '@/barbuzz-backend/firebaseConfig.js'; 
//import { createUserWithEmailAndPassword } from 'firebase/auth';


let showLocationsOfInterest = [
  {
    title: "The Grog Grill",
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
    title: "McSorley's",
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

type Location = {
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  //const [name, setName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false); 
  const [currentlyHere, setCurrentlyHere] = useState(false); // State for "Are you currently here?"
  const [planningToAttend, setPlanningToAttend] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // Splash screen state
  const mapRef = useRef<MapView | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userName, setUserName] = useState('');
  const [userLocations, setUserLocations] = useState([]);

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
  const handleMarkerPress = (location: Location) => {
    setSelectedLocation(location); // Store the selected bar location
    setPinModalVisible(true); // Show the blank box modal
  };

  const resetModal = () => {
    setCurrentlyHere(false);
    setPlanningToAttend(false);
    setSelectedLocation(null);
  };  

  const handleBuzzedSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }
      if (currentlyHere || planningToAttend) {
        await addDoc(collection(db, 'tracking'), {
          userId: userId || 'anonymous',
          currentlyHere,
          planningToAttend,
          location: selectedLocation, // Save the selected location
          timestamp: new Date().toISOString()
        });
  
        Alert.alert('Success', 'Your attendance has been recorded in Firestore!');
      } else {
        Alert.alert('Error', 'Please select an option.');
      }
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
      Alert.alert('Error', 'Failed to record attendance. Please try again.');
    } finally {
      setPinModalVisible(false);
      resetModal();
    }
  };
  

 //push
//FOR REQUIRING THE SIGN ON EVERY TIME   

  useEffect(() => {
    const checkUserSignUpStatus = async () => {
      setModalVisible(true);  // Always show the sign-up modal
    };
    checkUserSignUpStatus();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error("User ID not found");
          return;
        }
  
        // Query Firestore to get the user's document
        const userRef = collection(db, 'users');
        const q = query(userRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserName(userData.name); // Assuming 'name' field exists in the document
          // Fetch and set locations if available
          if (userData.locations) {
            setUserLocations(userData.locations);
          }
        } else {
          //console.error("User document not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      }
    };
  
    fetchUserData();
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


  const handleSignIn = async () => {
    try {
      const auth = getAuth();
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
  
      // Check if the user is signed in and if their email is verified
      if (user) {
        if (!user.emailVerified) {
          Alert.alert('Email Not Verified', 'Please verify your email to access the app.');
          await signOut(auth); // Sign out if the email is not verified
          return;
        }
  
        // User is signed in and email is verified
        await AsyncStorage.setItem('userId', user.uid);
  
        // Fetch user profile data from Firestore
        const userRef = query(collection(db, 'users'), where('userId', '==', user.uid));
        const snapshot = await getDocs(userRef);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setName(userData.name); // Set name in state
          console.log('User data from Firestore:', userData);
  
          // Use userData.name directly in the Alert
          Alert.alert('Success', `Welcome back to BarBuzz, ${userData.name}!`);
        } else {
          //console.error('User profile not found in Firestore.');
        }
  
        setModalVisible(false); // Close the modal after successful sign-in
      } else {
        console.error('No user is signed in.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Invalid credentials or an issue with sign-in. Please try again.');
    }
    console.log('User ID stored:', await AsyncStorage.getItem('userId'));
  };    

const completeSignUp = async () => {
  const auth = getAuth();
  const firestore = getFirestore();
  const [month, day, year] = dob.split('/');
  const formattedDob = `${year}-${month}-${day}`;

  try {
      console.log("Completing Sign Up...");

      // Create user and get user ID
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the user data under their UID in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
          dob: formattedDob,
      });

      setName(name);

      // Store userId locally in AsyncStorage for future reference
      await AsyncStorage.setItem('userId', user.uid); 

      // Close modal and show success message
      setModalVisible(true);
      Alert.alert('Success', `Welcome to BarBuzz, ${name}!`);
  } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
      console.error('Error completing sign-up:', errorMessage);
      Alert.alert('Error', errorMessage);
  }
};

const handleSignUp = async () => {
  console.log("Button Clicked!");

  // Check that all required fields are filled out
  if (!email || !name || !password || !dob) {
    Alert.alert('Missing Information', 'Please complete all required fields.');
    return;
  }

  // Villanova email check
  if (!email.endsWith('@villanova.edu')) {
    Alert.alert('Invalid Email', 'Please use a Villanova email address.');
    return;
  }

  // Age restriction check
  const birthYear = new Date(dob).getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - birthYear < 21) {
    Alert.alert('Age Restriction', 'You must be 21+ to sign up.');
    return;
  }

  //Define formattedDob and name
  const [month, day, year] = dob.split('/');
  const formattedDob = `${year}-${month}-${day}`;

  const auth = getAuth();
  const firestore = getFirestore();

  try {
    console.log("Sending request to Firestore...");

    // Create user and get user ID
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 1: Send email verification
    await sendEmailVerification(user);
    Alert.alert('Email Verification', 'A verification email has been sent. Please verify to complete registration.');

    // Step 2: Save the user data with separate fields for first and last name
    await setDoc(doc(firestore, 'users', user.uid), {
      name, // Stored concatenated name
      email,
      dob: formattedDob,
    });

    // Step 3: Sign out user to prevent unverified access
    await signOut(auth);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error signing up:', errorMessage);
    Alert.alert('Error', errorMessage);
  }
};

const checkVerificationStatus = async () => {
  const auth = getAuth();
  
  // Ensure auth.currentUser is not null
  if (auth.currentUser) {
    await auth.currentUser.reload(); // Reload user to get the latest verification status

    if (auth.currentUser.emailVerified) {
      Alert.alert('Verified', 'Your email is now verified. You can log in.');
    } else {
      Alert.alert('Not Verified', 'Please verify your email to proceed.');
    }
  } else {
    console.error('No user is currently signed in.');
    Alert.alert('Error', 'No user is currently signed in.');
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
    onPress={() => handleMarkerPress(location)} // Pass the full location object
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

      {/* Sign-up or Sign-in modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.welcomeText}>{isSignUp ? 'Sign Up for BarBuzz' : 'Sign In to BarBuzz'}</Text>

{/* Additional fields for Sign Up only */}
{isSignUp && (
          <>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your Name*</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Your name"
              />
            </View>

            {/* Date of Birth Input */}
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
          </>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your Email*</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholder="Your Email"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your Password*</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholder="Your Password"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={isSignUp ? handleSignUp : handleSignIn}>
          <Text style={styles.submitButtonText}>{isSignUp ? "Let’s Go!" : "Sign In"}</Text>
        </TouchableOpacity>

        {/* Toggle between Sign Up and Sign In */}
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={{ color: '#1E90FF', marginTop: 10 }}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
        {/* Question 1: Are you currently here? */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you currently here?</Text>
          <TouchableOpacity 
          style={[styles.radioCircle, currentlyHere && styles.selectedRadioCircle]} 
          onPress={() => {
          if (currentlyHere) {
            setCurrentlyHere(false);  // Clear if already selected
          } else {
            setCurrentlyHere(true);
            setPlanningToAttend(false);  // Ensure only one option is selected
          }
        }}
      />
      </View>

      {/* Question 2: Are you planning to attend? */}
      <View style={styles.questionContainer}>
      <Text style={styles.questionText}>Are you planning to attend?</Text>
  <TouchableOpacity 
    style={[styles.radioCircle, planningToAttend && styles.selectedRadioCircle]} 
    onPress={() => {
      if (planningToAttend) {
        setPlanningToAttend(false);  // Clear if already selected
      } else {
        setPlanningToAttend(true);
        setCurrentlyHere(false);  // Ensure only one option is selected
      }
    }}
  />
</View>
</View>



      {/* "Buzzed" Button */}
      <TouchableOpacity 
        style={styles.buzzedButton} 
        onPress={handleBuzzedSubmit} // Handler for submission
        disabled={!currentlyHere && !planningToAttend} // Disable if no option is selected
      >
        <Text style={styles.buzzedButtonText}>Buzzed</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </>
  );
}


const styles = StyleSheet.create({
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E90FF',  // Circle border color
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  selectedRadioCircle: {
    backgroundColor: '#1E90FF', // Circle fill when selected
  },
  questionContainer: {
    width: '100%',
    flexDirection: 'row', // Align question text and circle
    justifyContent: 'space-between', // Space between text and circle
    alignItems: 'center',
    marginBottom: 15, 
    marginTop: 15,
  },
  buzzedButton: {
    backgroundColor: '#6FCF97', // Green color for the button
    padding: 15,
    borderRadius: 5,
    width: '80%', // Width of the button
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buzzedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
   scrollViewContent: {
        padding: 10, // Example styles
        backgroundColor: 'white', // Example styles
    },
});