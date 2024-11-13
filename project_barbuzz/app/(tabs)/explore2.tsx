import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Modal, Button } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useNavigation } from 'expo-router';
import { db } from '../../firebase'; // Adjust the path if necessary
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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

const TabTwoScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [peopleCount, setPeopleCount] = useState<{ [key: string]: { planning: number; currentlyHere: number; total: number } }>({});
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<{ [barName: string]: { planning: boolean; currentlyHere: boolean } }>({});

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  useEffect(() => {
    const fetchPeopleCount = () => {
      const trackingCollection = collection(db, 'tracking');
      const auth = getAuth();
      const userId = auth.currentUser?.uid; // Get the current user’s ID

      if (!userId) return; // If no user is logged in, exit early

      DATA.forEach((item) => {
        const barName = item.name;

        // Query for people planning to attend and currently here
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

        // Listen for updates for each query
        const unsubscribePlanning = onSnapshot(planningQuery, (snapshot) => {
          const planningCount = snapshot.size;
          setPeopleCount((prev) => ({
            ...prev,
            [barName]: {
              ...prev[barName],
              planning: planningCount,
              total: planningCount + (prev[barName]?.currentlyHere || 0),
            },
          }));
        });

        const unsubscribeCurrentlyHere = onSnapshot(currentlyHereQuery, (snapshot) => {
          const currentlyHereCount = snapshot.size;
          setPeopleCount((prev) => ({
            ...prev,
            [barName]: {
              ...prev[barName],
              currentlyHere: currentlyHereCount,
              total: (prev[barName]?.planning || 0) + currentlyHereCount,
            },
          }));
        });

        // Check if the user has logged their attendance status for this bar
        const userQuery = query(
          trackingCollection,
          where("userId", "==", userId),
          where("location.title", "==", barName)
        );

        const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
          const userData = snapshot.docs[0]?.data();
          if (userData) {
            // Debugging: Log the data we received
            console.log(`User data for ${barName}:`, userData);

            setUserStatus((prev) => ({
              ...prev,
              [barName]: {
                planning: userData.planningToAttend,
                currentlyHere: userData.currentlyHere,
              },
            }));
          } else {
            // Handle case where user data isn't found (i.e., user hasn't logged any status for this bar)
            console.log(`No user data for ${barName}`);
          }
        });

        // Cleanup the subscriptions when the component unmounts
        return () => {
          unsubscribePlanning();
          unsubscribeCurrentlyHere();
          unsubscribeUser();
        };
      });
    };

    fetchPeopleCount();
  }, []);

  const handlePress = (item: Item) => {
    const { planning, currentlyHere } = userStatus[item.name] || {};

    // Debugging: Check what status we're getting for the user
    console.log(`Checking user status for ${item.name}: planningToAttend = ${planning}, currentlyHere = ${currentlyHere}`);

    // If either `planningToAttend` or `currentlyHere` is undefined, show modal
    if (planning == undefined || currentlyHere == undefined) {
      setSelectedBar(item.name);
      setModalVisible(true);
     // setModalVisible(false);
    } else {
      // Once attendance is logged (both planning and currentlyHere are true), allow navigation to all bars
     // setModalVisible(false);
      const routes = [
        { name: "Kelly's Taproom", path: '/detail' },
        { name: "The Grog Grill", path: '/detailGrog' },
        { name: "McSorley's", path: '/detailMcSorleys' },
        { name: "Flip & Bailey's", path: '/detailFlips' }
      ];

      // Navigate to each bar path
      routes.forEach((route) => {
        router.push({
          pathname: route.path as "/detail" | "/detailGrog" | "/detailMcSoreleys" | "/detailFlips",
        });
      });
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const backgroundColor = (() => {
      switch (item.name) {
        case "Kelly's Taproom":
          return '#00BFFF'; // Blue
        case "The Grog Grill":
          return '#008000'; // Green
        case "McSorley's":
          return '#FF0000'; // Red
        case "Flip & Bailey's":
          return '#FFA500'; // Orange
        default:
          return 'white';
      }
    })();

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

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <Image source={require('@/assets/images/BarBuzz2.png')} style={styles.BBlogo} />
            <ThemedText style={styles.title}>Villanova University</ThemedText>
            <ThemedText style={styles.subtitle}>Villanova, PA</ThemedText>
          </ThemedView>
        }
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.key}
      />

      {/* Modal for "Log Data" message */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalText}>
              {selectedBar ? `Log your visit to ${selectedBar}` : "Log your visit"}
            </ThemedText>
            <Button title="Close" onPress={handleModalClose} />
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 8,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: 'gray',
    marginTop: 5,
  },
  BBlogo: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TabTwoScreen;
