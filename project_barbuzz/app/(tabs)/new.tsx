import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const name = "Your Name";       // Replace with your name
  const school = "Villanova University";   // Replace with your school
  const monthlyRecap = "You went to the Grog 7 times this month!"; // Replace with your recap

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Person Logo */}
        <Image 
          source={require('@/assets/images/usericon.png')}  
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
      {/* Grog Superstar Text */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>You are a Grog superstar!</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', //white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '33%', 
    padding: 16,
  },
  logo: {
    width: 150, 
    height: 150, 
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end', // Right-align text
  },
  name: {
    fontSize: 70, 
    fontWeight: 'bold',
  },
  school: {
    fontSize: 35,
    color: '#0033A0', // Blue color 
    marginTop: 10, 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30, 
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
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0033A0', // Blue color 
  },
});
