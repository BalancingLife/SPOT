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

    console.log("👉 Authorization:", config.headers.Authorization);
    console.log("🚀 API 요청:", client.defaults.baseURL, config.url);

    return config;
  });

  return client;
}

export const api8080 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8080,
    timeout: 10_000,
  })
);

export const api8000 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8000,
    timeout: 10_000,
  })
);

export const api8001 = attachInterceptors(
  axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL_8001,
    timeout: 10_000,
  })
);
