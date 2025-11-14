import {
  View,
  Image,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import { ScrollView } from "react-native-gesture-handler";

const TABS = [
  { key: "map", label: "지도" },
  { key: "place", label: "장소" },
  { key: "comment", label: "코멘트" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("map");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* 좌측 로고, 우측 친구 아이콘 */}
        <View style={styles.topBar}>
          <Image
            source={require("@/assets/images/SPOT.png")}
            style={styles.spotLogo}
          />

          <View style={styles.friendsIconContainer}>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/friends-icon-black.png")}
                style={styles.friendsIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={require("@/assets/images/friends-add-icon-black.png")}
                style={styles.friendsIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 스토리 (친구 / 나의닉네임 / 닉네임예시...) */}

        {/* 스토리 리스트 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storyScroll}
          contentContainerStyle={styles.storyContent}
        >
          {["친구", "나의닉네임", "닉네임예시", "닉네임예시", "닉네임예시"].map(
            (label, i) => (
              <View key={i} style={styles.storyItem}>
                <View style={styles.storyAvatar} />
                <Text style={styles.storyLabel}>{label}</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>

      {/* 아래 탭 + 콘텐츠 영역 */}
      <View style={styles.bodyContainer}>
        {/* 탭 바 */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 탭 콘텐츠 (지금은 placeholder만) */}
        <View style={styles.tabContent}>
          {activeTab === "map" && (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.placeholderText}>
                지도 영역 (나중에 네이버/카카오 지도)
              </Text>
            </View>
          )}

          {activeTab === "place" && (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>장소 리스트 영역</Text>
            </View>
          )}

          {activeTab === "comment" && (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>코멘트 리스트 영역</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingLeft: 16,
  },

  // top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 16,
  },
  spotLogo: { width: 63, height: 29 },
  friendsIconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  friendsIcon: { width: 24, height: 24 },

  // story row
  storyScroll: {
    marginTop: 20,
  },
  storyContent: {
    paddingRight: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 20,
  },
  storyAvatar: {
    width: 65,
    height: 65,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    backgroundColor: Colors.white,
    marginBottom: 6,
  },
  storyLabel: {
    ...TextStyles.Regular12,
  },

  // 아래 탭 + 콘텐츠 영역
  bodyContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 20,
  },

  tabBar: {
    justifyContent: "space-around", // 혹은 "space-between"
    flexDirection: "row",
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabLabel: {
    ...TextStyles.SemiBold16,
    marginBottom: 4,
  },
  tabLabelActive: {
    color: Colors.primary_500,
    fontWeight: "600",
  },
  tabLabelInactive: {
    color: Colors.gray_300,
  },
  tabUnderline: {
    width: "230%",
    height: 4,
    backgroundColor: Colors.primary_500,
  },

  tabContent: {
    flex: 1,
  },

  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...TextStyles.Regular12,
    color: Colors.gray_400,
  },
});
