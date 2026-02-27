import React from "react";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { Colors } from "../../styles/Colors";

type Props = {
  onPress: () => void;
};

export default function CommentWriteButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.button}>
        <Image
          source={require("@/assets/images/pencil-white.png")}
          style={styles.icon}
        ></Image>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: Colors.primary_500,
    justifyContent: "center",
    alignItems: "center",

    // 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },

  icon: {
    width: 15,
    height: 15,
    tintColor: "#fff",
  },
});
