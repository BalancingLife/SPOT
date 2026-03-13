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
  const parsed = JSON.parse(json) as AnalyzeApiResponse;
  const normalized = normalizeResults(parsed?.results);

  return normalized
    .filter((item) => !!item.name && !!item.address)
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
}

export default function AnalyzeResultPage() {
  useEffect(() => {
    const run = async () => {
      try {
        const { SharedStore } = NativeModules;

        if (!SharedStore?.getLatestAnalyzeResult) {
          router.replace("/(tabs)/map");
          return;
        }

        const json = await SharedStore.getLatestAnalyzeResult();

        if (!json) {
          router.replace("/(tabs)/map");
          return;
        }

        const items = mapAnalyzeJsonToItems(json);

        if (items.length > 0) {
          useAnalyzeResultStore.getState().openWithPlaces(items, {
            receivedAt: Date.now(),
          });
        }

        if (SharedStore?.clearLatestAnalyzeResult) {
          await SharedStore.clearLatestAnalyzeResult();
        }

        router.replace("/(tabs)/map");
      } catch {
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
