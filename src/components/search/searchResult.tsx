// components/searchResult.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
} from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import type { SearchResultItem } from "@/app/search";

type Props = {
  data: SearchResultItem[];
  onPressItem: (item: SearchResultItem) => void;
};

function formatDistance(meters: number) {
  // 요청: 1000m 넘어갈 때만 km
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${Math.round(meters)}m`;
}

export default function SearchResult({ data, onPressItem }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.gid}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Pressable onPress={() => onPressItem(item)} style={styles.row}>
          <Image
            source={
              item.photoUrl
                ? { uri: item.photoUrl }
                : require("@/assets/images/x-gray.png")
            }
            style={styles.thumb}
          />

          <View style={styles.textWrap}>
            <Text style={TextStyles.Bold16} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={styles.addressView}>
              <Image source={require("@/assets/images/marker-gray.png")} />
              <Text
                style={[TextStyles.Regular12, { color: Colors.gray_800 }]}
                numberOfLines={1}
              >
                {item.address}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[TextStyles.Regular10, styles.badge]}>
                {item.category}
              </Text>
              <Text style={[TextStyles.Bold12, { color: Colors.gray_300 }]}>
                {formatDistance(item.distance)}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text
          style={[
            TextStyles.Medium16,
            { color: Colors.gray_500, paddingVertical: 24 },
          ]}
        >
          검색 결과가 없어요.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray_100,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.gray_100,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  addressView: {
    flexDirection: "row",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    color: Colors.gray_700,
    backgroundColor: Colors.gray_100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
