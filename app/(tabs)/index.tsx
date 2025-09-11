import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { router } from "expo-router";
import {
  NaverMapView,
  // NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import PlacesBottomSheetContainer from "../../src/components/bottomSheet/PlacesBottomSheetContainer";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import UserLocationMarker from "@/src/components/UserLocationMarker";
import { useLocationStore } from "@/src/stores/useLocationStore";
import { useAuthStore } from "@/src/stores/useAuthStore";

export default function Home() {
  const mapRef = useRef<NaverMapViewRef>(null);
  const hydrate = useAuthStore((s) => s.hydrate);

  const { refreshOnce, coords } = useLocationStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    (async () => {
      await refreshOnce(); // ✅ 권한요청 + 현재 좌표 1회 갱신
      mapRef.current?.setLocationTrackingMode("Follow");
    })();
  }, [refreshOnce]);

  const moveToCurrentLocation = async () => {
    try {
      await refreshOnce(); // ✅ 최신 좌표 갱신
      if (coords.lat && coords.lng) {
        mapRef.current?.animateCameraTo({
          latitude: coords.lat,
          longitude: coords.lng,
          zoom: 16,
          duration: 0,
          easing: "EaseIn",
        });
      } else {
        throw new Error("coords is null");
      }
    } catch (error) {
      Alert.alert("위치 확인 실패", "현재 위치를 가져올 수 없습니다.");
      console.error("❌ 위치 이동 실패:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <NaverMapView
        ref={mapRef}
        isShowLocationButton={false}
        onInitialized={() => {
          mapRef.current?.setLocationTrackingMode("None" as any);
        }}
        style={[styles.map, StyleSheet.absoluteFillObject]}
      >
        {/* 커스텀 사용자 마커 */}
        <UserLocationMarker enableRotation />
      </NaverMapView>

      {/* 검색창 */}
      <Pressable
        style={styles.searchInput}
        onPress={() => router.push("/search")}
      >
        <Image
          source={require("@/assets/images/search-input-icon-gray.png")}
          style={styles.searchIcon}
        />
        <Text style={[TextStyles.Medium16, { color: Colors.gray_300 }]}>
          지역, 상호명을 검색해보세요
        </Text>
      </Pressable>

      {/* 바텀시트 */}

      <PlacesBottomSheetContainer onPressMyLocation={moveToCurrentLocation} />
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
    zIndex: 10,
  },

  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 9,
  },
  resultList: {
    position: "absolute",
    top: 60 + 60 + 8, // 검색창 아래 여백
    left: 17,
    right: 17,
    backgroundColor: "white",
    maxHeight: 1000,
    borderRadius: 8,
    zIndex: 10,
  },

  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: "500",
  },

  resultAddress: {
    fontSize: 12,
    color: Colors.gray_400,
    marginTop: 2,
  },
});
