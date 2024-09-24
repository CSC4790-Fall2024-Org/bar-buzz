import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';  // Use router hook

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

  const handlePress = (item: Item) => {
    router.push({
      pathname: '/detail',
      params: { barName: item.name },  // Pass the barName as a param
    });
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
      <ThemedText style={styles.item}>{item.name}</ThemedText>
    </TouchableOpacity>
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
        {/* Sticky Header */}
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.key}
          // Add the sticky header to keep the title visible when scrolling
          stickyHeaderIndices={[0]}  // Index 0 is the header (Villanova title)
          ListHeaderComponent={
            <ThemedView style={styles.titleContainer}>
              <ThemedText style={styles.title}>Villanova University</ThemedText>
              <ThemedText style={styles.subtitle}>Villanova, PA</ThemedText>
            </ThemedView>
          }
        />
      </ParallaxScrollView>
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
  item: {
    fontSize: 22,
    backgroundColor: 'white',
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',  // Ensure background is white so it stands out
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
  },
  BBlogo: {
    height: 250,
    width: '104%',
  },
});

export default TabTwoScreen;









