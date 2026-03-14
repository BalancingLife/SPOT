// src/lib/api/friends.ts
import { api8000, api8001 } from "@/src/lib/api/client";

export type ApiFriend = {
  comment: string | null;
  email: string;
  friend_id: number;
  nickname: string;
  profile_url: string | null;
  updated_at: string;
};

export type FriendsListResponse = {
  friends: ApiFriend[];
};

export type Friend = {
  id: number;
  nickname: string;
  avatarUrl?: string | null;
  updatedAt?: string;
  email?: string;
  comment?: string | null;
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
