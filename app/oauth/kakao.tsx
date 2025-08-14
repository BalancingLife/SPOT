// app/oauth/kakao.tsx
import { useEffect } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";

/**
 * spot://oauth/kakao?token=...      ✅
 * spot:///oauth/kakao?token=...     ✅  (호스트 없음 + 경로가 /oauth/kakao)
 */
export default function KakaoOAuthRedirect() {
  const router = useRouter();
  const { token, email, nickname, error } = useLocalSearchParams<{
    token?: string;
    email?: string;
    nickname?: string;
    error?: string;
  }>();

  useEffect(() => {
    const run = async () => {
      // 1) 에러 케이스
      if (error) {
        Alert.alert("로그인 실패", String(error));
        router.replace("/login");
        return;
      }

      // 2) 토큰 필수
      if (!token) {
        Alert.alert("로그인 실패", "토큰이 없습니다.");
        router.replace("/login");
        return;
      }

      // ✅ 받아온 토큰 콘솔 출력
      console.log("[Kakao OAuth] token:", token);
      console.log("[Kakao OAuth] email:", email);
      console.log("[Kakao OAuth] nickname:", nickname);

      // 3) 토큰 저장/후처리 (원하면 SecureStore 사용)
      // await SecureStore.setItemAsync("accessToken", String(token));
      // const meRes = await fetch("https://api.example.com/me", { headers: { Authorization: `Bearer ${token}` }});
      // const me = await meRes.json();

      // 4) 성공 이동
      router.replace("/home");
    };
    run();
  }, [token, email, nickname, error, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
