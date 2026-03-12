// React / React Native
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Routing
import { useFocusEffect } from "expo-router";

// Map

import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";

// Components
import { HomeHeader } from "@/src/components/home/HomeHeader";
import { MapTabSection } from "@/src/components/home/MapTabSection";
import FilterBar from "@/src/components/bottomSheet/FilterBar";
import CommentBottomSheet, {
  type CommentBottomSheetHandle,
} from "@/src/components/comment/CommentBottomSheet";
import type { SelectedUser as StorySelectedUser } from "@/src/components/home/StoryList";

import OptionModal from "@/src/components/OptionModal";

// API
import {
  fetchHomeCommentsMain,
  fetchHomeCommentsMe,
  fetchHomeCommentsUser,
  fetchHomeMain,
  fetchHomeMe,
  fetchHomePlacesMain,
  fetchHomePlacesMe,
  fetchHomePlacesUser,
  fetchHomeUser,
  type HomeCommentItem,
  type HomePlaceItem,
} from "@/src/lib/api/home";
import { fetchPlaceMore } from "@/src/lib/api/places";

// Stores
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useFriendsStore } from "@/src/stores/useFriendsStore";
import { useLocationStore } from "@/src/stores/useLocationStore";

// Styles
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import { PlaceTabSection } from "@/src/components/home/PlaceTabSection";

const HOME_TABS = [
  { key: "map", label: "지도" },
  { key: "place", label: "장소" },
  { key: "comment", label: "코멘트" },
] as const;
// as const를 쓰면 배열/객체의 값이 바뀌지 않는 상수로 취급되고,
// "map" 같은 값도 string이 아니라 리터럴 타입으로 정확히 추론된다.

type HomeTab = (typeof HOME_TABS)[number];
type HomeTabKey = HomeTab["key"];

type HomeScope =
  | { type: "me" }
  | { type: "friends" }
  | { type: "friend"; userId: number };

export type HomeMarker = {
  key: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  raw: any;
};

