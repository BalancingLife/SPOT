import { useEffect, useRef } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useAuthStore } from "@/src/stores/useAuthStore";

function toStr(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v ?? "";
}

function resolveReturnTo(value: string): Href {
  switch (value) {
    case "/":
      return "/";
    case "/home":
      return "/home";
    case "/map":
      return "/map";
    case "/profile":
      return "/profile";
    default:
      return "/";
  }
}

export default function KakaoOAuthRedirect() {
  const router = useRouter();
  const { token, email, nickname, error, returnTo } = useLocalSearchParams<{
    token?: string | string[];
    email?: string | string[];
    nickname?: string | string[];
    error?: string | string[];
    returnTo?: string | string[];
  }>();

  const ranRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (ranRef.current) return;
      ranRef.current = true;

      const t = toStr(token);
      const e = toStr(error);
      const em = toStr(email);
      const nn = toStr(nickname);
      const next = resolveReturnTo(toStr(returnTo));

      if (e) {
        Alert.alert("로그인 실패", e);
        router.replace("/login");
        return;
      }

      if (!t) {
        Alert.alert("로그인 실패", "토큰이 없습니다.");
        router.replace("/login");
        return;
      }

      try {
        await useAuthStore.getState().setAuth({
          token: t,
          email: em,
          nickname: nn,
        });

        router.replace(next);
      } catch (err: any) {
        console.warn("[Kakao OAuth] setAuth 실패:", err?.message || err);
        Alert.alert("로그인 실패", "세션 저장 중 문제가 발생했습니다.");
        router.replace("/login");
      }
    };

    run();
  }, [token, email, nickname, error, returnTo, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
