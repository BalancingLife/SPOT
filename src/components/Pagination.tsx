import React from "react";
import { Image, View, Text, Pressable, StyleSheet } from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPrev} disabled={currentPage === 1}>
        <Image
          source={require("@/assets/images/arrow-left-gray.png")}
          style={styles.leftArrow}
        />
      </Pressable>

      <Text style={styles.text}>
        <Text style={[TextStyles.Regular12, { color: "#FFFFFF" }]}>
          {currentPage}
        </Text>
        <Text style={{ color: Colors.gray_300 }}> | </Text>
        <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
          {totalPages}
        </Text>
      </Text>

      <Pressable onPress={onNext} disabled={currentPage === totalPages}>
        <Image
          source={require("@/assets/images/arrow-right-gray.png")}
          style={styles.rightArrow}
        ></Image>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: 71.92,
    height: 21.11,
    backgroundColor: "#0D0D0DB2",

    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftArrow: {
    width: 16.44,
    height: 16.44,
  },
  rightArrow: {
    width: 16.44,
    height: 16.44,
  },
});
