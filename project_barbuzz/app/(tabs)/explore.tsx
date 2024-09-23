import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView'; // Import your ParallaxScrollView component

// Define the type for your data items
interface Item {
  name: string;
  key: string;
}

// Your data array with defined types
const DATA: Item[] = [
  { name: "Kelly's Taproom", key: "1"},
  { name: "The Grog Bar & Grill", key: "2"},
  { name: "McSoreley's Ale House", key: "3"},
  { name: "Flip & Bailey's", key: "4"},
];

export default function TabTwoScreen() {
  // Specify the type of the item in the renderItem function
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <ThemedText style={styles.item}>{item.name}</ThemedText>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <Image
            source={require('@/assets/images/BBlogo.png')}
            style={styles.BBlogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.title}>Villanova University</ThemedText>
        </ThemedView>
        <ThemedText>Villanova, PA</ThemedText>

        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.key}
        />
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
  },
  item: {
    fontSize: 22,
    backgroundColor: "white",
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center', // Center the title
  },
  title: {
    fontSize: 25, // Change font size
    fontWeight: 'bold', // Make it bold
    color: 'black', 
  },
  BBlogo: {
    height: 250, 
    width: '104%', // Full width
  },
});






