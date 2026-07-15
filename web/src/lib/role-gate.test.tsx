import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { RoleGate } from "./role-gate"
import { useAuth } from "@/lib/auth-context"

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}))

function mockSession(role: "ADMIN" | "CURATOR" | "LISTENER" | null) {
  vi.mocked(useAuth).mockReturnValue({
    session: role ? { role } : null,
  } as ReturnType<typeof useAuth>)
}

describe("RoleGate", () => {
  test("renders children when the session role matches", () => {
    mockSession("CURATOR")
    render(
      <RoleGate roles={["ADMIN", "CURATOR"]}>
        <span>curator controls</span>
      </RoleGate>,
    )
    expect(screen.getByText("curator controls")).toBeInTheDocument()
  })

  test("renders fallback when the session role doesn't match", () => {
    mockSession("LISTENER")
    render(
      <RoleGate roles={["ADMIN", "CURATOR"]} fallback={<span>nope</span>}>
        <span>curator controls</span>
      </RoleGate>,
    )
    expect(screen.getByText("nope")).toBeInTheDocument()
    expect(screen.queryByText("curator controls")).not.toBeInTheDocument()
  })

  test("renders nothing (no fallback given) when there is no session", () => {
    mockSession(null)
    const { container } = render(
      <RoleGate roles={["ADMIN", "CURATOR"]}>
        <span>curator controls</span>
      </RoleGate>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
