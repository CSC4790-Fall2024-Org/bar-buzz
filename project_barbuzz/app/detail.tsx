import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const DetailScreen: React.FC = () => {
  const { barName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [currentPeople, setCurrentPeople] = useState<{ name: string }[]>([]);
  const [planningPeople, setPlanningPeople] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({ title: `People at ${barName}` });
    }
  }, [barName, navigation]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const qCurrent = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), 
        where('currentlyHere', '==', true)
      );

      const qPlanning = query(
        collection(db, 'tracking'),
        where('location.title', '==', barName), 
        where('currentlyHere', '==', false)
      );

      try {
        const currentQuerySnapshot = await getDocs(qCurrent);
        const planningQuerySnapshot = await getDocs(qPlanning);

        // Fetch current people
        const currentAttendees = currentQuerySnapshot.docs.map((doc) => doc.data().userId);
        const currentPeopleList = await Promise.all(
          currentAttendees.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
          })
        );

        // Fetch planning people
        const planningAttendees = planningQuerySnapshot.docs.map((doc) => doc.data().userId);
        const planningPeopleList = await Promise.all(
          planningAttendees.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? { name: userDoc.data().name } : { name: "Unknown User" };
          })
        );

        // Set state with fetched data
        setCurrentPeople(currentPeopleList);
        setPlanningPeople(planningPeopleList);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError('Failed to load data');
      } finally {
        setLoading(false); // Set loading to false after data fetching is complete
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
        <View style={styles.wrapper}>
          {/* Currently Here Column */}
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

          {/* Divider */}
          <View style={styles.verticalDivider} />

          {/* Planning to Attend Column */}
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
    backgroundColor: '#fffbe0', 
  },
  wrapper: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start', 
    justifyContent: 'center', 
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
    width: '100%', 
  },
  nameText: {
    fontSize: 16,
    color: '#333',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'black',
    height: '100%', 
  },
});

export default DetailScreen;
