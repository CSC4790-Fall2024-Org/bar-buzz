import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, ActivityIndicator, Button, TouchableOpacity, Modal, Text, } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Progress from 'react-native-progress';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';


const screenWidth = Dimensions.get('window').width;

const profileIcons = [
  require('@/assets/images/beer.png'),
  require('@/assets/images/juice.png'),
  require('@/assets/images/martini.png'),
  require('@/assets/images/wine.png'),
];

const defaultProfilePhotoUrl = Image.resolveAssetSource(
  require('@/assets/images/usericon.png')
).uri;



export default function HomeScreen() {
  const [name, setName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(defaultProfilePhotoUrl);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [visits, setVisits] = useState([
    { name: "The Grog Grill", visits: 0 },
    { name: "Kelly's Taproom", visits: 0 },
    { name: "McSorley's", visits: 0 },
    { name: "Flip & Bailey's", visits: 0 },
  ]);


  const barColors = ['#008000', '#00BFFF', '#FF0000', '#ffa500'];


  const fetchProfileData = async () => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;
  
    if (user) {
      try {
        console.log('Fetching user profile data...');
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
        
          if (userData.profileIcon) {
            const iconIndex = parseInt(userData.profileIcon.replace('icon', ''), 10) - 1;
            setProfilePhotoUrl(Image.resolveAssetSource(profileIcons[iconIndex] || require('@/assets/images/usericon.png')).uri);
          } else {
            setProfilePhotoUrl(Image.resolveAssetSource(require('@/assets/images/usericon.png')).uri);
          }
        } else {
          setName('Unknown User');
        }
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setName('Error Loading Name');
      }
    }
  };

  useEffect(() => {
    setProfilePhotoUrl(defaultProfilePhotoUrl);
  }, []);

  const handleIconSelect = async (iconIndex: number | null) => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;
  
    if (user) {
      try {
        if (iconIndex !== null) {
          // Store the selected icon index or identifier
          const selectedIcon = `icon${iconIndex + 1}`;
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            profileIcon: selectedIcon,
          });
  
          // Optionally update state for UI feedback
          setProfilePhotoUrl(Image.resolveAssetSource(profileIcons[iconIndex]).uri);
        } else {
          // Reset to default icon
          const defaultIcon = 'default';
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            profileIcon: defaultIcon,
          });
  
          setProfilePhotoUrl(Image.resolveAssetSource(require('@/assets/images/usericon.png')).uri);
        }
  
        setShowIconSelector(false);
      } catch (error) {
        console.error('Error updating profile icon:', error);
      }
    }
  };
  
  


  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;


    if (user) {
      console.log('User is signed in:', user.uid);

      fetchProfileData();

      const trackingQuery = query(
        collection(firestore, 'tracking'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        trackingQuery,
        (snapshot) => {
          console.log('Snapshot received. Docs count:', snapshot.docs.length);


          const visitsData = snapshot.docs.map((doc) => {
            const visit = doc.data() as { location: { title: string } };
            return {
              name: visit.location.title,
              visits: 1,
            };
          });


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


          const updatedVisits = [
            { name: "The Grog Grill", visits: 0 },
            { name: "Kelly's Taproom", visits: 0 },
            { name: "McSorley's", visits: 0 },
            { name: "Flip & Bailey's", visits: 0 },
          ].map((bar) => {
            const match = aggregatedVisits.find(item => item.name === bar.name);
            return match ? { ...bar, visits: match.visits } : bar;
          });


          setVisits(updatedVisits);
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to Firestore updates:', error);
          setLoading(false);
        }
      );


      return () => {
        console.log('Unsubscribing from snapshot listener');
        unsubscribe();
      };
    } else {
      console.log('No user is signed in.');
      setLoading(false);
    }
  }, []);


  const totalVisits = visits.reduce((acc, place) => acc + place.visits, 0);
  const mostVisitedBar = visits.reduce((max, place) => place.visits > max.visits ? place : max, visits[0]).name;


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowIconSelector(true)}>
        <Image
          source={
            profilePhotoUrl
            ? { uri: profilePhotoUrl }
            : require('@/assets/images/usericon.png')
            }
          style={styles.logo}
        />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <ThemedText type="title" style={styles.name}>
              {name}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.school}>
              Villanova University
            </ThemedText>
          </View>
        </View>

        {showIconSelector && (
  <View style={styles.iconSelectorContainer}>
    <View style={styles.iconSelector}>
      {profileIcons.map((icon, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleIconSelect(index)}
        >
          <Image source={icon} style={styles.icon} />
        </TouchableOpacity>
      ))}
    </View>
    {/* Cancel Button */}
    <TouchableOpacity
      onPress={() => handleIconSelect(null)}
      style={styles.cancelButton}
    >
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>
  </View>
)}

        <ThemedView style={styles.contentContainer}>
  <ThemedText type="title" style={styles.recapTitle}>Monthly Recap</ThemedText>
  <View style={styles.chartContainer}>
    {visits.map((place, index) => (
      <View key={index} style={styles.chartBarContainer}>
        <View
          style={[
            styles.chartBar,
            {
              height: Math.min((place.visits / (totalVisits || 1)) * 150, 150), // Limit bar height
              backgroundColor: barColors[index],
            },
          ]}
        />
        <ThemedText style={styles.barLabel} numberOfLines={2}>{place.name}</ThemedText>
      </View>
    ))}
  </View>
</ThemedView>


        <View style={styles.superstarContainer}>
          <ThemedText style={styles.superstarText}>
            {totalVisits === 0
              ? 'Buzz in and see your stats'
              : `You are a ${mostVisitedBar} Superstar!`}
          </ThemedText>
        </View>

        <View style={styles.visitsContainer}>
          {visits.map((place, index) => (
            <View key={index} style={styles.visitRow}>
              <ThemedText style={styles.visitText}>
                {place.visits}/{totalVisits} Visits to {place.name}
              </ThemedText>
              <Progress.Bar
                progress={place.visits / (totalVisits || 1)}
                width={screenWidth * 0.9}
                color={barColors[index]}
                style={styles.progressBar}
                borderRadius={10}
                height={12}
                unfilledColor="#e0e0e0"
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
   // backgroundColor: 'transparent', // Set to transparent
   backgroundColor: '#FFFFFF',

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
    color: '#666',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  recapTitle: {
    fontSize: 22,
    fontWeight: 'bold',
   // marginBottom: 15,
  },
  chartWrapper: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  chartBarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartBar: {
    width: 30,
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
  iconSelector: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 0,
  },
  icon: {
    width: 80,
    height: 80,
  },
  iconSelectorContainer: {
    alignItems: 'center',
    marginVertical: 0,
  },
  cancelButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#d3d3d3',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
