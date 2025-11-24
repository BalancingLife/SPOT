// src/components/layout/Screen.tsx
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";

type LayoutProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Layout({ children, style }: LayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff", // 앱 기본 배경
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
