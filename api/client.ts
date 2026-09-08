import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:8000/api"; // swap to live or deployed render url

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await SecureStore.getItemAsync("auth_token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
