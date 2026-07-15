// Mock data rendered only when boneyard's CLI/Vite plugin captures skeleton
// bones (window.__BONEYARD_BUILD) -- every app route sits behind auth, so a
// real query never resolves during capture.
import type { AlbumResponseDto, TrackResponseDto } from "@/lib/api-types"
import type { GetArtistsById200One } from "@/lib/api/generated/model/getArtistsById200One"
import type { GetStatsTopArtists200OneItem } from "@/lib/api/generated/model/getStatsTopArtists200OneItem"
import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model/getScrobblesRecent200OneItemsItem"

const NOW = "2026-01-01T00:00:00.000Z"

export const FIXTURE_ARTIST: AlbumResponseDto["artist"] = {
  id: 1,
  name: "The Fixture Four",
  createdAt: NOW,
}

export function fixtureAlbum(id: number): AlbumResponseDto {
  return {
    id,
    title: `Fixture Album ${id}`,
    releaseYear: 1999,
    imageUrl: null,
    genre: "Rock",
    artistId: 1,
    createdAt: NOW,
    artist: FIXTURE_ARTIST,
  }
}

export const FIXTURE_ALBUMS: AlbumResponseDto[] = Array.from({ length: 10 }, (_, i) =>
  fixtureAlbum(i + 1),
)

export const FIXTURE_ALBUM_DETAIL: AlbumResponseDto = {
  ...fixtureAlbum(1),
  tracks: Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    title: `Fixture Track ${i + 1}`,
    albumId: 1,
    createdAt: NOW,
  })),
}

export const FIXTURE_TRACKS: TrackResponseDto[] = FIXTURE_ALBUM_DETAIL.tracks!.map((t) => ({
  ...t,
  album: FIXTURE_ALBUM_DETAIL,
}))

export const FIXTURE_ARTIST_DETAIL: GetArtistsById200One = {
  id: 1,
  name: "The Fixture Four",
  createdAt: NOW,
  albums: FIXTURE_ALBUMS.slice(0, 4),
}

export const FIXTURE_TOP_ARTISTS: GetStatsTopArtists200OneItem[] = [
  { artistId: 1, name: "The Fixture Four", playCount: 42 },
  { artistId: 2, name: "Static & the Bones", playCount: 31 },
  { artistId: 3, name: "Placeholder Kings", playCount: 18 },
  { artistId: 4, name: "Mock Turntable", playCount: 9 },
]

export const FIXTURE_SCROBBLES: GetScrobblesRecent200OneItemsItem[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: i + 1,
    userId: 1,
    trackId: (i % 4) + 1,
    playedAt: new Date(2026, 0, 1 + i, 12).toISOString(),
    track: {
      id: (i % 4) + 1,
      title: `Fixture Track ${(i % 4) + 1}`,
      albumId: 1,
      createdAt: NOW,
      album: {
        id: 1,
        title: "Fixture Album 1",
        releaseYear: 1999,
        imageUrl: null,
        genre: i % 2 === 0 ? "Rock" : "Jazz",
        artistId: 1,
        createdAt: NOW,
        artist: FIXTURE_ARTIST,
      },
    },
  }),
)
