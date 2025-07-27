import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";

export default function Home() {
  const mapRef = useRef<NaverMapViewRef>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        mapRef.current?.setLocationTrackingMode("Follow");
      } else {
        console.log("위치 권한이 거부되었습니다.");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        isShowLocationButton={true}
        style={styles.map}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
