const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

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
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? res.statusText)
    throw new ApiError(message, res.status)
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
  albums?: Album[]
}

export type Track = {
  id: number
  title: string
  albumId: number
  createdAt: string
  album?: Album
}

export type Album = {
  id: number
  title: string
  releaseYear: number | null
  imageUrl: string | null
  artistId: number
  createdAt: string
  artist?: Artist
  tracks?: Track[]
}

export type Scrobble = {
  id: number
  userId: number
  trackId: number
  playedAt: string
  track?: Track & { album?: Album & { artist?: Artist } }
}

export const api = {
  register: (email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // artists
  artists: () => request<Artist[]>("/artists"),
  artist: (id: number) => request<Artist>(`/artists/${id}`),
  createArtist: (name: string) =>
    request<Artist>("/artists", { method: "POST", body: JSON.stringify({ name }) }),
  updateArtist: (id: number, name: string) =>
    request<Artist>(`/artists/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteArtist: (id: number) => request<void>(`/artists/${id}`, { method: "DELETE" }),

  // albums
  albums: () => request<Album[]>("/albums"),
  album: (id: number) => request<Album>(`/albums/${id}`),
  createAlbum: (dto: { title: string; releaseYear?: number; imageUrl?: string; artistId: number }) =>
    request<Album>("/albums", { method: "POST", body: JSON.stringify(dto) }),
  updateAlbum: (
    id: number,
    dto: Partial<{ title: string; releaseYear: number; imageUrl: string; artistId: number }>,
  ) => request<Album>(`/albums/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  deleteAlbum: (id: number) => request<void>(`/albums/${id}`, { method: "DELETE" }),

  // tracks
  tracks: () => request<Track[]>("/tracks"),
  track: (id: number) => request<Track>(`/tracks/${id}`),
  createTrack: (dto: { title: string; albumId: number }) =>
    request<Track>("/tracks", { method: "POST", body: JSON.stringify(dto) }),
  updateTrack: (id: number, dto: Partial<{ title: string; albumId: number }>) =>
    request<Track>(`/tracks/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  deleteTrack: (id: number) => request<void>(`/tracks/${id}`, { method: "DELETE" }),

  // scrobbles (spinning a track / logging a play)
  scrobble: (trackId: number) =>
    request<Scrobble>("/scrobbles", { method: "POST", body: JSON.stringify({ trackId }) }),
  recentScrobbles: () => request<Scrobble[]>("/scrobbles/recent"),

  // stats
  topArtists: () => request<{ artistId: number; name: string; playCount: number }[]>(
    "/stats/top-artists",
  ),
}
