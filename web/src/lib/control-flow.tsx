import { Children, isValidElement, type ReactElement, type ReactNode } from "react"

type ShowProps<T> = {
  when: T | null | undefined | false
  fallback?: ReactNode
  children: ReactNode | ((value: NonNullable<T>) => ReactNode)
}

/** Renders `children` when `when` is truthy, `fallback` otherwise. A function `children`
 *  receives `when` narrowed to non-null/non-undefined/non-false. Not for loading states --
 *  use boneyard's `<Skeleton>` for those. */
export function Show<T>({ when, fallback = null, children }: ShowProps<T>) {
  if (when === null || when === undefined || when === false) return <>{fallback}</>
  if (typeof children === "function") {
    return <>{(children as (value: NonNullable<T>) => ReactNode)(when as NonNullable<T>)}</>
  }
  return <>{children}</>
}

type MatchProps = {
  when: unknown
  children: ReactNode
}

/** Only meaningful as a direct child of `<Switch>` -- renders nothing on its own. */
export function Match(_props: MatchProps) {
  return null
}

/** Renders the first `<Match when>` child whose `when` is truthy; nothing else renders. */
export function Switch({ children }: { children: ReactNode }) {
  const match = Children.toArray(children).find(
    (child): child is ReactElement<MatchProps> =>
      isValidElement<MatchProps>(child) && child.type === Match && Boolean(child.props.when),
  )
  return <>{match?.props.children ?? null}</>
}
