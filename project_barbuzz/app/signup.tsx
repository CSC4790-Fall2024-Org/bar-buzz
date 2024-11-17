import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const SplashScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Redirect to the login screen after 2 seconds
      router.replace("/(tabs)"); // Replace with your login screen route
    }, 2000);

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={require("@/assets/images/BarBuzz2.png")} // Replace with your logo's path
        style={styles.logo}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Set the background to white
  },
  logo: {
    width: 350, // Adjust the size of your logo
    height: 350,
  },
});

export default SplashScreen;
