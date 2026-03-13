import "react-native-reanimated";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, SplashScreen, useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState, NativeModules, Linking } from "react-native";
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

  // ✅ spot://analyze-result 같은 딥링크에서 "route"만 뽑아내기
  const getRouteFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      const path = (u.pathname ?? "").replace(/^\/+/, "");
      // ✅ spot://analyze-result 는 host에 들어오는 케이스가 많음
      return path || u.host || "";
    } catch {
      return url.replace("spot://", "").replace(/^\/+/, "");
    }
  };

  // ✅ analyze-result 트리거: AppGroup에서 결과 꺼내고 map으로 이동 (매핑/시트오픈은 다음 스텝)
  const handleAnalyzeTrigger = async () => {
    const { SharedStore } = NativeModules;

    const json = await SharedStore?.getLatestAnalyzeResult?.();
    if (!json) return;

    await SharedStore?.clearLatestAnalyzeResult?.();

    // 일단 map으로 이동만 (다음 스텝에서 json 파싱 + openWithPlaces 붙일거임)
    router.replace("/(tabs)/map");
  };

  // ✅ 딥링크 수신: 콜드 스타트 + 런타임 둘 다 처리
  useEffect(() => {
    let alive = true;

    const onUrl = async ({ url }: { url: string }) => {
      if (!alive) return;
      const route = getRouteFromUrl(url);
      if (route !== "analyze-result") return;

      await handleAnalyzeTrigger();
    };

    const sub = Linking.addEventListener("url", onUrl);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!alive || !initialUrl) return;

      const route = getRouteFromUrl(initialUrl);
      if (route !== "analyze-result") return;

      await handleAnalyzeTrigger();
    })();

    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  // ✅ fallback: 앱이 active 될 때도 한번 체크 (딥링크 이벤트 씹히는 케이스 대비)
  useEffect(() => {
    const { SharedStore } = NativeModules;

    const sub = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      const json = await SharedStore?.getLatestAnalyzeResult?.();
      if (!json) return;

      await SharedStore?.clearLatestAnalyzeResult?.();

      router.replace("/(tabs)/map");
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
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
