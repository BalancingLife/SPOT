import React from "react";
import { View, Pressable, Text, Image, StyleSheet } from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

type TabType = "saved" | "hot";

interface Props {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function PlacesBottomSheetTabSelector({
  selectedTab,
  onSelectTab,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
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
            TextStyles.SemiBold16,
            {
              color:
                selectedTab === "saved" ? Colors.gray_900 : Colors.gray_300,
            },
          ]}
        >
          저장한 장소
        </Text>
      </Pressable>

      <Pressable
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
            TextStyles.SemiBold16,
            {
              color: selectedTab === "hot" ? Colors.gray_900 : Colors.gray_300,
            },
          ]}
        >
          인기 장소
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
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
    width: 24,
    height: 24,
    marginRight: 6,
  },
});
