// app/search/index.tsx
import React, { useEffect, useRef, useState } from "react";
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
import { useLocationStore } from "@/src/stores/useLocationStore";
import client from "@/src/lib/api/client";
import RecentSearch from "@/src/components/search/recentSearch";
import SearchResult from "@/src/components/search/searchResult";

type SearchPayload = {
  keyword: string;
  lat: number | null;
  lng: number | null;
};

export type SearchResultItem = {
  name: string;
  address: string;
  gid: string;
  photoUrl: string | null;
  category: string;
  distance: number; // m
};

export default function SearchPage() {
  const [searchInputText, setSearchInputText] = useState("");
  const { coords, refreshOnce } = useLocationStore();
  const [results, setResults] = useState<SearchResultItem[] | null>(null);

  const showRecent = !searchInputText || results === null;
  const showResults = Array.isArray(results) && results.length > 0;

  // 컴포넌트 진입 시 좌표가 없으면 한 번 갱신 시도(선택)
  useEffect(() => {
    if (coords.lat === null || coords.lng === null) {
      refreshOnce().catch(() => {});
    }
  }, [coords.lat, coords.lng, refreshOnce]);

  // ---- 디바운싱 + 최신요청만 처리 ----
  const debounceMs = 400;
  const timerRef = useRef<number | null>(null);
  const reqSeqRef = useRef(0); // 증가하는 요청 id
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // trim + 최소 길이 조건(원하면 조정)
    const keyword = searchInputText.trim();
    if (!keyword || keyword.length < 1) {
      // 키워드 없으면 진행 안 함 (필요 시 검색 초기화 로직 추가)
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // 이전 fetch 중단
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const seq = ++reqSeqRef.current;
      try {
        const params: SearchPayload = {
          keyword,
          lat: coords.lat,
          lng: coords.lng,
        };

        const res = await client.get<SearchResultItem[]>("/search", {
          params,
          signal: controller.signal,
        });

        if (seq !== reqSeqRef.current) return;
        setResults(res.data ?? []);
        console.log("검색 결과:", res.data);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.warn(
          "검색 요청 에러:",
          err?.response?.status,
          err?.response?.data ?? err.message
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchInputText, coords.lat, coords.lng]);

  useEffect(() => {
    return () => {
      // 언마운트 시 진행 중 요청 취소
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 바: 뒤로가기 + TextInput */}
      <View style={styles.header}>
        <View style={styles.inputWrap}>
          <Image
            source={
              searchInputText
                ? require("@/assets/images/search-input-icon-black.png")
                : require("@/assets/images/search-input-icon-gray.png")
            }
            style={styles.searchIcon}
          />
          <TextInput
            autoFocus
            placeholder="지역, 상호명을 검색해보세요"
            value={searchInputText}
            onChangeText={setSearchInputText}
            placeholderTextColor={Colors.gray_300}
            style={styles.inputText}
            returnKeyType="search"
            // onSubmitEditing={(e) => { /* 추후: pendingQuery 세팅 후 router.back() */ }}
          />
          {searchInputText ? (
            <Pressable onPress={() => setSearchInputText("")}>
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
          <RecentSearch
            items={[
              { id: "1", keyword: "커피" },
              { id: "2", keyword: "헬스장" },
              { id: "3", keyword: "CU" },
            ]}
            onTapKeyword={(k) => setSearchInputText(k)}
          />
        )}

        {!showRecent && !showResults && (
          <Text style={TextStyles.Medium16}>검색 결과가 없어요.</Text>
        )}

        {showResults && (
          <SearchResult
            data={results!}
            onPressItem={(place) => {
              console.log("선택:", place);
              router.back();
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  leftArrow: {
    width: 24,
    height: 24,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 9,
  },
  inputText: {
    ...TextStyles.Medium16,
    flex: 1,
  },
  xIcon: {
    width: 24,
    height: 24,
  },
  backBtn: {
    ...TextStyles.Medium16,
    color: Colors.gray_800,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
