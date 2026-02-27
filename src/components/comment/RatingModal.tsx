import React from "react";
import { Modal, Pressable, View, Text, Image, StyleSheet } from "react-native";
import { TextStyles } from "../../styles/TextStyles";
import { Colors } from "../../styles/Colors";

type Props = {
  visible: boolean;
  value: number | null; // 1~5 or null
  onClose: () => void;
  onSelect: (rating: number) => void;
};

export default function RatingModal({
  visible,
  value,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 바깥 누르면 닫기 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 카드 영역은 눌러도 overlay onPress 안 타게 */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>
            방문한 장소의{"\n"}만족도를 알려주세요!
          </Text>

          <View style={styles.starRow}>
            {Array.from({ length: 5 }).map((_, i) => {
              const rating = i + 1;
              const active = (value ?? 0) >= rating;

              return (
                <Pressable
                  key={rating}
                  onPress={() => {
                    onSelect(rating);
                    onClose();
                  }}
                  hitSlop={8}
                >
                  <Image
                    source={
                      active
                        ? require("@/assets/images/star-orange.png")
                        : require("@/assets/images/star-gray.png")
                    }
                    style={styles.star}
                  />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 280,
    borderRadius: 18,
    backgroundColor: "white",
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    ...TextStyles.Bold16,
    color: Colors.gray_800,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  starRow: {
    flexDirection: "row",
    gap: 10,
  },
  star: {
    width: 34,
    height: 34,
  },
});
