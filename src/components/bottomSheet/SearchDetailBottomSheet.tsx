// src/components/bottomSheet/SearchDetailBottomSheet.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { useSearchStore } from "@/src/stores/useSearchStore";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

type Props = { onClose: () => void };

function formatDistance(m?: number) {
  if (m == null || !isFinite(m)) return null;
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${Math.round(m)}m`;
}

export default function SearchDetailBottomSheet({ onClose }: Props) {
  const focused = useSearchStore((s) => s.focused);
  const unfocus = useSearchStore((s) => s.unfocus);

  // ✅ 훅은 항상 같은 순서로 호출
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

  // ✅ UI에서만 조건부 렌더 처리 (훅은 위에서 이미 호출됨)
  if (!focused) return null;

  const { name, address, ratingAvg, ratingCount, isBookmarked } = focused;

  return (
    <View style={styles.sheet}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={TextStyles.SemiBold16}>장소 상세</Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Image
            source={require("@/assets/images/x-gray.png")}
            style={{ width: 20, height: 20 }}
          />
        </Pressable>
      </View>

      {/* 바디 */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 이름/평점/북마크 */}
        <View style={styles.row}>
          <Text
            style={[TextStyles.SemiBold20, { flexShrink: 1 }]}
            numberOfLines={2}
          >
            {name}
          </Text>

          {ratingAvg != null && ratingCount != null && (
            <View style={styles.ratingBox}>
              <Image
                style={styles.starImg}
                source={require("@/assets/images/star-orange.png")}
              />
              <Text style={[TextStyles.Medium12, { marginLeft: 3 }]}>
                {ratingAvg.toFixed(1)}
              </Text>
              <Text
                style={[
                  TextStyles.Regular12,
                  { color: Colors.gray_400, marginLeft: 3 },
                ]}
              >
                ({ratingCount.toLocaleString()})
              </Text>
            </View>
          )}

          <Image
            source={
              isBookmarked
                ? require("@/assets/images/bookmark-orange.png")
                : require("@/assets/images/bookmark-orange-empty.png")
            }
            style={styles.bookmarkIcon}
          />
        </View>

        {/* 주소/거리 */}
        {!!address && (
          <View style={[styles.row, { marginTop: 6 }]}>
            <Image
              style={styles.marker}
              source={require("@/assets/images/placecard-marker.png")}
            />
            <Text
              style={[
                TextStyles.Regular12,
                { color: Colors.gray_900, flexShrink: 1 },
              ]}
              numberOfLines={2}
            >
              {address}
            </Text>
            {!!distanceText && (
              <Text
                style={[
                  TextStyles.Regular12,
                  { color: Colors.gray_400, marginLeft: 8 },
                ]}
              >
                {distanceText}
              </Text>
            )}
          </View>
        )}

        {/* 이미지 가로 스크롤 */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
          >
            {images.map((img, idx) => (
              <Image key={idx} source={img} style={styles.image} />
            ))}
          </ScrollView>
        )}

        {/* 저장한 사람들 아바타 */}
        {savedUsers.length > 0 && (
          <View style={[styles.row, { marginTop: 14 }]}>
            <View style={styles.avatarGroup}>
              {savedUsers.map((img, i) => (
                <Image
                  key={i}
                  source={img}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]}
                />
              ))}
            </View>
            <Text
              style={[
                TextStyles.Regular12,
                { color: Colors.gray_600, marginLeft: 6 },
              ]}
            >
              {(focused.savers?.length ?? 0).toLocaleString()}명이 저장했어요
            </Text>
          </View>
        )}

        {/* 버튼들 */}
        <View style={[styles.rowBetween, { marginTop: 16 }]}>
          <Pressable style={styles.navBtn} onPress={openNaverDirection}>
            <Image
              source={require("@/assets/images/naver-map-icon.png")}
              style={styles.navIcon}
            />
            <Text style={TextStyles.Regular12}>네이버 지도 길찾기</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleClose}>
            <Text style={TextStyles.Medium12}>닫기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "75%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ratingBox: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  starImg: { width: 14, height: 14 },
  bookmarkIcon: { width: 24, height: 24, marginLeft: 8 },

  marker: { width: 12.15, height: 12.15, marginRight: 4 },
  image: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: Colors.gray_100,
  },

  avatarGroup: { flexDirection: "row" },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },

  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.75,
    borderColor: Colors.gray_100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  navIcon: { width: 12, height: 12 },

  secondaryBtn: {
    backgroundColor: Colors.gray_100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
