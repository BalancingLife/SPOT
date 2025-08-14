// 서버 원본 타입: id가 생겼음!
export type ApiSavedPlace = {
  id: number;
  photos: string[];
  name: string | null;
  address: string;
  rating: number;
  category: string;
  total: number;
};

// 화면용 타입
export type SavedPlace = {
  id: string; // UI에서 문자열로 사용
  title: string;
  category: string;
  address: string;
  rating: number;
  images: string[];
  savedCount: number;
  savedUsers: string[];
};
