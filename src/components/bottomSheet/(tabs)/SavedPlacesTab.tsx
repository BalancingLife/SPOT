import React from "react";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import PlaceCard from "@/src/components/PlaceCard";

const dummyData = new Array(2).fill(0).map((_, i) => ({
  name: `장소 이름${i + 1}`,
  category: "카페 / 베이커리",
  address: `서울 주소구 주소동 ${123 + i}-1`,
  images: [
    require("@/assets/images/example.png"),
    require("@/assets/images/react-logo.png"),
    require("@/assets/images/spot-icon-orange.png"),
  ],
  savedUsers: [
    require("@/assets/images/spot-icon-orange.png"),
    require("@/assets/images/react-logo.png"),
  ],
  savedCount: 4 + i,
}));

export default function SavedPlacesTab() {
  return (
    <BottomSheetFlatList
      data={dummyData}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => <PlaceCard {...item} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
