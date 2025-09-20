import { Pressable, View, Text, StyleSheet, Image } from "react-native";

import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import type { FilterBarProps } from "@/src/types";

export default function FilterBar({
  sortLabel = "정렬",
  saveTypeLabel = "저장방식",
  categoryLabel = "업종",
  onPressSort,
  onPressSaveType,
  onPressCategory,
  showSort = true,
  showSaveType = true,
  showCategory = true,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      {/* 정렬기준 */}
      {showSort && (
        <Pressable onPress={onPressSort}>
          <View style={styles.filterView}>
            <Text style={styles.filterText}>{sortLabel}</Text>
            <Image
              style={styles.filterImage}
              source={require("@/assets/images/arrow-down-gray.png")}
            />
          </View>
        </Pressable>
      )}

      {showSaveType && (
        <Pressable onPress={onPressSaveType}>
          <View style={styles.filterView}>
            <Text style={styles.filterText}>{saveTypeLabel}</Text>
            <Image
              style={styles.filterImage}
              source={require("@/assets/images/arrow-down-gray.png")}
            />
          </View>
        </Pressable>
      )}

      {showCategory && (
        <Pressable onPress={onPressCategory}>
          <View style={styles.filterView}>
            <Text style={styles.filterText}>{categoryLabel}</Text>
            <Image
              style={styles.filterImage}
              source={require("@/assets/images/arrow-down-gray.png")}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 16,
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#E6E6E680",
  },
  filterView: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  filterText: {
    ...TextStyles.Medium14,
    color: Colors.gray_900,
    marginRight: 3,
  },
  filterImage: {
    marginLeft: 6,
    width: 24,
    height: 24,
  },
});
