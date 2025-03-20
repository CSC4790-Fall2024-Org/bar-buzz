import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { db } from '../firebase';
import { collection, query, where, doc, getDoc, getDocs } from 'firebase/firestore';

const DetailMcSorleys: React.FC = () => {
  const { barName } = useLocalSearchParams(); // Get dynamic bar name
  const navigation = useNavigation();
  const [currentPeople, setCurrentPeople] = useState<{ name: string }[]>([]);
  const [planningPeople, setPlanningPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamically set the title based on the barName
  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({ title: `People at ${barName}` });
    }
  }, [barName, navigation]);

  // Fetch attendance data once when the component is loaded
  useEffect(() => {
    const fetchAttendanceData = async () => {
      const qCurrent = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), // Use dynamic barName
        where('currentlyHere', '==', true)
      );

      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), // Use dynamic barName
        //where('currentlyHere', '==', false)
        where('planningToAttend', '==', true)
      );

      try {
        // Fetch current attendees
        const currentQuerySnapshot = await getDocs(qCurrent);
        const planningQuerySnapshot = await getDocs(qPlanning);

        const currentAttendees = currentQuerySnapshot.docs.map((doc) => doc.data().userId);
        const currentPeopleList = await Promise.all(
          currentAttendees.map(async (userId) => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: 'Unknown User' };
          })
        );

        // Fetch planning attendees
        const planningAttendees = planningQuerySnapshot.docs.map((doc) => doc.data().userId);
        const planningPeopleList = await Promise.all(
          planningAttendees.map(async (userId) => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: 'Unknown User' };
          })
        );

        setCurrentPeople(currentPeopleList);
        setPlanningPeople(planningPeopleList);
      } catch (err) {
        console.error('Error fetching data: ', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (barName) {
      fetchAttendanceData();
    }
  }, [barName]);

  if (loading) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <ThemedText style={styles.nameText}>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <ThemedText style={styles.nameText}>{error}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.peopleListContainer}>
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Currently Here</ThemedText>
          {currentPeople.length > 0 ? (
            currentPeople.map(({ name }, index) => (
              <View key={index} style={styles.row}>
                <ThemedText style={styles.nameText}>{name}</ThemedText>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <ThemedText style={styles.nameText}>No one here yet!</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Planning to Attend</ThemedText>
          {planningPeople.length > 0 ? (
            planningPeople.map(({ name }, index) => (
              <View key={index} style={styles.row}>
                <ThemedText style={styles.nameText}>{name}</ThemedText>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <ThemedText style={styles.nameText}>No one planning to attend yet!</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  peopleListContainer: {
    padding: 15,
    backgroundColor: '#f7f7f7', // Light gray background for a consistent feel
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  nameText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
});

export default DetailMcSorleys;
