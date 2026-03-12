import { useEffect } from "react";
import { ActivityIndicator, NativeModules, Text, View } from "react-native";
import { router } from "expo-router";

import { useAnalyzeResultStore } from "@/src/stores/useAnalyzeResultStore";
import type { SavePlaceItem } from "@/src/components/bottomSheet/SavePlacesBottomSheet";

type AnalyzeApiResult = {
  id?: number;
  name?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
};

type AnalyzeApiResponse = {
  results?: (AnalyzeApiResult | AnalyzeApiResult[])[];
};

function normalizeResults(
  results: AnalyzeApiResponse["results"],
): AnalyzeApiResult[] {
  if (!Array.isArray(results)) return [];

  return results.flatMap((item) => {
    if (Array.isArray(item)) return item;
    if (item && typeof item === "object") return [item];
    return [];
  });
}

function mapAnalyzeJsonToItems(json: string): SavePlaceItem[] {
  console.log("[analyze-result] mapAnalyzeJsonToItems raw:", json);

  const parsed = JSON.parse(json) as AnalyzeApiResponse;
  const normalized = normalizeResults(parsed?.results);

  console.log("[analyze-result] normalized results:", normalized);

  const mapped = normalized
    .filter((item) => {
      const ok = !!item.name && !!item.address;
      if (!ok) {
        console.log("[analyze-result] 필터 제외 item:", item);
      }
      return ok;
    })
    .map((item, index) => {
      const lat = item.latitude ?? 0;
      const lng = item.longitude ?? 0;
      const stableId =
        item.id != null
          ? String(item.id)
          : `${index}_${item.name}_${lat}_${lng}`;

      return {
        id: stableId,
        name: item.name ?? "이름 없음",
        category: item.category ?? "unknown",
        address: item.address ?? "주소 없음",
        thumbUrl: item.photo,
      };
    });

  console.log("[analyze-result] mapped items:", mapped);

  return mapped;
}

export default function AnalyzeResultPage() {
  useEffect(() => {
    const run = async () => {
      console.log("[analyze-result] 진입");

      try {
        const { SharedStore } = NativeModules;

        console.log("[analyze-result] NativeModules.SharedStore:", SharedStore);

        if (!SharedStore?.getLatestAnalyzeResult) {
          console.log(
            "[analyze-result] SharedStore.getLatestAnalyzeResult 없음",
          );
          router.replace("/(tabs)/map");
          return;
        }

        const json = await SharedStore.getLatestAnalyzeResult();
        console.log("[analyze-result] getLatestAnalyzeResult 결과:", json);

        if (!json) {
          console.log("[analyze-result] 저장된 analyze 결과 없음");
          router.replace("/(tabs)/map");
          return;
        }

        const items = mapAnalyzeJsonToItems(json);
        console.log("[analyze-result] 최종 items 길이:", items.length);

        if (items.length > 0) {
          console.log("[analyze-result] openWithPlaces 호출 직전");
          useAnalyzeResultStore.getState().openWithPlaces(items, {
            receivedAt: Date.now(),
          });

          const stateAfterOpen = useAnalyzeResultStore.getState();
          console.log("[analyze-result] store after open:", {
            visible: stateAfterOpen.visible,
            places: stateAfterOpen.places,
            meta: stateAfterOpen.meta,
          });
        } else {
          console.log("[analyze-result] items가 0개라 store open 안 함");
        }

        if (SharedStore?.clearLatestAnalyzeResult) {
          await SharedStore.clearLatestAnalyzeResult();
          console.log("[analyze-result] clearLatestAnalyzeResult 완료");
        }

        console.log("[analyze-result] /(tabs)/map 으로 이동");
        router.replace("/(tabs)/map");
      } catch (error) {
        console.log("[analyze-result] 처리 실패:", error);
        router.replace("/(tabs)/map");
      }
    };

    run();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <ActivityIndicator />
      <Text style={{ marginTop: 12 }}>분석 결과를 불러오는 중...</Text>
    </View>
  );
}
