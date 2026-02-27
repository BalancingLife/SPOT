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

import PlaceCard from "@/src/components/PlaceCard";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import Pagination from "@/src/components/Pagination";
import CommentWriteButton from "@/src/components/comment/CommentWriteButton";
import CommentWriteModal, {
  CommentWriteModalRef,
} from "@/src/components/comment/CommentWriteModal";

import SpotButton from "@/src/components/SpotButton";

import { fetchPlaceMore } from "@/src/lib/api/places";
import { usePlaceMoreStore } from "@/src/stores/usePlaceMoreStore";
import type { ApiPlace, ApiPlaceComment } from "@/src/types/place";
import { formatDistance } from "@/src/utils/format";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PlaceDetailScreen() {
  const { placeId, lat, lng } = useLocalSearchParams<{
    placeId: string;
    lat?: string;
    lng?: string;
  }>();

  // 리스트에서 넘어온 기본 Place
  const basePlace = usePlaceMoreStore((s) => s.basePlace);

  const [currentPage, setCurrentPage] = useState(1);
  const [place, setPlace] = useState<ApiPlace | null>(null);
  const [comments, setComments] = useState<ApiPlaceComment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const commentModalRef = useRef<CommentWriteModalRef>(null);

  // 사진 없을 때 더미
  const fallbackImages = useMemo(
    () => [
      require("@/assets/images/example2.png"),
      require("@/assets/images/example.png"),
      require("@/assets/images/SPOT.png"),
    ],
    [],
  );

  // 상단 캐러셀 이미지: /more → basePlace → fallback
  const topImages = useMemo(() => {
    if (place?.photo) return [{ uri: place.photo }];
    if (basePlace?.photo) return [{ uri: basePlace.photo }];
    if (basePlace?.thumbnails?.length)
      return basePlace.thumbnails.map((u) => ({ uri: u }));
    return fallbackImages;
  }, [place, basePlace, fallbackImages]);

  // PlaceCard 안에 들어갈 썸네일들
  const cardImages = useMemo(() => {
    if (basePlace?.thumbnails?.length)
      return basePlace.thumbnails.map((u) => ({ uri: u }));
    if (place?.photo) return [{ uri: place.photo }];
    return [require("@/assets/images/example.png")];
  }, [place, basePlace]);

  // 표시용 공통 데이터 (place 우선, 없으면 basePlace)
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

  // /more API 호출 (추가 정보용, 실패해도 화면은 basePlace로 렌더)
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

  // basePlace도 없고 /more도 없으면 진짜로 정보 없음
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
        {/* 상단 이미지 캐러셀 */}
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

        {/* 장소 정보 (PlaceCard 그대로 활용) */}
        <View style={styles.infoSection}>
          <PlaceCard
            name={display.name}
            category={display.category}
            address={display.address}
            images={cardImages}
            showBookmark={true}
            isBookmarked={display.isBookmarked}
            showDirectionButton={false}
            rating={display.ratingAvg ?? undefined}
            reviewCount={display.ratingCount ?? undefined}
            distanceText={distanceText}
          />
        </View>

        {/* 지도 안내 텍스트 */}
        <Text
          style={[
            TextStyles.Medium14,
            { color: Colors.gray_300, textAlign: "center" },
          ]}
        >
          네이버 지도 api에서 받아올 수 있는{"\n"} 정보 나열 (*개발자와 상의
          필요)
        </Text>

        {/* 지도 이미지 */}
        <Text
          style={[TextStyles.Bold16, { color: Colors.gray_900, padding: 16 }]}
        >
          매장 위치
        </Text>
        <Image
          source={require("@/assets/images/example.png")}
          style={styles.mapImage}
        />

        {/* 길찾기 버튼 */}
        <SpotButton
          label="네이버 지도로 길 찾기"
          variant="primary"
          size="large"
          style={{ marginHorizontal: 16 }}
        />

        {/* 저장한 사람들 안내 (지금은 예전 이미지 그대로 사용) */}
        <View style={styles.savedInfo}>
          <Image
            source={require("@/assets/images/example3.png")}
            style={{ width: 343, height: 64 }}
          />
        </View>

        {/* 코멘트 */}
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

      {/* 우하단 코멘트 쓰기 버튼 */}
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
