import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Modal, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useNavigation } from 'expo-router';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Item {
  name: string;
  key: string;
}

const DATA: Item[] = [
  { name: "Kelly's Taproom", key: "1" },
  { name: "The Grog Grill", key: "2" },
  { name: "McSorley's", key: "3" },
  { name: "Flip & Bailey's", key: "4" },
];

const initialPeopleCount: {
  [key: string]: { planning: number; currentlyHere: number; total: number }
} = {};

// Loop over your DATA array to initialize each bar
DATA.forEach((bar) => {
  initialPeopleCount[bar.name] = {
    planning: 0,
    currentlyHere: 0,
    total: 0,
  };
});


const routePaths: Record<string, "/detail" | "/detailGrog" | "/detailMcSorleys" | "/detailFlips"> = {
  "Kelly's Taproom": "/detail",
  "The Grog Grill": "/detailGrog",
  "McSorley's": "/detailMcSorleys",
  "Flip & Bailey's": "/detailFlips",
};

const TabTwoScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [peopleCount, setPeopleCount] = useState<{
    [key: string]: { planning: number; currentlyHere: number; total: number };
  }>(initialPeopleCount);
  const [showBuzzInModal, setShowBuzzInModal] = useState(false);
  const countsRef = useRef<{ [key: string]: { planning: number; currentlyHere: number } }>({});
  const unsubscribeRef = useRef<{ [key: string]: () => void }>({});
  //const [resetTimestamp, setResetTimestamp] = useState<number | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  const updatePeopleCount = (barName: string) => {
    const { planning, currentlyHere } = countsRef.current[barName];
    console.log(`Updated counts for ${barName}: Planning: ${planning}, Currently Here: ${currentlyHere}`);
    setPeopleCount((prev) => ({
      ...prev,
      [barName]: {
        planning,
        currentlyHere,
        total: planning + currentlyHere,
      },
    }));
  };

  useEffect(() => {
    // Unsubscribe existing listeners before setting up new ones
    const unsubscribeAll = () => {
      Object.keys(countsRef.current).forEach((barName) => {
        const unsubscribe = unsubscribeRef.current[barName];
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };

    const setupListeners = () => {
      const trackingCollection = collection(db, 'tracking');

      DATA.forEach((item) => {
        const barName = item.name;
        countsRef.current[barName] = { planning: 0, currentlyHere: 0 };

        // Queries for planning to attend and currently here
        const planningQuery = query(trackingCollection, where("location.title", "==", barName), where("planningToAttend", "==", true));
        const currentlyHereQuery = query(trackingCollection, where("location.title", "==", barName), where("currentlyHere", "==", true));

        // Setting up listeners
        const unsubscribePlanning = onSnapshot(planningQuery, (snapshot) => {
          const planningCount = snapshot.size;
          countsRef.current[barName].planning = planningCount;
          updatePeopleCount(barName);
        });

        const unsubscribeCurrentlyHere = onSnapshot(currentlyHereQuery, (snapshot) => {
          const currentlyHereCount = snapshot.size;
          countsRef.current[barName].currentlyHere = currentlyHereCount;
          updatePeopleCount(barName);
        });

        // Store the unsubscribe functions
        unsubscribeRef.current[barName] = () => {
          unsubscribePlanning();
          unsubscribeCurrentlyHere();
        };
      });
    };

    unsubscribeAll(); // Unsubscribe before setting up new listeners
    setupListeners(); // Set up new listeners

    // Cleanup function for when component unmounts or resetTimestamp changes
    return () => {
      unsubscribeAll();
    };
  }, []);

  /*const triggerReset = async () => {
    try {
      // Call the backend API to reset daily submissions
      const response = await fetch('http://localhost:8082/clear-daily-submissions', { method: 'POST' });
      const data = await response.json();
      console.log('Reset triggered successfully:', data);
  
      // After resetting in Firestore, manually update the counts in the component
      const trackingCollection = collection(db, 'tracking');
      const updatedSnapshot = await getDocs(trackingCollection);
  
      updatedSnapshot.forEach(doc => {
        const barName = doc.data().location.title;
        const { planningToAttend, currentlyHere } = doc.data();
  
        // Update the counts to ensure planningToAttend is properly reflected
        countsRef.current[barName] = {
          planning: planningToAttend ? 1 : 0, // Setting to 0 after reset
          currentlyHere: currentlyHere ? 1 : 0
        };
        updatePeopleCount(barName);
      });
  
      // Update the reset timestamp to trigger a re-run of useEffect
      setResetTimestamp(Date.now());
  
    } catch (error) {
      //console.error('Error triggering reset:', error);
    }
  };*/
  
  /*
  useEffect(() => {
    const initialize = async () => {
      //await triggerReset(); // Trigger the reset on component mount
    };
  
    initialize();
  }, []);  */
  

  const handlePress = async (item: Item) => {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      console.log('No user is signed in.');
      setShowBuzzInModal(true);
      return;
    }

    const trackingCollection = collection(db, 'tracking');
    const userQuery = query(trackingCollection, where('userId', '==', currentUserId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('No logs found for the user. Showing modal.');
      setShowBuzzInModal(true);
      return;
    }

    // Check if the user has logged "currentlyHere" or "planningToAttend" for today
    let hasLogged = false;
    userSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.currentlyHere || data.planningToAttend) {
        hasLogged = true;
      }
    });

    if (!hasLogged) {
      console.log('User has not logged attendance for today. Showing modal.');
      setShowBuzzInModal(true);
    } else {
      console.log(`User has logged attendance. Navigating to ${item.name}`);
      router.push({
        pathname: routePaths[item.name] || "/detail",
        params: { barName: item.name },
      });
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    let backgroundColor = 'white';
    if (item.name === "Kelly's Taproom") backgroundColor = '#00BFFF';
    else if (item.name === "The Grog Grill") backgroundColor = '#008000';
    else if (item.name === "McSorley's") backgroundColor = '#FF0000';
    else if (item.name === "Flip & Bailey's") backgroundColor = '#ffa500';

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={[styles.itemContainer, { backgroundColor }]}
      >
        <View style={styles.itemContent}>
          <ThemedText style={styles.item}>{item.name}</ThemedText>
          <ThemedText style={styles.peopleCount}>
            {peopleCount[item.name] ? `${peopleCount[item.name].total} people` : 'Loading...'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {showBuzzInModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showBuzzInModal}
          onRequestClose={() => setShowBuzzInModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Image 
                source={require('@/assets/images/BarBuzz2.png')} 
                style={styles.BBlogo2} 
              />
              <Text style={styles.modalText}>Buzz Alert!</Text>
              <Text style={styles.modalSubText}>
                To see who’s here right now, head back and buzz yourself in!
              </Text>
              <TouchableOpacity 
                style={styles.letsGoButton}
                onPress={() => setShowBuzzInModal(false)}
              >
                <Text style={styles.letsGoButtonText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <FlatList
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <Image source={require('@/assets/images/BarBuzz.png')} style={styles.BBlogo} />
            <ThemedText style={styles.title}>Villanova University</ThemedText>
            <ThemedText style={styles.subtitle}>Villanova, PA</ThemedText>
          </ThemedView>
        }
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.key}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  item: {
    fontSize: 22,
    color: 'white',
    padding: 2,
  },
  peopleCount: {
    fontSize: 18,
    color: 'white',
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 21,
    marginTop: 5,
  },
  BBlogo: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
  BBlogo2: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  letsGoButton: {
    backgroundColor: '#6FCF97',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  letsGoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TabTwoScreen;