import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TextInput, Image } from "react-native";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import BottomSheetContainer from "../../src/components/bottomSheet/BottomSheetContainer";

export default function Home() {
  const mapRef = useRef<NaverMapViewRef>(null);
  const [searchInputText, setSearchInputText] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        mapRef.current?.setLocationTrackingMode("Follow");
      } else {
        console.log("위치 권한이 거부되었습니다.");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <NaverMapView
        ref={mapRef}
        isShowLocationButton={true}
        style={[styles.map, StyleSheet.absoluteFillObject]}
      />

      {/* 검색창 */}
      <View style={styles.searchInput}>
        <Image
          source={
            searchInputText
              ? require("@/assets/images/search-input-icon-black.png")
              : require("@/assets/images/search-input-icon-gray.png")
          }
          style={styles.searchIcon}
        />
        <TextInput
          value={searchInputText}
          onChangeText={setSearchInputText}
          placeholder="지역, 상호명을 검색해보세요"
          placeholderTextColor="#888"
          style={styles.searchInputText}
        />
      </View>

      {/* 바텀시트 */}
      <BottomSheetContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { zIndex: 0, flex: 1 },

  searchInput: {
    position: "absolute",
    top: 60,
    left: 17,
    right: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 9,
  },

  searchInputText: {
    flex: 1,
    fontSize: 16,
  },
});
