import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, AppState, Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Region } from 'react-native-maps';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { ScrollView } from 'react-native';
import { auth, db } from '../config/firebaseConfig.js';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['@firebase/auth']);

let showLocationsOfInterest = [
  { title: "The Grog Grill", location: { latitude: 40.02257990031775, longitude: -75.32031440725875 }, description: "Buzz in" },
  { title: "Kelly's Taproom", location: { latitude: 40.02458, longitude: -75.32429 }, description: "Buzz in" },
  { title: "McSorley's", location: { latitude: 39.993037576566806, longitude: -75.29751787647021 }, description: "Buzz in" },
  { title: "Flip & Bailey's", location: { latitude: 40.02547645051331, longitude: -75.33737617922777 }, description: "Buzz in" }
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    //console.log(region);
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
  
        //Alert.alert('Success', 'Your attendance has been recorded in Firestore!');
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


  const fetchUserData = async (userId: string) => {
    try {
      if (!userId) {
        console.error("User ID not found");
        return null;
      }
  
      // Query Firestore to get the user's document
      const userRef = collection(db, 'users');
      const q = query(userRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setUserName(userData.name); // Update state for later use if needed
        if (userData.locations) {
          setUserLocations(userData.locations);
        }
        return userData; // Return user data for immediate use
      } else {
        //console.error("User document not found in Firestore");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
      return null;
    }
  };  
  

 //push
//FOR REQUIRING THE SIGN ON EVERY TIME   

useEffect(() => {
  const enforceEmailVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      await user.reload(); // Reload user state to get latest information
      console.log("Enforcing email verification:", user.emailVerified);

      if (!user.emailVerified) {
        console.log("User email is not verified. Signing out...");
        Alert.alert(
          "Email Not Verified",
          "Please verify your email to access the app. Check your inbox and spam folder."
        );
        await signOut(auth); // Sign out unverified user
        setModalVisible(true); // Show modal for unverified users
      } else {
        console.log("User email is verified.");
        setModalVisible(false); // Hide modal for verified users
      }
    } else {
      console.log("No user is signed in. Showing sign-up modal.");
      setModalVisible(true); // Show modal if no user is signed in
    }
  };

  enforceEmailVerification();
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
  
      if (user) {
        await user.reload(); // Reload user to get the latest verification status
  
        // Retry mechanism to enforce a strict check
        let retryCount = 0;
        while (!user.emailVerified && retryCount < 3) {
          console.log("User email not verified. Retrying...");
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          await user.reload(); // Reload user
          retryCount++;
        }
  
        if (user.emailVerified) {
          // Proceed with login
          console.log("Email verified. Proceeding with login...");
          await AsyncStorage.setItem('userId', user.uid);
          setModalVisible(false);
  
          // Fetch user data to get the user's name
          const userData = await fetchUserData(user.uid); // Fetch the user data directly
  
          if (userData && userData.name) {
            //Alert.alert("Success", `Welcome to BarBuzz, ${userData.name}`);
          } else {
            console.log("User data not found or missing name.");
            //Alert.alert("Success", "Welcome to BarBuzz!");
          }
        } else {
          // Sign out if email is still not verified after retries
          console.log("User email not verified after retries. Signing out...");
          await signOut(auth);
          Alert.alert("Email Not Verified", "Please verify your email to access the app.");
          setModalVisible(true); // Show modal for unverified users
        }
      }
    } catch (error) {
      console.error("Error signing in:", error);
      Alert.alert("Error", "Invalid credentials or an issue with sign-in. Please try again.");
    }
  };  
  

  const handleSignUp = async () => {
    console.log("Attempting to sign up...");
    
    // Validate input fields
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
  
    const auth = getAuth();
  
    try {
      console.log("Creating user with email:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // User created successfully - ensure they are logged out immediately
      if (user) {
        console.log("User created:", user.uid);
        await sendEmailVerification(user);
        console.log("Verification email sent to:", email);
        
        // Sign out the user to prevent access before verification
        await signOut(auth);
        console.log("User signed out after registration.");
        Alert.alert("Verification Required", "A verification email has been sent to your email address. Please verify before signing in.");
        
        // Save user data to Firestore for reference
        const firestore = getFirestore();
        const [month, day, year] = dob.split('/');
        const formattedDob = `${year}-${month}-${day}`;
        
        await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
          dob: formattedDob,
          profileIcon:'default',
        });
  
      }
  
      // Show sign-in modal after sign out
      setIsSignUp(false);
      setModalVisible(true);
  
    } catch (error) {
      console.error("Error during sign-up:", error);
      Alert.alert('Error', 'Sign-up failed. Please try again.');
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
      <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalContainer}
      >
    <View style={styles.modalView}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.welcomeText}>{isSignUp ? 'Sign Up for BarBuzz' : 'Sign In to BarBuzz'}</Text>

        {/* Additional fields for Sign Up only */}
        {isSignUp && (
          <>
            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name*</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholder="Your first name"
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name*</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholder="Your last name"
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
  </KeyboardAvoidingView>
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
      {/* Title at the top */}
      <View style={styles.titleContainer}>
        <Text style={styles.modalTitle}>Buzz In!</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setPinModalVisible(false)}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Questions */}
      <View style={styles.questionsStack}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you currently here?</Text>
          <TouchableOpacity 
            style={[styles.radioCircle, currentlyHere && styles.selectedRadioCircle]} 
            onPress={() => {
              setCurrentlyHere(!currentlyHere);
              if (!currentlyHere) setPlanningToAttend(false); // Deselect the other option
            }}
          />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you planning to attend?</Text>
          <TouchableOpacity 
            style={[styles.radioCircle, planningToAttend && styles.selectedRadioCircle]} 
            onPress={() => {
              setPlanningToAttend(!planningToAttend);
              if (!planningToAttend) setCurrentlyHere(false); // Deselect the other option
            }}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleBuzzedSubmit}
        disabled={!currentlyHere && !planningToAttend} // Disable if no option is selected
      >
        <Text style={styles.submitButtonText}>Submit</Text>
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
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioCircle: {
    backgroundColor: '#1E90FF',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  buzzedButton: {
    backgroundColor: '#6FCF97',
    padding: 15,
    borderRadius: 8,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    opacity: 0.8, // Slight opacity for a more modern look
  },
  buzzedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
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
    marginBottom: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background to make modal stand out
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  modalView: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 16,
    color: 'black',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  blankBox: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'stretch', // Stretch content to align title and questions
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
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 50,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});