const API_URL = import.meta.env.VITE_API_URL

const TOKEN_KEY = "tunetrack_token"

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = auth.getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.message ?? res.statusText, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export type Role = "ADMIN" | "CURATOR" | "LISTENER"

export type User = {
  id: number
  email: string
  role: Role
  createdAt: string
}

export type Artist = {
  id: number
  name: string
  createdAt: string
}

export type Album = {
  id: number
  title: string
  releaseYear: number | null
  artistId: number
  createdAt: string
  artist?: Artist
}

export const api = {
  register: (email: string, password: string) =>
    request<User>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  artists: () => request<Artist[]>("/artists"),
  albums: () => request<Album[]>("/albums"),
}
