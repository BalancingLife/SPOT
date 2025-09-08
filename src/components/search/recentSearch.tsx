// src/components/search/RecentSearch.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type RecentItem = {
  id: string;
  keyword: string;
};

type Props = {
  items: RecentItem[];
  onTapKeyword: (keyword: string) => void;
};

export default function RecentSearch({ items, onTapKeyword }: Props) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={TextStyles.Medium16}>최근 검색어가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최근 검색</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onTapKeyword(item.keyword)}
            style={styles.row}
          >
            <Image
              source={require("@/assets/images/x-gray.png")}
              style={styles.icon}
            />
            <Text style={TextStyles.Regular12}>{item.keyword}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    ...TextStyles.Medium16,
    color: Colors.gray_800,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: Colors.gray_400,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray_200,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
