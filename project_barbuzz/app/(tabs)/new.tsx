import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const name = "Your Name";       // Replace with your name
  const school = "Villanova University";   // Replace with your school
  const monthlyRecap = ""; // Replace with your recap

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Person Logo */}
        <Image 
          source={require('@/assets/images/usericon.png')}  // Replace with your logo image path
          style={styles.logo}
        />
        {/* Name and School */}
        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={styles.name}>{name}</ThemedText>
          <ThemedText type="subtitle" style={styles.school}>{school}</ThemedText>
        </View>
      </View>
      {/* Monthly Recap */}
      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.recapTitle}>Monthly Recap</ThemedText>
        <ThemedText style={styles.recapText}>{monthlyRecap}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Set background color to white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '33%', // Takes up top third of screen
    padding: 16,
  },
  logo: {
    width: 150, // Increased size for the logo
    height: 150, // Increased size for the logo
  },
  headerTextContainer: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16, // Optional padding to add some space on the right
  },
  name: {
    fontSize: 70, 
    fontWeight: 'bold',
  },
  school: {
    fontSize: 40,
    color: '#0033A0', // Blue color for "Villanova University"
    marginTop: 10, // Added margin to push the school name down
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align items at the top of the container
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30, // Reduced padding to move "Monthly Recap" higher up
  },
  recapTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recapText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
