import React, { useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useNavigation } from 'expo-router'; // Use router hook

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

const PEOPLE_COUNT = {
  "1": 25,
  "2": 40,
  "3": 15,
  "4": 60,
};

const TabTwoScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Bars' });
  }, [navigation]);

  const handlePress = (item: Item) => {
    // Declare routePath as an empty string
    let routePath: string = ''; // Cast as string type
  
    // Set routePath based on the item name
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
        return; // Exit function if no matching route is found
    }
  
    // Push to the router using the selected routePath and barName
    router.push({
      pathname: routePath as "/detail" | "/detailGrog" | "/detailMcSoreleys" | "/detailFlips", // Explicitly specify the type
      params: { barName: item.name },
    });
  };
  

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <ThemedText style={styles.item}>{item.name}</ThemedText>
        <ThemedText style={styles.peopleCount}>
          {PEOPLE_COUNT[item.key as keyof typeof PEOPLE_COUNT]} people
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/BarBuzz2.png')}
              style={styles.BBlogo}
            />
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



