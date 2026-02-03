import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onPress: () => void;
  left?: number;
  bottom?: number;
};

export default function MyLocationButton({
  onPress,
  left = 16.5,
  bottom = 70,
}: Props) {
  // press scale
  const pressScale = useSharedValue(1);

  // flash
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(1);

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const flashAnimStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  const handlePress = () => {
    // scale: 1 → 0.92 → 1
    pressScale.value = withSequence(
      withTiming(0.92, { duration: 90 }),
      withTiming(1, { duration: 90 }),
    );

    // flash
    flashScale.value = 1;
    flashOpacity.value = 0;

    flashScale.value = withSequence(
      withTiming(1.12, { duration: 120 }),
      withTiming(1.2, { duration: 120 }),
    );
    flashOpacity.value = withSequence(
      withTiming(0.22, { duration: 100 }),
      withDelay(80, withTiming(0, { duration: 140 })),
    );

    onPress?.();
  };

  return (
    <View style={[styles.wrapper, { left, bottom }]} pointerEvents="box-none">
      <Pressable onPress={handlePress} style={styles.myLocationButton}>
        {/* flash layer */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.flashLayer,
            flashAnimStyle,
          ]}
        />
        {/* icon + scale */}
        <Animated.View style={contentAnimStyle}>
          <Image
            source={require("@/assets/images/myLocation.png")}
            style={{ width: 24, height: 24 }}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    zIndex: 20, // 지도 위로
  },
  myLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden",
  },
  flashLayer: {
    borderRadius: 100,
    backgroundColor: "rgba(255, 127, 0, 0.25)",
  },
});
