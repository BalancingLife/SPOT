import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ActivityIndicator, View, Pressable, Text } from "react-native";
import PlaceCard from "@/src/components/PlaceCard";
import type { SavedPlace } from "@/src/types/place";
import { fetchMySavedPlaces } from "@/src/lib/api/places";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

// 이미 만들어둔 컴포넌트들
import FilterBar from "@/src/components/bottomSheet/FilterBar";
import OptionModal from "@/src/components/OptionModal";

export default function SavedPlacesTab() {
  const [items, setItems] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 탭 로컬 필터 상태
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null
  );
  const [sort, setSort] = useState<string[]>(["recent"]); // 기본 최신순
  const [saveType, setSaveType] = useState<string[]>([]); // 비어있음 = 전체
  const [category, setCategory] = useState<string[]>([]); // 비어있음 = 전체

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
      { label: "소품샵", value: "gift_shop" },
      { label: "옷가게", value: "clothing_store" },
      { label: "기타", value: "etc" },
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
      ? saveOptions.find((o) => o.value === saveType[0])?.label || "저장방식"
      : "저장방식";
  const categoryLabel =
    category.length > 0
      ? categoryOptions.find((o) => o.value === category[0])?.label || "업종"
      : "업종";

  // ✅ 데이터 로드 (필터 변경 시 재호출)
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMySavedPlaces({
        lat: 37.125, // TODO: 실제 값으로 바인딩
        lng: 126.1234,
        userId: 139,
        // 서버 스펙에 맞게 변환: sort, saveType, category는 선택 시에만 전달
        sort: sort[0] === "recent" ? "latest" : "distance", // 예: 서버가 latest/distance라면 이런 매핑
        ...(saveType.length ? { saveType: saveType[0] } : {}),
        ...(category.length ? { category: category[0] } : {}),
      });
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [sort, saveType, category]);

  useEffect(() => {
    load();
  }, [load]);

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
        {/* 목록 */}
        {items.length === 0 && !loading ? (
          <View style={{ flex: 1, alignItems: "center", paddingTop: 150 }}>
            <Text
              style={[
                TextStyles.SemiBold16,
                { color: Colors.gray_300, fontSize: 20 },
              ]}
            >
              저장된 장소가 없어요.
            </Text>
            <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
              첫 장소를 저장하고, 여정을 시작해 보세요!
            </Text>
          </View>
        ) : null}

        {items.map((item) => {
          const imageSources =
            item.images && item.images.length > 0
              ? item.images.map((u) => ({ uri: u }))
              : [require("@/assets/images/example.png")];

          return (
            <PlaceCard
              key={item.id}
              name={item.title}
              category={item.category}
              address={item.address}
              images={imageSources}
              savedUsers={[]} // API 아직 없음
              savedCount={item.savedCount}
              showDirectionButton={true}
              rating={item.rating}
              reviewCount={0}
              showBookmark={false}
              isBookmarked={false}
            />
          );
        })}

        {loading && items.length > 0 ? (
          <ActivityIndicator style={{ marginTop: 8 }} />
        ) : null}
      </View>

      {/* ✅ 모달들: 단일 선택 + 즉시 적용 */}
      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={sortOptions}
        selected={sort}
        onSelect={(next) => setSort(next)}
        onClose={() => setOpened(null)}
      />
      <OptionModal
        visible={opened === "save"}
        title="저장 방식"
        options={saveOptionsForModal} // '전체' 제외
        selected={saveType}
        onSelect={(next) => setSaveType(next)}
        onClose={() => setOpened(null)}
      />
      <OptionModal
        visible={opened === "category"}
        title="업종"
        options={categoryOptionsForModal} // '전체' 제외
        selected={category}
        onSelect={(next) => setCategory(next)}
        onClose={() => setOpened(null)}
      />
    </View>
  );
}
