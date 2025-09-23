// src/components/bottomSheet/SavePlacesBottomSheet.tsx
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
  memo,
} from "react";
import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export type SavePlaceItem = {
  id: string;
  name: string;
  category: string;
  address: string;
  thumbUrl?: string;
};

type Props = {
  visible: boolean;
  places: SavePlaceItem[];
  maxSelect?: number;
  initialSelectedIds?: string[];
  onClose: () => void;
  onChangeSelection?: (ids: string[]) => void; // 부모에게 선택 변경 알려줌
  onConfirm?: (ids: string[]) => void; // 저장하기
};

const FOOTER_HEIGHT = 72;

function SavePlacesBottomSheet({
  visible,
  places,
  maxSelect = 10,
  initialSelectedIds = [],
  onClose,
  onChangeSelection,
  onConfirm,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // 고정 스냅포인트 (문자/퍼센트 혼용 가능)
  const snapPoints = useMemo(() => ["6.7%", "50%", "75%"], []);

  // 선택 상태 (Set)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds)
  );

  // 외부 visible 변화에 따라 열기
  useEffect(() => {
    if (visible) sheetRef.current?.snapToIndex(2);
  }, [visible]);

  // ===== 무한 업데이트 방지용: 콜백을 ref로 관리 =====
  const onChangeSelectionRef = useRef(onChangeSelection);
  useEffect(() => {
    onChangeSelectionRef.current = onChangeSelection;
  }, [onChangeSelection]);

  // 선택 배열 (selected가 바뀔 때만 새로 만듦)
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  // 선택이 바뀔 때만 부모에 알려주기
  useEffect(() => {
    onChangeSelectionRef.current?.(selectedIds);
  }, [selectedIds]);

  // (선택) 부모가 initialSelectedIds를 갱신해왔을 때 동기화하고 싶다면:

  const toggleOne = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (next.size >= maxSelect) {
            Alert.alert("선택 제한", `최대 ${maxSelect}개까지 선택 가능`);
            return prev;
          }
          next.add(id);
        }
        return next;
      });
    },
    [maxSelect]
  );

  const isAllChecked = selected.size > 0 && selected.size === places.length;

  const toggleAll = useCallback(() => {
    if (!places.length) return;
    setSelected(
      isAllChecked
        ? new Set()
        : new Set(places.map((p) => p.id).slice(0, maxSelect))
    );
  }, [isAllChecked, places, maxSelect]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(selectedIds);
    sheetRef.current?.close();
  }, [onConfirm, selectedIds]);

  // footer (메모)
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <View style={styles.footer}>
          <Pressable
            onPress={handleConfirm}
            style={[styles.cta, selectedIds.length === 0 && styles.ctaDisabled]}
            disabled={selectedIds.length === 0}
          >
            <Text style={styles.ctaText}>
              장소 {selectedIds.length}곳 저장하기
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [insets.bottom, selectedIds.length, handleConfirm]
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: Colors.white }}
      handleIndicatorStyle={{ backgroundColor: Colors.gray_300 }}
      footerComponent={renderFooter}
      enableDynamicSizing={false} // 내용 높이 때문에 스냅 초과 상승 방지
    >
      {/* 헤더 + 리스트를 한 덩어리로 (겹침 방지) */}
      <BottomSheetScrollView
        stickyHeaderIndices={[0]} // 헤더 고정하려면 유지
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: FOOTER_HEIGHT + insets.bottom, // 푸터 가림 방지
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 (이제 스크롤 내부의 첫 뷰) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>장소 선택하기</Text>
          <Text style={styles.headerSubTitle}>
            SPOT에 저장할 장소를 선택해주세요
          </Text>

          <View style={styles.rowBetween}>
            <Pressable onPress={toggleAll} style={styles.checkAll}>
              <View
                style={[
                  styles.checkbox,
                  isAllChecked && styles.checkboxChecked,
                ]}
              >
                {isAllChecked && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkAllText}>전체선택</Text>
            </Pressable>
            <Text style={TextStyles.Medium14}>
              {selectedIds.length} / {maxSelect}
            </Text>
          </View>
        </View>

        {/* 리스트 아이템들 */}
        {places.map((item) => {
          const checked = selected.has(item.id);
          return (
            <View key={item.id} style={styles.card}>
              <Image
                source={
                  item.thumbUrl
                    ? { uri: item.thumbUrl }
                    : require("@/assets/images/example.png")
                }
                style={styles.thumb}
              />
              <View style={styles.info}>
                <View style={styles.infoRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View style={styles.addressContainer}>
                  <Image
                    style={styles.addressIcon}
                    source={require("@/assets/images/marker-gray.png")}
                  ></Image>
                  <Text style={styles.itemAddress}>{item.address}</Text>
                </View>
              </View>
              <Pressable onPress={() => toggleOne(item.id)}>
                <View
                  style={[
                    styles.checkboxLarge,
                    checked && styles.checkboxChecked,
                  ]}
                >
                  {checked && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
              </Pressable>
            </View>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export default memo(SavePlacesBottomSheet);

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white, // sticky 시 밑 내용 비침 방지
    paddingVertical: 16,
  },
  headerTitle: {
    textAlign: "center",
    ...TextStyles.Bold16,
    color: Colors.gray_600,
  },
  headerSubTitle: {
    textAlign: "center",

    ...TextStyles.Regular12,
    color: Colors.gray_400,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  checkAll: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  thumb: {
    width: 80,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  itemName: {
    ...TextStyles.Bold16,
    color: Colors.gray_800,
    marginRight: 5,
  },
  itemCategory: {
    marginTop: 4,
    ...TextStyles.Regular10,
    color: Colors.gray_300,
  },
  addressContainer: {
    flexDirection: "row",
  },
  addressIcon: {
    marginTop: 3,
    width: 15,
    height: 15,
  },
  itemAddress: {
    ...TextStyles.Regular12,
    color: Colors.gray_800,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray_200,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxLarge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray_200,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#303030",
  },
  checkboxTick: {
    color: "#fff",
    fontWeight: "700",
  },
  checkAllText: {
    ...TextStyles.Medium14,
    color: Colors.gray_300,
  },
  footer: {
    paddingHorizontal: 16,
  },
  cta: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: "#EFEFEF",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
  },
});
