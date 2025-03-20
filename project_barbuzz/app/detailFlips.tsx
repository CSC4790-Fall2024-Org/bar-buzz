import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from 'expo-router';
import { db } from '../firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const DetailFlips: React.FC = () => {
  const navigation = useNavigation();
  const [currentPeople, setCurrentPeople] = useState<{ name: string }[]>([]);
  const [planningPeople, setPlanningPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'People at Flip & Bailey\'s' });
  }, [navigation]);

  useEffect(() => {
    const fetchAttendanceData = () => {
      const qCurrent = query(
        collection(db, 'tracking'),
        where('location.title', '==', "Flip & Bailey's"), 
        where('currentlyHere', '==', true)
      );
      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', "Flip & Bailey's"), 
        //where('currentlyHere', '==', false) 
        where('planningToAttend', '==', true)
      );

      let currentDataFetched = false;
      let planningDataFetched = false;

      const unsubscribeCurrent = onSnapshot(qCurrent, async (querySnapshot) => {
        try {
          const attendeeIdsCurrent = querySnapshot.docs.map((doc) => doc.data().userId);

          const enrichedCurrentPeople = await Promise.all(
            attendeeIdsCurrent.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);

              return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
            })
          );

          setCurrentPeople(enrichedCurrentPeople);
          currentDataFetched = true;
          if (currentDataFetched && planningDataFetched) setLoading(false);  
        } catch (err) {
          setError('Failed to load current attendance data');
        }
      });

      const unsubscribePlanning = onSnapshot(qPlanning, async (querySnapshot) => {
        try {
          const attendeeIdsPlanning = querySnapshot.docs.map((doc) => doc.data().userId);

          const enrichedPlanningPeople = await Promise.all(
            attendeeIdsPlanning.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);

              return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
            })
          );

          setPlanningPeople(enrichedPlanningPeople);
          planningDataFetched = true;
          if (currentDataFetched && planningDataFetched) setLoading(false);  
        } catch (err) {
          setError('Failed to load planning attendance data');
        }
      });

      return () => {
        unsubscribeCurrent();
        unsubscribePlanning();
      };
    };

    fetchAttendanceData();
  }, []);

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
    backgroundColor: '#f7f7f7', // Matches DetailScreen light gray background
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444', // Matches DetailScreen section title color
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff', // Matches DetailScreen white background for rows
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000', // Subtle shadow for depth, similar to DetailScreen
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  nameText: {
    fontSize: 16,
    color: '#333', // Matches DetailScreen text color
    textAlign: 'left',
  },
});

export default DetailFlips;
