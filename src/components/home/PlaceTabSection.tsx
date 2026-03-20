import { useState, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";

import FilterBar from "../bottomSheet/FilterBar";
import PlaceCard from "../common/PlaceCard";
import OptionModal from "../common/OptionModal";

import { type HomePlaceItem } from "./types";
import { useSearchStore } from "@/src/stores/useSearchStore";

const SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "거리순", value: "distance" },
] as const;

const CATEGORY_OPTIONS = [
  { label: "음식점", value: "restaurant" },
  { label: "술집", value: "bar" },
  { label: "전시회", value: "exhibition" },
  { label: "카페", value: "cafe" },
  { label: "디저트", value: "dessert" },
  { label: "소품샵", value: "gift_shop" },
  { label: "체험", value: "experience" },
  { label: "옷가게", value: "clothing_store" },
] as const;

type PlaceTabSectionProps = {
  placeList: HomePlaceItem[];
  onScrollDirection?: (direction: "up" | "down") => void;
};

const dummyCardFallbackImgs = [
  require("@/assets/images/example.png"),
  require("@/assets/images/react-logo.png"),
  require("@/assets/images/spot-icon-orange.png"),
];

export const PlaceTabSection = ({
  placeList,
  onScrollDirection,
}: PlaceTabSectionProps) => {
  const [category, setCategory] = useState<string[]>([]);
  const [sort, setSort] = useState<string[]>(["latest"]);
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );

  const lastOffsetYRef = useRef(0);

  const toggleBookmark = useSearchStore((s) => s.toggleBookmark);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort[0])?.label ?? "최신순";

  const categoryLabel =
    category.length > 0
      ? (CATEGORY_OPTIONS.find((option) => option.value === category[0])
          ?.label ?? "업종")
      : "업종";

  const visiblePlaceList = useMemo(() => {
    let next = [...placeList];

    if (category[0]) {
      next = next.filter((place) => place.list === category[0]);
    }

    if (sort[0] === "distance") {
      next.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return next;
  }, [placeList, category, sort]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastOffsetYRef.current;

    if (Math.abs(diff) < 16) return;

    if (currentY <= 0) {
      onScrollDirection?.("up");
      lastOffsetYRef.current = currentY;
      return;
    }

    onScrollDirection?.(diff > 0 ? "down" : "up");
    lastOffsetYRef.current = currentY;
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterBar
        sortLabel={sortLabel}
        categoryLabel={categoryLabel}
        onPressSort={() => setOpened("sort")}
        onPressCategory={() => setOpened("category")}
        showSaveType={false}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {visiblePlaceList.map((p) => {
          const imgs =
            Array.isArray(p.photos) && p.photos.length > 0
              ? p.photos.map((u) => ({ uri: u }))
              : dummyCardFallbackImgs;

          const savedUsers =
            Array.isArray(p.memPhotos) && p.memPhotos.length > 0
              ? p.memPhotos.slice(0, 3).map((u) => ({ uri: u }))
              : undefined;

          return (
            <PlaceCard
              key={String(p.id)}
              name={p.name}
              category={p.list}
              address={p.address}
              images={imgs as any[]}
              savedUsers={savedUsers as any[]}
              savedCount={p.savedCount}
              showDirectionButton={true}
              rating={p.rating}
              reviewCount={p.ratingCount}
              showBookmark={true}
              isBookmarked={p.marked}
              distanceText={
                typeof p.distance === "number"
                  ? p.distance >= 1000
                    ? `${(p.distance / 1000).toFixed(1)}km`
                    : `${Math.round(p.distance)}m`
                  : undefined
              }
              onToggleBookmark={() => toggleBookmark(p.id)}
              onPress={() =>
                router.push({
                  pathname: "/place/[placeId]",
                  params: {
                    placeId: String(p.id),
                    lat: p.lat,
                    lng: p.lng,
                  },
                })
              }
            />
          );
        })}
      </ScrollView>

      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={SORT_OPTIONS}
        selected={sort}
        onSelect={setSort}
        onClose={() => setOpened(null)}
      />

      <OptionModal
        visible={opened === "category"}
        title="업종"
        options={CATEGORY_OPTIONS}
        selected={category}
        onSelect={setCategory}
        onClose={() => setOpened(null)}
      />
    </View>
  );
};
