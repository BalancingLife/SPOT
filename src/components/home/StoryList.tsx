// src/components/home/StoryList.tsx
import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type FriendStory = {
  id: string | number;
  nickname: string;
  avatarUrl?: string | null;
};

type SelectedUser = {
  nickname: string;
  userid: string;
  bio: string;
  profileImage: ImageSourcePropType;
};

type Props = {
  myNickname: string;
  myAvatarSource?: ImageSourcePropType;
  friends: FriendStory[];
  onPressItem: (user: SelectedUser) => void;
  onPressFriends: () => void;
};

const friendsIcon = require("@/assets/images/friends-icon-black-filled.png");
const fallbackProfile = require("@/assets/images/profile-example.png");
const fallbackFriend = require("@/assets/images/profile-icon-gray.png");

// ✅ 아이템 타입을 “명확히” 분리 (payload 있는 것 / 없는 것)
type FriendsItem = {
  key: "friends";
  label: "친구";
  source: ImageSourcePropType;
  kind: "friends";
};

type UserItem = {
  key: string;
  label: string;
  source: ImageSourcePropType | null;
  kind: "user";
  payload: SelectedUser;
};

type StoryItem = FriendsItem | UserItem;

// ✅ 타입가드
function isUserItem(item: StoryItem): item is UserItem {
  return item.kind === "user";
}

export default function StoryList({
  myNickname,
  myAvatarSource,
  friends,
  onPressItem,
  onPressFriends,
}: Props) {
  const items = useMemo<StoryItem[]>(() => {
    return [
      {
        key: "friends",
        label: "친구",
        source: friendsIcon as ImageSourcePropType,
        kind: "friends",
      },
      {
        key: "me",
        label: myNickname,
        source: myAvatarSource ?? null,
        kind: "user",
        payload: {
          nickname: myNickname,
          userid: "example@naver.com",
          bio: "내 소개글",
          profileImage: (myAvatarSource ??
            fallbackProfile) as ImageSourcePropType,
        },
      },
      ...friends.map<StoryItem>((f) => {
        const img: ImageSourcePropType = f.avatarUrl
          ? ({ uri: f.avatarUrl } as ImageSourcePropType)
          : (fallbackFriend as ImageSourcePropType);

        return {
          key: `friend-${f.id}`,
          label: f.nickname,
          source: img,
          kind: "user",
          payload: {
            nickname: f.nickname,
            userid: `friend-${f.id}`,
            bio: "",
            profileImage: img,
          },
        };
      }),
    ];
  }, [myNickname, myAvatarSource, friends]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storyScroll}
      contentContainerStyle={styles.storyContent}
    >
      {items.map((item) => {
        const isFriends = item.kind === "friends";

        return (
          <Pressable
            key={item.key}
            style={styles.storyItem}
            onPress={() => {
              if (isFriends) {
                onPressFriends(); // ✅ UserCard 닫기
                return;
              }
              // ✅ 여기서부터 item은 UserItem으로 좁혀짐 -> payload undefined 아님
              if (isUserItem(item)) onPressItem(item.payload);
            }}
          >
            <View style={styles.storyAvatar}>
              <Image
                source={item.source ?? fallbackProfile}
                style={[
                  styles.avatarImage,
                  isFriends ? styles.friendsIcon40 : null,
                ]}
                resizeMode={isFriends ? "contain" : "cover"}
              />
            </View>

            <Text style={styles.storyLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  storyScroll: { marginTop: 20 },
  storyContent: { paddingRight: 16 },

  storyItem: { alignItems: "center", marginRight: 20, width: 65 },

  storyAvatar: {
    width: 65,
    height: 65,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    backgroundColor: Colors.white,
    marginBottom: 6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: { width: "100%", height: "100%" },

  friendsIcon40: { width: 40, height: 40 },

  storyLabel: { ...TextStyles.Regular12, textAlign: "center" },
});
