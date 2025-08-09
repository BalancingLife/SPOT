import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Image, Text } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import SavedPlacesTab from "./(tabs)/SavedPlacesTab";
import HotPlacesTab from "./(tabs)/HotPlacesTab";
import PlacesBottomSheetTabSelector from "./PlacesBottomSheetTabSelector";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

interface PlacesBottomSheetProps {
  onPressMyLocation: () => void;
}

export default function PlacesBottomSheet({
  onPressMyLocation,
}: PlacesBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0); // 동적 값 담을 저장소, 0 으로 초기화
  const snapPoints = useMemo(() => ["6.7%", "50%", "75%"], []);
  const [selectedTab, setSelectedTab] = useState<"saved" | "hot">("saved");

  //  버튼 위치 애니메이션 스타일
  const animatedButtonStyle = useAnimatedStyle(() => {
    const bottom = interpolate(
      animatedIndex.value,
      [0, 1, 2], // snap index 0(6.7%), 1(50%), 2(75%)
      [70, 420, 420]
    );

    return {
      position: "absolute",
      left: 16.5,
      bottom,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      {/*  커스텀 내 위치 버튼 */}
      <Animated.View style={animatedButtonStyle}>
        <Pressable onPress={onPressMyLocation} style={styles.myLocationButton}>
          <Image
            source={require("@/assets/images/myLocation.png")}
            style={{ width: 26.4, height: 26.4 }}
          />
        </Pressable>
      </Animated.View>

      {/*  바텀 시트 */}
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
                {selectedTab === "saved" ? "13" : "15"}
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
  contentContainer: {
    flex: 1,
  },
  indicatorContainer: {
    alignItems: "center",
    paddingVertical: 3,
  },
  tabContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#E6E6E680",
  },
  myLocationButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
