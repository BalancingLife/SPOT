import {
  View,
  Image,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import MyLocationButton from "@/src/components/map/MyLocationButton";
import UserLocationMarker from "@/src/components/map/UserLocationMarker";
import { useLocationStore } from "@/src/stores/useLocationStore";
import StoryList from "@/src/components/home/StoryList";
import UserCard from "@/src/components/UserCard";
import { fetchHomeMain, fetchHomeMe, fetchHomeUser } from "@/src/lib/api/home";
import type { SelectedUser as StorySelectedUser } from "@/src/components/home/StoryList";

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
  // ---------------------------
  // types
  // ---------------------------
  type HomeScope =
    | { type: "friends" }
    | { type: "me" }
    | { type: "friend"; userId: number };

  type HomeMarker = {
    key: string;
    lat: number;
    lng: number;
    raw: any; // 테스트 단계: 로그용
  };

  // ---------------------------
  // constants
  // ---------------------------
  const HOME_DISTANCE = 10;
  const HOME_PIN = require("@/assets/images/spot-icon-orange.png");
  const DEFAULT_MY_IMAGE = require("@/assets/images/dog.png");

  // ---------------------------
  // state
  // ---------------------------
  const [selectedUser, setSelectedUser] = useState<StorySelectedUser | null>(
    null,
  );
  const [scope, setScope] = React.useState<HomeScope>({ type: "friends" });
  const [markers, setMarkers] = React.useState<HomeMarker[]>([]);

  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );
  const [category, setCategory] = useState<string[]>([]);
  const [sort, setSort] = useState<string[]>(["recent"]);
  const [activeTab, setActiveTab] = useState<TabKey>("map");

  // coords -> lat/lng state (deps 깔끔하게 하려고)
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);

  // ---------------------------
  // stores
  // ---------------------------
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const refreshOnce = useLocationStore((s) => s.refreshOnce);
  const coords = useLocationStore((s) => s.coords);

  const friends = useFriendsStore((s) => s.friends);
  const loadFriends = useFriendsStore((s) => s.loadFriends);

  // ---------------------------
  // memo
  // ---------------------------
  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "latest" },
      { label: "거리순", value: "distance" },
    ],
    [],
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
    [],
  );

  const sortLabel =
    sortOptions.find((o) => o.value === sort[0])?.label ?? "최신순";

  const categoryLabel =
    category.length > 0
      ? (categoryOptions.find((o) => o.value === category[0])?.label ?? "업종")
      : "업종";

  const categoryOptionsForModal = useMemo(
    () => categoryOptions.filter((o) => o.value !== "all"),
    [categoryOptions],
  );

  // ---------------------------
  // refs
  // ---------------------------
  const mapRef = useRef<NaverMapViewRef>(null);

  // ---------------------------
  // map init camera
  // ---------------------------
  const [didInitCamera, setDidInitCamera] = useState(false);

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

  // ---------------------------
  // friends list load
  // ---------------------------
  useFocusEffect(
    React.useCallback(() => {
      if (!hasHydrated) return;
      if (!token) return;
      loadFriends();
    }, [hasHydrated, token, loadFriends]),
  );

  // ---------------------------
  // coords -> (lat,lng) state
  // ---------------------------
  useEffect(() => {
    const nextLat = (coords as any)?.latitude ?? (coords as any)?.lat;
    const nextLng = (coords as any)?.longitude ?? (coords as any)?.lng;

    if (nextLat == null || nextLng == null) return;

    setLat(nextLat);
    setLng(nextLng);
  }, [coords]);

  // ---------------------------
  // dummy markers for EMPTY places
  // ---------------------------
  const makeDummyMarkers = (baseLat: number, baseLng: number, s: HomeScope) => {
    const tag =
      s.type === "friends"
        ? "friends"
        : s.type === "me"
          ? "me"
          : `friend-${s.userId}`;

    const base =
      s.type === "friends" ? 0.0012 : s.type === "me" ? 0.0022 : 0.0032;

    return [
      {
        key: `dummy-${tag}-1`,
        lat: baseLat + base,
        lng: baseLng + base,
        raw: { dummy: true, tag, idx: 1 },
      },
      {
        key: `dummy-${tag}-2`,
        lat: baseLat - base,
        lng: baseLng - base,
        raw: { dummy: true, tag, idx: 2 },
      },
    ] as HomeMarker[];
  };

  // ---------------------------
  // fetch markers (deps: activeTab, scope, lat, lng)
  // ---------------------------
  useEffect(() => {
    if (activeTab !== "map") return;
    if (lat == null || lng == null) {
      console.log("[home-map] lat/lng 없음 -> skip");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        console.log("[home-map] fetch start:", { scope, lat, lng });

        // 1) friends (/main)
        if (scope.type === "friends") {
          const data = await fetchHomeMain({
            lat,
            lng,
            distance: HOME_DISTANCE,
          });
          if (cancelled) return;

          const next: HomeMarker[] = (data.places ?? []).map((p) => ({
            key: `main-${p.id}`,
            lat: p.lat,
            lng: p.lng,
            raw: p,
          }));

          if (next.length === 0) {
            const dummy = makeDummyMarkers(lat, lng, scope);
            setMarkers(dummy);
            console.log(
              "[home-map] /main ok: EMPTY -> dummy",
              dummy.map((d) => d.key),
            );
          } else {
            setMarkers(next);
            console.log("[home-map] /main ok:", next.length);
          }
          return;
        }

        // 2) me (/main/me)
        if (scope.type === "me") {
          const data = await fetchHomeMe({ lat, lng, distance: HOME_DISTANCE });
          if (cancelled) return;

          const next: HomeMarker[] = (data.places ?? []).map((p) => ({
            key: `me-${p.placeId}`,
            lat: p.lat,
            lng: p.lng,
            raw: p,
          }));

          if (next.length === 0) {
            const dummy = makeDummyMarkers(lat, lng, scope);
            setMarkers(dummy);
            console.log(
              "[home-map] /main/me ok: EMPTY -> dummy",
              dummy.map((d) => d.key),
            );
          } else {
            setMarkers(next);
            console.log("[home-map] /main/me ok:", next.length);
          }
          return;
        }

        // 3) friend (/main/{userId})
        const data = await fetchHomeUser({
          userId: scope.userId,
          lat,
          lng,
          distance: HOME_DISTANCE,
        });
        if (cancelled) return;

        const next: HomeMarker[] = (data.places ?? []).map((p) => ({
          key: `friend-${scope.userId}-${p.placeId}`,
          lat: p.lat,
          lng: p.lng,
          raw: p,
        }));

        if (next.length === 0) {
          const dummy = makeDummyMarkers(lat, lng, scope);
          setMarkers(dummy);
          console.log(
            "[home-map] /main/{id} ok: EMPTY -> dummy",
            dummy.map((d) => d.key),
          );
        } else {
          setMarkers(next);
          console.log("[home-map] /main/{id} ok:", next.length);
        }
      } catch (e: any) {
        console.log("[home-map] fetch error:", {
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
        // 실패해도 테스트는 계속: 더미로 찍어두기
        setMarkers(makeDummyMarkers(lat, lng, scope));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, scope, lat, lng]);

  // ---------------------------
  // render
  // ---------------------------
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

        {/* StoryList */}
        <StoryList
          myNickname={"내 닉네임"}
          myAvatarSource={DEFAULT_MY_IMAGE}
          friends={friends}
          onPressItem={(u: StorySelectedUser) => {
            setSelectedUser(u);

            if (u.scope === "me") {
              setScope({ type: "me" });
              return;
            }
            if (u.scope === "friend" && typeof u.userId === "number") {
              setScope({ type: "friend", userId: u.userId });
            }
          }}
          onPressFriends={() => {
            setSelectedUser(null);
            setScope({ type: "friends" });
          }}
        />

        {selectedUser ? (
          <View style={{ paddingRight: 16, paddingTop: 12 }}>
            <UserCard
              variant="story"
              profileImage={selectedUser.profileImage}
              nickname={selectedUser.nickname}
              userid={
                selectedUser.scope === "friend"
                  ? String(selectedUser.userId ?? "")
                  : (selectedUser.email ?? "")
              }
              bio={selectedUser.bio ?? ""}
              friendAvatars={[]}
              friendCount={0}
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
              <NaverMapView
                ref={mapRef}
                isShowLocationButton={false}
                style={[styles.map, StyleSheet.absoluteFillObject]}
                onInitialized={() => {
                  mapRef.current?.setLocationTrackingMode("None" as any);
                }}
              >
                <UserLocationMarker enableRotation />

                {markers.map((m) => (
                  <NaverMapMarkerOverlay
                    key={m.key}
                    latitude={m.lat}
                    longitude={m.lng}
                    image={HOME_PIN}
                    width={44}
                    height={44}
                    onTap={() => {
                      console.log("[home-map] marker tap:", {
                        scope,
                        key: m.key,
                        lat: m.lat,
                        lng: m.lng,
                        raw: m.raw,
                      });
                    }}
                  />
                ))}
              </NaverMapView>

              <MyLocationButton
                onPress={moveToCurrentLocation}
                bottom={40}
                left={15}
              />
            </View>
          )}

          {/* 장소 탭 */}
          {activeTab === "place" && (
            <View style={styles.placeholderBox}>
              <View style={{ flex: 1 }}>
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

          {/* 코멘트 탭 */}
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

  bodyContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 20,
  },

  tabBar: {
    justifyContent: "space-around",
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

  tabContent: { flex: 1 },

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
