import "./global.css";
import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, } from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import AppNavigator from "@/app/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/theme/tokens";
// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();
export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
        "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
        "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
        "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
        "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
    });
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);
    if (!fontsLoaded && !fontError) {
        return (<View style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.page,
            }}>
        <ActivityIndicator size="large" color={Colors.primary}/>
      </View>);
    }
    return (<Provider store={store}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="dark"/>
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </Provider>);
}
