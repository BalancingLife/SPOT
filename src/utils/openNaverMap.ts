import { Alert, Linking, Platform } from "react-native";

export async function openNaverMap(query: string) {
  const encodedQuery = encodeURIComponent(query);
  const naverMapUrl = `nmap://search?query=${encodedQuery}&appname=com.balancinglife.SPOT`;

  const storeUrl =
    Platform.OS === "ios"
      ? "itms-apps://itunes.apple.com/app/id311867728"
      : "market://details?id=com.nhn.android.nmap";

  try {
    const canOpen = await Linking.canOpenURL(naverMapUrl);

    if (canOpen) {
      await Linking.openURL(naverMapUrl);
      return;
    }

    await Linking.openURL(storeUrl);
  } catch {
    Alert.alert("오류", "네이버 지도를 열지 못했어요.");
  }
}
