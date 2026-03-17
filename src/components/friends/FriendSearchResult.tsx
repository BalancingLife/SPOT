import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import type { FriendItem } from "@/app/searchFriends";

type Props = {
  data: FriendItem[];
  onPressItem: (friend: FriendItem) => void;
  onPressAction?: (friend: FriendItem) => void;
};

export default function FriendSearchResult({
  data,
  onPressItem,
  onPressAction,
}: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      renderItem={({ item }) => {
        return (
          <Pressable onPress={() => onPressItem(item)} style={styles.row}>
            {item.profileImageUrl ? (
              <Image
                source={{ uri: item.profileImageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback} />
            )}

            {/* content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.nickname} numberOfLines={1}>
                  {item.nickname}
                </Text>

                <Text style={styles.userId} numberOfLines={1}>
                  @{item.userId}
                </Text>
              </View>

              {!!item.oneLine && (
                <Text style={styles.oneLine} numberOfLines={1}>
                  {item.oneLine}
                </Text>
              )}
            </View>

            {onPressAction ? (
              <Pressable
                onPress={() => onPressAction(item)}
                style={styles.actionBtn}
              >
                <Text style={styles.actionText}>팔로우</Text>
              </Pressable>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  sep: {
    height: 1,
    backgroundColor: Colors.gray_100,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
  },

  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: Colors.gray_300,
  },

  content: {
    flex: 1,
    marginRight: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  nickname: {
    ...TextStyles.Bold14,
    color: Colors.gray_800,
    marginRight: 6,
  },

  userId: {
    ...TextStyles.Regular10,
    color: Colors.gray_400,
  },

  oneLine: {
    ...TextStyles.Regular12,
    color: Colors.gray_500,
    marginTop: 4,
  },

  actionBtn: {
    width: 80,
    height: 28,
    borderRadius: 999,
    backgroundColor: Colors.gray_900,
    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    ...TextStyles.Bold12,
    color: Colors.white,
  },
});
