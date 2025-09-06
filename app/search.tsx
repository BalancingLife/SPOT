// app/search/index.tsx
import React, { useState } from "react";

import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export default function SearchPage() {
  const [searchInputText, setSearchInputText] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 바: 뒤로가기 + TextInput */}
      <View style={styles.header}>
        <View style={styles.inputWrap}>
          <Image
            source={
              searchInputText
                ? require("@/assets/images/search-input-icon-black.png")
                : require("@/assets/images/search-input-icon-gray.png")
            }
            style={styles.searchIcon}
          />
          <TextInput
            autoFocus
            placeholder="지역, 상호명을 검색해보세요"
            value={searchInputText}
            placeholderTextColor={Colors.gray_300}
            style={TextStyles.Medium16}
            returnKeyType="search"
            // onSubmitEditing={(e) => { /* 추후: pendingQuery 세팅 후 router.back() */ }}
          />
        </View>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>취소</Text>
        </Pressable>
      </View>

      {/* 임시 바디 */}
      <View style={styles.body}>
        <Text style={TextStyles.Medium16}>🔍 검색 페이지입니다</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  leftArrow: {
    width: 24,
    height: 24,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 9,
  },
  backBtn: {
    ...TextStyles.Medium16,
    color: Colors.gray_800,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
