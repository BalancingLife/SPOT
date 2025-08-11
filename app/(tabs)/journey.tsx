import * as WebBrowser from "expo-web-browser";
import { Button, View } from "react-native";

// 환경변수 (app.config.js / .env에 설정)
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY!;
const KAKAO_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI!;

const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(
  KAKAO_REDIRECT_URI
)}`;

export default function KakaoLogin() {
  return (
    <View style={{ marginTop: 100 }}>
      <Button
        title="카카오 로그인"
        onPress={() => WebBrowser.openBrowserAsync(authUrl)}
      />
    </View>
  );
}
