import axios from "axios";

/**
 * 공용 axios 인스턴스
 * - baseURL은 .env의 EXPO_PUBLIC_API_BASE_URL를 사용
 * - timeout은 네트워크 지연 대비 기본 10초
 * - (나중에) 인터셉터에서 JWT 토큰 주입 가능
 */
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10_000,
});

// ✅ 나중에 인증 켜지면 이 부분 주석 해제해서 토큰 자동 주입
// import AsyncStorage from "@react-native-async-storage/async-storage";
// client.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("accessToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// (선택) 공통 에러 로깅도 여기서 가능
// client.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     console.warn("[API ERROR]", error?.response?.status, error?.response?.data);
//     return Promise.reject(error);
//   }
// );

export default client;
