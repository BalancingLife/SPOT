// src/components/comment/CommentActionBar.tsx
import React from "react";
import { View, Pressable, Text, Image, StyleSheet } from "react-native";
import { TextStyles } from "../../styles/TextStyles";
import { Colors } from "../../styles/Colors";

type Props = {
  visibilityLabel: string;
  visibilityIcon: any;

  onPressVisibility: () => void;

  ratingLabel: string;
  onPressRating: () => void;

  length: number;
  maxLength: number;

  submitDisabled: boolean;
  onSubmit: () => void;
};

export default function CommentActionBar({
  visibilityLabel,
  onPressVisibility,
  ratingLabel,
  onPressRating,
  length,
  maxLength,
  submitDisabled,
  onSubmit,
  visibilityIcon,
}: Props) {
  return (
    <View style={styles.bottomRow}>
      {/* LEFT */}
      <View style={styles.bottomLeft}>
        <Pressable
          style={styles.leftChip}
          onPress={onPressVisibility}
          hitSlop={8}
        >
          <Image source={visibilityIcon} style={{ width: 20, height: 20 }} />
          <Text style={styles.leftChipText}>{visibilityLabel}</Text>
        </Pressable>

        <View style={styles.verticalDivider} />

        <Pressable style={styles.leftChip} onPress={onPressRating} hitSlop={8}>
          <Image
            source={require("@/assets/images/star-orange.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={styles.leftChipText}>{ratingLabel}</Text>
        </Pressable>
      </View>

      {/* RIGHT */}
      <View style={styles.bottomRight}>
        <Text style={styles.lengthText}>
          {length}
          <Text style={styles.lengthMaxText}> / {maxLength}</Text>
        </Text>

        <Pressable
          style={[
            styles.submitButton,
            submitDisabled && styles.submitButtonDisabled,
          ]}
          disabled={submitDisabled}
          onPress={onSubmit}
          hitSlop={8}
        >
          <Text style={styles.submitButtonText}>게시</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  bottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: "#E5E5E5",
  },
  leftChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 12,
  },
  leftChipText: {
    ...TextStyles.Medium14,
    color: Colors.gray_800,
  },
  bottomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lengthText: {
    ...TextStyles.Bold12,
    color: Colors.gray_800,
  },
  lengthMaxText: {
    ...TextStyles.Regular12,
    color: Colors.gray_300,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#FF6A00",
  },
  submitButtonDisabled: {
    backgroundColor: "#D3D3D3",
  },
  submitButtonText: {
    ...TextStyles.Medium14,
    color: Colors.white,
  },
});
