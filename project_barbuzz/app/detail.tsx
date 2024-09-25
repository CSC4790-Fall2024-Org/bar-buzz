import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';

const DetailScreen: React.FC = () => {
  // Use useLocalSearchParams to get the parameters
  const { barName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>People at {barName}</ThemedText>
      <ThemedText style={styles.text}>Ellie McLaughlin</ThemedText>
      <ThemedText style={styles.text}>Navi Singh</ThemedText>
      <ThemedText style={styles.text}>Christina Alskewycz</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'center',
    backgroundColor: 'white', // or your themed background color
  },
  text: {
    fontSize: 24,
    margin: 10,
  },
});

export default DetailScreen;
