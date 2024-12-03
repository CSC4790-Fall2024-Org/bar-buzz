import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const SplashScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)"); // Replace with your login screen route
    }, 2000);

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/BarBuzz2.png")}
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
    backgroundColor: "white",
  },
  logo: {
    width: 350,
    height: 350,
  },
});

export default SplashScreen;
