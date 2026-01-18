import {
  View,
  Image,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { useFriendsStore } from "@/src/stores/useFriendsStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import FilterBar from "@/src/components/bottomSheet/FilterBar";
import PlaceCard from "@/src/components/PlaceCard";
import OptionModal from "@/src/components/OptionModal";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import MyLocationButton from "@/src/components/map/MyLocationButton";
import UserLocationMarker from "@/src/components/map/UserLocationMarker";
import { useLocationStore } from "@/src/stores/useLocationStore";
import StoryList from "@/src/components/home/StoryList";
import UserCard from "@/src/components/UserCard";

type SelectedUser = {
  nickname: string;
  userid: string; //
  bio: string | null;
  profileImage: ImageSourcePropType;
};

const TABS = [
  { key: "map", label: "지도" },
  { key: "place", label: "장소" },
  { key: "comment", label: "코멘트" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const dummyData = new Array(4).fill(0).map((_, i) => ({
  name: `장소 이름${i + 1}`,
  category: "카페 / 베이커리",
  address: `서울 주소구 주소동 ${123 + i}-1`,
  images: [
    require("@/assets/images/example.png"),
    require("@/assets/images/react-logo.png"),
    require("@/assets/images/spot-icon-orange.png"),
  ],
  savedUsers: [
    require("@/assets/images/spot-icon-orange.png"),
    require("@/assets/images/react-logo.png"),
  ],
  savedCount: 4 + i,
  rating: 4.5,
  reviewCount: 199,
  showBookmark: true,
  isBookmarked: true,
}));

export default function Home() {
  const [selectedUser, setSelectedUser] = React.useState<SelectedUser | null>(
    null
  );

  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const DEFAULT_MY_IMAGE = require("@/assets/images/dog.png");
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null
  );
  const [category, setCategory] = useState<string[]>([]); // 비어있음 = 전체
  const [sort, setSort] = useState<string[]>(["recent"]); // 기본 최신순

  const [activeTab, setActiveTab] = useState<TabKey>("map");

  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    []
  );
  const categoryOptions = useMemo(
    () => [
      { label: "음식점", value: "restaurant" },
      { label: "술집", value: "bar" },
      { label: "전시회", value: "exhibition" },
      { label: "카페", value: "cafe" },
      { label: "디저트", value: "dessert" },
      { label: "소품샵", value: "gift_shop" },
      { label: "체험", value: "experience" },
      { label: "옷가게", value: "clothing_store" },
    ],
    []
  );

  const sortLabel =
    sortOptions.find((o) => o.value === sort[0])?.label ?? "최신순";
  const categoryLabel =
    category.length > 0
      ? categoryOptions.find((o) => o.value === category[0])?.label ?? "업종"
      : "업종";

  const categoryOptionsForModal = useMemo(
    () => categoryOptions.filter((o) => o.value !== "all"),
    [categoryOptions]
  );

  const mapRef = useRef<NaverMapViewRef>(null);

  const refreshOnce = useLocationStore((s) => s.refreshOnce);
  const coords = useLocationStore((s) => s.coords);
  // coords 형태는 네 store 기준. 예: { latitude, longitude } or { lat, lng }

  const [didInitCamera, setDidInitCamera] = useState(false);

  const friends = useFriendsStore((s) => s.friends);
  const loadFriends = useFriendsStore((s) => s.loadFriends);

  // 탭 진입 시 1회 위치 갱신
  useEffect(() => {
    if (activeTab !== "map") return;
    refreshOnce?.();
    setDidInitCamera(false);
  }, [activeTab, refreshOnce]);

  // coords 잡히면 “내 위치에서 시작”
  useEffect(() => {
    if (activeTab !== "map") return;
    if (!coords) return;
    if (didInitCamera) return;

    const latitude = (coords as any).latitude ?? (coords as any).lat;
    const longitude = (coords as any).longitude ?? (coords as any).lng;

    if (latitude == null || longitude == null) return;

    mapRef.current?.animateCameraTo?.({
      latitude,
      longitude,
      zoom: 16,
      duration: 400,
    });

    setDidInitCamera(true);
  }, [activeTab, coords, didInitCamera]);

  const moveToCurrentLocation = async () => {
    // refreshOnce가 좌표를 return하면 그거 쓰고, 아니면 store 최신값을 다시 읽는 방식으로
    const next = await refreshOnce?.();
    const c = next ?? coords ?? (useLocationStore as any).getState?.().coords;

    if (!c) return;

    const latitude = (c as any).latitude ?? (c as any).lat;
    const longitude = (c as any).longitude ?? (c as any).lng;

    if (latitude == null || longitude == null) return;

    mapRef.current?.animateCameraTo?.({
      latitude,
      longitude,
      zoom: 16,
      duration: 400,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!hasHydrated) return;
      if (!token) return;
      loadFriends();
    }, [hasHydrated, token, loadFriends])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* 좌측 로고, 우측 친구 아이콘 */}
        <View style={styles.topBar}>
          <Image
            source={require("@/assets/images/SPOT.png")}
            style={styles.spotLogo}
          />

          <View style={styles.friendsIconContainer}>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/friends-icon-black.png")}
                style={styles.friendsIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={require("@/assets/images/friends-add-icon-black.png")}
                style={styles.friendsIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 스토리 (친구 / 나의닉네임 / 닉네임예시...) */}
        {/* 스토리 리스트 */}
        <StoryList
          myNickname={"내 닉네임"}
          myAvatarSource={DEFAULT_MY_IMAGE}
          friends={friends}
          onPressItem={(u) => setSelectedUser(u)} // ✅ 다음 단계에서 StoryList에 추가할 props
          onPressFriends={() => setSelectedUser(null)} // ✅ 친구 누르면 닫기
        />

        {selectedUser ? (
          <View style={{ paddingRight: 16, paddingTop: 12 }}>
            <UserCard
              variant="story"
              profileImage={selectedUser.profileImage}
              nickname={selectedUser.nickname}
              userid={selectedUser.userid} //
              bio={selectedUser.bio ?? ""}
              friendAvatars={[]} // 일단 빈 배열
              friendCount={0} // 일단 0
            />
          </View>
        ) : null}
      </View>

      {/* 아래 탭 + 콘텐츠 영역 */}
      <View style={styles.bodyContainer}>
        {/* 탭 바 */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 탭 콘텐츠 */}
        <View style={styles.tabContent}>
          {/* 지도 탭 */}
          {activeTab === "map" && (
            <View style={styles.mapContainer}>
              {/* 지도 */}
              <NaverMapView
                ref={mapRef}
                isShowLocationButton={false}
                style={[styles.map, StyleSheet.absoluteFillObject]}
                onInitialized={() => {
                  mapRef.current?.setLocationTrackingMode("None" as any);
                }}
              >
                {/* 커스텀 사용자 마커 */}
                <UserLocationMarker enableRotation />
              </NaverMapView>

              {/* 내 위치 버튼 */}
              <MyLocationButton
                onPress={moveToCurrentLocation}
                bottom={40}
                left={15}
              />
            </View>
          )}

          {activeTab === "place" && (
            <View style={styles.placeholderBox}>
              <View style={{ flex: 1 }}>
                {/* 필터 바 */}
                <FilterBar
                  sortLabel={sortLabel}
                  categoryLabel={categoryLabel}
                  onPressSort={() => setOpened("sort")}
                  onPressCategory={() => setOpened("category")}
                  showSaveType={false}
                />

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  {dummyData.map((item, index) => (
                    <PlaceCard
                      key={index}
                      {...item}
                      showDirectionButton={true}
                    />
                  ))}
                </ScrollView>

                {/*  모달: 단일 선택 + 즉시 적용, '전체'는 모달에서 숨김 */}
                <OptionModal
                  visible={opened === "sort"}
                  title="정렬 기준"
                  options={sortOptions}
                  selected={sort}
                  onSelect={(next) => setSort(next)}
                  onClose={() => setOpened(null)}
                />
                <OptionModal
                  visible={opened === "category"}
                  title="업종"
                  options={categoryOptionsForModal}
                  selected={category}
                  onSelect={(next) => setCategory(next)}
                  onClose={() => setOpened(null)}
                />
              </View>
            </View>
          )}

          {activeTab === "comment" && (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>코멘트 리스트 영역</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingLeft: 16,
  },

  // top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 16,
  },
  spotLogo: { width: 63, height: 29 },
  friendsIconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  friendsIcon: { width: 24, height: 24 },

  // story row
  storyScroll: {
    marginTop: 20,
  },
  storyContent: {
    paddingRight: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 20,
  },
  storyAvatar: {
    width: 65,
    height: 65,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    backgroundColor: Colors.white,
    marginBottom: 6,
  },
  storyLabel: {
    ...TextStyles.Regular12,
  },

  // 아래 탭 + 콘텐츠 영역
  bodyContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 20,
  },

  tabBar: {
    justifyContent: "space-around", // 혹은 "space-between"
    flexDirection: "row",
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabLabel: {
    ...TextStyles.SemiBold16,
    marginBottom: 4,
  },
  tabLabelActive: {
    color: Colors.primary_500,
    fontWeight: "600",
  },
  tabLabelInactive: {
    color: Colors.gray_300,
  },
  tabUnderline: {
    width: "230%",
    height: 4,
    backgroundColor: Colors.primary_500,
  },

  tabContent: {
    flex: 1,
  },

  mapContainer: {
    flex: 1,
    backgroundColor: Colors.gray_100,
  },

  map: { flex: 1, zIndex: 0 },

  placeholderBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...TextStyles.Regular12,
    color: Colors.gray_400,
  },
});
