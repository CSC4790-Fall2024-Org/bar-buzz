// import React from 'react';
// import { StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { FlatList } from 'react-native-gesture-handler';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { useRouter } from 'expo-router';  // Use router hook

// interface Item {
//   name: string;
//   key: string;
// }

// const DATA: Item[] = [
//   { name: "Kelly's Taproom", key: "1" },
//   { name: "The Grog Bar & Grill", key: "2" },
//   { name: "McSoreley's Ale House", key: "3" },
//   { name: "Flip & Bailey's", key: "4" },
// ];

// const TabTwoScreen: React.FC = () => {
//   const router = useRouter();

//   const handlePress = (item: Item) => {
//     router.push({
//       pathname: '/detail',
//       params: { barName: item.name },  // Pass the barName as a param
//     });
//   };

//   const renderItem = ({ item }: { item: Item }) => (
//     <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
//       <ThemedText style={styles.item}>{item.name}</ThemedText>
//     </TouchableOpacity>
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <FlatList
//         ListHeaderComponent={
//           <ThemedView style={styles.headerContainer}>
//             <Image
//               source={require('@/assets/images/BBlogo.png')}
//               style={styles.BBlogo}
//             />
//             <ThemedText style={styles.title}>Villanova University</ThemedText>
//             <ThemedText style={styles.subtitle}>Villanova, PA</ThemedText>
//           </ThemedView>
//         }
//         data={DATA}
//         renderItem={renderItem}
//         keyExtractor={item => item.key}
//       />
//     </GestureHandlerRootView>
//   );
// };

// const styles = StyleSheet.create({
//   itemContainer: {
//     backgroundColor: 'white',
//     marginTop: 20,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'black',
//     borderRadius: 8,
//   },
//   item: {
//     fontSize: 22,
//     backgroundColor: 'white',
//     padding: 2,
//   },
//   headerContainer: {
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   subtitle: {
//     fontSize: 21,
//     color: 'gray',
//   },
//   BBlogo: {
//     height: 250,
//     width: '104%',
//   },
// });

// export default TabTwoScreen;

import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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

const PEOPLE_COUNT = {
  "1": 25,
  "2": 40,
  "3": 15,
  "4": 60,
};

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
      <View style={styles.itemContent}>
        <ThemedText style={styles.item}>{item.name}</ThemedText>
        <ThemedText style={styles.peopleCount}>{PEOPLE_COUNT[item.key as keyof typeof PEOPLE_COUNT]} people</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/BBlogo.png')}
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
    justifyContent: 'space-between', // Aligns text and number on opposite sides
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 21,
    color: 'gray',
  },
  BBlogo: {
    height: 250,
    width: '104%',
  },
});

export default TabTwoScreen;









