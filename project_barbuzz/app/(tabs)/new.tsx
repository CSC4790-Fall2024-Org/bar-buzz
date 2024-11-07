import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Progress from 'react-native-progress';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, QueryDocumentSnapshot } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [name, setName] = useState(''); // State to hold the user's name
  const [visits, setVisits] = useState<{ name: string; visits: number }[]>([]); // State to hold visits data
  const [loading, setLoading] = useState(true); // Loading state
  const school = "Villanova University"; // Replace with your school

  const allBars = [
    { name: "The Grog", visits: 0 },
    { name: "Kelly's Taproom", visits: 0 },
    { name: "McSorelsey's", visits: 0 },
    { name: "Flip & Bailey's", visits: 0 },
  ];
  
  const fetchProfileData = async () => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Fetch user profile data
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name); // Assuming 'name' is a field in Firestore
        } else {
          console.log('No such document!');
        }
  
        // Fetch tracking data for the user
        const trackingQuery = query(
          collection(firestore, 'tracking'),
          where('userId', '==', user.uid)
        );
        const trackingSnapshot = await getDocs(trackingQuery);
  
        let visitsData: { name: string; visits: number }[] = [];
        if (!trackingSnapshot.empty) {
          visitsData = trackingSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
            const visit = doc.data() as { location: { title: string } };
            return {
              name: visit.location.title,
              visits: 1,
            };
          });
  
          // Aggregate visits by location title
          const aggregatedVisits = visitsData.reduce<{ name: string; visits: number }[]>(
            (acc, visit) => {
              const existingIndex = acc.findIndex(item => item.name === visit.name);
              if (existingIndex !== -1) {
                acc[existingIndex].visits += 1;
              } else {
                acc.push(visit);
              }
              return acc;
            },
            []
          );
  
          // Ensure all bars are present, with zero visits if not already in aggregatedVisits
          const completeVisitsData = allBars.map(bar => {
            const existingBar = aggregatedVisits.find(item => item.name === bar.name);
            return existingBar ? existingBar : bar;
          });
  
          setVisits(completeVisitsData);
        } else {
          // If no tracking data, show all bars with zero visits
          setVisits(allBars);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      console.log('No user is signed in.');
    }
    setLoading(false);
  };
  

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Sum of all visits
  const totalVisits = visits.reduce((acc, place) => acc + place.visits, 0);

  // Define an array of colors corresponding to each bar
  const barColors = ['#008000', '#00BFFF', '#FF0000', '#ffa500'];

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Person Logo */}
          <Image 
            source={require('@/assets/images/usericon.png')} // Ensure this path is correct
            style={styles.logo}
          />
          {/* Name and School */}
          <View style={styles.headerTextContainer}>
            <ThemedText type="title" style={styles.name}>{name}</ThemedText>
            <ThemedText type="subtitle" style={styles.school}>{school}</ThemedText>
          </View>
        </View>

        {/* Monthly Recap */}
        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title" style={styles.recapTitle}>Monthly Recap</ThemedText>
          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {visits.map((place, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar, 
                    { height: (place.visits / totalVisits) * 150, backgroundColor: barColors[index] }, // Dynamic height & color
                  ]} 
                />
                <ThemedText style={styles.barLabel}>{place.name}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Superstar Section */}
        <View style={styles.superstarContainer}>
          <ThemedText style={styles.superstarText}>You are a Grog Superstar!</ThemedText>
        </View>

        {/* Visit Progress */}
        <View style={styles.visitsContainer}>
          {visits.map((place, index) => (
            <View key={index} style={styles.visitRow}>
              <ThemedText style={styles.visitText}>
                {place.visits}/{totalVisits} Visits to {place.name}
              </ThemedText>
              {/* Progress bar adjusted to full width */}
              <Progress.Bar 
                progress={place.visits / totalVisits} 
                width={screenWidth * 0.9} // Set width dynamically relative to screen width
                color={barColors[index]} // Use the same color as the bar
                style={styles.progressBar} 
                borderRadius={10} // Smooth bar edges
                height={12} // Adjust height for better appearance
                unfilledColor="#e0e0e0" // Color of the unfilled portion
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: '20%',
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  school: {
    fontSize: 16,
    color: '#666',  // Gray color
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  recapTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartBackground: {
    backgroundColor: '#ffffff', // White background
    padding: 10,  // Optional padding for visual appeal
    borderRadius: 10,  // Optional rounded corners
    elevation: 3,  // Optional shadow for Android
    shadowColor: '#000',  // Optional shadow color for iOS
    shadowOffset: { width: 0, height: 1 },  // Optional shadow offset for iOS
    shadowOpacity: 0.2,  // Optional shadow opacity for iOS
    shadowRadius: 1,  // Optional shadow radius for iOS
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',  // Align bars to the bottom
    height: 150,  // Set a fixed height for the chart
  },
  chartBarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartBar: {
    width: 30,
    backgroundColor: '#b19cd9',  // Default bar color (Grog)
  },
  barLabel: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },
  superstarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  superstarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',  
  },
  visitsContainer: {
    paddingHorizontal: 16,
  },
  visitRow: {
    marginBottom: 20,
  },
  visitText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    alignSelf: 'center',
  },
});
