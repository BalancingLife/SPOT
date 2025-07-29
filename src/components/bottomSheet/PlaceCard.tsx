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
  savedUsers: any[]; // 아바타도 마찬가지
  savedCount: number;
}

export default function PlaceCard({
  name,
  category,
  address,
  images,
  savedUsers,
  savedCount,
}: PlaceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[TextStyles.SemiBold20, { marginRight: 3 }]}>{name}</Text>
        <Text style={[TextStyles.Regular12, { color: Colors.gray_300 }]}>
          {category}
        </Text>
      </View>

      <View style={styles.addressContainer}>
        <Image
          style={styles.placecardMarker}
          source={require("@/assets/images/placecard-marker.png")}
        />
        <Text style={[TextStyles.Regular12, { color: Colors.gray_900 }]}>
          {address}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageScroll}
      >
        {images.map((img, index) => (
          <Image key={index} source={img} style={styles.image} />
        ))}
      </ScrollView>

      <View style={styles.bottomRow}>
        <View style={styles.savedInfo}>
          <View style={styles.avatarGroup}>
            {savedUsers.map((img, i) => (
              <Image
                key={i}
                source={img}
                style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]}
              />
            ))}
          </View>
          <Text style={[TextStyles.Regular12, { color: Colors.gray_600 }]}>
            {savedCount}명이 저장했어요
          </Text>
        </View>

        <Pressable style={styles.NaverMapButton}>
          <Image
            source={require("@/assets/images/naver-map-icon.png")}
            style={styles.NaverMapIcon}
          />
          <Text style={TextStyles.Regular10}>네이버 지도 길찾기</Text>
        </Pressable>
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
  category: {
    color: "#000",
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
