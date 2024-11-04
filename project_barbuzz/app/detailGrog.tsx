import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from 'expo-router';

const DetailGrog: React.FC = () => {
  const navigation = useNavigation();
  const [people, setPeople] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "People at Grog" });
  }, [navigation]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Fetch attendance records
        const response = await fetch(`http://10.0.2.2:8082/attendance/Grog`);
        if (!response.ok) {
          console.error('Failed to fetch attendance data:', response.status);
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        console.log('Fetched attendance data:', data);

        if (Array.isArray(data) && data.length > 0) {
          // Fetch each user's name based on userId in attendance records
          const namesPromises = data.map(async (item) => {
            try {
              const userResponse = await fetch(`http://10.0.2.2:8082/user/${item.userId}`);
              if (!userResponse.ok) {
                console.error(`Failed to fetch user data for userId ${item.userId}`);
                return null;
              }
              const userData = await userResponse.json();
              return userData.name || 'Unknown';
            } catch (error) {
              console.error(`Error fetching user name for userId ${item.userId}:`, error);
              return null;
            }
          });

          const names = await Promise.all(namesPromises);
          setPeople(names.filter(name => name)); // Filter out null values
        } else {
          console.log('No users currently at Grog.');
        }
      } catch (error) {
        console.error('Error in fetchAttendanceData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DetailGrog;




