import * as React from "react"
import { api, auth, type Role } from "@/lib/api"
import { decodeJwt, isExpired } from "@/lib/jwt"

type Session = {
  userId: number
  role: Role
  email: string | null
}

type AuthContextValue = {
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  canCurate: boolean
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
  const [isLoading, setIsLoading] = React.useState(false)

  const login = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { access_token } = await api.login(email, password)
      auth.setToken(access_token)
      const next = sessionFromToken(access_token)
      setSession(next ? { ...next, email } : null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await api.register(email, password)
      const { access_token } = await api.login(email, password)
      auth.setToken(access_token)
      const next = sessionFromToken(access_token)
      setSession(next ? { ...next, email } : null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = React.useCallback(() => {
    auth.clearToken()
    setSession(null)
  }, [])

  const value: AuthContextValue = {
    session,
    isLoading,
    login,
    register,
    logout,
    canCurate: session?.role === "ADMIN" || session?.role === "CURATOR",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
