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
    const body = await res.json().catch(() => null)
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? res.statusText)
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export type ErrorType<Error> = ApiError
export type BodyType<BodyData> = BodyData
