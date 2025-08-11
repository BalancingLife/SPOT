import React, { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import { Button, View } from "react-native";
import SaveFailedModal from "@/src/components/SaveFailedModal";

// 환경변수 (app.config.js / .env에 설정)
const KAKAO_AUTH_ENDPOINT = process.env.EXPO_PUBLIC_KAKAO_AUTH_ENDPOINT!;
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY!;
const KAKAO_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI!;

export default function KakaoOAuthLogin() {
  const discovery = {
    authorizationEndpoint: KAKAO_AUTH_ENDPOINT,
  };
  const [showModal, setShowModal] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      redirectUri: KAKAO_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params as { code?: string };
      console.log("🔐 인가 코드:", code);
    }
  }, [response]);

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="카카오 로그인" onPress={() => promptAsync()} />
      <SaveFailedModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}
