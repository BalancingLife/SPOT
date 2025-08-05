import React, { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import { Button, View } from "react-native";
import SaveFailedModal from "@/src/components/SaveFailedModal";

// 카카오 OAuth 엔드포인트
const kakaoAuthEndpoint = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_REST_API_KEY = "3a29040d229e76dade6b626bbdae933f";
const REDIRECT_URI =
  "https://ab4ac692bd1d.ngrok-free.app/api/auth/kakao/callback"; //  리디렉트 URI

export default function KakaoOAuthLogin() {
  const discovery = {
    authorizationEndpoint: kakaoAuthEndpoint,
  };
  const [showModal, setShowModal] = useState(true);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("🔐 인가 코드:", code);
      // 👉 여기서 백엔드로 code 보내기
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
