// src/lib/api/friends.ts
import { api8001 } from "@/src/lib/api/client";

export type ApiFriend = {
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
};

// 친구리스트 호출 API

export async function fetchFriendsList(): Promise<Friend[]> {
  try {
    const res = await api8001.get<FriendsListResponse>("/friends/list");

    const raw = Array.isArray(res.data?.friends) ? res.data.friends : [];

    return raw.map((f) => ({
      id: f.friend_id,
      nickname: f.nickname,
      avatarUrl: f.profile_url,
      updatedAt: f.updated_at,
    }));
  } catch (e: any) {
    // axios 에러는 e.response / e.message 등이 있음
    const status = e?.response?.status;
    const data = e?.response?.data;

    console.warn(
      "👥 [friends] fetchFriendsList failed:",
      status,
      data ?? e?.message
    );

    // 여기서 throw 하면 store에서 error 처리하기 쉬움
    // throw e;
    return [];
  }
}
