// src/lib/api/home.ts
import { api8080 } from "@/src/lib/api/client";

/** -----------------------------
 *  MAP 탭 (/main, /main/me, /main/{userId})
 *  ----------------------------- */
export type HomeMainPlace = {
  id: number;
  name: string;
  imageUrl: string;
  commentCount: number;
  lat: number;
  lng: number;
  distance: number;
};

export type HomeMainResponse = {
  friends: { id: number; nickname: string; profileImageUrl: string }[];
  places: HomeMainPlace[];
};

export type HomeUserPlace = {
  placeId: string;
  photo: string;
  num: number;
  lat: number;
  lng: number;
};

export type HomeUserResponse = {
  spotNickname: string;
  email: string;
  info: string;
  places: HomeUserPlace[];
};

// /main
export async function fetchHomeMain(params: {
  lat: number;
  lng: number;
  distance: number;
}) {
  const res = await api8080.get<HomeMainResponse>("/main", { params });
  return res.data;
}

// /main/me
export async function fetchHomeMe(params: {
  lat: number;
  lng: number;
  distance: number;
}) {
  const res = await api8080.get<HomeUserResponse>("/main/me", { params });
  return res.data;
}

// /main/{userId}
export async function fetchHomeUser(params: {
  userId: number;
  lat: number;
  lng: number;
  distance: number;
  includeMarkerBadgeLayout: boolean;
}) {
  const { userId, ...rest } = params;
  const res = await api8080.get<HomeUserResponse>(`/main/${userId}`, {
    params: rest,
  });
  return res.data;
}

/** -----------------------------
 *  PLACE 탭
 *  friends: /main/place
 *  me:      /main/me/places  (여기만 s)
 *  friend:  /main/place/{userId}
 *  (placeId param 제거했다고 가정)
 *  ----------------------------- */
export type HomePlaceItem = {
  id: number;
  gid: string;
  photos: string[];
  name: string;
  address: string;
  rating: number;
  ratingCount: number;
  list: string; // restaurant | cafe | ...
  savedCount: number;
  searchCount: number;
  score: number;
  distance: number;
  lat: number;
  lng: number;
  memPhotos: string[];
  comment: string;
  commentCount: number;
  memId: number;
  commentPhoto: string;
  marked: boolean;
};

// /main/place
export async function fetchHomePlacesMain(params: {
  lat: number;
  lng: number;
}) {
  const res = await api8080.get<HomePlaceItem[]>("/main/place", { params });
  return res.data;
}

// /main/me/places  (여기만 s)
export async function fetchHomePlacesMe(params: { lat: number; lng: number }) {
  const res = await api8080.get<HomePlaceItem[]>("/main/me/places", { params });
  return res.data;
}

// /main/place/{userId}
export async function fetchHomePlacesUser(params: {
  userId: number;
  lat: number;
  lng: number;
}) {
  const { userId, ...rest } = params;
  const res = await api8080.get<HomePlaceItem[]>(`/main/place/${userId}`, {
    params: rest,
  });
  return res.data;
}

/** -----------------------------
 *  COMMENT 탭
 *  friends: /main/comment
 *  me:      /main/me/comment
 *  friend:  /main/comment/{userId}
 *  (placeId param 제거했다고 가정)
 *  ----------------------------- */
export type HomeCommentItem = {
  id: number;
  placeId: number;
  gid: string;
  photos: string[];
  name: string;
  address: string;
  score: number;
  comment: string;
  memId: number;
  memEmail: string;
  commentPhoto: string;
  createdAt: string;
  marked: boolean;
};

export async function fetchHomeCommentsMain(params: {
  lat: number;
  lng: number;
  page?: number;
  size?: number;
}) {
  const res = await api8080.get<HomeCommentItem[]>("/main/comment", { params });
  return res.data;
}

export async function fetchHomeCommentsMe(params: {
  lat: number;
  lng: number;
  page?: number;
  size?: number;
}) {
  const res = await api8080.get<HomeCommentItem[]>("/main/me/comment", {
    params,
  });
  return res.data;
}

export async function fetchHomeCommentsUser(params: {
  userId: number;
  lat: number;
  lng: number;
  page?: number;
  size?: number;
}) {
  const { userId, ...rest } = params;
  const res = await api8080.get<HomeCommentItem[]>(`/main/comment/${userId}`, {
    params: rest,
  });
  return res.data;
}
