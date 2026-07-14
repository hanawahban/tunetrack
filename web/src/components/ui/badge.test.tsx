import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge", () => {
  test("renders its children", () => {
    render(<Badge>1977</Badge>)
    expect(screen.getByText("1977")).toBeInTheDocument()
  })

  test("applies the requested variant's classes", () => {
    render(<Badge variant="oxblood">Sold out</Badge>)
    expect(screen.getByText("Sold out")).toHaveClass("bg-shop-oxblood")
  })
})
