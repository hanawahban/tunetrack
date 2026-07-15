import type { ReactNode } from "react"

import type { UserResponseDtoRole } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"
import { Show } from "@/lib/control-flow"

type RoleGateProps = {
  roles: UserResponseDtoRole[]
  fallback?: ReactNode
  children: ReactNode
}

/** UI convenience only, NOT an authorization boundary -- the server enforces
 *  access; this only decides what's worth rendering. */
export function RoleGate({ roles, fallback = null, children }: RoleGateProps) {
  const { session } = useAuth()
  return (
    <Show when={!!session && roles.includes(session.role)} fallback={fallback}>
      {children}
    </Show>
  )
}
