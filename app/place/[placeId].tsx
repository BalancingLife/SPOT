// app/place/[placeId].tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";

import PlaceCard from "@/src/components/common/PlaceCard";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import Pagination from "@/src/components/common/Pagination";
import CommentWriteButton from "@/src/components/comment/CommentWriteButton";
import CommentWriteModal, {
  CommentWriteModalRef,
} from "@/src/components/comment/CommentWriteModal";

import SpotButton from "@/src/components/common/SpotButton";

import { fetchPlaceMore } from "@/src/lib/api/places";
import { toggleBookmarkApi } from "@/src/lib/api/bookmark";
import type { ApiPlace, ApiPlaceComment } from "@/src/types/place";
import { formatDistance } from "@/src/utils/format";

import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore";
import { useSearchStore } from "@/src/stores/useSearchStore";
import { usePlaceMoreStore } from "@/src/stores/usePlaceMoreStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PlaceDetailScreen() {
  const { placeId, lat, lng } = useLocalSearchParams<{
    placeId: string;
    lat?: string;
    lng?: string;
  }>();

  const basePlace = usePlaceMoreStore((s) => s.basePlace);

  const [currentPage, setCurrentPage] = useState(1);
  const [place, setPlace] = useState<ApiPlace | null>(null);
  const [comments, setComments] = useState<ApiPlaceComment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const commentModalRef = useRef<CommentWriteModalRef>(null);

  const fallbackImages = useMemo(
    () => [
      require("@/assets/images/example2.png"),
      require("@/assets/images/example.png"),
      require("@/assets/images/SPOT.png"),
    ],
    [],
  );

  const topImages = useMemo(() => {
    if (place?.photo) return [{ uri: place.photo }];
    if (basePlace?.photo) return [{ uri: basePlace.photo }];
    if (basePlace?.thumbnails?.length) {
      return basePlace.thumbnails.map((u) => ({ uri: u }));
    }
    return fallbackImages;
  }, [place, basePlace, fallbackImages]);

  const cardImages = useMemo(() => {
    if (basePlace?.thumbnails?.length) {
      return basePlace.thumbnails.map((u) => ({ uri: u }));
    }
    if (place?.photo) return [{ uri: place.photo }];
    return [require("@/assets/images/example.png")];
  }, [place, basePlace]);

  const display = {
    name: place?.name ?? basePlace?.name ?? "알 수 없는 장소",
    category: place?.list ?? basePlace?.category ?? "",
    address: place?.address ?? basePlace?.address ?? "",
    ratingAvg: place?.ratingAvg ?? basePlace?.ratingAvg ?? null,
    ratingCount: place?.ratingCount ?? basePlace?.ratingCount ?? null,
    distance:
      typeof place?.distance === "number"
        ? place.distance
        : basePlace?.distanceM,
    savers: place?.savers ?? basePlace?.savers ?? [],
    isBookmarked: place?.isMarked ?? basePlace?.isBookmarked ?? false,
  };

  const distanceText =
    typeof display.distance === "number"
      ? formatDistance(display.distance)
      : undefined;

  useEffect(() => {
    setLocalBookmarked(display.isBookmarked);
  }, [display.isBookmarked]);

  useEffect(() => {
    if (!placeId || !lat || !lng) return;

    const load = async () => {
      try {
        const data = await fetchPlaceMore({
          placeId: Number(placeId),
          lat: Number(lat),
          lng: Number(lng),
        });

        setPlace(data.places);
        setComments(data.comments ?? []);
        setError(null);
      } catch (e: any) {
        console.error("[PlaceDetailScreen] /more error:", e);
        setError(e?.message ?? "추가 정보를 불러오지 못했어요.");
      }
    };

    load();
  }, [placeId, lat, lng]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.floor(offsetX / SCREEN_WIDTH) + 1;
    setCurrentPage(newPage);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage - 2 });
    }
  };

  const handleNext = () => {
    if (currentPage < topImages.length) {
      flatListRef.current?.scrollToIndex({ index: currentPage });
    }
  };

  const handleOpenCommentSheet = () => {
    commentModalRef.current?.open();
  };

  const handleToggleBookmark = async () => {
    const numericPlaceId = Number(placeId);

    if (!Number.isFinite(numericPlaceId) || bookmarkLoading) return;

    const prev = localBookmarked;
    const next = !prev;

    setLocalBookmarked(next);
    setBookmarkLoading(true);

    try {
      await toggleBookmarkApi(numericPlaceId);

      const syncTarget =
        basePlace && basePlace.placeId === numericPlaceId
          ? { ...basePlace, isBookmarked: next }
          : null;

      if (syncTarget) {
        useSavedPlacesStore.getState().applyBookmarkFromPlace(syncTarget, next);
      }

      useSearchStore.getState().syncBookmarkByPlaceId(numericPlaceId, next);
      usePlaceMoreStore.getState().syncBookmarkByPlaceId(numericPlaceId, next);
    } catch (e) {
      console.error("[PlaceDetailScreen] bookmark toggle error:", e);
      setLocalBookmarked(prev);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (!place && !basePlace) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={TextStyles.Medium16}>장소 정보를 찾을 수 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topImageContainer}>
          <FlatList
            ref={flatListRef}
            data={topImages}
            horizontal
            pagingEnabled
            onScroll={handleScroll}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={item} style={styles.topImage} />
            )}
          />
          <View style={styles.paginationContainer}>
            <Pagination
              currentPage={currentPage}
              totalPages={topImages.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <PlaceCard
            name={display.name}
            category={display.category}
            address={display.address}
            images={cardImages}
            showBookmark={true}
            isBookmarked={localBookmarked}
            showDirectionButton={false}
            rating={display.ratingAvg ?? undefined}
            reviewCount={display.ratingCount ?? undefined}
            distanceText={distanceText}
            onToggleBookmark={handleToggleBookmark}
          />
        </View>

        <Text
          style={[TextStyles.Bold16, { color: Colors.gray_900, padding: 16 }]}
        >
          매장 위치
        </Text>
        <Image
          source={require("@/assets/images/example.png")}
          style={styles.mapImage}
        />

        <SpotButton
          label="네이버 지도로 길 찾기"
          variant="primary"
          size="large"
          style={{ marginHorizontal: 16 }}
        />

        <View style={styles.savedInfo}>
          <Image
            source={require("@/assets/images/example3.png")}
            style={{ width: 343, height: 64 }}
          />
        </View>

        <View style={styles.commentSection}>
          <Text
            style={[
              TextStyles.Bold16,
              { color: Colors.gray_900, marginBottom: 8 },
            ]}
          >
            코멘트
          </Text>

          {error && (
            <Text style={[TextStyles.Regular12, { color: Colors.gray_400 }]}>
              코멘트를 불러오지 못했어요.
            </Text>
          )}

          {comments.length === 0 && !error ? (
            <Text style={[TextStyles.Regular12, { color: Colors.gray_400 }]}>
              아직 코멘트가 없어요. 첫 코멘트를 남겨보세요!
            </Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={TextStyles.Medium12}>{c.memEmail}</Text>
                  <Text style={TextStyles.Medium12}>
                    ★ {c.score.toFixed(1)}
                  </Text>
                </View>
                <Text
                  style={[
                    TextStyles.Regular12,
                    { color: Colors.gray_900, marginTop: 2 },
                  ]}
                >
                  {c.comment}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <CommentWriteButton onPress={handleOpenCommentSheet} />
      <CommentWriteModal ref={commentModalRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  topImageContainer: {
    width: "100%",
    backgroundColor: "#fff",
  },
  topImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  category: {
    fontSize: 14,
    color: "#777",
    marginRight: 5,
  },
  star: {
    color: "#f55",
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  address: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  imageRow: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  mapImage: {
    paddingHorizontal: 16,
    width: "100%",
    height: 154,
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 10,
  },

  savedInfo: {
    marginTop: 16,
    padding: 16,
    borderColor: "#eee",
    marginBottom: 30,
    alignItems: "center",
  },
  commentSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  commentCard: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray_100,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
