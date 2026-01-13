// src/lib/api/friends.ts
import { api8001 } from "@/src/lib/api/client";

export type ApiFriend = {
  comment: string | null; // 서버가 string인데, null 가능성까지 방어
  email: string;
  friend_id: number;
  nickname: string;
  profile_url: string | null;
  updated_at: string; // ISO string
};

export type FriendsListResponse = {
  friends: ApiFriend[];
};

// StoryList에서 쓰기 좋은 형태
export type Friend = {
  id: number;
  nickname: string;
  avatarUrl?: string | null;
  updatedAt?: string;
  // 필요하면 아래도 꺼내 쓰자
  email?: string;
  comment?: string | null;
};

// 친구 장소 API 타입
export type ApiSaver = {
  nickname: string;
  profileImageUrl: string;
};

export type ApiFriendPlace = {
  address: string;
  gId: string;
  isMarked: boolean;
  latitude: number;
  list: string;
  longitude: number;
  myRating: number;
  name: string;
  photo: string;
  placeId: number;
  ratingAvg: number;
  savers: ApiSaver[];
};

// UI에서 쓰기 좋은 형태(원하면 그대로 ApiFriendPlace 써도 됨)
export type FriendPlace = {
  placeId: number;
  name: string;
  address: string;
  gId: string;
  photo: string;
  latitude: number;
  longitude: number;
  isMarked: boolean;
  list: string;
  myRating: number;
  ratingAvg: number;
  savers: ApiSaver[];
};

export type FriendPlacesQuery = {
  sort?: "latest" | "star";
  category?: string;
};

// 친구리스트 호출 API
export async function fetchFriendsList(): Promise<Friend[]> {
  try {
    const res = await api8001.get<FriendsListResponse>("/friends/list");

    const raw = Array.isArray(res.data?.friends) ? res.data.friends : [];
    console.log("친구 리스트", raw);
    return raw.map((f) => ({
      id: f.friend_id,
      nickname: f.nickname,
      avatarUrl: f.profile_url,
      updatedAt: f.updated_at,
      email: f.email,
      comment: f.comment,
    }));
  } catch (e: any) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    console.warn(
      "👥 [friends] fetchFriendsList failed:",
      status,
      data ?? e?.message
    );

    return [];
  }
}

// 친구가 저장한 장소 목록 조회
export async function fetchFriendPlaces(
  friendId: number,
  query: FriendPlacesQuery = {}
): Promise<FriendPlace[]> {
  try {
    const res = await api8001.get<ApiFriendPlace[]>(
      `/main/places/${friendId}`,
      {
        params: {
          ...(query.sort ? { sort: query.sort } : {}),
          ...(query.category ? { category: query.category } : {}),
        },
      }
    );

    const raw = Array.isArray(res.data) ? res.data : [];

    return raw.map((p) => ({
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      gId: p.gId,
      photo: p.photo,
      latitude: p.latitude,
      longitude: p.longitude,
      isMarked: p.isMarked,
      list: p.list,
      myRating: p.myRating,
      ratingAvg: p.ratingAvg,
      savers: Array.isArray(p.savers) ? p.savers : [],
    }));
  } catch (e: any) {
    const status = e?.response?.status;
    const data = e?.response?.data;

    console.warn(
      "📍 [friends] fetchFriendPlaces failed:",
      status,
      data ?? e?.message
    );

    return [];
  }
}
