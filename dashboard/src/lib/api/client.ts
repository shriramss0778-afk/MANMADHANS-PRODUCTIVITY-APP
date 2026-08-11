"use client";

import axios from "axios";
import { getErrorMessage } from "./errors";

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
      error.message = getErrorMessage(error, error.message);
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
        .catch((refreshError) => {
          setAccessToken(null);
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    let token: string | null;
    try {
      token = await refreshPromise;
    } catch (refreshError) {
      error.cause = refreshError;
      error.message = getErrorMessage(
        refreshError,
        apiMessage ?? "Your session has expired. Please sign in again.",
      );
      throw error;
    }

    if (!token) {
      error.message = apiMessage ?? "Your session has expired. Please sign in again.";
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
