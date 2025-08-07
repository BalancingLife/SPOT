import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  FlatList,
} from "react-native";
import {
  NaverMapView,
  // NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import BottomSheetContainer from "../../src/components/bottomSheet/BottomSheetContainer";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

// ✅ 네이버 오픈 API 키 (env로 분리 권장)
const NAVER_CLIENT_ID = "kVfIrjPOZF9xtv9Evmt2";
const NAVER_CLIENT_SECRET = "2GlVd6NxL1";

type SearchResultItem = {
  title: string;
  roadAddress?: string;
  address: string;
  mapx: string;
  mapy: string;
};

export default function Home() {
  const mapRef = useRef<NaverMapViewRef>(null);
  const [searchInputText, setSearchInputText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        // const location = await Location.getCurrentPositionAsync({});
        // setUserLocation({
        //   latitude: location.coords.latitude,
        //   longitude: location.coords.longitude,
        // });
        mapRef.current?.setLocationTrackingMode("Follow");
      } else {
        console.log("위치 권한이 거부되었습니다.");
      }
    })();
  }, []);

  // 🔁 입력값이 바뀔 때마다 debounce로 검색
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInputText.trim()) {
        fetchSearchResults(searchInputText);
      } else {
        setSearchResults([]); // 검색어 지우면 리스트 초기화
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delay);
  }, [searchInputText]);

  const fetchSearchResults = async (query: string) => {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
          query
        )}&display=10`,
        {
          headers: {
            "X-Naver-Client-Id": NAVER_CLIENT_ID,
            "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
          },
        }
      );
      const data = await res.json();
      console.log("🔍 검색 결과", data);
      setSearchResults(data.items || []);
    } catch (e) {
      console.error("❌ 검색 실패", e);
    }
  };

  const moveToCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      mapRef.current?.animateCameraTo({
        latitude,
        longitude,
        zoom: 16,
        duration: 0,
        easing: "EaseIn",
      });
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
        style={[styles.map, StyleSheet.absoluteFillObject]}
      >
        {/* 사용자 마커
        {userLocation && (
          <NaverMapMarkerOverlay
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor={{ x: 0.5, y: 0.5 }}
            width={40}
            height={40}
            image={require("@/assets/images/hot-orange.png")}
          />
        )} */}
      </NaverMapView>

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
          style={TextStyles.Medium16}
          value={searchInputText}
          onChangeText={setSearchInputText}
          placeholder="지역, 상호명을 검색해보세요"
          placeholderTextColor={Colors.gray_300}
        />
      </View>

      {/* 📋 검색 결과 리스트 */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(_, i) => i.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const title = item.title.replace(/<[^>]+>/g, "");
            const roadAddress = item.roadAddress || item.address;
            return (
              <Pressable
                onPress={() => {
                  const lat = parseFloat(item.mapy);
                  const lng = parseFloat(item.mapx);
                  mapRef.current?.animateCameraTo({
                    latitude: lat,
                    longitude: lng,
                    zoom: 16,
                    duration: 1000,
                    easing: "EaseIn",
                  });
                  setSearchResults([]);
                  setSearchInputText(title);
                }}
                style={styles.resultItem}
              >
                <Text style={styles.resultTitle}>{title}</Text>
                <Text style={styles.resultAddress}>{roadAddress}</Text>
              </Pressable>
            );
          }}
          style={styles.resultList}
        />
      )}

      {/* 바텀시트 */}

      <BottomSheetContainer onPressMyLocation={moveToCurrentLocation} />
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
