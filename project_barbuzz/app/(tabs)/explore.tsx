import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Modal, Text, Animated } from 'react-native';
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

const routePaths: Record<string, "/detail" | "/detailGrog" | "/detailMcSorleys" | "/detailFlips"> = {
  "Kelly's Taproom": "/detail",
  "The Grog Grill": "/detailGrog",
  "McSorley's": "/detailMcSorleys",
  "Flip & Bailey's": "/detailFlips",
};

const TabTwoScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [peopleCount, setPeopleCount] = useState<{ [key: string]: { planning: number; currentlyHere: number; total: number } }>({});
  const [showBuzzInModal, setShowBuzzInModal] = useState(false);
  const countsRef = useRef<{ [key: string]: { planning: number; currentlyHere: number } }>({});

  useEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  useEffect(() => {
    const fetchPeopleCount = () => {
      const trackingCollection = collection(db, 'tracking');

      DATA.forEach((item) => {
        const barName = item.name;
        countsRef.current[barName] = { planning: 0, currentlyHere: 0 };

        const planningQuery = query(
          trackingCollection,
          where("location.title", "==", barName),
          where("planningToAttend", "==", true)
        );

        const currentlyHereQuery = query(
          trackingCollection,
          where("location.title", "==", barName),
          where("currentlyHere", "==", true)
        );

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

        return () => {
          unsubscribePlanning();
          unsubscribeCurrentlyHere();
        };
      });
    };

    const updatePeopleCount = (barName: string) => {
      const { planning, currentlyHere } = countsRef.current[barName];
      setPeopleCount((prev) => ({
        ...prev,
        [barName]: {
          planning,
          currentlyHere,
          total: planning + currentlyHere,
        },
      }));
    };

    fetchPeopleCount();
  }, []);

  const fetchUserStatus = async () => {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      return { currentlyHere: false, planningToAttend: false };
    }

    const trackingCollection = collection(db, 'tracking');
    const userQuery = query(trackingCollection, where('userId', '==', currentUserId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return { currentlyHere: false, planningToAttend: false };
    }

    const userData = userSnapshot.docs[0].data();
    return {
      currentlyHere: userData.currentlyHere,
      planningToAttend: userData.planningToAttend,
    };
  };

  const handlePress = async (item: Item) => {
    const userStatus = await fetchUserStatus();

    if (!userStatus.currentlyHere && !userStatus.planningToAttend) {
      setShowBuzzInModal(true);
      return;
    }

    router.push({
      pathname: routePaths[item.name] || "/detail",
      params: { barName: item.name },
    });
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
    //backgroundColor: 'white',

  },
  item: {
    fontSize: 22,
    color: 'white',
    padding: 2,
  },
  peopleCount: {
    fontSize: 18,
    color: 'white',
    //backgroundColor: 'white',
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
    //color: 'gray',
    marginTop: 5,
  },
  BBlogo: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
    //marginBottom: 20,
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
