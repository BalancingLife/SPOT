// app/(tabs)/index.tsx
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
import type { SelectedUser as StorySelectedUser } from "@/src/components/home/StoryList";

import {
  fetchHomeMain,
  fetchHomeMe,
  fetchHomeUser,
  fetchHomePlacesMain,
  fetchHomePlacesMe,
  fetchHomePlacesUser,
  fetchHomeCommentsMain,
  fetchHomeCommentsMe,
  fetchHomeCommentsUser,
  type HomePlaceItem,
  type HomeCommentItem,
} from "@/src/lib/api/home";

const TABS = [
  { key: "map", label: "지도" },
  { key: "place", label: "장소" },
  { key: "comment", label: "코멘트" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type HomeScope =
  | { type: "friends" }
  | { type: "me" }
  | { type: "friend"; userId: number };

type HomeMarker = {
  key: string;
  lat: number;
  lng: number;
  raw: any;
};

const dummyCardFallbackImgs = [
  require("@/assets/images/example.png"),
  require("@/assets/images/react-logo.png"),
  require("@/assets/images/spot-icon-orange.png"),
];

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<StorySelectedUser | null>(
    null,
  );

  const HOME_DISTANCE = 10;
  const HOME_PIN = require("@/assets/images/spot-icon-orange.png");

  const [scope, setScope] = React.useState<HomeScope>({ type: "friends" });

  // map markers
  const [markers, setMarkers] = React.useState<HomeMarker[]>([]);

  // place list
  const [placeList, setPlaceList] = React.useState<HomePlaceItem[]>([]);

  // comment list
  const [commentList, setCommentList] = React.useState<HomeCommentItem[]>([]);

  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const DEFAULT_MY_IMAGE = require("@/assets/images/dog.png");
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );
  const [category, setCategory] = useState<string[]>([]);
  const [sort, setSort] = useState<string[]>(["recent"]);

  const [activeTab, setActiveTab] = useState<TabKey>("map");

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

  const mapRef = useRef<NaverMapViewRef>(null);

  const refreshOnce = useLocationStore((s) => s.refreshOnce);
  const coords = useLocationStore((s) => s.coords);

  // coords에서 lat/lng만 뽑아서 deps 깔끔하게
  const lat = (coords as any)?.latitude ?? (coords as any)?.lat;
  const lng = (coords as any)?.longitude ?? (coords as any)?.lng;

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
    if (lat == null || lng == null) return;
    if (didInitCamera) return;

    mapRef.current?.animateCameraTo?.({
      latitude: lat,
      longitude: lng,
      zoom: 16,
      duration: 400,
    });

    setDidInitCamera(true);
  }, [activeTab, lat, lng, didInitCamera]);

  const moveToCurrentLocation = async () => {
    const next = await refreshOnce?.();
    const c = next ?? coords ?? (useLocationStore as any).getState?.().coords;

    if (!c) return;

    const nextLat = (c as any).latitude ?? (c as any).lat;
    const nextLng = (c as any).longitude ?? (c as any).lng;
    if (nextLat == null || nextLng == null) return;

    mapRef.current?.animateCameraTo?.({
      latitude: nextLat,
      longitude: nextLng,
      zoom: 16,
      duration: 400,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!hasHydrated) return;
      if (!token) return;
      loadFriends();
    }, [hasHydrated, token, loadFriends]),
  );

  /** -----------------------------
   *  더미 생성기 (테스트용)
   *  ----------------------------- */

  const makeDummyMarkers = (baseLat: number, baseLng: number, s: HomeScope) => {
    const tag =
      s.type === "friends"
        ? "friends"
        : s.type === "me"
          ? "me"
          : `friend-${s.userId}`;
    const offset =
      s.type === "friends" ? 0.0012 : s.type === "me" ? 0.0022 : 0.0032;

    return [
      {
        key: `dummy-${tag}-1`,
        lat: baseLat + offset,
        lng: baseLng + offset,
        raw: { dummy: true, tag, idx: 1 },
      },
      {
        key: `dummy-${tag}-2`,
        lat: baseLat - offset,
        lng: baseLng - offset,
        raw: { dummy: true, tag, idx: 2 },
      },
    ] as HomeMarker[];
  };

  const makeDummyPlaces = (s: HomeScope): HomePlaceItem[] => {
    const tag =
      s.type === "friends"
        ? "friends"
        : s.type === "me"
          ? "me"
          : `friend-${s.userId}`;

    return new Array(3).fill(0).map((_, i) => ({
      id: 9000 + i,
      gid: `dummy-gid-${tag}-${i}`,
      photos: [
        `https://placehold.co/300x300/png?text=${encodeURIComponent(
          `${tag}-P${i + 1}-1`,
        )}`,
        `https://placehold.co/300x300/png?text=${encodeURIComponent(
          `${tag}-P${i + 1}-2`,
        )}`,
        `https://placehold.co/300x300/png?text=${encodeURIComponent(
          `${tag}-P${i + 1}-3`,
        )}`,
      ],
      name: `더미 장소(${tag}) #${i + 1}`,
      address: `더미 주소 ${i + 1}`,
      rating: 4.2,
      ratingCount: 123,
      list: "cafe",
      savedCount: 10 + i,
      memPhotos: [
        `https://placehold.co/100x100/png?text=A`,
        `https://placehold.co/100x100/png?text=B`,
        `https://placehold.co/100x100/png?text=C`,
      ],

      searchCount: 0,
      score: 0,
      distance: 0,
      lat: 37.5665 + 0.001 * i,
      lng: 126.978 + 0.001 * i,
      comment: "더미 코멘트",
      commentCount: 1,
      memId: 0,
      commentPhoto: "",
      marked: false,
    }));
  };

  const makeDummyComments = (s: HomeScope): HomeCommentItem[] => {
    const tag =
      s.type === "friends"
        ? "friends"
        : s.type === "me"
          ? "me"
          : `friend-${s.userId}`;

    return new Array(5).fill(0).map((_, i) => ({
      id: 8000 + i,
      placeId: 7000 + i,
      gid: `dummy-gid-${tag}-${i}`,
      photos: [],
      name: `더미 장소명(${tag}) #${i + 1}`,
      address: `더미 주소 ${i + 1}`,
      score: 5,
      comment: `더미 코멘트(${tag}) - ${i + 1}`,
      memId: 0,
      memEmail: "dummy@spot.com",
      commentPhoto: "",
      createdAt: new Date().toISOString(),
      marked: false,
    }));
  };

  /** -----------------------------
   *  MAP 탭: scope별 마커 데이터 로드 (+ 비면 더미 마커)
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "map") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
        console.log("[home-map] fetch start:", { scope, lat, lng });

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

        // friend
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
        setMarkers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, scope, lat, lng]);

  /** -----------------------------
   *  PLACE 탭: scope별 장소 리스트 로드 (+ 비면 더미 리스트)
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "place") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
        console.log("[home-place] fetch start:", { scope, lat, lng });

        let list: HomePlaceItem[] = [];

        if (scope.type === "friends") {
          list = await fetchHomePlacesMain({ lat, lng });
        } else if (scope.type === "me") {
          list = await fetchHomePlacesMe({ lat, lng });
        } else {
          list = await fetchHomePlacesUser({ userId: scope.userId, lat, lng });
        }

        if (cancelled) return;

        if (!list || list.length === 0) {
          const dummy = makeDummyPlaces(scope);
          setPlaceList(dummy);
          console.log(
            "[home-place] EMPTY -> dummy",
            dummy.map((d) => d.name),
          );
        } else {
          setPlaceList(list);
          console.log("[home-place] ok:", list.length);
        }
      } catch (e: any) {
        console.log("[home-place] fetch error:", {
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
        if (!cancelled) setPlaceList(makeDummyPlaces(scope));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, scope, lat, lng]);

  /** -----------------------------
   *  COMMENT 탭: scope별 코멘트 리스트 로드 (+ 비면 더미 리스트)
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "comment") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
        console.log("[home-comment] fetch start:", { scope, lat, lng });

        let list: HomeCommentItem[] = [];

        if (scope.type === "friends") {
          list = await fetchHomeCommentsMain({ lat, lng, page: 0, size: 10 });
        } else if (scope.type === "me") {
          list = await fetchHomeCommentsMe({ lat, lng, page: 0, size: 10 });
        } else {
          list = await fetchHomeCommentsUser({
            userId: scope.userId,
            lat,
            lng,
            page: 0,
            size: 10,
          });
        }

        if (cancelled) return;

        if (!list || list.length === 0) {
          const dummy = makeDummyComments(scope);
          setCommentList(dummy);
          console.log(
            "[home-comment] EMPTY -> dummy",
            dummy.map((d) => d.comment),
          );
        } else {
          setCommentList(list);
          console.log("[home-comment] ok:", list.length);
        }
      } catch (e: any) {
        console.log("[home-comment] fetch error:", {
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
        if (!cancelled) setCommentList(makeDummyComments(scope));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, scope, lat, lng]);

  /** -----------------------------
   *  UI
   *  ----------------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* top bar */}
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

      {/* body */}
      <View style={styles.bodyContainer}>
        {/* tab bar */}
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

        {/* tab content */}
        <View style={styles.tabContent}>
          {/* MAP */}
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

          {/* PLACE */}
          {activeTab === "place" && (
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
                {placeList.map((p) => {
                  const imgs =
                    Array.isArray(p.photos) && p.photos.length > 0
                      ? p.photos.map((u) => ({ uri: u }))
                      : dummyCardFallbackImgs;

                  const savedUsers =
                    Array.isArray(p.memPhotos) && p.memPhotos.length > 0
                      ? p.memPhotos.slice(0, 3).map((u) => ({ uri: u }))
                      : undefined;

                  return (
                    <PlaceCard
                      key={String(p.id)}
                      name={p.name}
                      category={p.list}
                      address={p.address}
                      images={imgs as any[]}
                      savedUsers={savedUsers as any[]}
                      savedCount={p.savedCount}
                      showDirectionButton={true}
                      rating={p.rating}
                      reviewCount={p.ratingCount}
                      showBookmark={true}
                      isBookmarked={p.marked}
                      distanceText={
                        typeof p.distance === "number"
                          ? p.distance >= 1000
                            ? `${(p.distance / 1000).toFixed(1)}km`
                            : `${Math.round(p.distance)}m`
                          : undefined
                      }
                      onToggleBookmark={() =>
                        console.log("[home-place] bookmark:", p.id)
                      }
                      onPress={() => console.log("[home-place] press:", p.id)}
                    />
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
              <OptionModal
                visible={opened === "category"}
                title="업종"
                options={categoryOptionsForModal}
                selected={category}
                onSelect={(next) => setCategory(next)}
                onClose={() => setOpened(null)}
              />
            </View>
          )}

          {/* COMMENT */}
          {activeTab === "comment" && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {commentList.map((c) => (
                <View
                  key={String(c.id)}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.gray_100,
                  }}
                >
                  <Text style={TextStyles.SemiBold16}>{c.name}</Text>
                  <Text
                    style={[TextStyles.Regular12, { color: Colors.gray_400 }]}
                  >
                    {c.address}
                  </Text>
                  <Text style={[TextStyles.Regular12, { marginTop: 6 }]}>
                    {c.comment}
                  </Text>
                  <Text
                    style={[
                      TextStyles.Regular12,
                      { color: Colors.gray_300, marginTop: 6 },
                    ]}
                  >
                    {c.createdAt}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  headerContainer: { backgroundColor: Colors.white, paddingLeft: 16 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 16,
  },
  spotLogo: { width: 63, height: 29 },
  friendsIconContainer: { flexDirection: "row", gap: 16 },
  friendsIcon: { width: 24, height: 24 },

  bodyContainer: { flex: 1, backgroundColor: Colors.white, paddingTop: 20 },

  tabBar: { justifyContent: "space-around", flexDirection: "row" },
  tabItem: { alignItems: "center", paddingHorizontal: 20 },
  tabLabel: { ...TextStyles.SemiBold16, marginBottom: 4 },
  tabLabelActive: { color: Colors.primary_500, fontWeight: "600" },
  tabLabelInactive: { color: Colors.gray_300 },
  tabUnderline: {
    width: "230%",
    height: 4,
    backgroundColor: Colors.primary_500,
  },

  tabContent: { flex: 1 },

  mapContainer: { flex: 1, backgroundColor: Colors.gray_100 },
  map: { flex: 1, zIndex: 0 },
});
