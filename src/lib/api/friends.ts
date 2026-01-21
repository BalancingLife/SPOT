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

// ✅ friends action 공통 응답 타입(스웨거 예시 기반)
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

// ==========================
// ✅ GET: 친구 리스트
// ==========================
export async function fetchFriendsList(): Promise<Friend[]> {
  try {
    const res = await api8001.get<FriendsListResponse>("/friends/list");

    const raw = Array.isArray(res.data?.friends) ? res.data.friends : [];

    return raw.map((f) => ({
      id: f.friend_id,
      nickname: f.nickname,
      avatarUrl: f.profile_url,
      updatedAt: f.updated_at,
      email: f.email,
      comment: f.comment,
    }));
  } catch {
    return [];
  }
}

// ==========================
// ✅ GET: 친구가 저장한 장소 목록 조회
// ==========================
export async function fetchFriendPlaces(
  friendId: number,
  query: FriendPlacesQuery = {},
): Promise<FriendPlace[]> {
  try {
    const res = await api8001.get<ApiFriendPlace[]>(
      `/main/places/${friendId}`,
      {
        params: {
          ...(query.sort ? { sort: query.sort } : {}),
          ...(query.category ? { category: query.category } : {}),
        },
      },
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
  } catch {
    return [];
  }
}

// ==========================
// ✅ POST: 친구 팔로우 요청 보내기
// POST /friends/follow/{friend_id}
// ==========================
export async function requestFollow(
  friendId: number,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/follow/${friendId}`,
    );

    return {
      friendId: res.data?.friend_id ?? friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}

// ==========================
// ✅ POST: 친구 팔로우 요청 거절하기
// POST /friends/decline_follow/{friend_id}
// (요청을 보낸 사람의 유저 ID)
// ==========================
export async function declineFollow(
  friendId: number,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/decline_follow/${friendId}`,
    );

    return {
      friendId: res.data?.friend_id ?? friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}

// ==========================
// ✅ POST: 친구 팔로우 요청 수락하기
// POST /friends/access_follow/{friend_id}
// (요청을 보낸 사람의 유저 ID)
// ==========================
export async function acceptFollow(
  friendId: number,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/access_follow/${friendId}`,
    );

    return {
      friendId: res.data?.friend_id ?? friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}

// ==========================
// ✅ POST: 친구 차단하기
// POST /friends/block/{friend_id}
// ==========================
export async function blockFriend(
  friendId: number,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/block/${friendId}`,
    );

    return {
      friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}

// ==========================
// ✅ POST: 친구 차단 해제하기 (+ 관계 삭제)
// POST /friends/unblock/{friend_id}
// ==========================
export async function unblockFriend(
  friendId: number,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/unblock/${friendId}`,
    );

    return {
      friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}

// ==========================
// ✅ DELETE: 친구 삭제(언팔로우)
// DELETE /friends/{friend_id}
// ==========================
export async function deleteFriend(friendId: number): Promise<boolean> {
  try {
    await api8001.delete(`/friends/${friendId}`);
    return true;
  } catch {
    return false;
  }
}

// ==========================
// ✅ POST: 친구 신고하기
// POST /friends/report/{friend_id}
// body: { reason: string }
// ==========================
export async function reportFriend(
  friendId: number,
  body: ReportFriendBody,
): Promise<FriendActionResult | null> {
  try {
    const res = await api8001.post<FriendActionResponse>(
      `/friends/report/${friendId}`,
      body,
    );

    return {
      friendId,
      message: res.data?.message ?? "",
    };
  } catch {
    return null;
  }
}
