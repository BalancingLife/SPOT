// src/lib/api/client.ts
import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/src/stores/useAuthStore";

function attachInterceptors(client: AxiosInstance): AxiosInstance {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    console.log("🔑 token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method ?? "GET").toUpperCase();

    // ✅ baseURL + url + params 까지 합친 최종 URL
    const fullUrl = client.getUri(config);

    console.log("👉 Authorization:", config.headers.Authorization);
    console.log("🚀 API 요청:", method, fullUrl);

    // ✅ query params 확인
    console.log("params:", config.params ?? null);

    // (선택) body까지 보고 싶으면 주석 해제
    // console.log("   body:", config.data ?? null);

    return config;
  });

  client.interceptors.response.use(
    (res) => {
      console.log("✅ API 응답:", res.config?.url, res.status);
      console.log("📦 res.data:", res.data);
      return res;
    },
    (err) => {
      console.log("❌ API 에러:", err.config?.url, err.response?.status);
      console.log("📦 err.response.data:", err.response?.data);
      return Promise.reject(err);
    },
  );

  return client;
}

export const api8080 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8080,
    timeout: 10_000,
  }),
);

export const api8000 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8000,
    timeout: 10_000,
  }),
);

export const api8001 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8001,
    timeout: 10_000,
  }),
);
