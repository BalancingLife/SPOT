// src/lib/api/home.ts
import { api8080 } from "@/src/lib/api/client";

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
  console.log("/main api 결과: ", res.data);
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

// /main/${userId}
export async function fetchHomeUser(params: {
  userId: number;
  lat: number;
  lng: number;
  distance: number;
}) {
  const { userId, ...rest } = params;
  const res = await api8080.get<HomeUserResponse>(`/main/${userId}`, {
    params: rest,
  });
  return res.data;
}
