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
