import { View, StyleSheet } from "react-native";
import { NaverMapView } from "@mj-studio/react-native-naver-map";

export default function Home() {
  return (
    <View style={styles.container}>
      <NaverMapView style={styles.map}></NaverMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
