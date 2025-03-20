import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const DetailScreen: React.FC = () => {
  const { barName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [currentPeople, setCurrentPeople] = useState<{ name: string }[]>([]);
  const [planningPeople, setPlanningPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({
        title: `People at ${barName}`,
        headerBackTitle: 'Bars', // Customizes the back label
      });
    }
  }, [barName, navigation]);
  

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const qCurrent = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), 
        where('currentlyHere', '==', true)
      );
      
      /*
      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), 
        where('currentlyHere', '==', false)
      );*/

      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName),
        where('planningToAttend', '==', true)
      );

      try {
        const currentQuerySnapshot = await getDocs(qCurrent);
        const planningQuerySnapshot = await getDocs(qPlanning);

        const currentAttendees = currentQuerySnapshot.docs.map((doc) => doc.data().userId);
        const currentPeopleList = await Promise.all(
          currentAttendees.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
          })
        );

        const planningAttendees = planningQuerySnapshot.docs.map((doc) => doc.data().userId);
        const planningPeopleList = await Promise.all(
          planningAttendees.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
          })
        );

        setCurrentPeople(currentPeopleList);
        setPlanningPeople(planningPeopleList);
      } catch (err) {
        console.error("Error fetching data: ", err);
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
    backgroundColor: '#f7f7f7', // Slightly lighter gray for a soft, professional feel
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444', // Dark gray for a softer look than black
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff', // Clean white background for entries
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  nameText: {
    fontSize: 16,
    color: '#333', // Dark gray for text to complement background
    textAlign: 'left',
  },
});

export default DetailScreen;
