import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { Show, Switch, Match } from "./control-flow"

describe("Show", () => {
  test("renders children when when is truthy", () => {
    render(<Show when={true}>visible</Show>)
    expect(screen.getByText("visible")).toBeInTheDocument()
  })

  test("renders fallback when when is false", () => {
    render(<Show when={false} fallback={<>hidden</>}>visible</Show>)
    expect(screen.getByText("hidden")).toBeInTheDocument()
    expect(screen.queryByText("visible")).not.toBeInTheDocument()
  })

  test("renders fallback when when is null or undefined", () => {
    render(<Show when={undefined} fallback={<>hidden</>}>visible</Show>)
    expect(screen.getByText("hidden")).toBeInTheDocument()
  })

  test("renders nothing when when is falsy and no fallback given", () => {
    const { container } = render(<Show when={null}>visible</Show>)
    expect(container).toBeEmptyDOMElement()
  })

  test("passes the narrowed non-null value to a function child", () => {
    render(<Show when={"cover.jpg"}>{(url) => <span>{url}</span>}</Show>)
    expect(screen.getByText("cover.jpg")).toBeInTheDocument()
  })
})

describe("Switch/Match", () => {
  test("renders the first matching Match and nothing else", () => {
    render(
      <Switch>
        <Match when={false}>first</Match>
        <Match when={true}>second</Match>
        <Match when={true}>third</Match>
      </Switch>,
    )
    expect(screen.getByText("second")).toBeInTheDocument()
    expect(screen.queryByText("first")).not.toBeInTheDocument()
    expect(screen.queryByText("third")).not.toBeInTheDocument()
  })

  test("renders nothing when no Match matches", () => {
    const { container } = render(
      <Switch>
        <Match when={false}>first</Match>
      </Switch>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
