import { useState, useMemo } from "react";
import { View, ScrollView, Image, StyleSheet, Text } from "react-native";

import FilterBar from "../bottomSheet/FilterBar";
import OptionModal from "../OptionModal";

import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";

import {
  type HomeScope,
  type HomeCommentItem,
} from "@/src/components/home/types";

type CommentTabSectionProps = {
  scope: HomeScope;
  commentList: HomeCommentItem[];
};

export const CommentTabSection = ({
  scope,
  commentList,
}: CommentTabSectionProps) => {
  // 필터 선택 상태
  const [sort, setSort] = useState<string[]>(["latest"]);

  // 필터 모달 열림 상태
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );

  // 정렬 옵션은 고정값이므로 메모이제이션해 불필요한 재생성을 막는다.
  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    [],
  );

  // 현재 선택된 정렬값에 대응하는 라벨을 계산한다.
  const sortLabel =
    sortOptions.find((option) => option.value === sort[0])?.label ?? "최신순";

  const formatYMD = (iso: string) => {
    // "2026-01-18T..." -> "2026.01.18"
    return String(iso).slice(0, 10).replaceAll("-", ".");
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterBar
        sortLabel={sortLabel}
        categoryLabel="" // 안 쓸 거라 빈 값
        onPressSort={() => setOpened("sort")}
        showSaveType={false}
        showCategory={false}
      />

      <ScrollView
        style={styles.commentScroll}
        contentContainerStyle={styles.commentContent}
        showsVerticalScrollIndicator={false}
      >
        {commentList.map((c) => {
          const avatarUrl = `https://placehold.co/100x100/png?text=${encodeURIComponent(
            (c.memEmail ?? "U").slice(0, 1).toUpperCase(),
          )}`;

          const tag =
            scope.type === "friends"
              ? "FRIENDS"
              : scope.type === "me"
                ? "ME"
                : `U${scope.userId}`;

          const photoUrls =
            Array.isArray(c.photos) && c.photos.length > 0
              ? c.photos
              : [
                  `https://placehold.co/300x300/png?text=${encodeURIComponent(`${tag}-1`)}`,
                  `https://placehold.co/300x300/png?text=${encodeURIComponent(`${tag}-2`)}`,
                  `https://placehold.co/300x300/png?text=${encodeURIComponent(`${tag}-3`)}`,
                ];

          const topPhotos = photoUrls.slice(0, 3);

          const hasCommentPhoto =
            typeof c.commentPhoto === "string" && c.commentPhoto.length > 0;

          return (
            <View key={String(c.id)} style={styles.commentItem}>
              {/* 작성자 Row */}
              <View style={styles.commentHeaderRow}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.commentAvatar}
                />

                <View style={styles.commentHeaderTextCol}>
                  <Text style={styles.commentNickname} numberOfLines={1}>
                    {c.memEmail?.split("@")[0] ?? "사용자"}
                  </Text>
                  <Text style={styles.commentEmail} numberOfLines={1}>
                    {c.memEmail ?? ""}
                  </Text>
                </View>

                {/*  날짜 */}
                <Text style={styles.commentDate}>
                  {formatYMD(String(c.createdAt))}
                </Text>
              </View>

              {/* 코멘트 */}
              <Text style={styles.commentBodyText}>{c.comment}</Text>

              {/* 장소 사진 3장 */}
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

              {/* commentPhoto (하단 큰 이미지) */}
              {hasCommentPhoto && (
                <Image
                  source={{ uri: c.commentPhoto }}
                  style={styles.commentBigPhoto}
                  resizeMode="cover"
                />
              )}

              {/* 장소 카드 */}
              <View style={styles.commentPlaceCard}>
                <View style={styles.commentPlaceTextCol}>
                  <Text style={styles.commentPlaceName} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.commentPlaceAddr} numberOfLines={1}>
                    {c.address}
                  </Text>
                </View>

                {/* marked는 일단 텍스트로만 */}
                <Text style={styles.commentMarkedText}>
                  {c.marked ? "저장됨" : ""}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <OptionModal
        visible={opened === "sort"}
        title="정렬 기준"
        options={sortOptions}
        selected={sort}
        onSelect={(next) => setSort(next)}
        onClose={() => setOpened(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  commentScroll: {
    flex: 1,
  },
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
    marginRight: 8,
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
