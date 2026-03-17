import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

export type ActionMenuItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  menus: ActionMenuItem[];
};

export default function ActionMenuModal({ visible, onClose, menus }: Props) {
  const handlePressMenu = (onPress: () => void) => {
    onClose();
    onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.shadowWrapper}>
          <Pressable style={styles.menuContainer} onPress={() => {}}>
            {menus.map((menu, index) => {
              const isLast = index === menus.length - 1;

              return (
                <View key={`${menu.label}-${index}`}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => handlePressMenu(menu.onPress)}
                  >
                    <Text
                      style={[
                        styles.menuText,
                        menu.destructive && styles.destructiveText,
                      ]}
                    >
                      {menu.label}
                    </Text>
                  </Pressable>

                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  shadowWrapper: {
    position: "absolute",
    top: 265,
    right: 20,
    width: 142,
    backgroundColor: Colors.white,
    borderRadius: 12,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: {
    ...TextStyles.Medium14,
    color: Colors.gray_800,
  },
  destructiveText: {
    color: Colors.gray_800,
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E6E680",
  },
});
