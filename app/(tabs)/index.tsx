// React / React Native
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
} from "react-native";

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
import { HOME_DISTANCE } from "@/src/components/home/constants";

// Map
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";

// Components
import { TopBar } from "@/src/components/home/TopBar";
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
import { useMyProfileStore } from "@/src/stores/useMyProfileStore";

// Styles
import { Colors } from "@/src/styles/Colors";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<StorySelectedUser | null>(
    null,
  );

  const [scope, setScope] = useState<HomeScope>({ type: "friends" });
  const [activeTab, setActiveTab] = useState<HomeTabKey>("map");

  const [markers, setMarkers] = useState<HomeMarker[]>([]);
  const [placeList, setPlaceList] = useState<HomePlaceItem[]>([]);
  const [commentList, setCommentList] = useState<HomeCommentItem[]>([]);

  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const refreshOnce = useLocationStore((state) => state.refreshOnce);
  const coords = useLocationStore((state) => state.coords);

  const friends = useFriendsStore((state) => state.friends);
  const loadFriends = useFriendsStore((state) => state.loadFriends);

  const fetchMyProfile = useMyProfileStore((state) => state.fetchMyProfile);

  const lat = coords?.lat;
  const lng = coords?.lng;

  const mapRef = useRef<NaverMapViewRef>(null);
  const commentSheetRef = useRef<CommentBottomSheetHandle>(null);

  const [didInitCamera, setDidInitCamera] = useState(false);

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [morePlace, setMorePlace] = useState<any>(null);
  const [moreComments, setMoreComments] = useState<any[]>([]);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const [isCommentOpen, setIsCommentOpen] = useState(false);

  /** -----------------------------
   *  오토 하이딩 헤더 상태
   *  ----------------------------- */
  const [headerMeasuredHeight, setHeaderMeasuredHeight] = useState(0);
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  const headerHeightAnim = useRef(new Animated.Value(0)).current;
  const isHeaderHiddenRef = useRef(false);

  const showHeader = useCallback(() => {
    if (headerMeasuredHeight <= 0) return;
    if (!isHeaderHiddenRef.current) return;

    isHeaderHiddenRef.current = false;

    Animated.timing(headerHeightAnim, {
      toValue: headerMeasuredHeight,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [headerMeasuredHeight, headerHeightAnim]);

  const hideHeader = useCallback(() => {
    if (headerMeasuredHeight <= 0) return;
    if (isHeaderHiddenRef.current) return;

    isHeaderHiddenRef.current = true;

    Animated.timing(headerHeightAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [headerMeasuredHeight, headerHeightAnim]);

  const handleHeaderLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      if (height <= 0) return;

      if (!isHeaderReady) {
        setHeaderMeasuredHeight(height);
        headerHeightAnim.setValue(height);
        isHeaderHiddenRef.current = false;
        setIsHeaderReady(true);
      }
    },
    [isHeaderReady, headerHeightAnim],
  );

  const handleScrollDirection = useCallback(
    (direction: "up" | "down") => {
      if (direction === "down") {
        hideHeader();
        return;
      }

      showHeader();
    },
    [hideHeader, showHeader],
  );

  useEffect(() => {
    showHeader();
  }, [activeTab, showHeader]);

  // 탭 진입 시 1회 위치 갱신
  useEffect(() => {
    if (activeTab !== "map") return;
    refreshOnce?.();
    setDidInitCamera(false);
  }, [activeTab, refreshOnce]);

  // coords 잡히면 내 위치에서 시작
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

  // 화면 다시 보일때마다, 친구 목록 불러오기
  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated) return;
      if (!token) return;

      fetchMyProfile();
      loadFriends();
    }, [hasHydrated, token, loadFriends, fetchMyProfile]),
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
   *  MAP 탭: scope별 장소 리스트 로드
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "map") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
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
            imageUrl: p.photo,
            raw: p,
          }));

          if (next.length === 0) {
            setMarkers(makeDummyMarkers(lat, lng, scope));
          } else {
            setMarkers(next);
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
            setMarkers(makeDummyMarkers(lat, lng, scope));
          } else {
            setMarkers(next);
          }
          return;
        }

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
          setMarkers(makeDummyMarkers(lat, lng, scope));
        } else {
          setMarkers(next);
        }
      } catch (e: any) {
        console.log("홈 화면 지도 탭 데이터 fetch 오류:", {
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
   *  PLACE 탭: scope별 장소 리스트 로드
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "place") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
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
          setPlaceList(makeDummyPlaces(scope));
        } else {
          setPlaceList(list);
        }
      } catch (e: any) {
        console.log("PLACE 탭 fetch error:", {
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
   *  COMMENT 탭: scope별 코멘트 리스트 로드
   *  ----------------------------- */
  useEffect(() => {
    if (activeTab !== "comment") return;
    if (lat == null || lng == null) return;

    let cancelled = false;

    (async () => {
      try {
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
          setCommentList(makeDummyComments(scope));
        } else {
          setCommentList(list);
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

  const loadPlaceDetail = async (placeId: number) => {
    if (lat == null || lng == null) return;

    setMoreLoading(true);
    setMoreError(null);

    try {
      const data = await fetchPlaceMore({ lat, lng, placeId });
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

  const handleSelectStory = (user: StorySelectedUser | null) => {
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

  const moveToCurrentLocation = async () => {
    await refreshOnce?.();

    const c = useLocationStore.getState().coords;
    if (!c) return;

    mapRef.current?.animateCameraTo?.({
      latitude: c.lat,
      longitude: c.lng,
      zoom: 16,
      duration: 400,
    });
  };

  const handlePressMapMarker = (placeId: number) => {
    setSelectedPlaceId(placeId);
    commentSheetRef.current?.open(0);
    loadPlaceDetail(placeId);
  };

  const handlePressTab = (tab: HomeTabKey) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />

      {!isHeaderReady ? (
        <View onLayout={handleHeaderLayout}>
          <HomeHeader
            friends={friends}
            selectedUser={selectedUser}
            onSelectStory={handleSelectStory}
          />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.animatedHeaderContainer,
            {
              height: headerHeightAnim,
            },
          ]}
        >
          <HomeHeader
            friends={friends}
            selectedUser={selectedUser}
            onSelectStory={handleSelectStory}
          />
        </Animated.View>
      )}

      <View style={styles.bodyContainer}>
        <TabBar activeTab={activeTab} onPressTab={handlePressTab} />

        <View style={styles.tabContent}>
          {activeTab === "map" && (
            <MapTabSection
              mapRef={mapRef}
              markers={markers}
              isCommentOpen={isCommentOpen}
              onPressCurrentLocation={moveToCurrentLocation}
              onPressMarker={handlePressMapMarker}
            />
          )}

          {activeTab === "place" && (
            <PlaceTabSection
              placeList={placeList}
              onScrollDirection={handleScrollDirection}
            />
          )}

          {activeTab === "comment" && (
            <CommentTabSection
              scope={scope}
              commentList={commentList}
              onScrollDirection={handleScrollDirection}
            />
          )}
        </View>
      </View>

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
          if (selectedPlaceId != null) loadPlaceDetail(selectedPlaceId);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

  animatedHeaderContainer: {
    overflow: "hidden",
    backgroundColor: Colors.white,
  },

  bodyContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 20,
  },

  tabContent: { flex: 1 },
});
