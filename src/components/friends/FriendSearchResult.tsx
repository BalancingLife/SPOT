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

            <View style={styles.mid}>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <Text style={styles.userId}>@{item.userId}</Text>
            </View>

            {onPressAction ? (
              <Pressable
                onPress={() => onPressAction(item)}
                style={styles.actionBtn}
              >
                <Text style={styles.actionText}>추가</Text>
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
  },
  sep: { height: 1, backgroundColor: Colors.gray_100 },

  avatar: { width: 44, height: 44, borderRadius: 999, marginRight: 12 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: Colors.gray_300,
  },

  mid: { flex: 1 },
  nickname: { ...TextStyles.SemiBold16, color: Colors.gray_900 },
  userId: { ...TextStyles.Medium14, color: Colors.gray_500, marginTop: 2 },

  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.gray_900,
  },
  actionText: { ...TextStyles.SemiBold14, color: Colors.white },
});
