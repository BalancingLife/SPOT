import "react-native-reanimated";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PretendardRegular: require("@/assets/fonts/Pretendard-Regular.ttf"),
    PretendardMedium: require("@/assets/fonts/Pretendard-Medium.ttf"),
    PretendardBold: require("@/assets/fonts/Pretendard-Bold.ttf"),
    PretendardSemiBold: require("@/assets/fonts/Pretendard-SemiBold.ttf"),
    PretendardLight: require("@/assets/fonts/Pretendard-Light.ttf"),
    PretendardExtraBold: require("@/assets/fonts/Pretendard-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 탭 그룹은 그대로 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="search"
          options={{
            headerShown: false,
            animation: "none", // 전환 아예 없애고 싶으면 이걸로
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
