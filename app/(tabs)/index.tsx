import { Text, View, StyleSheet, Image } from "react-native";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Text>홈 페이지입니다.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
