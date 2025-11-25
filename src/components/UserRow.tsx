import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import SpotButton from "@/src/components/SpotButton";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

type UserRowProps = {
  nickname: string;
  userId: string;
  bio?: string;
  avatarUri?: string | null;
  actionLabel: string;
  actionDisabled?: boolean;
  onPressAction?: () => void;
  onPressRow?: () => void;
};

export default function UserRow({
  nickname,
  userId,
  bio,
  avatarUri,
  actionLabel,
  actionDisabled,
  onPressAction,
  onPressRow,
}: UserRowProps) {
  return (
    <Pressable onPress={onPressRow} style={styles.container}>
      {/* 아바타 */}
      <View style={styles.avatarWrapper}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require("@/assets/images/profile-icon-gray.png")}
            />
          </View>
        )}
      </View>

      {/* 텍스트 영역 */}
      <View style={styles.textArea}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1}>
            <Text style={styles.nickname}>{nickname}</Text>
            <Text style={styles.userId}> @{userId}</Text>
          </Text>
        </View>

        {bio ? (
          <Text style={styles.bio} numberOfLines={1}>
            {bio}
          </Text>
        ) : null}
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonArea}>
        <SpotButton
          label={actionLabel}
          variant="primary"
          size="small"
          disabled={actionDisabled}
          onPress={onPressAction}
        />
      </View>
    </Pressable>
  );
}

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  nickname: {
    ...TextStyles.Bold14,
    color: Colors.gray_800,
    marginRight: 4,
  },
  userId: {
    ...TextStyles.Regular10,
    color: Colors.gray_400,
  },
  bio: {
    ...TextStyles.Regular12,
    color: Colors.gray_500,
  },
  buttonArea: {
    marginLeft: 12,
    width: 80,
    height: 28,
  },
});
