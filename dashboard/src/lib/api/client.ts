"use client";

import axios from "axios";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? "");
    const isAuthRoute = requestUrl.startsWith("/auth/");
    const apiMessage = error.response?.data?.error?.message;

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthRoute) {
      if (apiMessage) {
        error.message = apiMessage;
      }
      throw error;
    }

    if (!refreshPromise) {
      refreshPromise = api
        .post("/auth/refresh")
        .then((response) => {
          const token = response.data?.accessToken ?? null;
          setAccessToken(token);
          return token;
        })
        .catch(() => {
          setAccessToken(null);
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const token = await refreshPromise;
    if (!token) {
      if (apiMessage) {
        error.message = apiMessage;
      }
      throw error;
    }

    originalRequest._retry = true;
    originalRequest.headers = {
      ...(originalRequest.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
    return api(originalRequest);
  },
);
