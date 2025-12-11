import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import PlaceCard from "@/src/components/PlaceCard";
import type { Place } from "@/src/types/place";
import {
  fetchMyNewSavedPlaces,
  fetchPlacesByDistance,
} from "@/src/lib/api/places";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import { useLocationStore } from "@/src/stores/useLocationStore";
import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore";

import FilterBar from "@/src/components/bottomSheet/FilterBar";
import OptionModal from "@/src/components/OptionModal";

import { toggleBookmarkApi } from "@/src/lib/api/bookmark";

import { usePlaceMoreNavigation } from "@/src/hooks/usePlaceMoreNavigation";

import { formatDistance } from "@/src/utils/format";

export default function SavedPlacesTab() {
  const { handlePressPlaceCard } = usePlaceMoreNavigation();

  const lat = useLocationStore((s) => s.coords.lat);
  const lng = useLocationStore((s) => s.coords.lng);

  const items = useSavedPlacesStore((s) => s.savedList);
  const setSavedList = useSavedPlacesStore((s) => s.setSavedList);
  const loading = useSavedPlacesStore((s) => s.savedLoading);
  const setSavedLoading = useSavedPlacesStore((s) => s.setSavedLoading);
  const setSavedError = useSavedPlacesStore((s) => s.setSavedError);

  const applyBookmarkFromPlace = useSavedPlacesStore(
    (s) => s.applyBookmarkFromPlace
  );

  // 로컬 필터 상태
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null
  );
  const [sort, setSort] = useState<string[]>(["latest"]); // 기본 최신순
  const [saveType, setSaveType] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);

  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    []
  );
  const saveOptions = useMemo(
    () => [
      { label: "전체", value: "all" },
      { label: "인스타그램", value: "instagram" },
      { label: "직접 저장", value: "self" },
    ],
    []
  );
  const categoryOptions = useMemo(
    () => [
      { label: "음식점", value: "restaurant" },
      { label: "술집", value: "bar" },
      { label: "전시회", value: "exhibition" },
      { label: "카페", value: "cafe" },
      { label: "디저트", value: "dessert" },
      { label: "소품샵", value: "gift_shop" },
      { label: "체험", value: "experience" },
      { label: "옷가게", value: "clothing_store" },
    ],
    []
  );

  const saveOptionsForModal = useMemo(
    () => saveOptions.filter((o) => o.value !== "all"),
    [saveOptions]
  );
  const categoryOptionsForModal = useMemo(
    () => categoryOptions.filter((o) => o.value !== "all"),
    [categoryOptions]
  );

  const sortLabel =
    sortOptions.find((o) => o.value === sort[0])?.label || "최신순";
  const saveTypeLabel =
    saveType.length > 0
      ? saveOptions.find((o) => o.value === saveType[0])?.label
      : "저장방식";
  const categoryLabel =
    category.length > 0
      ? categoryOptions.find((o) => o.value === category[0])?.label
      : "업종";

  // /new에서 데이터 로드
  const loadByNew = useCallback(async () => {
    if (lat == null || lng == null) return;

    setSavedLoading(true);
    setSavedError(null);

    try {
      const list = await fetchMyNewSavedPlaces({ lat, lng });
      setSavedList(list);
    } catch (e: any) {
      setSavedError(e?.message ?? "불러오기 실패");
    } finally {
      setSavedLoading(false);
    }
  }, [lat, lng, setSavedList, setSavedLoading, setSavedError]);

  useEffect(() => {
    loadByNew();
  }, [loadByNew]);

  // /distance에서 데이터 로드 (거리순)
  const loadByDistance = useCallback(async () => {
    if (lat == null || lng == null) return;

    setSavedLoading(true);
    setSavedError(null);

    try {
      const list = await fetchPlacesByDistance({ lat, lng });
      setSavedList(list);
    } catch (e: any) {
      setSavedError(e?.message ?? "불러오기 실패");
    } finally {
      setSavedLoading(false);
    }
  }, [lat, lng, setSavedList, setSavedLoading, setSavedError]);

  const handleSelectSort = useCallback(
    (next: string[]) => {
      setSort(next);
      const value = next[0];

      console.log("[SavedPlacesTab] sort selected", value);

      if (value === "latest") {
        // 최신순 → /new
        loadByNew();
      } else if (value === "distance") {
        // 거리순 → /distance
        loadByDistance();
      }

      setOpened(null);
    },
    [loadByNew, loadByDistance]
  );

  //  SavedPlacesTab 전용 북마크 토글
  const handleToggleBookmark = useCallback(
    async (place: Place) => {
      if (place.placeId == null) {
        console.warn(
          "[SavedPlacesTab] placeId is null, cannot toggle bookmark"
        );
        return;
      }

      const willBookmark = !place.isBookmarked;
      console.log("[SavedPlacesTab] toggle bookmark", {
        placeId: place.placeId,
        willBookmark,
      });

      // 1) 전역 store 낙관적 업데이트
      applyBookmarkFromPlace(place, willBookmark);

      // 2) API 호출
      try {
        await toggleBookmarkApi(place.placeId, willBookmark);
      } catch (err) {
        console.error("[SavedPlacesTab] toggleBookmark failed:", err);
        // 3) 실패 시 새로 불러오기(또는 나중에 refreshSavedPlaces 사용)
        if (lat != null && lng != null) {
          // 여기서 refreshSavedPlaces({ lat, lng }) 같은 걸 쓰게 설계해도 됨
          await loadByNew();
        }
      }
    },
    [applyBookmarkFromPlace, lat, lng, loadByNew]
  );

  // 클라이언트 측 정렬/필터 (지금은 정렬만 적용)
  const filteredItems = items;

  if (loading && items.length === 0) {
    return <ActivityIndicator style={{ marginVertical: 12 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FilterBar
        sortLabel={sortLabel}
        saveTypeLabel={saveTypeLabel}
        categoryLabel={categoryLabel}
        onPressSort={() => setOpened("sort")}
        onPressSaveType={() => setOpened("save")}
        onPressCategory={() => setOpened("category")}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* 목록 없음 */}
        {filteredItems.length === 0 && !loading && (
          <View style={{ flex: 1, alignItems: "center", paddingTop: 150 }}>
            <Text
              style={[
                TextStyles.SemiBold16,
                { color: Colors.gray_300, fontSize: 20 },
              ]}
            >
              저장된 장소가 없어요
            </Text>
            <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
              첫 장소를 저장하고, 여정을 시작해 보세요!
            </Text>
          </View>
        )}

        {/* 리스트 */}
        {filteredItems.map((p) => (
          <PlaceCard
            key={p.id}
            name={p.name}
            category={p.category ?? ""}
            address={p.address}
            images={
              p.thumbnails.length > 0
                ? p.thumbnails.map((u) => ({ uri: u }))
                : [require("@/assets/images/example.png")]
            }
            savedUsers={p.savers}
            savedCount={p.savers.length}
            showDirectionButton={true}
            rating={p.ratingAvg ?? 0}
            reviewCount={p.ratingCount ?? 0}
            showBookmark={true}
            isBookmarked={p.isBookmarked}
            onToggleBookmark={() => handleToggleBookmark(p)}
            distanceText={
              p.distanceM != null ? formatDistance(p.distanceM) : undefined
            }
            onPress={() => handlePressPlaceCard(p)}
          />
        ))}
      </View>

      {/* 모달 */}
      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={sortOptions}
        selected={sort}
        onSelect={handleSelectSort}
        onClose={() => setOpened(null)}
      />
      <OptionModal
        visible={opened === "save"}
        title="저장 방식"
        options={saveOptionsForModal}
        selected={saveType}
        onSelect={(next) => setSaveType(next)}
        onClose={() => setOpened(null)}
      />
      <OptionModal
        visible={opened === "category"}
        title="업종"
        options={categoryOptionsForModal}
        selected={category}
        onSelect={(next) => setCategory(next)}
        onClose={() => setOpened(null)}
      />
    </View>
  );
}
