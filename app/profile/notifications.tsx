import React from "react";
import { StyleSheet } from "react-native";

import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";
import UserRow from "@/src/components/UserRow";

const friends = [
  {
    id: 1,
    nickname: "맛있는 것만 공유해요",
    userId: "onlyDelicious",
    bio: "안녕하세요",
    isPending: true,
  },
  {
    id: 2,
    nickname: "멍멍멍멍멍멍멍멍멍멍멍멍멍멍멍",
    userId: "wowowowowow",
    bio: "나로 말할것 같으면~",
    isPending: false,
  },
  {
    id: 3,
    nickname: "맛있는 것만 공유해요",
    userId: "onlyDelicious",
    bio: "안녕하세요",
    isPending: true,
  },
  {
    id: 4,
    nickname: "맛있는 것만 공유해요",
    userId: "onlyDelicious",
    bio: "안녕하세요",
    isPending: false,
  },
  {
    id: 5,
    nickname: "맛있는 것만 공유해요",
    userId: "onlyDelicious",
    bio: "안녕하세요안녕하세요안녕하세요안녕하세요안녕하세요안녕",
    isPending: true,
  },

  // ...
];

export default function NotificationsScreen() {
  return (
    <ProfileLayout>
      {/* ----- 상단 헤더 (이 페이지 내부에서 직접 구성) ----- */}
      <ProfileHeader title="알림" showBack={true} />

      {/* ----- 알림 리스트 ----- */}
      {friends.map((u) => (
        <UserRow
          key={u.id}
          nickname={u.nickname}
          userId={u.userId}
          bio={u.bio}
          avatarUri={null}
          actionLabel={u.isPending ? "팔로우 수락" : "팔로우"}
          actionDisabled={!u.isPending}
          onPressAction={() => {
            // 팔로우 수락 / 언팔 등
          }}
        />
      ))}
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({});
