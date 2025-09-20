import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import PlaceCard from "@/src/components/PlaceCard";
import FilterBar from "@/src/components/bottomSheet/FilterBar";
import OptionModal from "@/src/components/OptionModal";

const dummyData = new Array(4).fill(0).map((_, i) => ({
  name: `장소 이름${i + 1}`,
  category: "카페 / 베이커리",
  address: `서울 주소구 주소동 ${123 + i}-1`,
  images: [
    require("@/assets/images/example.png"),
    require("@/assets/images/react-logo.png"),
    require("@/assets/images/spot-icon-orange.png"),
  ],
  savedUsers: [
    require("@/assets/images/spot-icon-orange.png"),
    require("@/assets/images/react-logo.png"),
  ],
  savedCount: 4 + i,
  rating: 4.5,
  reviewCount: 199,
  showBookmark: true,
  isBookmarked: true,
}));

export default function HotPlacesTab() {
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
    sortOptions.find((o) => o.value === sort[0])?.label ?? "최신순";
  const categoryLabel =
    category.length > 0
      ? categoryOptions.find((o) => o.value === category[0])?.label ?? "업종"
      : "업종";

  // ⚠️ 지금은 더미 데이터라 필터 적용 로직은 생략.
  // 실제 API 연동 시, sort/saveType/category 변경에 맞춰 refetch 또는 클라이언트 필터링을 수행하면 됨.

  return (
    <View style={{ flex: 1 }}>
      {/* 필터 바 */}
      <FilterBar
        sortLabel={sortLabel}
        categoryLabel={categoryLabel}
        onPressSort={() => setOpened("sort")}
        onPressCategory={() => setOpened("category")}
        showSaveType={false}
      />

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {dummyData.map((item, index) => (
          <PlaceCard key={index} {...item} showDirectionButton={true} />
        ))}
      </BottomSheetScrollView>

      {/* ✅ 모달: 단일 선택 + 즉시 적용, '전체'는 모달에서 숨김 */}
      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={sortOptions}
        selected={sort}
        onSelect={(next) => setSort(next)}
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
