//original details page
import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native'; // Import ScrollView
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useNavigation } from 'expo-router';

const DetailScreen: React.FC = () => {
  const { barName } = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (barName) {
      navigation.setOptions({ title: `People at ${barName}` });
    }
  }, [barName, navigation]);

  return (
    <View style={styles.container}>
      {/* Optional custom back button */}
      {/* <Button title="Back to Explore" onPress={() => navigation.goBack()} /> */}

      {/* Scrollable list of people */}
      <ScrollView contentContainerStyle={styles.peopleListContainer}>
        <ThemedText style={styles.nameText}>Ellie McLaughlin</ThemedText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  peopleListContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  nameText: {
    fontSize: 20,
    marginVertical: 10,
    color: '#333',
  },
});

export default DetailScreen;




