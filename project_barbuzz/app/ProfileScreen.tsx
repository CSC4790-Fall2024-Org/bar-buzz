import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permissions for photo library access
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Photo library access is needed to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `profilePhotos/${user.uid}.jpg`);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setImage(downloadURL);

        // Here you would save `downloadURL` to the user's Firestore profile document
        console.log('Profile photo uploaded successfully:', downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    } else {
      console.log('No user is signed in');
    }
    setUploading(false);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage} />
      )}
      <Button title="Choose Profile Photo" onPress={pickImage} disabled={uploading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
});

export default ProfileScreen;
