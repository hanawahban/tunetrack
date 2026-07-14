import type {
  GetAlbumsById200One,
  GetTracksById200One,
  PostAuthRegister201OneRole,
} from "@/lib/api/generated/model"

/**
 * Elysia/TypeBox emits no named `components/schemas` in the OpenAPI spec (unlike Nest's
 * decorator-based DTOs), so Orval can't generate shared model names like these -- only
 * per-endpoint anonymous types. These alias the album/track shape's single-item read
 * response, since every album/track endpoint (create, read, update, delete) responds with
 * the same underlying schema. UserResponseDtoRole aliases a generated (spec-derived) type
 * rather than hand-writing the union, so a backend role change breaks loudly on regen.
 */
export type AlbumResponseDto = GetAlbumsById200One
export type TrackResponseDto = GetTracksById200One
export type UserResponseDtoRole = PostAuthRegister201OneRole
