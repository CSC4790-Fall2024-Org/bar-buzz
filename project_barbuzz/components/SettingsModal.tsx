import React from 'react';
import { Modal, View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const router = useRouter(); // Initialize router
  const auth = getAuth(); // Firebase auth instance

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out from Firebase
      await AsyncStorage.clear(); // Clear stored user data
  
      Alert.alert("Logged Out", "You have been successfully logged out.");
      onClose(); // Close the modal
  
      // Redirect to sign-in page
      router.replace("/signup");
    } catch (error) {
      console.error("Logout error: ", error);
      Alert.alert("Logout Error", "An error occurred during logout.");
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendPasswordResetEmail(auth, user.email!); // Send password reset email
        Alert.alert("Password Reset", "A password reset email has been sent.");
      } catch (error) {
        console.error("Password reset error: ", error);
        Alert.alert("Password Reset Error", "An error occurred while sending the password reset email.");
      }
    } else {
      Alert.alert("User Not Found", "No user is currently logged in.");
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Settings</Text>
          {/* Log Out Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
          {/* Reset Password Button */}
          <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: 320,
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5, // Adds a subtle shadow to lift the modal
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#6FCF97', // Modern green color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF6347', // Red color for close button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SettingsModal;
