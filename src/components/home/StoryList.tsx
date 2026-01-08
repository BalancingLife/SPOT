// src/components/home/StoryList.tsx
import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type FriendStory = {
  id: string | number;
  nickname: string;
  avatarUrl?: string | null;
};

type Props = {
  myNickname: string;
  myAvatarSource?: ImageSourcePropType; // ✅ require()도 OK
  friends: FriendStory[];
};

const friendsIcon = require("@/assets/images/friends-icon-black-filled.png");

export default function StoryList({
  myNickname,
  myAvatarSource,
  friends,
}: Props) {
  const items = useMemo(() => {
    return [
      {
        key: "friends",
        label: "친구",
        source: friendsIcon as ImageSourcePropType,
        kind: "friendsIcon",
      },
      { key: "me", label: myNickname, source: myAvatarSource ?? null },
      ...friends.map((f) => ({
        key: `friend-${f.id}`,
        label: f.nickname,
        source: f.avatarUrl
          ? ({ uri: f.avatarUrl } as ImageSourcePropType)
          : null,
      })),
    ];
  }, [myNickname, myAvatarSource, friends]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storyScroll}
      contentContainerStyle={styles.storyContent}
    >
      {items.map((item) => (
        <View key={item.key} style={styles.storyItem}>
          <View style={styles.storyAvatar}>
            {item.source ? (
              <Image
                source={item.source}
                style={
                  item.kind === "friendsIcon"
                    ? styles.friendsIconImage
                    : styles.avatarImage
                }
              />
            ) : null}
          </View>
          <Text style={styles.storyLabel}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ✅ index에 있던 style 그대로 복붙
const styles = StyleSheet.create({
  storyScroll: { marginTop: 20 },
  storyContent: { paddingRight: 16 },
  storyItem: { alignItems: "center", marginRight: 20 },
  storyAvatar: {
    width: 65,
    height: 65,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    backgroundColor: Colors.white,
    marginBottom: 6,
    overflow: "hidden", // ✅ 이미지가 원형 안에 딱 들어가게

    justifyContent: "center",
    alignItems: "center",
  },

  friendsIconImage: {
    width: 40,
    height: 40,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  storyLabel: { ...TextStyles.Regular12 },
});