export default function Home() {
  // 선택된 유저 상태
  const [selectedUser, setSelectedUser] = useState<StorySelectedUser | null>(
    null,
  );

  // 홈 화면 기본 상수
  const HOME_DISTANCE = 1000;

  // 홈 화면 범위(전체 / 나 / 친구 등) 상태
  const [scope, setScope] = useState<HomeScope>({ type: "friends" });

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<HomeTabKey>("map");

  // 필터 모달 열림 상태
  const [opened, setOpened] = useState<"sort" | "save" | "category" | null>(
    null,
  );

  // 필터 선택 상태
  const [sort, setSort] = useState<string[]>(["recent"]);

  // 지도 마커 데이터
  const [markers, setMarkers] = useState<HomeMarker[]>([]);

  // 장소/코멘트 리스트 데이터
  const [placeList, setPlaceList] = useState<HomePlaceItem[]>([]);
  const [commentList, setCommentList] = useState<HomeCommentItem[]>([]);

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

  // 인증 관련 전역 상태
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // 위치 관련 전역 상태
  const refreshOnce = useLocationStore((state) => state.refreshOnce);
  const coords = useLocationStore((state) => state.coords);

  // friends 데이터와 로딩 함수
  const friends = useFriendsStore((state) => state.friends);
  const loadFriends = useFriendsStore((state) => state.loadFriends);

  // coords 객체에서 위도/경도만 꺼내 deps나 분기에서 쓰기 쉽게 정리한다.
  const lat = (coords as any)?.latitude ?? (coords as any)?.lat;
  const lng = (coords as any)?.longitude ?? (coords as any)?.lng;

  // 지도 ref
  const mapRef = useRef<NaverMapViewRef>(null);

  // 댓글 바텀시트 ref
  const commentSheetRef = useRef<CommentBottomSheetHandle>(null);

  // 지도 카메라 최초 이동 여부를 관리한다.
  const [didInitCamera, setDidInitCamera] = useState(false);

  // 선택된 장소와 추가 데이터 상태
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [morePlace, setMorePlace] = useState<any>(null);
  const [moreComments, setMoreComments] = useState<any[]>([]);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  // 댓글 바텀시트 열림 여부
  const [isCommentOpen, setIsCommentOpen] = useState(false);

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

    const basePlaceId =
      s.type === "friends" ? 10000 : s.type === "me" ? 20000 : 30000;

    return [
      {
        key: `dummy-${tag}-1`,
        lat: baseLat + offset,
        lng: baseLng + offset,
        raw: {
          placeId: basePlaceId + 1,
          dummy: true,
          tag,
          idx: 1,
        },
      },
      {
        key: `dummy-${tag}-2`,
        lat: baseLat - offset,
        lng: baseLng - offset,
        raw: {
          placeId: basePlaceId + 2,
          dummy: true,
          tag,
          idx: 2,
        },
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
      comment: `더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 더미 코멘트 (${tag}) - ${i + 1}`,
      memId: 0,
      memEmail: "dummy@spot.com",
      commentPhoto: "",
      createdAt: new Date().toISOString(),
      marked: false,
    }));
  };

  const formatYMD = (iso: string) => {
    // "2026-01-18T..." -> "2026.01.18"
    return String(iso).slice(0, 10).replaceAll("-", ".");
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

        const toMarkerKey = (prefix: string, p: any, fallbackIdx: number) => {
          const id = p?.placeId ?? p?.id ?? p?.gid ?? p?.num ?? fallbackIdx;
          return `${prefix}-${String(id)}`;
        };

        if (scope.type === "friends") {
          const data = await fetchHomeMain({
            lat,
            lng,
            distance: HOME_DISTANCE,
          });
          if (cancelled) return;

          const next: HomeMarker[] = (data.places ?? []).map((p: any, idx) => ({
            key: toMarkerKey("main", p, idx),
            lat: p.lat,
            lng: p.lng,
            imageUrl: p.photo, // ✅ S3 URL을 마커 이미지로
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

          const next: HomeMarker[] = (data.places ?? []).map((p: any, idx) => ({
            key: toMarkerKey("me", p, idx),
            lat: p.lat,
            lng: p.lng,
            imageUrl: p.photo,
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
          includeMarkerBadgeLayout: true,
        });
        if (cancelled) return;

        const next: HomeMarker[] = (data.places ?? []).map((p: any, idx) => ({
          key: toMarkerKey(`friend-${scope.userId}`, p, idx),
          lat: p.lat,
          lng: p.lng,
          imageUrl: p.photo,
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

  const loadMore = async (placeId: number) => {
    if (lat == null || lng == null) return;

    setMoreLoading(true);
    setMoreError(null);

    try {
      const data = await fetchPlaceMore({ lat, lng, placeId }); // ✅ 너가 준 함수 사용
      setMorePlace(data.places ?? null);
      setMoreComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (e: any) {
      setMoreError(e?.message ?? "failed");
      setMorePlace(null);
      setMoreComments([]);
    } finally {
      setMoreLoading(false);
    }
  };

  // HomeHeader
  const handleSelectStory = (user: StorySelectedUser | null) => {
    // 유저 정보가 없다면 전체 친구들 스코프
    if (!user) {
      setSelectedUser(null);
      setScope({ type: "friends" });
      return;
    }

    setSelectedUser(user);

    if (user.scope === "me") {
      setScope({ type: "me" });
      return;
    }

    if (user.scope === "friend" && typeof user.userId === "number") {
      setScope({ type: "friend", userId: user.userId });
    }
  };

  // MapTabSection
  const handlePressMapMarker = (placeId: number) => {
    console.log("hihhihihi");
    setSelectedPlaceId(placeId);
    commentSheetRef.current?.open(0);
    loadMore(placeId);
  };

  /** -----------------------------
   *  UI
   *  ----------------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* header */}
      <HomeHeader
        friends={friends}
        selectedUser={selectedUser}
        onSelectStory={handleSelectStory}
      />

      {/* body */}
      <View style={styles.bodyContainer}>
        {/* tab bar */}
        <View style={styles.tabBar}>
          {HOME_TABS.map((tab) => {
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
            <MapTabSection
              mapRef={mapRef}
              markers={markers}
              isCommentOpen={isCommentOpen}
              onPressCurrentLocation={moveToCurrentLocation}
              onPressMarker={handlePressMapMarker}
            />
          )}

          {/* PLACE */}
          {activeTab === "place" && <PlaceTabSection placeList={placeList} />}

          {/* COMMENT */}
          {activeTab === "comment" && (
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
                    typeof c.commentPhoto === "string" &&
                    c.commentPhoto.length > 0;

                  return (
                    <View key={String(c.id)} style={styles.commentItem}>
                      {/* 작성자 Row */}
                      <View style={styles.commentHeaderRow}>
                        <Image
                          source={{ uri: avatarUrl }}
                          style={styles.commentAvatar}
                        />

                        <View style={styles.commentHeaderTextCol}>
                          <Text
                            style={styles.commentNickname}
                            numberOfLines={1}
                          >
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
                                idx !== topPhotos.length - 1 &&
                                  styles.commentThumbMr,
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
                          <Text
                            style={styles.commentPlaceName}
                            numberOfLines={1}
                          >
                            {c.name}
                          </Text>
                          <Text
                            style={styles.commentPlaceAddr}
                            numberOfLines={1}
                          >
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
          )}
        </View>
      </View>

      {/* 지도  탭 장소 누르면 나오는 코멘트 바텀 시트 */}
      <CommentBottomSheet
        ref={commentSheetRef}
        onOpen={() => setIsCommentOpen(true)}
        onClose={() => setIsCommentOpen(false)}
        placeId={selectedPlaceId}
        place={morePlace}
        comments={moreComments}
        loading={moreLoading}
        error={moreError}
        onRetry={() => {
          if (selectedPlaceId != null) loadMore(selectedPlaceId);
        }}
      />
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
