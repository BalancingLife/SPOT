import React from "react";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import PlaceCard from "@/src/components/PlaceCard";

const dummyData = new Array(4).fill(0).map((_, i) => ({
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
  rating: 4.5,
  reviewCount: 199,
  showBookmark: true,
  isBookmarked: true,
}));

export default function HotPlacesTab() {
  return (
    <BottomSheetScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {dummyData.map((item, index) => (
        <PlaceCard key={index} {...item} showDirectionButton={true} />
      ))}
    </BottomSheetScrollView>
  );
}
