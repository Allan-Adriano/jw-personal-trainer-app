import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat/400Regular";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { AndadaPro_400Regular } from "@expo-google-fonts/andada-pro/400Regular";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  const [screen, setScreen] = useState<"login" | "home">("login");
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Montserrat_400Regular,
    Inter_400Regular,
    AndadaPro_400Regular,
  });

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (screen !== "home") return false;
        setScreen("login");
        return true;
      },
    );
    return () => subscription.remove();
  }, [screen]);

  return (
    <SafeAreaProvider>
      <StatusBar style={screen === "login" ? "light" : "dark"} />
      <View style={styles.canvas}>
        {!fontsLoaded && !fontError ? (
          <ActivityIndicator
            accessibilityLabel="Carregando aplicativo"
            style={styles.loading}
          />
        ) : fontError ? (
          <Text style={styles.loading}>
            Não foi possível carregar as fontes. Abra o aplicativo novamente.
          </Text>
        ) : screen === "login" ? (
          <LoginScreen onEnterDemo={() => setScreen("home")} />
        ) : (
          <HomeScreen onSignOut={() => setScreen("login")} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
  },
  loading: { flex: 1, textAlign: "center", paddingTop: 80 },
});
