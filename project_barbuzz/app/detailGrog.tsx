import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from 'expo-router';
import { db } from '../firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const DetailGrog: React.FC = () => {
  const navigation = useNavigation();
  const [currentPeople, setCurrentPeople] = useState<{ name: string }[]>([]);
  const [planningPeople, setPlanningPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'People at The Grog Grill' });
  }, [navigation]);

  useEffect(() => {
    const fetchAttendanceData = () => {
      const qCurrent = query(
        collection(db, 'tracking'),
        where('location.title', '==', "The Grog Bar & Grill"), // Adjusted query to check the Grog Bar's name
        where('currentlyHere', '==', true)
      );
      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', "The Grog Bar & Grill"), 
        where('currentlyHere', '==', false) 
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
        <View style={styles.wrapper}>
          <View style={styles.column}>
            <ThemedText style={styles.columnTitle}>Currently Here</ThemedText>
            {currentPeople.length > 0 ? (
              currentPeople.map(({ name }, index) => (
                <View
                  key={index}
                  style={[
                    styles.row,
                    { backgroundColor: index % 2 === 0 ? '#ffecb3' : '#fff8e1' },
                  ]}
                >
                  <ThemedText style={styles.nameText}>{name}</ThemedText>
                </View>
              ))
            ) : (
              <View style={styles.row}>
                <ThemedText style={styles.nameText}>No one here yet!</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.column}>
            <ThemedText style={styles.columnTitle}>Planning to Attend</ThemedText>
            {planningPeople.length > 0 ? (
              planningPeople.map(({ name }, index) => (
                <View
                  key={index}
                  style={[
                    styles.row,
                    { backgroundColor: index % 2 === 0 ? '#ffecb3' : '#fff8e1' },
                  ]}
                >
                  <ThemedText style={styles.nameText}>{name}</ThemedText>
                </View>
              ))
            ) : (
              <View style={styles.row}>
                <ThemedText style={styles.nameText}>No one planning to attend yet!</ThemedText>
              </View>
            )}
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fffbe0', // Light yellow background for table area
  },
  wrapper: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start', // Aligns content to the top
    justifyContent: 'center', // Centers the columns and divider in the screen
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 20,
  },
  row: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Makes rows full width within column
  },
  nameText: {
    fontSize: 16,
    color: '#333',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'black', // Changed to black
    height: '100%', // Extends divider vertically through header and rows
  },
});

export default DetailGrog;
