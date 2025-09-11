// app/oauth/kakao.tsx
import { useEffect, useRef } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/src/stores/useAuthStore";

function toStr(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v ?? "";
}

export default function KakaoOAuthRedirect() {
  const router = useRouter();
  const { token, email, nickname, error } = useLocalSearchParams<{
    token?: string | string[];
    email?: string | string[];
    nickname?: string | string[];
    error?: string | string[];
  }>();

  // 중복 실행 방지 (ios strict mode 등)
  const ranRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (ranRef.current) return;
      ranRef.current = true;

      const t = toStr(token);
      const e = toStr(error);
      const em = toStr(email);
      const nn = toStr(nickname);

      // 1) 에러 케이스
      if (e) {
        Alert.alert("로그인 실패", e);
        router.replace("/login");
        return;
      }

      // 2) 토큰 필수
      if (!t) {
        Alert.alert("로그인 실패", "토큰이 없습니다.");
        router.replace("/login");
        return;
      }

      try {
        // ✅ 받아온 값 확인
        console.log("[Kakao OAuth] token:", t);
        console.log("[Kakao OAuth] email:", em);
        console.log("[Kakao OAuth] nickname:", nn);

        // 3) 토큰 저장 (Zustand + (선택) AsyncStorage 내부에서 처리됨)
        await useAuthStore
          .getState()
          .setAuth({ token: t, email: em, nickname: nn });
        console.log("✅ 저장된 토큰:", useAuthStore.getState().token);

        // 4) (선택) 서버에 me 동기화가 필요하면 여기서 호출
        // await client.post("/auth/sync", { ... });

        // 5) 성공 이동
        router.replace("/home");
      } catch (err: any) {
        console.warn("[Kakao OAuth] setAuth 실패:", err?.message || err);
        Alert.alert("로그인 실패", "세션 저장 중 문제가 발생했습니다.");
        router.replace("/login");
      }
    };

    run();
  }, [token, email, nickname, error, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
