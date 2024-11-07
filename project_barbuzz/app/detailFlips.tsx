import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from 'expo-router';
import { db } from '../firebase';  // Ensure correct path
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const DetailFlips: React.FC = () => {
  const navigation = useNavigation();
  const [people, setPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'People at Flip & Bailey\'s' });
  }, [navigation]);

  useEffect(() => {
    const fetchAttendanceData = () => {
      const q = query(
        collection(db, 'tracking'),
        where('location.title', '==', "Flip & Bailey's"), // Check if the title is matching in Firestore
        where('currentlyHere', '==', true)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        try {
          console.log("Querying for Flip & Bailey's attendance data...");
          const attendeeIds = querySnapshot.docs.map((doc) => doc.data().userId);

          const enrichedPeople = await Promise.all(
            attendeeIds.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);

              return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
            })
          );

          console.log("Enriched people:", enrichedPeople); // Log the enriched data
          setPeople(enrichedPeople);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching data:", err); // Log error to the console
          setError('Failed to load data');
          setLoading(false);
        }
      });

      return () => unsubscribe();  // Cleanup on component unmount
    };

    fetchAttendanceData();
  }, []);

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
              {name}
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

export default DetailFlips;
