// src/lib/api/client.ts
import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/src/stores/useAuthStore";

function attachInterceptors(client: AxiosInstance): AxiosInstance {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (res) => {
      const method = (res.config?.method ?? "GET").toUpperCase();

      console.log(`✅ [${method}] ${res.config.url} ${res.status}`);

      // const fullUrl = res.config ? client.getUri(res.config) : "unknown url";
      // console.log(`✅ [${method}] ${fullUrl} ${res.status}`);

      return res;
    },
    (err) => {
      const method = (err.config?.method ?? "GET").toUpperCase();
      const fullUrl = err.config ? client.getUri(err.config) : "unknown url";
      const status = err.response?.status ?? "NO_STATUS";
      const message =
        err.response?.data?.message ?? err.message ?? "Unknown error";

      console.error(`❌ [${method}] ${fullUrl} ${status} - ${message}`);

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
