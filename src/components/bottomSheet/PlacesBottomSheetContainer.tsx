import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Image, Text } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

import SavedPlacesTab from "./(tabs)/SavedPlacesTab";
import HotPlacesTab from "./(tabs)/HotPlacesTab";
import PlacesBottomSheetTabSelector from "./PlacesBottomSheetTabSelector";

import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore"; // ← 추가

interface PlacesBottomSheetContainerProps {
  onPressMyLocation: () => void;
}

export default function PlacesBottomSheetContainer({
  onPressMyLocation,
}: PlacesBottomSheetContainerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  const snapPoints = useMemo(() => ["6.7%", "50%", "75%"], []);
  const [selectedTab, setSelectedTab] = useState<"saved" | "hot">("saved");

  // 🔥 저장한 장소 개수 가져오기
  const savedCount = useSavedPlacesStore((s) => s.savedList.length);

  // Hot 탭 API가 아직 없다면 임시 0
  const hotCount = 0;

  // 버튼 위치 애니메이션
  const animatedButtonStyle = useAnimatedStyle(() => {
    const bottom = interpolate(animatedIndex.value, [0, 1, 2], [70, 420, 420]);
    return { position: "absolute", left: 16.5, bottom };
  });

  //  깜빡임/스케일 애니메이션 값
  const pressScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(1);

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const flashAnimStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  //  깜빡임 효과 + 상위 콜백 호출
  const handlePress = () => {
    // 스케일: 1 → 0.92 → 1
    pressScale.value = withSequence(
      withTiming(0.92, { duration: 90 }),
      withTiming(1, { duration: 90 })
    );

    // 플래시: 살짝 커지면서 나타났다 빠르게 사라짐
    flashScale.value = 1;
    flashOpacity.value = 0;
    flashScale.value = withSequence(
      withTiming(1.12, { duration: 120 }),
      withTiming(1.2, { duration: 120 })
    );
    flashOpacity.value = withSequence(
      withTiming(0.22, { duration: 100 }),
      withDelay(80, withTiming(0, { duration: 140 }))
    );

    // 실제 동작
    onPressMyLocation?.();
  };

  // 바텀시트를 75%로 스냅
  const handlePressPlaceList = () => {
    bottomSheetRef.current?.snapToIndex(2);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 커스텀 내 위치 버튼 */}
      <Animated.View style={animatedButtonStyle} pointerEvents="box-none">
        <Pressable onPress={handlePress} style={styles.myLocationButton}>
          {/*  플래시 레이어 (버튼 안에서 깜빡임 효과) */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.flashLayer,
              flashAnimStyle,
            ]}
          />
          {/* 아이콘 + 스케일 애니메이션 */}
          <Animated.View style={contentAnimStyle}>
            <Image
              source={require("@/assets/images/myLocation.png")}
              style={{ width: 24, height: 24 }}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* 장소 리스트 버튼 */}
      <View pointerEvents="box-none" style={styles.placeListButtonContainer}>
        <Pressable onPress={handlePressPlaceList}>
          <Image
            source={require("@/assets/images/PlaceListUpButton.png")}
            style={{ width: 220, height: 54, resizeMode: "contain" }}
          />
        </Pressable>
      </View>

      {/* 바텀 시트 */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        enableDynamicSizing={false}
      >
        <BottomSheetScrollView style={styles.contentContainer}>
          {/* 인디케이터 */}
          <View style={styles.indicatorContainer}>
            <Text style={TextStyles.Medium16}>
              <Text style={{ color: Colors.gray_300 }}>
                {selectedTab === "saved" ? "저장한 장소 " : "인기 장소 "}
              </Text>
              <Text style={[TextStyles.Bold16, { color: Colors.gray_300 }]}>
                {selectedTab === "saved" ? savedCount : hotCount}
              </Text>
            </Text>
          </View>

          {/* 탭 선택 */}
          <View style={styles.tabContainer}>
            <PlacesBottomSheetTabSelector
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
            />
          </View>

          {/* 탭 콘텐츠 */}
          <View style={{ flex: 1 }}>
            {selectedTab === "saved" ? <SavedPlacesTab /> : <HotPlacesTab />}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1 },
  indicatorContainer: { alignItems: "center", paddingVertical: 3 },
  tabContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  myLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden", //  플래시가 버튼 밖으로 안 나가게
  },

  placeListButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 58,
    alignItems: "center",
    zIndex: 0,
  },

  flashLayer: {
    borderRadius: 100,
    backgroundColor: "rgba(255, 127, 0, 0.25)", // SPOT 주황 느낌
  },
});
