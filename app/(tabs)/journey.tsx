import React, { useMemo, useState } from "react";
import { Button, View } from "react-native";
import SavePlacesBottomSheet, {
  SavePlaceItem,
} from "@/src/components/bottomSheet/SavePlacesBottomSheet";

export default function Journey() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const dummyPlaces = useMemo(
    () => [
      {
        id: "1",
        name: "상호명예시 1",
        category: "카페",
        address: "서울 주소구 주소동 123-1",
        thumbUrl:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&q=80",
      },
      {
        id: "2",
        name: "상호명예시 2",
        category: "식당",
        address: "서울 주소구 주소동 456-7",
      },
      {
        id: "3",
        name: "상호명예시 3",
        category: "베이커리",
        address: "서울 주소구 주소동 999-1",
      },

      {
        id: "4",
        name: "상호명예시 4",
        category: "카페",
        address: "서울 주소구 주소동 123-1",
        thumbUrl:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&q=80",
      },
      {
        id: "5",
        name: "상호명예시 5",
        category: "식당",
        address: "서울 주소구 주소동 456-7",
      },
      {
        id: "6",
        name: "상호명예시 6",
        category: "베이커리",
        address: "서울 주소구 주소동 999-1",
      },
      {
        id: "7",
        name: "상호명예시 7",
        category: "카페",
        address: "서울 주소구 주소동 123-1",
        thumbUrl:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&q=80",
      },
      {
        id: "8",
        name: "상호명예시 8",
        category: "식당",
        address: "서울 주소구 주소동 456-7",
      },
      {
        id: "9",
        name: "상호명예시 9",
        category: "베이커리",
        address: "서울 주소구 주소동 999-1",
      },
    ],
    []
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="장소 선택하기 열기" onPress={() => setVisible(true)} />

      <SavePlacesBottomSheet
        visible={visible}
        places={dummyPlaces}
        maxSelect={10}
        initialSelectedIds={["1"]}
        onClose={() => setVisible(false)}
        onChangeSelection={(ids) => setSelected(ids)}
        onConfirm={(ids) => {
          console.log("최종 선택:", ids);
          setSelected(ids);
          setVisible(false);
        }}
      />
    </View>
  );
}
