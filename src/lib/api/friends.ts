// src/lib/api/friends.ts
import { api8000, api8001 } from "@/src/lib/api/client";

export type ApiFriend = {
  comment: string | null;
  friend_id: number;
  mutual_count: number;
  mutual_profiles: string | null;
  nickname: string;
  profile_url: string | null;
  spot_id: string;
  status: string;
  updated_at: string;
};

export type FriendsListResponse = {
  friends: ApiFriend[];
};

export type Friend = {
  id: number;
  nickname: string;
  userId: string;
  avatarUrl?: string | null;
  updatedAt?: string;
  comment?: string | null;
  status?: string;
  mutualCount?: number;
  mutualProfiles?: string | null;
};

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

export type FriendActionResponse = {
  friend_id?: number;
  message: string;
};

export type FriendActionResult = {
  friendId?: number;
  message: string;
};

export type ReportFriendBody = {
  reason: string;
};

/** =========================
 * 친구 검색 (8000번)
 * GET /friends/search?keyword=
 * ========================= */

export type ApiFriendSearchItem = {
  highlighted_spot_id: string;
  highlighted_spot_nickname: string;
  id: number;
  one_line: string;
  profile_photo: string | null;
  spot_id: string;
  spot_nickname: string;
};

export type ApiFriendSearchResponse = {
  results: ApiFriendSearchItem[];
};

export type FriendSearchItem = {
  id: number;
  nickname: string;
  userId: string;
  profileImageUrl: string | null;
  oneLine: string;
  highlightedNickname?: string;
  highlightedUserId?: string;
};

export async function searchFriends(
  keyword: string,
  signal?: AbortSignal,
): Promise<FriendSearchItem[]> {
  try {
    const res = await api8000.get<ApiFriendSearchResponse>("/friends/search", {
      params: { keyword },
      signal,
    });

    const raw = Array.isArray(res.data?.results) ? res.data.results : [];

    return raw.map((item) => ({
      id: item.id,
      nickname: item.spot_nickname,
      userId: item.spot_id,
      profileImageUrl: item.profile_photo,
      oneLine: item.one_line,
      highlightedNickname: item.highlighted_spot_nickname,
      highlightedUserId: item.highlighted_spot_id,
    }));
  } catch (error) {
    throw error;
  }
}

export async function fetchFriendsList(): Promise<Friend[]> {
  const res = await api8001.get<FriendsListResponse>("/friends/list");

  const raw = Array.isArray(res.data?.friends) ? res.data.friends : [];

  return raw.map((item) => ({
    id: item.friend_id,
    nickname: item.nickname,
    userId: item.spot_id,
    avatarUrl: item.profile_url,
    updatedAt: item.updated_at,
    comment: item.comment,
    status: item.status,
    mutualCount: item.mutual_count,
    mutualProfiles: item.mutual_profiles,
  }));
}
