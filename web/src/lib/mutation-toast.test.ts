import { afterEach, describe, expect, test, vi } from "vitest"
import { toast } from "sonner"
import { withToast, skipToast } from "./mutation-toast"
import { ApiError } from "@/lib/api-error"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe("withToast", () => {
  test("shows the success toast and calls onSuccess on success", async () => {
    const onSuccess = vi.fn()
    await withToast(() => Promise.resolve("saved"), {
      success: "Saved!",
      error: "Failed",
      onSuccess,
    })
    expect(toast.success).toHaveBeenCalledWith("Saved!")
    expect(onSuccess).toHaveBeenCalledWith("saved")
  })

  test("success can be derived from the resolved value", async () => {
    await withToast(() => Promise.resolve({ title: "One More Time" }), {
      success: (r) => `Spinning "${r.title}"`,
      error: "Failed",
    })
    expect(toast.success).toHaveBeenCalledWith('Spinning "One More Time"')
  })

  test("shows the ApiError message on failure, not the fallback", async () => {
    await withToast(() => Promise.reject(new ApiError("real reason", 409)), {
      success: "Saved!",
      error: "Fallback message",
    })
    expect(toast.error).toHaveBeenCalledWith("real reason")
    expect(toast.success).not.toHaveBeenCalled()
  })

  test("shows the fallback message on a non-ApiError failure", async () => {
    await withToast(() => Promise.reject(new Error("network blew up")), {
      success: "Saved!",
      error: "Fallback message",
    })
    expect(toast.error).toHaveBeenCalledWith("Fallback message")
  })

  test("skipToast suppresses the success toast and onSuccess", async () => {
    const onSuccess = vi.fn()
    await withToast(() => Promise.resolve(skipToast), {
      success: "Saved!",
      error: "Failed",
      onSuccess,
    })
    expect(toast.success).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
