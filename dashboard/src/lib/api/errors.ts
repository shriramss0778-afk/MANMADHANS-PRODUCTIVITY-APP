"use client";

import axios from "axios";

/** Status code of a failed API call, or null when the request never reached the server. */
export function getErrorStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? error.response?.status ?? null : null;
}

export function isUnauthorizedError(error: unknown) {
  return getErrorStatus(error) === 401;
}

/** Message from the API error envelope, falling back to the error itself. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.error?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }
    if (!error.response) {
      return "Could not reach the server. Check your connection and try again.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
