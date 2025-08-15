import { Pressable, View, Text, StyleSheet, Image } from "react-native";

import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

export default function FilterBar({
  sortLabel,
  saveTypeLabel,
  categoryLabel,
  onPressSort,
  onPressSaveType,
  onPressCategory,
}: {
  sortLabel: string;
  saveTypeLabel: string;
  categoryLabel: string;
  onPressSort: () => void;
  onPressSaveType: () => void;
  onPressCategory: () => void;
}) {
  return (
    <View style={styles.container}>
      {/* 정렬기준 */}

      <Pressable onPress={onPressSort}>
        <View style={styles.filterView}>
          <Text style={styles.filterText}>{sortLabel}</Text>
          <Image
            style={styles.filterImage}
            source={require("@/assets/images/arrow-down-gray.png")}
          />
        </View>
      </Pressable>

      {/* 저장방식 */}
      <Pressable onPress={onPressSaveType}>
        <View style={styles.filterView}>
          <Text style={styles.filterText}>{saveTypeLabel}</Text>
          <Image
            style={styles.filterImage}
            source={require("@/assets/images/arrow-down-gray.png")}
          />
        </View>
      </Pressable>

      {/* 업종 */}
      <Pressable onPress={onPressCategory}>
        <View style={styles.filterView}>
          <Text style={styles.filterText}>{categoryLabel}</Text>
          <Image
            style={styles.filterImage}
            source={require("@/assets/images/arrow-down-gray.png")}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 16,
    marginTop: 15,
    paddingBottom: 6,
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
    width: 24,
    height: 24,
  },
});
