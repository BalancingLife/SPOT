// app/(tabs)/profile.tsx
import { Text, Pressable } from "react-native";
import { router } from "expo-router";
import Layout from "@/src/components/profile/Layout";

export default function ProfileTabScreen() {
  return (
    <Layout>
      {/* 알림 전체 보기 */}
      <Pressable onPress={() => router.push("/profile/notifications")}>
        <Text>알림</Text>
      </Pressable>

      {/* 친구 관리 */}
      <Pressable onPress={() => router.push("/profile/friends")}>
        <Text>친구 관리</Text>
      </Pressable>

      {/* 차단 목록 */}
      <Pressable onPress={() => router.push("/profile/blocked")}>
        <Text>차단 목록</Text>
      </Pressable>

      {/* 설정 */}
      <Pressable onPress={() => router.push("/profile/setting")}>
        <Text>설정</Text>
      </Pressable>

      {/* 프로필 수정 */}
      <Pressable onPress={() => router.push("/profile/edit")}>
        <Text>프로필 수정</Text>
      </Pressable>
    </Layout>
  );
}
