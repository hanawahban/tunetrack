import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { ShopShell } from "@/components/layout/shop-shell"
import { AuthPage } from "@/pages/auth-page"
import { ShopFloorPage } from "@/pages/shop-floor"
import { AlbumPage } from "@/pages/album-page"
import { ArtistPage } from "@/pages/artist-page"
import { MyCratePage } from "@/pages/my-crate"

function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        element={
          <RequireAuth>
            <ShopShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<ShopFloorPage />} />
        <Route path="/albums/:id" element={<AlbumPage />} />
        <Route path="/artists/:id" element={<ArtistPage />} />
        <Route path="/crate" element={<MyCratePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
