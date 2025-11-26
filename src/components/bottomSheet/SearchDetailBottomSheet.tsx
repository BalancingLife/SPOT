// src/components/bottomSheet/SearchDetailBottomSheet.tsx
import React, { useMemo, useRef } from "react";
import { StyleSheet, Linking } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { useSearchStore } from "@/src/stores/useSearchStore";
import { Colors } from "@/src/styles/Colors";
import PlaceCard from "@/src/components/PlaceCard";

type Props = { onClose: () => void };

function formatDistance(m?: number) {
  if (m == null || !isFinite(m)) return null;
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${Math.round(m)}m`;
}

export default function SearchDetailBottomSheet({ onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const focused = useSearchStore((s) => s.focused);
  const unfocus = useSearchStore((s) => s.unfocus);
  const toggleBookmark = useSearchStore((s) => s.toggleBookmark);

  const images = useMemo(() => {
    if (!focused) return [];
    const arr =
      focused.thumbnails && focused.thumbnails.length > 0
        ? focused.thumbnails
        : focused.photo
        ? [focused.photo]
        : [];
    return arr.slice(0, 5).map((uri) => ({ uri }));
  }, [focused]);

  const savedUsers = useMemo(() => {
    if (!focused?.savers) return [];
    return focused.savers.slice(0, 6).map((s) => ({ uri: s.profileImageUrl }));
  }, [focused]);

  const distanceText = useMemo(
    () => formatDistance(focused?.distanceM),
    [focused]
  );

  const openNaverDirection = () => {
    if (!focused) return;
    const { lat, lng, name } = focused;
    if (!isFinite(lat) || !isFinite(lng)) return;

    const url = `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(
      name || "목적지"
    )}`;
    Linking.openURL(url).catch(() => {
      const web = `https://map.naver.com/v5/search/${encodeURIComponent(
        name || ""
      )}`;
      Linking.openURL(web);
    });
  };

  const handleClose = () => {
    unfocus();
    onClose?.();
  };

  if (!focused) return null;

  const {
    placeId,
    name,
    address,
    ratingAvg,
    ratingCount,
    isBookmarked,
    categoryPath,
  } = focused;

  const category =
    (categoryPath && categoryPath.length > 0 ? categoryPath.join(" > ") : "") ??
    "";

  const savedCount = focused.savers?.length ?? 0;

  return (
    <BottomSheet
      ref={sheetRef}
      enableDynamicSizing // ✅ 내용물 높이에 맞춰서 자동 조절
      index={0} // 첫 오픈시 내용물 높이로 열림
      enablePanDownToClose
      enableOverDrag={false} // 위로 더 못 당기게
      onClose={handleClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={{ backgroundColor: Colors.gray_300 }}
    >
      {/* 본문 */}
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PlaceCard
          name={name}
          category={category}
          address={address ?? ""}
          images={images}
          savedUsers={savedUsers}
          savedCount={savedCount}
          showDirectionButton={true}
          rating={ratingAvg ?? undefined}
          reviewCount={ratingCount ?? undefined}
          showBookmark={true}
          isBookmarked={!!isBookmarked}
          distanceText={distanceText ?? undefined}
          onToggleBookmark={() => toggleBookmark(placeId)}
          onPressDirection={openNaverDirection}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
