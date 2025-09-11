// src/components/search/RecentSearch.tsx
import React, { useEffect } from "react";
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
import client from "@/src/lib/api/client";

type RecentItem = {
  id: string;
  keyword: string;
};

type Props = {
  items: RecentItem[];
  onTapKeyword: (keyword: string) => void;
  onRemoveKeyword?: (id: string) => void; // ← 삭제 콜백 추가
};

export default function RecentSearch({
  items,
  onTapKeyword,
  onRemoveKeyword,
}: Props) {
  useEffect(() => {
    fetchRecentSearch();
  }, []);

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={TextStyles.Medium16}>최근 검색어가 없습니다.</Text>
      </View>
    );
  }

  async function fetchRecentSearch() {
    try {
      const res = await client.get("/recent");
      console.log("status:", res.status);
      console.log("headers:", res.headers);
      console.log("data:", res.data);
      return res.data;
    } catch (err) {
      console.log("최근 검색어 불러오기 실패", err);
      throw err;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최근 검색어</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {/* 키워드 클릭 */}
            <Pressable
              onPress={() => onTapKeyword(item.keyword)}
              style={styles.keywordWrap}
            >
              <Image
                source={require("@/assets/images/marker-gray.png")}
                style={styles.icon}
              />
              <Text style={TextStyles.Medium16}>{item.keyword}</Text>
            </Pressable>

            {/* 삭제 버튼 */}
            {onRemoveKeyword && (
              <Pressable
                onPress={() => onRemoveKeyword(item.id)}
                hitSlop={8}
                style={styles.removeBtn}
              >
                <Image
                  source={require("@/assets/images/x-gray.png")}
                  style={styles.removeIcon}
                />
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    ...TextStyles.SemiBold16,
    color: Colors.gray_900,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 양쪽 배치
    paddingVertical: 10,
  },
  keywordWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: Colors.gray_400,
  },
  removeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  removeIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.gray_400,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
