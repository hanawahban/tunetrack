import { ApiError } from "./api-error"
import { auth } from "./auth-token"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = auth.getToken()
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    // A 401 on a request that carried a token means that token expired or
    // was revoked mid-session -- clear it and bounce to login instead of
    // stranding the user with error toasts on every subsequent request. A
    // 401 with no token to begin with (e.g. a failed login attempt) is a
    // normal auth failure, not a dead session, and isn't touched here.
    if (res.status === 401 && token) {
      auth.clearToken()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }

    const body = await res.json().catch(() => null)
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? res.statusText)
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export type ErrorType<_Error> = ApiError
export type BodyType<BodyData> = BodyData
