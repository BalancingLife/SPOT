import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type Props = {
  nickname: string;
  userid: string;
  bio: string;
  friendCount: number;
  friendAvatars: string[];
  profileImage: string;
};

export default function UserCard({
  nickname,
  userid,
  bio,
  friendCount,
  friendAvatars,
  profileImage,
}: Props) {
  const profileImg = require("@/assets/images/profile-icon-gray.png");

  return (
    <View style={styles.container}>
      {/* 왼쪽 텍스트 영역 */}
      <View style={styles.left}>
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.userid}>@{userid}</Text>
        <Text style={styles.bio}>{bio}</Text>

        {/* 친구 아바타 + 숫자 */}
        <View style={styles.friendRow}>
          <View style={styles.avatarGroup}>
            {friendAvatars.map((uri, i) => (
              <Image
                key={i}
                source={profileImg}
                style={[styles.avatar, { marginLeft: i === 0 ? 0 : -6 }]}
              />
            ))}
          </View>

          <Text style={styles.friendCount}>친구 {friendCount}명</Text>
        </View>
      </View>

      {/* 오른쪽 프로필 이미지 */}
      <View style={styles.right}>
        <Image source={profileImg} style={styles.profileImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },

  left: {
    flex: 1,
  },

  nickname: {
    ...TextStyles.Bold16,
    color: Colors.gray_800,
  },

  userid: {
    ...TextStyles.Regular10,
    color: Colors.gray_400,
    marginBottom: 8,
  },

  bio: {
    ...TextStyles.Regular14,
    color: Colors.gray_800,
    marginBottom: 14,
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarGroup: {
    flexDirection: "row",
    marginRight: 6,
  },

  avatar: {
    width: 18,
    height: 18,
    borderRadius: 100,
    borderWidth: 0.74,
    borderColor: "#FFFFFF",
    backgroundColor: "lightgray",
  },

  friendCount: {
    ...TextStyles.Regular12,
    color: Colors.gray_600,
  },

  right: {},
  profileImage: {
    backgroundColor: "lightgray",
    width: 77,
    height: 77,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.gray_100,
  },
});
