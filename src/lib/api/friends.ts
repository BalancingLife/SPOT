// src/lib/api/friends.ts
import { api8000, api8001 } from "@/src/lib/api/client";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { type FriendStatus } from "@/src/types/friends";

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

export type ApiFriendSearchItem = {
  highlighted_spot_id: string;
  highlighted_spot_nickname: string;
  id: number;
  one_line: string;
  profile_photo: string | null;
  spot_id: string;
  spot_nickname: string;
  status: FriendStatus;
};

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
  status: FriendStatus;
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
    console.log(raw);
    return raw.map((item) => ({
      id: item.id,
      nickname: item.spot_nickname,
      userId: item.spot_id,
      profileImageUrl: item.profile_photo,
      oneLine: item.one_line,
      highlightedNickname: item.highlighted_spot_nickname,
      highlightedUserId: item.highlighted_spot_id,
      status: item.status,
    }));
  } catch (error) {
    throw error;
  }
}

// 팔로우 신청
export const sendFollowRequest = async (friend_id: number): Promise<void> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL_8080}/friends/follow/${friend_id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("네트워크 응답이 ok가 아님");
  }
};

// 팔로우 수락
export const acceptFollowRequest = async (friend_id: number): Promise<void> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL_8001}/friends/access_follow/${friend_id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("네트워크 응답이 ok가 아님");
  }
};

// 팔로우 거절
export const declineFollowRequest = async (
  friend_id: number,
): Promise<void> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL_8001}/friends/decline_follow/${friend_id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("네트워크 응답이 ok가 아님");
  }
};

// 친구 삭제
export const deleteFriend = async (friend_id: number): Promise<void> => {
  const token = useAuthStore.getState().token;

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL_8001}/friends/${friend_id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("네트워크 응답이 ok가 아님");
  }
};

// 친구 차단
export const blockFriend = async (friend_id: number): Promise<void> => {
  await api8001.post(`/friends/block/${friend_id}`);
};

// 친구 차단 해제
export const unblockFriend = async (friend_id: number): Promise<void> => {
  await api8001.post(`/friends/unblock/${friend_id}`);
};
