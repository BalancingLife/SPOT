// app/place/[placeId].tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import PlaceCard from "@/src/components/PlaceCard";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

export default function PlaceDetailScreen() {
  const { placeId } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      {/* 상단 이미지 */}
      <View style={styles.topImageContainer}>
        <Image
          source={require("@/assets/images/example2.png")}
          style={styles.topImage}
        />
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
          showDirectionButton={false}
        />
      </View>

      {/* 지도 안내 텍스트 */}
      <Text style={styles.mapNotice}>
        네이버 지도 api에서 받아올 수 있는 정보 나열 (*개발자와 상의 필요)
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
        <Text>
          닉네임 1, 닉네임 2 외 10명이 저장한 장소예요.{"\n"}
          <Text style={{ fontWeight: "bold" }}>
            여정을 만들어 함께 방문해보세요!
          </Text>
        </Text>
      </View>
    </ScrollView>
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
    width: "100%",
    height: 300,
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
  mapNotice: {
    paddingHorizontal: 16,
    color: "#aaa",
    fontSize: 13,
    marginVertical: 16,
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
    borderTopWidth: 1,
    borderColor: "#eee",
    marginBottom: 30,
    alignItems: "center",
  },
});
