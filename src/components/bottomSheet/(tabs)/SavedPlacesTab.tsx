import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View, Pressable, Text } from "react-native";
import PlaceCard from "@/src/components/PlaceCard";
import type { SavedPlace } from "@/src/types/place";
import { fetchMySavedPlaces } from "@/src/lib/api/places";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export default function SavedPlacesTab() {
  const [items, setItems] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMySavedPlaces({
        lat: 37.125, // TODO: 실제 값으로 바인딩
        lng: 126.1234,
        userId: 90,
        sort: "latest",
      });
      console.log(res);

      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && items.length === 0) {
    return <ActivityIndicator style={{ marginVertical: 12 }} />;
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      {/* 에러 표시 (간단버전) */}
      {error ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
            {error}
          </Text>
          <Pressable
            onPress={load}
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: Colors.gray_100,
              borderRadius: 6,
              marginTop: 6,
            }}
          >
            <Text style={TextStyles.Regular12}>다시 불러오기</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 목록 */}
      {items.length === 0 && !loading ? (
        <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
          저장한 장소가 없어요.
        </Text>
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
            rating={item.rating} // ⭐ 숫자만 표시 (별 이미지는 컴포넌트에 이미 있음)
            reviewCount={0} // 일단 0으로
            showBookmark={false}
            isBookmarked={false}
          />
        );
      })}

      {/* 하단 로딩(추가 요청 없지만, 최초 이후 재요청 시 표시용) */}
      {loading && items.length > 0 ? (
        <ActivityIndicator style={{ marginTop: 8 }} />
      ) : null}
    </View>
  );
}
