// src/utils/getMapPinImage.ts
import { getCategoryLabel } from "@/src/utils/categoryLabel";

export function getMapPinImage(list?: string | null) {
  const label = getCategoryLabel(list);

  switch (label) {
    case "카페":
      return require("@/assets/images/pin-cafe.png");
    case "음식점":
      return require("@/assets/images/pin-restaurant.png");
    case "술집":
      return require("@/assets/images/pin-bar.png");
    // case "전시회":
    //   return require("@/assets/images/pin-exhibition.png");
    // case "디저트":
    //   return require("@/assets/images/pin-dessert.png");
    // case "소품샵":
    //   return require("@/assets/images/pin-goods.png");
    // case "체험":
    //   return require("@/assets/images/pin-experience.png");
    // case "기타":
    default:
      return require("@/assets/images/pin-etc.png");
  }
}
