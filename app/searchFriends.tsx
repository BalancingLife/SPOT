import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/src/styles/Colors";
import { TextStyles } from "@/src/styles/TextStyles";
import RecentFriendSearch from "@/src/components/friends/RecentFriendSearch";
import FriendSearchResult from "@/src/components/friends/FriendSearchResult";
import { api8080 } from "@/src/lib/api/client";

// ✅ 타입은 너희 서버 스펙에 맞춰 나중에 조정
export type FriendItem = {
  id: number;
  nickname: string;
  userId: string; // 또는 username
  profileImageUrl: string | null;
};

export type RecentFriendItem = {
  id: string;
  keyword: string; // 닉네임/아이디 검색 문자열
  profileImageUrl?: string | null; // 있으면 프사칩
};

// ✅ 최근 검색은 장소 store랑 비슷한 형태로 "가짜 구현"해둠
// 나중에 useRecentFriendSearchStore로 교체해
function useRecentFriendSearchMock() {
  const [items, setItems] = useState<RecentFriendItem[]>([
    { id: "1", keyword: "김하늘" },
    { id: "2", keyword: "박철수" },
    { id: "3", keyword: "아이러브푸드" },
    { id: "4", keyword: "koilver_", profileImageUrl: null },
  ]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    // TODO: 서버 연동 시 여기에서 불러오기
    setLoading(false);
  }, []);

  const add = useCallback((item: RecentFriendItem) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.keyword !== item.keyword);
      return [item, ...filtered].slice(0, 10);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return { items, loading, fetch, add, remove, clear };
}

export default function SearchFriendScreen() {
  const [searchInputText, setSearchInputText] = useState("");
  const [results, setResults] = useState<FriendItem[] | null>(null);

  const showRecent = !searchInputText || results === null;
  const showResults = Array.isArray(results) && results.length > 0;

  const recentStore = useRecentFriendSearchMock();
  const {
    items: recent,
    loading: recentLoading,
    fetchRecent,
    add,
    remove,
    clear,
  } = {
    items: recentStore.items,
    loading: recentStore.loading,
    fetchRecent: recentStore.fetch,
    add: recentStore.add,
    remove: recentStore.remove,
    clear: recentStore.clear,
  };

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // ---- 디바운싱 + 최신요청만 처리 ----
  const debounceMs = 400;
  const timerRef = useRef<number | null>(null);
  const reqSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const keyword = searchInputText.trim();
    if (!keyword || keyword.length < 1) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setResults(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const seq = ++reqSeqRef.current;

      try {
        // ✅ 너희 서버에 맞춰 엔드포인트/params만 바꾸면 됨
        // 예: GET /friends/search?keyword=...
        const res = await api8080.get<FriendItem[]>("/friends/search", {
          params: { keyword },
          signal: controller.signal,
        });

        if (seq !== reqSeqRef.current) return;
        setResults(res.data ?? []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.warn(
          "친구 검색 요청 에러:",
          err?.response?.status,
          err?.response?.data ?? err.message,
        );
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchInputText]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const submitAndSearch = useCallback(() => {
    const keyword = searchInputText.trim();
    if (!keyword) return;

    // “엔터 눌렀을 때”도 최근검색에 저장하고 싶으면 여기서 add
    add({
      id: String(Date.now()),
      keyword,
    });
  }, [searchInputText, add]);

  const onSelectFriend = useCallback(
    (friend: FriendItem) => {
      // ✅ 최근검색 저장
      add({
        id: String(Date.now()),
        keyword: friend.nickname || friend.userId,
        profileImageUrl: friend.profileImageUrl,
      });

      // ✅ 동작은 너희 플로우에 맞게:
      // 1) 친구 상세로 이동
      // router.push(`/friend/${friend.id}`);

      // 2) or 이전 화면으로 돌아가서 선택값 반영
      router.back();
    },
    [add],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <View style={styles.inputWrap}>
          <Pressable onPress={() => submitAndSearch()}>
            <Image
              source={
                searchInputText
                  ? require("@/assets/images/search-input-icon-black.png")
                  : require("@/assets/images/search-input-icon-gray.png")
              }
              style={styles.searchIcon}
            />
          </Pressable>

          <TextInput
            autoFocus
            placeholder="별명 또는 아이디를 입력해주세요"
            value={searchInputText}
            onChangeText={setSearchInputText}
            placeholderTextColor={Colors.gray_300}
            style={styles.inputText}
            returnKeyType="search"
            onSubmitEditing={() => submitAndSearch()}
          />

          {searchInputText ? (
            <Pressable
              onPress={() => {
                setSearchInputText("");
                setResults(null);
              }}
            >
              <Image
                source={require("@/assets/images/x-gray.png")}
                style={styles.xIcon}
              />
            </Pressable>
          ) : null}
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>취소</Text>
        </Pressable>
      </View>

      {/* 바디 */}
      <View style={styles.body}>
        {showRecent && (
          <RecentFriendSearch
            items={recent}
            loading={recentLoading}
            onTapKeyword={(k) => setSearchInputText(k)}
            onRemoveKeyword={(id) => remove(id)}
            onClearAll={() => clear()}
          />
        )}

        {!showRecent && !showResults && (
          <Text style={TextStyles.Medium16}>검색 결과가 없어요.</Text>
        )}

        {showResults && (
          <FriendSearchResult
            data={results!}
            onPressItem={(friend) => onSelectFriend(friend)}
            onPressAction={(friend) => {
              // ✅ 오른쪽 버튼 액션(예: 친구요청) 자리
              onSelectFriend(friend);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    paddingBottom: 12,
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  searchIcon: { width: 24, height: 24, marginRight: 9 },
  inputText: { ...TextStyles.Medium16, flex: 1 },
  xIcon: { width: 24, height: 24 },
  backBtn: { ...TextStyles.Medium16, color: Colors.gray_800 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 5 },
});
