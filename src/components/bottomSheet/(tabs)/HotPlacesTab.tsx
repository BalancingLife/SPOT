import React from "react";
import { FlatList } from "react-native";
import PlaceCard from "@/src/components/bottomSheet/PlaceCard";

const dummyData = new Array(5).fill(0).map((_, i) => ({
  name: `장소 이름${i + 1}`,
  category: "카페 / 베이커리",
  address: `서울 주소구 주소동 ${123 + i}-1`,
  images: [
    require("@/assets/images/spot-icon-orange.png"),
    require("@/assets/images/react-logo.png"),
    require("@/assets/images/spot-icon-orange.png"),
  ],
  savedUsers: [
    require("@/assets/images/spot-icon-orange.png"),
    require("@/assets/images/react-logo.png"),
  ],
  savedCount: 4 + i,
}));

export default function HotPlacesTab() {
  return (
    <FlatList
      data={dummyData}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => <PlaceCard {...item} />}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
