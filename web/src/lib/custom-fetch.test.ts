import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { customFetch } from "./custom-fetch"
import { auth } from "./auth-token"
import { ApiError } from "./api-error"

function mockResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: () => Promise.resolve(body),
  } as Response
}

beforeEach(() => {
  localStorage.clear()
  delete (window as { location?: unknown }).location
  ;(window as unknown as { location: Location }).location = {
    pathname: "/",
    href: "",
  } as Location
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("customFetch 401 handling", () => {
  test("clears the token and redirects to login on a 401 with a token present", async () => {
    auth.setToken("stale-token")
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401, { message: "Unauthorized" }))

    await expect(customFetch("/albums")).rejects.toThrow(ApiError)

    expect(auth.getToken()).toBeNull()
    expect(window.location.href).toBe("/login")
  })

  test("does not touch the token or redirect on a 401 with no token (e.g. a failed login)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401, { message: "Invalid credentials" }))

    await expect(customFetch("/auth/login")).rejects.toThrow(ApiError)

    expect(auth.getToken()).toBeNull()
    expect(window.location.href).toBe("")
  })

  test("does not redirect again if already on the login page", async () => {
    auth.setToken("stale-token")
    window.location.pathname = "/login"
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401, { message: "Unauthorized" }))

    await expect(customFetch("/albums")).rejects.toThrow(ApiError)

    expect(auth.getToken()).toBeNull()
    expect(window.location.href).toBe("")
  })

  test("a non-401 error does not clear the token", async () => {
    auth.setToken("still-good")
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(500, { message: "boom" }))

    await expect(customFetch("/albums")).rejects.toThrow(ApiError)

    expect(auth.getToken()).toBe("still-good")
  })
})
