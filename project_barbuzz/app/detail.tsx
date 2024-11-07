import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { db } from '../firebase';  // Ensure correct path
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const DetailScreen: React.FC = () => {
  const { barName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [people, setPeople] = useState<{ name: string }[]>([]); // Updated type to only store name
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({ title: `People at ${barName}` });
    }
  }, [barName, navigation]);

  useEffect(() => {
    const fetchAttendanceData = () => {
      const q = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), // Adjusted query to check location.title
        where('currentlyHere', '==', true)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        try {
          const attendeeIds = querySnapshot.docs.map((doc) => doc.data().userId);

          const enrichedPeople = await Promise.all(
            attendeeIds.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);

              return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
            })
          );

          setPeople(enrichedPeople);
          setLoading(false); // Data fetched successfully
        } catch (err) {
          setError('Failed to load data');
          setLoading(false); // Stop loading on error
        }
      });

      return () => unsubscribe();  // Cleanup on component unmount
    };

    fetchAttendanceData();
  }, [barName]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.nameText}>Loading...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.nameText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.peopleListContainer}>
        {people.length > 0 ? (
          people.map(({ name }, index) => (
            <ThemedText key={index} style={styles.nameText}>
              {name} {/* Only show the name */}
            </ThemedText>
          ))
        ) : (
          <ThemedText style={styles.nameText}>No one here yet!</ThemedText>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  peopleListContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  nameText: {
    fontSize: 20,
    marginVertical: 10,
    color: '#333',
  },
});

export default DetailScreen;
