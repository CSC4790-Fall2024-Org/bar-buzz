import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { db } from '../firebase';  // Ensure correct path
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const DetailScreen: React.FC = () => {
  const { barName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [people, setPeople] = useState<{ name: string; userId: string }[]>([]); // Update type to store name and userId

  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({ title: `People at ${barName}` });
    }
  }, [barName, navigation]);
  

useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        console.log('Bar Name:', barName); // Log the bar name
        const q = query(
          collection(db, 'tracking'),
          where('location', '==', barName),
          where('currentlyHere', '==', true)
        );

        const querySnapshot = await getDocs(q);
        console.log('Currently Here Users:', querySnapshot.docs.map(doc => doc.data())); // Log the fetched data

        const names = querySnapshot.docs.map((doc) => doc.data().userId);

        const planningToAttendQuery = query(
          collection(db, 'tracking'),
          where('location', '==', barName),
          where('planningToAttend', '==', true)
        );

        const planningSnapshot = await getDocs(planningToAttendQuery);
        console.log('Planning to Attend Users:', planningSnapshot.docs.map(doc => doc.data())); // Log planning users
        const planningNames = planningSnapshot.docs.map((doc) => doc.data().userId);

        const allAttendees = [...new Set([...names, ...planningNames])];

        const enrichedPeople = await Promise.all(
          allAttendees.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              return { userId, name: userDoc.data().name };
            } else {
              return { userId, name: userId }; // Fallback to userId if no user found
            }
          })
        );

        console.log('All Attendees:', enrichedPeople); // Log enriched people
        setPeople(enrichedPeople);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, [barName]);


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.peopleListContainer}>
        {people.length > 0 ? (
          people.map(({ name, userId }, index) => (
            <ThemedText key={index} style={styles.nameText}>
              {name} (ID: {userId})
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
