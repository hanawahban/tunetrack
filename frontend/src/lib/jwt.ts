export type JwtClaims = {
  sub: number
  role: "ADMIN" | "CURATOR" | "LISTENER"
  iat?: number
  exp?: number
}

/** Decodes the payload of a JWT without verifying the signature. Verification happens server-side. */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return false
  return Date.now() >= claims.exp * 1000
}
