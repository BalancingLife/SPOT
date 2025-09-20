// src/types/modals.ts
import type { Option } from "./filters";

export type OptionModalProps = {
  visible: boolean;
  title: string;
  options: Option[];
  selected: string[]; // 단일선택이면 string | null 권장
  onSelect: (next: string[]) => void;
  onClose: () => void;
};
