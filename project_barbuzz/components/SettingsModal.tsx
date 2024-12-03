import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import for icons
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      onClose();
      router.replace('/signup');
    } catch (error) {
      console.error('Logout error: ', error);
      Alert.alert('Logout Error', 'An error occurred during logout.');
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendPasswordResetEmail(auth, user.email!);
        Alert.alert('Password Reset', 'A password reset email has been sent.');
      } catch (error) {
        console.error('Password reset error: ', error);
        Alert.alert(
          'Password Reset Error',
          'An error occurred while sending the password reset email.'
        );
      }
    } else {
      Alert.alert('User Not Found', 'No user is currently logged in.');
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

          {/* Menu Options */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemContent}>
              <Ionicons name="log-out-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePasswordReset}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Reset Password</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <View style={styles.menuItemContent}>
              <Ionicons name="close-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Close</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#aaa" />
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
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 10, // Subtle shadow for elevation
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
});

export default SettingsModal;
