import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useNavigation } from 'expo-router';
import { db } from '../../firebase'; // Adjust the path if necessary
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
  const countsRef = useRef<{ [key: string]: { planning: number; currentlyHere: number } }>({});

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  useEffect(() => {
    const fetchPeopleCount = () => {
      const trackingCollection = collection(db, 'tracking');
      
      DATA.forEach((item) => {
        const barName = item.name;
        countsRef.current[barName] = { planning: 0, currentlyHere: 0 };

        // Query for people planning to attend
        const planningQuery = query(
          trackingCollection,
          where("location.title", "==", barName),
          where("planningToAttend", "==", true)
        );

        // Query for people currently here
        const currentlyHereQuery = query(
          trackingCollection,
          where("location.title", "==", barName),
          where("currentlyHere", "==", true)
        );

        // Subscribe to real-time updates for the planning query
        const unsubscribePlanning = onSnapshot(planningQuery, (snapshot) => {
          const planningCount = snapshot.size;
          countsRef.current[barName].planning = planningCount;
          updatePeopleCount(barName);
        });

        // Subscribe to real-time updates for the currentlyHere query
        const unsubscribeCurrentlyHere = onSnapshot(currentlyHereQuery, (snapshot) => {
          const currentlyHereCount = snapshot.size;
          countsRef.current[barName].currentlyHere = currentlyHereCount;
          updatePeopleCount(barName);
        });

        // Cleanup the subscriptions when the component unmounts
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
          total: planning + currentlyHere,  // Calculate total from both counts
        },
      }));
    };

    fetchPeopleCount();
  }, []);

  const handlePress = (item: Item) => {
    let routePath = '';
    switch (item.name) {
      case "Kelly's Taproom":
        routePath = '/detail';
        break;
      case "The Grog Grill":
        routePath = '/detailGrog';
        break;
      case "McSorley's":
        routePath = '/detailMcSoreleys';
        break;
      case "Flip & Bailey's":
        routePath = '/detailFlips';
        break;
      default:
        console.warn(`No page found for ${item.name}`);
        return;
    }

    router.push({
      pathname: routePath as "/detail" | "/detailGrog" | "/detailMcSoreleys" | "/detailFlips",
      params: { barName: item.name },
    });
  };

  const renderItem = ({ item }: { item: Item }) => {
    // Set background color based on bar name
    const backgroundColor = (() => {
      switch (item.name) {
        case "Kelly's Taproom":
          return '#00BFFF'; // Blue
        case "The Grog Grill":
          return '#008000'; // Purple
        case "McSorley's":
          return '#FF0000'; // Red
        case "Flip & Bailey's":
          return '#ffa500'; // Orange
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
});

export default TabTwoScreen;
