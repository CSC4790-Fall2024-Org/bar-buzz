import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {FlatList} from 'react-native';
import react,{useState} from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  
 const[people, setPeople] = useState([
   {name: "Ellie", key:"1"},
   {name: "Navi", key:"2"},
   {name: "Flips", key:"3"},
   {name: "D", key:"3"},
  ]);
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
    
    // <View style={StyleSheet.container}>
    //   <FlatList
    //     data={people}
    //     renderItem={({item})=>(
    //       <View>
    //         <Text style={styles.item}>{item.name}</Text>
    //         </View>
    //     )}
    //     />
    // </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex:1,
//     backgroundColor: 'white',
//     marginTop:20
//   },
//   item:{
//     fontSize:22,
//     backgroundColor: "yellow",
//     marginTop:30,
//     padding:20
//   }
// })