// src/components/bottomSheet/SearchDetailsBottomSheet.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import { useSearchStore } from "@/src/stores/useSearchStore";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import PlaceCard from "@/src/components/PlaceCard";

type Props = {
  onClose: () => void; // 검색 모드 종료(Places 시트로 복귀)
  onPressItem?: (placeId: string) => void; // 카드 선택 시 지도 카메라 이동 등
};

export default function SearchDetailsBottomSheet({
  onClose,
  onPressItem,
}: Props) {
  const phase = useSearchStore((s) => s.phase);
  const items = useSearchStore((s) => s.items);
  const error = useSearchStore((s) => s.error);
  const focus = useSearchStore((s) => s.focus);

  // ----- 공통 헤더 -----
  const Header = (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Image
          source={require("@/assets/images/search-input-icon-black.png")}
          style={{ width: 18, height: 18, marginTop: 1 }}
        />
        <Text style={TextStyles.SemiBold16}>검색 결과</Text>
      </View>

      <Pressable onPress={onClose} hitSlop={10}>
        <Image
          source={require("@/assets/images/x-gray.png")}
          style={{ width: 20, height: 20 }}
        />
      </Pressable>
    </View>
  );

  // ----- 상태별 렌더 -----
  if (phase === "loading") {
    return (
      <View style={styles.sheet}>
        {Header}
        <View style={styles.centerWrap}>
          <ActivityIndicator />
          <Text
            style={[
              TextStyles.Medium14,
              { color: Colors.gray_500, marginTop: 8 },
            ]}
          >
            검색 중…
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "error") {
    return (
      <View style={styles.sheet}>
        {Header}
        <View style={styles.centerWrap}>
          <Text style={TextStyles.Medium16}>문제가 발생했어요</Text>
          {!!error && (
            <Text
              style={[
                TextStyles.Regular12,
                { color: Colors.gray_500, marginTop: 6 },
              ]}
              numberOfLines={2}
            >
              {error}
            </Text>
          )}
          <Text
            style={[
              TextStyles.Regular12,
              { color: Colors.gray_400, marginTop: 12 },
            ]}
          >
            검색어를 바꾸거나 잠시 후 다시 시도해 주세요.
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "empty") {
    return (
      <View style={styles.sheet}>
        {Header}
        <View style={styles.centerWrap}>
          <Text style={TextStyles.Medium16}>검색 결과가 없어요</Text>
          <Text
            style={[
              TextStyles.Regular12,
              { color: Colors.gray_400, marginTop: 8 },
            ]}
          >
            키워드를 바꿔보거나 위치를 이동해보세요.
          </Text>
        </View>
      </View>
    );
  }

  // ----- success: 리스트 렌더 -----
  return (
    <View style={styles.sheet}>
      {Header}

      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
        renderItem={({ item: p }) => {
          // Place -> PlaceCard props 매핑
          const category =
            (p as any).categoryPath?.join(" > ") ?? (p as any).list ?? ""; // 서버에서 list:string 올 수도 있음
          const images =
            p.thumbnails && p.thumbnails.length > 0
              ? p.thumbnails.slice(0, 5).map((uri) => ({ uri }))
              : p.photo
              ? [{ uri: p.photo }]
              : []; // 이미지 없을 때는 빈 배열
          const savedUsers =
            p.savers && p.savers.length > 0
              ? p.savers.slice(0, 3).map((s) => ({ uri: s.profileImageUrl }))
              : [];
          const savedCount = p.savers ? p.savers.length : 0;

          return (
            <Pressable
              onPress={() => {
                onPressItem?.(p.id); // 지도 이동
                focus(p); // 단일 상세 시트 전환 준비
              }}
              style={{ paddingVertical: 2 }}
            >
              <PlaceCard
                name={p.name}
                category={category}
                address={p.address ?? ""}
                images={images}
                savedUsers={savedUsers}
                savedCount={savedCount}
                showDirectionButton={true}
                rating={p.ratingAvg ?? undefined}
                reviewCount={p.ratingCount ?? undefined}
                showBookmark={false}
                isBookmarked={p.isBookmarked}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "70%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
    // 그림자
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  centerWrap: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
