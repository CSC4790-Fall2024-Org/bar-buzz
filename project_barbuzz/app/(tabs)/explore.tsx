import React, { useLayoutEffect, useState, useEffect } from 'react';
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
  { name: "The Grog Bar & Grill", key: "2" },
  { name: "McSoreley's Ale House", key: "3" },
  { name: "Flip & Bailey's", key: "4" },
];

const TabTwoScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [peopleCount, setPeopleCount] = useState<{ [key: string]: { planning: number; currentlyHere: number; total: number } }>({});

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  // Fetch the people counts from Firebase when the component mounts
  useEffect(() => {
    const fetchPeopleCount = () => {
      const trackingCollection = collection(db, 'tracking');
      
      DATA.forEach((item) => {
        // Query to get people planning to attend the bar
        const planningQuery = query(
          trackingCollection,
          where("location.title", "==", item.name),
          where("planningToAttend", "==", true)
        );

        // Query to get people currently at the bar
        const currentlyHereQuery = query(
          trackingCollection,
          where("location.title", "==", item.name),
          where("currentlyHere", "==", true)
        );

        // Subscribe to real-time updates for both queries
        const unsubscribePlanning = onSnapshot(planningQuery, (snapshot) => {
          const planningCount = snapshot.size;
          setPeopleCount((prev) => ({
            ...prev,
            [item.name]: {
              ...prev[item.name],
              planning: planningCount,
              total: (prev[item.name]?.currentlyHere || 0) + planningCount,  // Update total count
            },
          }));
        });

        const unsubscribeCurrentlyHere = onSnapshot(currentlyHereQuery, (snapshot) => {
          const currentlyHereCount = snapshot.size;
          setPeopleCount((prev) => ({
            ...prev,
            [item.name]: {
              ...prev[item.name],
              currentlyHere: currentlyHereCount,
              total: (prev[item.name]?.planning || 0) + currentlyHereCount,  // Update total count
            },
          }));
        });

        // Cleanup the subscriptions when the component unmounts
        return () => {
          unsubscribePlanning();
          unsubscribeCurrentlyHere();
        };
      });
    };

    fetchPeopleCount();
  }, []);

  const handlePress = (item: Item) => {
    let routePath = '';
    switch (item.name) {
      case "Kelly's Taproom":
        routePath = '/detail';
        break;
      case "The Grog Bar & Grill":
        routePath = '/detailGrog';
        break;
      case "McSoreley's Ale House":
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

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <ThemedText style={styles.item}>{item.name}</ThemedText>
        <ThemedText style={styles.peopleCount}>
          {peopleCount[item.name] ? `${peopleCount[item.name].total} people` : 'Loading...'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

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
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    fontSize: 22,
    backgroundColor: 'white',
    padding: 2,
  },
  peopleCount: {
    fontSize: 18,
    color: 'gray',
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
