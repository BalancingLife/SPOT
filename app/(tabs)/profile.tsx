import { useCallback, useState } from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import ProfileLayout from "@/src/components/profile/Layout";
import ProfileUserCard from "@/src/components/UserCard";
import SpotButton from "@/src/components/SpotButton";

import { getMyProfile, type MyProfile } from "@/src/lib/api/profile";

export default function ProfileScreen() {
  const defaultProfileImg = require("@/assets/images/profile-example.png");
  const fallbackFriendImg = require("@/assets/images/profile-icon-gray.png");

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [recentFriendPhotos, setRecentFriendPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      if (!data) {
        setProfile(null);
        setFriendCount(0);
        setRecentFriendPhotos([]);
        return;
      }

      setProfile(data.profile);
      setFriendCount(data.friendCount);
      setRecentFriendPhotos(data.recentFriendPhotos);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  // ✅ UI 매핑 (camelCase만)
  const nickname = profile?.nickname ?? "닉네임 없음";
  const userid = profile?.spotId ?? "-"; // 보통 spot_id를 아이디처럼 표시
  const bio = profile?.oneLine ?? "한 줄 소개를 추가해보세요";

  const profileImageSource =
    profile?.photo && profile.photo.length > 0
      ? { uri: profile.photo }
      : defaultProfileImg;

  // ✅ recentFriendPhotos(원격 URL) -> ImageSource로 매핑
  const friendAvatars =
    recentFriendPhotos.length > 0
      ? recentFriendPhotos
          .slice(0, 3)
          .map((url) => (url ? { uri: url } : fallbackFriendImg))
      : [fallbackFriendImg, fallbackFriendImg, fallbackFriendImg];

  return (
    <ProfileLayout>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.left}>
          <Image
            style={{ width: 64, height: 30 }}
            source={require("@/assets/images/SPOT.png")}
          />
        </View>
        <View style={styles.right}>
          <Pressable onPress={() => router.push("/profile/notifications")}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/bell-icon.png")}
            />
          </Pressable>

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
        nickname={loading ? "불러오는 중..." : nickname}
        userid={loading ? "" : userid}
        bio={loading ? "" : bio}
        friendCount={loading ? 0 : friendCount}
        friendAvatars={friendAvatars}
        profileImage={profileImageSource}
      />

      {/* 버튼 */}
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
