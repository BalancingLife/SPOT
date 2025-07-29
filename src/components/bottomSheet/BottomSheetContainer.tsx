import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { View, StyleSheet, Text } from "react-native";
import React, { useRef, useState, useMemo, useCallback } from "react";
import SavedPlacesTab from "./(tabs)/SavedPlacesTab";
import HotPlacesTab from "./(tabs)/HotPlacesTab";
import BottomSheetTabSelector from "./BottomSheetTabSelector";

export default function BottomSheetContainer() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["6%", "50%", "75%"], []);
  const [selectedTab, setSelectedTab] = useState<"saved" | "hot">("saved");

  const handleSheetChanges = useCallback((index: number) => {
    console.log("BottomSheet Index:", index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* 장소 개수 인디케이터 */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>인기 장소 13</Text>
        </View>

        {/* 탭 전환 버튼 */}
        <View style={styles.tabContainer}>
          <BottomSheetTabSelector
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />
        </View>

        {/* 탭별 콘텐츠 */}
        <View style={{ flex: 1, marginTop: 16 }}>
          {selectedTab === "saved" ? <SavedPlacesTab /> : <HotPlacesTab />}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  indicatorContainer: {
    alignItems: "center",
  },
  indicatorText: {
    color: "#999999",
  },
  tabContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  tabText: {
    fontSize: 16,
    color: "#aaa",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
});
