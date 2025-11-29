// src/types/place.ts

export type ApiPlace = {
  placeId?: number | null;
  gId?: string | null;
  name?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  list?: string | null; // 업종 카테고리
  photo?: string | null;
  photoUrl?: string | null;
  photos?: (string | null)[] | null;

  ratingAvg?: number | null;
  ratingCount?: number | null;
  myRating?: number | null;

  savers?:
    | {
        nickname: string;
        profileImageUrl: string;
      }[]
    | null;

  distance?: number | null;
  isMarked?: boolean | null;
};

export type Place = {
  placeId: number | null;
  id: string; // unique key (placeId 또는 gid 문자열)
  name: string;
  address: string;

  lat: number;
  lng: number;

  category: string | null;

  photo: string | null;
  thumbnails: string[];

  ratingAvg: number | null;
  ratingCount: number | null;
  myRating: number | null;

  savers: { nickname: string; profileImageUrl: string }[];
  distanceM?: number;

  isBookmarked: boolean;
};
