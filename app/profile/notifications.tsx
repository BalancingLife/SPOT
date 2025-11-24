import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

import ProfileLayout from "@/src/components/profile/Layout";
import ProfileHeader from "@/src/components/profile/Header";

export default function NotificationsScreen() {
  const data = [1, 2, 3]; // 더미 데이터

  return (
    <ProfileLayout>
      {/* ----- 상단 헤더 (이 페이지 내부에서 직접 구성) ----- */}
      <ProfileHeader title="알림" showBack={true} />

      {/* ----- 알림 리스트 ----- */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={() => (
          <View style={styles.item}>
            <Text>알림 하나</Text>
          </View>
        )}
      />
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    width: 32,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F3",
  },
});
