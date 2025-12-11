// src/components/bottomSheet/SearchDetailBottomSheet.tsx
import React, { useMemo, useRef } from "react";
import { StyleSheet, Linking } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { useSearchStore } from "@/src/stores/useSearchStore";
import { Colors } from "@/src/styles/Colors";
import PlaceCard from "@/src/components/PlaceCard";
import { formatDistance } from "@/src/utils/format"; // ✅ 공통 util 사용

type Props = { onClose: () => void };

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

  const distanceText = useMemo(() => {
    if (!focused?.distanceM) return undefined;
    return formatDistance(focused.distanceM);
  }, [focused]);

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
    category,
  } = focused;

  const categoryLabel = category ?? "";
  const savedCount = focused.savers?.length ?? 0;

  return (
    <BottomSheet
      ref={sheetRef}
      enableDynamicSizing
      index={0}
      enablePanDownToClose
      enableOverDrag={false}
      onClose={handleClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={{ backgroundColor: Colors.gray_300 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PlaceCard
          name={name}
          category={categoryLabel}
          address={address ?? ""}
          images={images}
          savedUsers={savedUsers}
          savedCount={savedCount}
          showDirectionButton={true}
          rating={ratingAvg ?? undefined}
          reviewCount={ratingCount ?? undefined}
          showBookmark={true}
          isBookmarked={!!isBookmarked}
          distanceText={distanceText}
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
