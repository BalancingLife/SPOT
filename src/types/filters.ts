// src/types/filters.ts
export type Option = {
  label: string;
  value: string;
};

// 바텀시트에서 열릴 수 있는 키(HotPlaces 기준)
export type FilterOpenedKey = "sort" | "save" | "category" | null;

// 필터 상태(HotPlaces 전용)
export type HotPlacesFilterState = {
  sort: string[]; // 단일선택이라면 string | null 로 바꿔도 됨
  saveType?: string[]; // HotPlaces 탭에선 사용 안 해도 타입은 남겨둘 수 있음
  category: string[]; // 다중선택 고려 시 string[]
  opened: FilterOpenedKey;
};

// FilterBar 컴포넌트 프롭스
export type FilterBarProps = {
  sortLabel?: string;
  saveTypeLabel?: string;
  categoryLabel?: string;
  onPressSort?: () => void;
  onPressSaveType?: () => void;
  onPressCategory?: () => void;
  showSort?: boolean;
  showSaveType?: boolean;
  showCategory?: boolean;
};
