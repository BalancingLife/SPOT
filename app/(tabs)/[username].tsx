// app/place/[placeId].tsx 이거 PlaceCard로 만들지 말기.
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import PlaceCard from "@/src/components/PlaceCard";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";
import Pagination from "@/src/components/Pagination";
import { useState, useRef } from "react";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import CommentWriteButton from "@/src/components/CommentWriteButton";
import CommentWriteModal, {
  CommentWriteModalRef,
} from "@/src/components/CommentWriteModal";

export default function PlaceDetailScreen() {
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const [currentPage, setCurrentPage] = useState(1);
  const imageSources = [
    require("@/assets/images/example2.png"),
    require("@/assets/images/example.png"),
    require("@/assets/images/SPOT.png"),
  ];
  const flatListRef = useRef<FlatList>(null);
  const commentModalRef = useRef<CommentWriteModalRef>(null);

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
    if (currentPage < imageSources.length) {
      flatListRef.current?.scrollToIndex({ index: currentPage });
    }
  };

  const handleOpenCommentSheet = () => {
    commentModalRef.current?.open();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 상단 이미지 */}
        <View style={styles.topImageContainer}>
          <FlatList
            ref={flatListRef}
            data={imageSources}
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
              totalPages={imageSources.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </View>
        </View>

        {/* 장소 정보 */}
        <View style={styles.infoSection}>
          <PlaceCard
            name="상호명예시"
            category="업종"
            address="서울 주소구 주소동 주소 123-1"
            images={[
              require("@/assets/images/example.png"),
              require("@/assets/images/example.png"),
              require("@/assets/images/example.png"),
            ]}
            showBookmark={true}
            showDirectionButton={false}
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
        <Pressable style={styles.mapButton}>
          <Text style={styles.mapButtonText}>네이버 지도로 길 찾기</Text>
        </Pressable>

        {/* 저장한 사람들 안내 */}
        <View style={styles.savedInfo}>
          <Image
            source={require("@/assets/images/example3.png")}
            style={{ width: 343, height: 64 }}
          ></Image>
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
  mapButton: {
    height: 53,
    backgroundColor: Colors.primary_500,
    borderRadius: 10,
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  savedInfo: {
    marginTop: 16,
    padding: 16,
    borderColor: "#eee",
    marginBottom: 30,
    alignItems: "center",
  },
});
