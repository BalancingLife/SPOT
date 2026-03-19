import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import type { MoreComment } from "./CommentBottomSheet";

type CommentCardProps = {
  commentList: MoreComment[];
};

const formatYMD = (iso: string) => {
  return String(iso).slice(0, 10).replaceAll("-", ".");
};

const safeUri = (u?: string) => {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return u;
};

export const CommentCard = ({ commentList }: CommentCardProps) => {
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const handlePressHeart = (commentId: number) => {
    setLikedMap((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <View style={styles.commentContent}>
      {commentList.map((c) => {
        const avatarUrl = safeUri(c.commentPhoto);
        const photoUrls = Array.isArray(c.photos) ? c.photos : [];
        const topPhotos = photoUrls.slice(0, 3);

        const hasCommentPhoto =
          typeof c.commentPhoto === "string" && c.commentPhoto.length > 0;

        const isLiked = likedMap[c.id] ?? false;

        return (
          <View key={String(c.id)} style={styles.commentItem}>
            <View style={styles.commentHeaderRow}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.commentAvatar}
                />
              ) : (
                <View style={styles.commentAvatarFallback} />
              )}

              <View style={styles.commentHeaderTextCol}>
                <Text style={styles.commentNickname} numberOfLines={1}>
                  {c.memEmail?.split("@")[0] ?? "사용자"}
                </Text>
                <Text style={styles.commentEmail} numberOfLines={1}>
                  {c.memEmail ?? ""}
                </Text>
              </View>

              <Text style={styles.commentDate}>
                {formatYMD(String(c.createdAt))}
              </Text>

              <Pressable
                onPress={() => handlePressHeart(c.id)}
                hitSlop={8}
                style={styles.commentHeartButton}
              >
                <Image
                  source={
                    isLiked
                      ? require("@/assets/images/heart-filled.png")
                      : require("@/assets/images/heart-empty.png")
                  }
                  style={styles.commentHeartIcon}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            <Text style={styles.commentBodyText}>{c.comment}</Text>

            {topPhotos.length > 0 && (
              <View style={styles.commentPhotoRow}>
                {topPhotos.map((url, idx) => (
                  <Image
                    key={`${c.id}-p-${idx}`}
                    source={{ uri: url }}
                    style={[
                      styles.commentThumb,
                      idx !== topPhotos.length - 1 && styles.commentThumbMr,
                    ]}
                  />
                ))}
              </View>
            )}

            {hasCommentPhoto && (
              <Image
                source={{ uri: c.commentPhoto }}
                style={styles.commentBigPhoto}
                resizeMode="cover"
              />
            )}

            <View style={styles.commentPlaceCard}>
              <View style={styles.commentPlaceTextCol}>
                <Text style={styles.commentPlaceName} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.commentPlaceAddr} numberOfLines={1}>
                  {c.address}
                </Text>
              </View>

              <Text style={styles.commentMarkedText}>
                {c.marked ? "저장됨" : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  commentItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray_100,
  },

  commentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.gray_100,
  },

  commentAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.gray_100,
  },

  commentHeaderTextCol: {
    flex: 1,
  },

  commentNickname: {
    ...TextStyles.Bold12,
    color: Colors.gray_900,
  },

  commentEmail: {
    ...TextStyles.Regular10,
    color: Colors.gray_400,
  },

  commentDate: {
    ...TextStyles.Regular10,
    color: Colors.gray_300,
    marginRight: 9,
  },

  commentHeartButton: {
    justifyContent: "center",
    alignItems: "center",
  },

  commentHeartIcon: {
    width: 22,
    height: 22,
  },

  commentBodyText: {
    ...TextStyles.Regular14,
    color: Colors.gray_800,
    marginTop: 10,
    lineHeight: 18,
  },

  commentPhotoRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 4,
  },

  commentThumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
  },

  commentThumbMr: {
    marginRight: 10,
  },

  commentBigPhoto: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginTop: 12,
  },

  commentPlaceCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.gray_100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  commentPlaceTextCol: {
    flex: 1,
    paddingRight: 10,
  },

  commentPlaceName: {
    ...TextStyles.SemiBold16,
    color: Colors.gray_800,
  },

  commentPlaceAddr: {
    ...TextStyles.Regular12,
    color: Colors.gray_400,
    marginTop: 4,
  },

  commentMarkedText: {
    ...TextStyles.Regular12,
    color: Colors.gray_400,
  },
});
