import "react-native-reanimated";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, SplashScreen, useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState, NativeModules } from "react-native";
import { useAuthStore } from "@/src/stores/useAuthStore";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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

  // ✅ Share Extension 결과 수신 (앱이 다시 active 될 때)
  useEffect(() => {
    const { SharedStore } = NativeModules;

    const sub = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      const json = await SharedStore?.getLatestAnalyzeResult?.();
      if (!json) return;

      await SharedStore?.clearLatestAnalyzeResult?.();

      console.log("[share] analyze result:", json);

      // TODO: 원하는 화면으로 이동
      // router.push({ pathname: "/shareResult", params: { json } });
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 탭 그룹은 그대로 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />

          <Stack.Screen
            name="profile/notifications"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/friends"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/blocked"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/setting"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/accountSetting"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{ headerShown: false, presentation: "card" }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
