import React from "react";
import {
  Modal,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

import { TextStyles } from "../styles/TextStyles";
import { Colors } from "../styles/Colors";

type Option = { label: string; value: string };

interface Props {
  visible: boolean;
  title: string;
  options: Option[];
  selected: string[]; // 항상 길이 1 배열로 사용
  onSelect: (next: string[]) => void;
  onClose: () => void;
}

export default function OptionModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  const choose = (v: string) => {
    onSelect([v]); // 즉시 적용
    onClose(); // 즉시 닫기
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(i) => i.value}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.value);
              return (
                <Pressable
                  style={styles.row}
                  onPress={() => choose(item.value)}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      isSelected && { color: Colors.primary_500 },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Image
                      source={require("@/assets/images/check-orange.png")}
                      style={{ width: 30, height: 28 }}
                    />
                  )}
                </Pressable>
              );
            }}
            style={{ maxHeight: 320 }}
          />
          {/* 취소 버튼 */}
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: 305,
    borderRadius: 16,
    backgroundColor: "#FEFEFE",
    paddingTop: 26,
    paddingBottom: 13,
  },
  title: {
    ...TextStyles.SemiBold20,
    color: Colors.gray_900,
    marginBottom: 10,
    paddingHorizontal: 23,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E680",
    paddingHorizontal: 23,
  },
  rowLabel: { ...TextStyles.Medium16 },
  rowCheck: { ...TextStyles.Medium16 },

  cancelBtn: {
    paddingHorizontal: 23,
    paddingTop: 9,
    paddingBottom: 5,
    alignItems: "flex-end",
    marginTop: 6,
  },
  cancelText: {
    ...TextStyles.Medium14,
    color: Colors.gray_300,
  },
});
