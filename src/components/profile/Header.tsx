// src/components/profile/Header.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type ProfileHeaderProps = {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode; // 우측 버튼(옵션)
};

export default function ProfileHeader({
  title,
  showBack = true,
  right,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {/* ---- 왼쪽: 뒤로가기 ---- */}
      {showBack ? (
        <Pressable
          style={styles.left}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Image
            source={require("@/assets/images/arrow-left-black.png")}
            style={styles.backIcon}
          />
        </Pressable>
      ) : (
        <View style={styles.left} /> // placeholder: 정렬 유지
      )}

      {/* ---- 중앙: 타이틀 ---- */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* ---- 오른쪽: 옵션 버튼 자리 ---- */}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  left: {
    width: 32,
    height: 32,
    justifyContent: "center",
  },
  backIcon: {
    width: 40,
    height: 40,
    paddingRight: 30,
  },
  title: {
    ...TextStyles.SemiBold20,
    color: Colors.gray_900,
    paddingBottom: 2, // 위아래 미세 조정
  },
  right: {
    width: 32,
    alignItems: "flex-end",
  },
});
