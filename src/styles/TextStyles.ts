import { TextStyle } from "react-native";

const base: TextStyle = {
  fontFamily: "PretendardRegular",
  lineHeight: 1.3 * 16, // 나중에 오버라이드됨
};

export const TextStyles = {
  Bold36: {
    ...base,
    fontFamily: "PretendardBold",
    fontSize: 36,
    lineHeight: 36 * 1.3,
  },
  Bold28: {
    ...base,
    fontFamily: "PretendardBold",
    fontSize: 28,
    lineHeight: 28 * 1.3,
  },
  Bold24: {
    ...base,
    fontFamily: "PretendardBold",
    fontSize: 24,
    lineHeight: 24 * 1.3,
  },
  Bold16: {
    ...base,
    fontFamily: "PretendardBold",
    fontSize: 16,
    lineHeight: 16 * 1.3,
  },
  SemiBold16: {
    ...base,
    fontFamily: "PretendardSemiBold",
    fontSize: 16,
    lineHeight: 20 * 1.3,
  },

  SemiBold20: {
    ...base,
    fontFamily: "PretendardSemiBold",
    fontSize: 20,
    lineHeight: 20 * 1.3,
  },
  Medium24: {
    ...base,
    fontFamily: "PretendardMedium",
    fontSize: 24,
    lineHeight: 24 * 1.3,
  },
  Medium20: {
    ...base,
    fontFamily: "PretendardMedium",
    fontSize: 20,
    lineHeight: 20 * 1.3,
  },
  Medium16: {
    ...base,
    fontFamily: "PretendardMedium",
    fontSize: 16,
    lineHeight: 16 * 1.3,
  },
  Regular12: {
    ...base,
    fontFamily: "PretendardRegular",
    fontSize: 12,
    lineHeight: 12 * 1.3,
  },
  Regular10: {
    ...base,
    fontFamily: "PretendardRegular",
    fontSize: 10,
    lineHeight: 10 * 1.3,
  },
};
