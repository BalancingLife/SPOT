import React from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";

type TabType = "saved" | "hot";

interface Props {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomSheetTabSelector({
  selectedTab,
  onSelectTab,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === "saved" && styles.selectedTabButton,
        ]}
        onPress={() => onSelectTab("saved")}
      >
        <Image
          source={
            selectedTab === "saved"
              ? require("@/assets/images/bookmark-orange.png")
              : require("@/assets/images/bookmark-gray.png")
          }
          style={styles.icon}
        />
        <Text
          style={[
            styles.tabText,
            selectedTab === "saved" && styles.selectedTabText,
          ]}
        >
          저장한 장소
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === "hot" && styles.selectedTabButton,
        ]}
        onPress={() => onSelectTab("hot")}
      >
        <Image
          source={
            selectedTab === "hot"
              ? require("@/assets/images/hot-orange.png")
              : require("@/assets/images/hot-gray.png")
          }
          style={styles.icon}
        />
        <Text
          style={[
            styles.tabText,
            selectedTab === "hot" && styles.selectedTabText,
          ]}
        >
          인기 장소
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    borderRadius: 16,
    padding: 4,
    marginVertical: 12,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  selectedTabButton: {
    backgroundColor: "white",
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  selectedTabText: {
    color: "#000",
    fontWeight: "700",
  },
});
