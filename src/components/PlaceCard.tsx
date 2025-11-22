import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { TextStyles } from "@/src/styles/TextStyles";
import { Colors } from "@/src/styles/Colors";

interface PlaceCardProps {
  name: string;
  category: string;
  address: string;
  images: any[]; // require로 넣으니까 any로!
  savedUsers?: any[]; // 아바타도 마찬가지
  savedCount?: number;
  showDirectionButton: boolean;
  rating?: number;
  reviewCount?: number;
  showBookmark?: boolean; // 북마크 UI를 보여줄지 여부
  isBookmarked?: boolean; // 북마크 되어 있는지 여부
  distanceText?: string; // ex) "320m", "1.2km"
  onToggleBookmark?: () => void;
  onPressDirection?: () => void;
}

export default function PlaceCard({
  name,
  category,
  address,
  images,
  savedUsers,
  savedCount,
  showDirectionButton,
  rating,
  reviewCount,
  showBookmark,
  isBookmarked,
  distanceText,
  onToggleBookmark,
  onPressDirection,
}: PlaceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[TextStyles.SemiBold20, { marginRight: 3 }]}>{name}</Text>
        <Text
          style={[
            TextStyles.Regular12,
            { color: Colors.gray_300 },
            { marginTop: 3.5 },
            { marginRight: 6 },
          ]}
        >
          {category}
        </Text>

        {rating !== undefined && reviewCount !== undefined && (
          <View style={styles.ratingContainer}>
            <Image
              style={styles.starImg}
              source={require("@/assets/images/star-orange.png")}
            />
            <Text
              style={[
                TextStyles.Medium12,
                { color: Colors.gray_900, marginRight: 3 },
              ]}
            >
              {rating}
            </Text>
            <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
              ({reviewCount.toLocaleString()})
            </Text>
          </View>
        )}

        {showBookmark && (
          <Pressable
            style={styles.bookmarkPressable}
            onPress={onToggleBookmark}
            hitSlop={8}
          >
            <Image
              source={
                isBookmarked
                  ? require("@/assets/images/bookmark-orange.png")
                  : require("@/assets/images/bookmark-orange-empty.png")
              }
              style={styles.bookmarkIcon}
            />
          </Pressable>
        )}
      </View>

      {/* 주소 + 거리 */}
      <View style={styles.addressContainer}>
        <Image
          style={styles.placecardMarker}
          source={require("@/assets/images/placecard-marker.png")}
        />
        <Text style={[TextStyles.Regular12, { color: Colors.gray_900 }]}>
          {address}
        </Text>
        {!!distanceText && (
          <Text
            style={[
              TextStyles.Regular12,
              { color: Colors.gray_400, marginLeft: 8 },
            ]}
          >
            {distanceText}
          </Text>
        )}
      </View>

      {/* 이미지 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageScroll}
      >
        {images.map((img, index) => (
          <Image key={index} source={img} style={styles.image} />
        ))}
      </ScrollView>

      {/* 저장한 사람들 + 네이버 지도 버튼 */}
      <View style={styles.bottomRow}>
        <View style={styles.savedInfo}>
          {savedUsers && savedUsers.length > 0 && savedCount !== undefined && (
            <View style={styles.avatarGroup}>
              {savedUsers.map((img, i) => (
                <Image
                  key={i}
                  source={img}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]}
                />
              ))}
              <Text
                style={[
                  TextStyles.Regular12,
                  { color: Colors.gray_600 },
                  { marginLeft: 2 },
                ]}
              >
                {savedCount}명이 저장했어요
              </Text>
            </View>
          )}
        </View>

        {showDirectionButton && (
          <Pressable style={styles.NaverMapButton}>
            <Image
              source={require("@/assets/images/naver-map-icon.png")}
              style={styles.NaverMapIcon}
            />
            <Text style={TextStyles.Regular10}>네이버 지도 길찾기</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E666",
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  starImg: {
    width: 14,
    height: 14,
  },
  bookmarkPressable: {
    position: "absolute",
    right: 0,
  },

  bookmarkIcon: {
    position: "absolute",
    right: 0,
    width: 24,
    height: 24,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14.9,
  },

  placecardMarker: {
    width: 12.15,
    height: 12.15,
    marginRight: 1.92,
  },
  imageScroll: {
    marginBottom: 11.25,
  },
  image: {
    width: 111,
    height: 125,
    borderRadius: 16.73,
    marginRight: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  savedInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGroup: {
    flexDirection: "row",
    marginRight: 6,
  },
  avatar: {
    width: 17.65,
    height: 17.65,
    borderRadius: 12,
    borderWidth: 0.74,
    borderColor: "#ffffff",
  },
  savedText: {
    color: "#333",
  },
  NaverMapButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.75,
    borderColor: Colors.gray_100,
    borderRadius: 4.5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  NaverMapIcon: {
    width: 10.5,
    height: 10.5,
    marginRight: 1.25,
  },
  mapText: {
    color: "#333",
  },
});
