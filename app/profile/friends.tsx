import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";
import UserRow from "@/src/components/common/UserRow";

import { useFriendsStore } from "@/src/stores/useFriendsStore";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export default function FriendsScreen() {
  const friends = useFriendsStore((s) => s.friends);
  const loading = useFriendsStore((s) => s.loading);
  const error = useFriendsStore((s) => s.error);
  const loadFriends = useFriendsStore((s) => s.loadFriends);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return (
    <ProfileLayout>
      <ProfileHeader title="친구 목록" showBack />

      {loading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={Colors.gray_500} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      )}

      {!loading && !error && friends.length === 0 && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>친구가 없습니다.</Text>
        </View>
      )}

      {!loading &&
        !error &&
        friends.map((u) => (
          <UserRow
            key={u.id}
            nickname={u.nickname}
            userId={u.userId}
            bio={u.comment ?? ""}
            avatarUri={u.avatarUrl ?? null}
            actionLabel="팔로잉"
            actionDisabled
            onPressAction={() => {}}
            onPressRow={() => {
              // 나중에 프로필 상세 이동 붙이면 됨
            }}
          />
        ))}
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    ...TextStyles.Regular14,
    color: Colors.gray_500,
  },
});
