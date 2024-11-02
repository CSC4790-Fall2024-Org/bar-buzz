import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from 'expo-router';

const DetailGrog: React.FC = () => {
  const navigation = useNavigation();
  const [people, setPeople] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Track loading state

  useLayoutEffect(() => {
    navigation.setOptions({ title: "People at Grog" });
  }, [navigation]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8082/attendance/Grog`);
        const data = await response.json();

        console.log('Attendance Data for Grog:', data); // Log fetched data

        if (Array.isArray(data) && data.length > 0) {
          const userIds = data.map(item => item.userId);
          setPeople(userIds);
        } else {
          console.log('No users currently at Grog.'); // Log when no users found
        }
      } catch (error) {
        console.error('Error fetching attendance data for Grog:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return <ThemedText style={styles.loadingText}>Loading...</ThemedText>; // Display loading text
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.peopleListContainer}>
        {people.length > 0 ? (
          people.map((name, index) => (
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
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DetailGrog;





