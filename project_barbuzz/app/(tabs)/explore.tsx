import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigate } from 'react-router-dom';
import { FlatList } from 'react-native-gesture-handler';


export default function TabTwoScreen() {
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.container}>
      <Collapsible title={item.title}>
        {item.content}
      </Collapsible>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/BBlogo.png')}
          style={styles.BBlogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Villanova University</ThemedText>
      </ThemedView>
      <ThemedText>Villanova, PA</ThemedText>
      
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  BBlogo: {
    height: 250,
    width: 400,
    bottom: 0,
    left: 5,
    position: 'absolute',
  },
  container: {
    backgroundColor: '#f0f0f0', // Light background for the container
    marginVertical: 8, // Space between containers
    borderRadius: 8, // Rounded corners
    overflow: 'hidden', // Ensures children respect the border radius
    elevation: 2, // Adds shadow on Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});



// import Ionicons from '@expo/vector-icons/Ionicons';
// import { StyleSheet, Image, View, useColorScheme } from 'react-native';

// import { Collapsible } from '@/components/Collapsible';
// import { ExternalLink } from '@/components/ExternalLink';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { useNavigate } from 'react-router-dom';
// import { FlatList } from 'react-native-gesture-handler';


// export default function TabTwoScreen() {

  
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/BBlogo.png')}
//           style={styles.BBlogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Villanova University</ThemedText>
//       </ThemedView>
//       <ThemedText>Villanova, PA</ThemedText>
      
//       <Collapsible title="Kelly's Taproom">
//         <ThemedText>
//           This app has two screens:{' '}
//           <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
//           <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
//         </ThemedText>
//         <ThemedText>
//           The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
//           sets up the tab navigator.
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/router/introduction">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
      
//       <Collapsible title="The Grog Bar & Grill">
//         <ThemedText>
//           You can open this project on Android, iOS, and the web. To open the web version, press{' '}
//           <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
//         </ThemedText>
//       </Collapsible>
//       <Collapsible title="McSoreley's Ale House">
//         <ThemedText>
//           For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
//           <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
//           different screen densities
//         </ThemedText>
//         <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
//         <ExternalLink href="https://reactnative.dev/docs/images">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Flip & Bailey's">
//         <ThemedText>
//           Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
//           <ThemedText style={{ fontFamily: 'SpaceMono' }}>
//             custom fonts such as this one.
//           </ThemedText>
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//     </ParallaxScrollView>
//   );
// }


// const styles = StyleSheet.create({
//   headerImage: {
//     color: '#808080',
//     bottom: -90,
//     left: -35,
//     position: 'absolute',
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   BBlogo: {
//     height: 250,
//     width: 400,
//     bottom: 0,
//     left: 5,
//     position: 'absolute',
//   },
// });