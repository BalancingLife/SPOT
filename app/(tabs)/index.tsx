// React / React Native
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

// Routing
import { useFocusEffect } from "expo-router";

// types and constants
import {
  type HomeScope,
  type HomeCommentItem,
  type HomePlaceItem,
  type HomeMarker,
  HomeTabKey,
} from "@/src/components/home/types";
import type { SelectedUser as StorySelectedUser } from "@/src/components/home/StoryList";

// Map
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";

// Components
import { HomeHeader } from "@/src/components/home/HomeHeader";
import { MapTabSection } from "@/src/components/home/MapTabSection";
import { PlaceTabSection } from "@/src/components/home/PlaceTabSection";
import { CommentTabSection } from "@/src/components/home/CommentTabSection";
import { TabBar } from "@/src/components/home/TabBar";
import CommentBottomSheet, {
  type CommentBottomSheetHandle,
} from "@/src/components/comment/CommentBottomSheet";

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
} from "@/src/lib/api/home";
import { fetchPlaceMore } from "@/src/lib/api/places";

// Stores
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useFriendsStore } from "@/src/stores/useFriendsStore";
import { useLocationStore } from "@/src/stores/useLocationStore";

// Styles
import { Colors } from "@/src/styles/Colors";

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

  // 지도 마커 데이터
  const [markers, setMarkers] = useState<HomeMarker[]>([]);

  // 장소/코멘트 리스트 데이터
  const [placeList, setPlaceList] = useState<HomePlaceItem[]>([]);
  const [commentList, setCommentList] = useState<HomeCommentItem[]>([]);

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
    setSelectedPlaceId(placeId);
    commentSheetRef.current?.open(0);
    loadMore(placeId);
  };

  // TabBar
  const handlePressTab = (tab: HomeTabKey) => {
    setActiveTab(tab);
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
        <TabBar activeTab={activeTab} onPressTab={handlePressTab} />

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
            <CommentTabSection scope={scope} commentList={commentList} />
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

  tabContent: { flex: 1 },
});
