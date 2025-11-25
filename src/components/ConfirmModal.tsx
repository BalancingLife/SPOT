import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import SpotButton from "@/src/components/SpotButton";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description?: string;

  confirmLabel?: string; // 기본: 확인
  cancelLabel?: string; // 기본: 취소

  onConfirm?: (e?: GestureResponderEvent) => void;
  onCancel?: (e?: GestureResponderEvent) => void;

  /** 바깥(배경) 터치 시 닫을지 여부. 기본 true */
  closeOnBackdropPress?: boolean;
};

export default function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  closeOnBackdropPress = true,
}: ConfirmModalProps) {
  const handleBackdropPress = (e: GestureResponderEvent) => {
    if (!closeOnBackdropPress) return;
    onCancel?.(e);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      {/* 배경 */}
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        {/* 카드 영역 - 이벤트 버블링 막기 */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonRow}>
            <SpotButton
              label={cancelLabel}
              variant="secondary"
              size="large"
              fullWidth
              onPress={onCancel}
              style={styles.button}
            />
            <SpotButton
              label={confirmLabel}
              variant="primary"
              size="large"
              fullWidth
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 30,
    paddingVertical: 33,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  textWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    ...TextStyles.SemiBold20,
    color: Colors.gray_800,
    textAlign: "center",
  },
  description: {
    ...TextStyles.Medium14,
    color: Colors.gray_600,
    marginTop: 8,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
