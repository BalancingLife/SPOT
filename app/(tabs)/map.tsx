import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";
import type { ApiMapPlace } from "@/src/types/place";
import { getMapPinImage } from "@/src/utils/getMapPinImage";

import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import PlacesBottomSheetContainer from "../../src/components/bottomSheet/PlacesBottomSheetContainer";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import UserLocationMarker from "@/src/components/map/UserLocationMarker";
import { useLocationStore } from "@/src/stores/useLocationStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useSearchStore } from "@/src/stores/useSearchStore";
import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore";
import SavePlacesBottomSheet from "@/src/components/bottomSheet/SavePlacesBottomSheet";
import { useAnalyzeResultStore } from "@/src/stores/useAnalyzeResultStore";

import { fetchSearchDetails, fetchPlaceDetail } from "@/src/lib/api/search"; // ← 상세 함수 import
import { fetchMyNewSavedPlaces, fetchMapPlaces } from "@/src/lib/api/places";

import SearchDetailsBottomSheet from "@/src/components/bottomSheet/SearchDetailsBottomSheet";
import SearchDetailBottomSheet from "@/src/components/bottomSheet/SearchDetailBottomSheet";

export default function Map() {
  const mapRef = useRef<NaverMapViewRef>(null);

  const [myPlaces, setMyPlaces] = useState<ApiMapPlace[]>([]);

  const hydrate = useAuthStore((s) => s.hydrate);
  const { refreshOnce, coords } = useLocationStore();

  const query = useSearchStore((s) => s.query);
  const phase = useSearchStore((s) => s.phase);
  const items = useSearchStore((s) => s.items);
  const focused = useSearchStore((s) => s.focused);

  const setLoading = useSearchStore((s) => s.setLoading);
  const setResult = useSearchStore((s) => s.setResult);
  const setError = useSearchStore((s) => s.setError);
  const reset = useSearchStore((s) => s.reset);

  const pendingDetailGid = useSearchStore((s) => s.pendingDetailGid);
  const clearPendingDetail = useSearchStore((s) => s.clearPendingDetail);
  const focus = useSearchStore((s) => s.focus);
  const unfocus = useSearchStore((s) => s.unfocus);

  const setSavedList = useSavedPlacesStore((s) => s.setSavedList);
  const setSavedLoading = useSavedPlacesStore((s) => s.setSavedLoading);
  const setSavedError = useSavedPlacesStore((s) => s.setSavedError);

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const requestDetail = useSearchStore((s) => s.requestDetail);

  const analyzeVisible = useAnalyzeResultStore((s) => s.visible);
  const analyzePlaces = useAnalyzeResultStore((s) => s.places);
  const clearAnalyze = useAnalyzeResultStore((s) => s.clear);
  const closeAnalyze = useAnalyzeResultStore((s) => s.close);

  const stableCoords = useMemo(() => {
    if (coords.lat == null || coords.lng == null) {
      return { lat: null, lng: null };
    }

    return {
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
    };
  }, [coords.lat, coords.lng]);

  const lastSavedPlacesKeyRef = useRef<string | null>(null);
  const lastMapPlacesKeyRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("✅✅[map] analyzeVisible:", analyzeVisible);
    console.log("✅✅[map] analyzePlaces length:", analyzePlaces.length);
  }, [analyzeVisible, analyzePlaces.length]);

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

  // ✅ 상세 트리거: pendingDetailGid + 좌표 준비되면 /search/detail 호출
  useEffect(() => {
    if (!pendingDetailGid) return;
    if (coords.lat == null || coords.lng == null) return;

    let alive = true;

    console.log("🔔 상세 요청 트리거 감지:", {
      pendingDetailGid,
      lat: coords.lat,
      lng: coords.lng,
    });

    (async () => {
      try {
        console.log("🚀 /search/detail API 호출 시작");
        const place = await fetchPlaceDetail({
          gid: pendingDetailGid,
          lat: coords.lat!,
          lng: coords.lng!,
        });
        if (!alive) return;

        console.log("✅ /search/detail 성공:", place);

        // 상세 포커스 세팅 → 단일 상세 바텀시트가 표시됨
        focus(place);

        // 지도 카메라도 상세로 이동(선택)
        if (isFinite(place.lat) && isFinite(place.lng)) {
          console.log("📍 지도 카메라 이동:", {
            latitude: place.lat,
            longitude: place.lng,
          });
          mapRef.current?.animateCameraTo({
            latitude: place.lat,
            longitude: place.lng,
            zoom: 16,
            duration: 0,
            easing: "EaseIn",
          });
        }
      } catch (e: any) {
        console.error("❌  /search/detail 실패:", {
          name: e?.name,
          message: e?.message,
          code: e?.code,
          status: e?.response?.status,
          response: e?.response?.data,
        });
      } finally {
        console.log("🧹 clearPendingDetail 호출");
        clearPendingDetail();
      }
    })();

    return () => {
      console.log("🛑 상세 effect cleanup 실행");
      alive = false;
    };
  }, [pendingDetailGid, coords.lat, coords.lng, focus, clearPendingDetail]);

  // ✅ 검색 트리거: query가 바뀌고 좌표가 준비되면 /search/details 호출
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!query) return; // 검색 안했으면 패스
      if (coords.lat == null || coords.lng == null) return;

      try {
        setLoading(); // 로딩 전환
        const list = await fetchSearchDetails({
          keyword: query,
          lat: coords.lat,
          lng: coords.lng,
        });
        if (!alive) return;
        setResult(list);

        // 결과가 있으면 첫 번째 결과 근처로 카메라 소폭 이동(선택)
        if (list.length > 0) {
          const p = list[0];
          if (isFinite(p.lat) && isFinite(p.lng)) {
            mapRef.current?.animateCameraTo({
              latitude: p.lat,
              longitude: p.lng,
              zoom: 15,
              duration: 0,
              easing: "EaseIn",
            });
          }
        }
      } catch (e: any) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "검색 중 문제가 발생했습니다.";
        setError(msg);
        console.warn("❌ /search/details 실패:", msg);
      }
    })();
    return () => {
      alive = false;
    };
  }, [query, coords.lat, coords.lng, setLoading, setResult, setError]);

  // ✅ 리스트 아이템 탭 시 지도 이동 핸들러(시트 → 홈으로 바운스)
  const handlePressSearchItem = (placeId: string) => {
    const target = items.find((p) => p.id === placeId);
    if (target && isFinite(target.lat) && isFinite(target.lng)) {
      mapRef.current?.animateCameraTo({
        latitude: target.lat,
        longitude: target.lng,
        zoom: 16,
        duration: 0,
        easing: "EaseIn",
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      (async () => {
        await refreshOnce();

        if (cancelled) return;

        const { coords } = useLocationStore.getState();
        if (coords.lat == null || coords.lng == null) return;

        const roundedLat = Number(coords.lat.toFixed(4));
        const roundedLng = Number(coords.lng.toFixed(4));
        const requestKey = `${roundedLat},${roundedLng}`;

        if (lastSavedPlacesKeyRef.current === requestKey) {
          console.log("[map] /new skip - same coords:", requestKey);
          return;
        }

        lastSavedPlacesKeyRef.current = requestKey;

        setSavedLoading(true);
        setSavedError(null);

        try {
          console.log("[map] /new fetch start:", requestKey);

          const list = await fetchMyNewSavedPlaces({
            lat: roundedLat,
            lng: roundedLng,
          });

          if (!cancelled) {
            setSavedList(list);
          }
        } catch (e: any) {
          if (!cancelled) {
            setSavedError(e?.message ?? "failed to load");
            lastSavedPlacesKeyRef.current = null;
          }
        } finally {
          if (!cancelled) {
            setSavedLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [refreshOnce, setSavedList, setSavedLoading, setSavedError]),
  );
  // /main/map 호출
  useEffect(() => {
    async function loadMap() {
      if (stableCoords.lat == null || stableCoords.lng == null) {
        console.log("[map] 위치 정보 없음 → /main/map 스킵");
        return;
      }

      const requestKey = `${stableCoords.lat},${stableCoords.lng},10`;

      if (lastMapPlacesKeyRef.current === requestKey) {
        console.log("[map] /main/map skip - same coords:", requestKey);
        return;
      }

      lastMapPlacesKeyRef.current = requestKey;

      try {
        console.log("[map] /main/map fetch start:", requestKey);

        const list = await fetchMapPlaces({
          latitude: stableCoords.lat,
          longitude: stableCoords.lng,
          radius: 10,
        });

        setMyPlaces(list);
      } catch (err: any) {
        lastMapPlacesKeyRef.current = null;
        console.log(
          "[/main/map] 에러:",
          err?.response?.status,
          err?.response?.data ?? err.message,
        );
      }
    }

    loadMap();
  }, [stableCoords.lat, stableCoords.lng]);

  //  바텀 시트 표시 규칙:
  // - idle: 기존 PlacesBottomSheetContainer
  // - loading/success/empty/error: SearchDetailsBottomSheet
  // - focused 가 있으면 SearchDetailBottomSheet(단일 상세)
  const showPlacesSheet = phase === "idle" && !focused && !analyzeVisible;
  const showSearchListSheet = phase !== "idle" && !focused && !analyzeVisible;
  const showSearchDetailSheet = !!focused && !analyzeVisible;

  const PIN_W = 52;
  const PIN_H = 58;
  const PIN_SCALE = 1.5;

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

        {/* 저장한 장소 핀들 */}
        {myPlaces.map((p) => {
          const isSelected = selectedPlaceId === p.placeId;
          const w = isSelected ? Math.round(PIN_W * PIN_SCALE) : PIN_W;
          const h = isSelected ? Math.round(PIN_H * PIN_SCALE) : PIN_H;

          return (
            <NaverMapMarkerOverlay
              key={String(p.placeId)}
              latitude={p.latitude}
              longitude={p.longitude}
              image={getMapPinImage(p.list)}
              width={w}
              height={h}
              zIndex={isSelected ? 999 : 1}
              onTap={() => {
                const gid = p.gid;
                if (!gid) return;
                setSelectedPlaceId(p.placeId); // 핀 1.5배
                requestDetail(gid); // gid로 상세 트리거 → pendingDetailGid effect가 처리
              }}
            />
          );
        })}
      </NaverMapView>
      {/* 검색창 */}
      <Pressable
        style={styles.searchInput}
        onPress={() => router.push("/searchPlace")}
      >
        <Image
          source={require("@/assets/images/search-input-icon-gray.png")}
          style={styles.searchIcon}
        />
        <Text style={[TextStyles.Medium16, { color: Colors.gray_300 }]}>
          지역, 상호명을 검색해보세요
        </Text>
      </Pressable>

      {analyzeVisible ? (
        <SavePlacesBottomSheet
          visible={analyzeVisible}
          places={analyzePlaces}
          maxSelect={10}
          initialSelectedIds={[]}
          onClose={() => {
            if (!useAnalyzeResultStore.getState().visible) return;
            closeAnalyze();
          }}
          onChangeSelection={() => {}}
          onConfirm={(ids) => {
            console.log("✅ analyze 선택 확정 ids:", ids);
            clearAnalyze();
          }}
        />
      ) : (
        <>
          {showPlacesSheet && (
            <PlacesBottomSheetContainer
              onPressMyLocation={moveToCurrentLocation}
            />
          )}

          {showSearchListSheet && (
            <SearchDetailsBottomSheet
              onClose={() => reset()}
              onPressItem={handlePressSearchItem}
            />
          )}

          {showSearchDetailSheet && (
            <SearchDetailBottomSheet
              onClose={() => {
                setSelectedPlaceId(null);
                unfocus();
              }}
            />
          )}
        </>
      )}
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
