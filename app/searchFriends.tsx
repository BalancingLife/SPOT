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
import { searchFriends, type FriendSearchItem } from "@/src/lib/api/friends";

export type FriendItem = FriendSearchItem;

export type RecentFriendItem = {
  id: string;
  keyword: string;
  profileImageUrl?: string | null;
};

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

  const debounceMs = 400;
  const timerRef = useRef<number | null>(null);
  const reqSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const keyword = searchInputText.trim();

    if (!keyword) {
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
        const data = await searchFriends(keyword, controller.signal);

        if (seq !== reqSeqRef.current) return;
        setResults(data);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }

        console.warn(
          "친구 검색 요청 에러:",
          err?.response?.status,
          err?.response?.data ?? err?.message,
        );

        if (seq !== reqSeqRef.current) return;
        setResults([]);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
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

    add({
      id: String(Date.now()),
      keyword,
    });
  }, [searchInputText, add]);

  const onSelectFriend = useCallback(
    (friend: FriendItem) => {
      add({
        id: String(Date.now()),
        keyword: friend.nickname || friend.userId,
        profileImageUrl: friend.profileImageUrl,
      });

      router.back();
    },
    [add],
  );

  return (
    <SafeAreaView style={styles.container}>
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
            data={results}
            onPressItem={(friend) => onSelectFriend(friend)}
            onPressAction={(friend) => {
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
