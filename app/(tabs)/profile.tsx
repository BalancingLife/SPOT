// app/(tabs)/profile.tsx
import { View, Pressable, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import ProfileLayout from "@/src/components/profile/Layout";
import ProfileUserCard from "@/src/components/UserCard";
import SpotButton from "@/src/components/SpotButton";

export default function ProfileScreen() {
  const profileImg = require("@/assets/images/profile-example.png");
  const fallbackFriendImg = require("@/assets/images/profile-icon-gray.png");
  return (
    <ProfileLayout>
      {/* 헤더 - 로고, 우측 아이콘 두개 */}
      <View style={styles.header}>
        <View style={styles.left}>
          <Image
            style={{ width: 64, height: 30 }}
            source={require("@/assets/images/SPOT.png")}
          />
        </View>
        <View style={styles.right}>
          {/* 알림 */}
          <Pressable onPress={() => router.push("/profile/notifications")}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/bell-icon.png")}
            />
          </Pressable>

          {/* 설정 */}
          <Pressable onPress={() => router.push("/profile/setting")}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/settings-icon.png")}
            />
          </Pressable>
        </View>
      </View>

      {/* 프로필 유저 카드 */}
      <ProfileUserCard
        variant="profile"
        nickname="맛있는 건 참을 수 없어"
        userid="othernickname"
        bio="진짜 맛있는 집들만 핀해놓을거야"
        friendCount={36}
        friendAvatars={[
          fallbackFriendImg,
          fallbackFriendImg,
          fallbackFriendImg,
        ]}
        profileImage={profileImg}
      />

      {/* 프로필 수정, 친구 관리 버튼 */}
      <View style={styles.twoButtonsContainer}>
        <SpotButton
          onPress={() => router.push("/profile/edit")}
          label="프로필 수정"
          variant="primary"
          size="medium"
          style={{ flex: 1 }}
        />

        <SpotButton
          onPress={() => router.push("/profile/friends")}
          label="친구 관리"
          variant="secondary"
          size="medium"
          style={{ flex: 1 }}
        />
      </View>

      {/* 광고 */}
      <View style={styles.advertise}>
        <Image
          style={{ width: "100%", height: 72 }}
          source={require("@/assets/images/profile-ad.png")}
        />
      </View>

      {/* 차단 목록 */}
      {/* <Pressable onPress={() => router.push("/profile/blocked")}>
        <Text>차단 목록</Text>
      </Pressable> */}
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 40,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 26,
  },
  left: {},
  right: {
    gap: 14,
    flexDirection: "row",
  },

  twoButtonsContainer: {
    marginTop: 20,
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  advertise: { alignItems: "center" },
});
