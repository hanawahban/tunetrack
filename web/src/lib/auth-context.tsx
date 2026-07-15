import * as React from "react"
import { usePostAuthLogin, usePostAuthRegister } from "@/lib/api/generated/auth/auth"
import type { UserResponseDtoRole } from "@/lib/api-types"
import { auth } from "@/lib/auth-token"
import { decodeJwt, isExpired } from "@/lib/jwt"

type Session = {
  userId: number
  role: UserResponseDtoRole
  email: string | null
}

type AuthContextValue = {
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function sessionFromToken(token: string | null): Session | null {
  if (!token) return null
  const claims = decodeJwt(token)
  if (!claims || isExpired(claims)) return null
  return { userId: claims.sub, role: claims.role, email: null }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(() =>
    sessionFromToken(auth.getToken()),
  )
  const loginMutation = usePostAuthLogin()
  const registerMutation = usePostAuthRegister()

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { access_token } = await loginMutation.mutateAsync({ data: { email, password } })
      auth.setToken(access_token)
      const next = sessionFromToken(access_token)
      setSession(next ? { ...next, email } : null)
    },
    [loginMutation],
  )

  const register = React.useCallback(
    async (email: string, password: string) => {
      await registerMutation.mutateAsync({ data: { email, password } })
      const { access_token } = await loginMutation.mutateAsync({ data: { email, password } })
      auth.setToken(access_token)
      const next = sessionFromToken(access_token)
      setSession(next ? { ...next, email } : null)
    },
    [loginMutation, registerMutation],
  )

  const logout = React.useCallback(() => {
    auth.clearToken()
    setSession(null)
  }, [])

  const value: AuthContextValue = {
    session,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
