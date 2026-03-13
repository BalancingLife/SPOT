import { router } from "expo-router";
import { StyleSheet, Pressable, Image, Text } from "react-native";

import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

export const MapSearchBar = () => {
  return (
    <Pressable
      style={styles.searchInput}
      onPress={() => router.push("/searchPlace")}
    >
      <Image
        source={require("@/assets/images/search-input-icon-gray.png")}
        style={styles.searchIcon}
      />
      <Text style={[TextStyles.Medium16, { color: Colors.gray_300 }]}>
        지역, 상호명을 검색해보세요
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    position: "absolute",
    top: 60,
    left: 17,
    right: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },

  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 9,
  },
});
