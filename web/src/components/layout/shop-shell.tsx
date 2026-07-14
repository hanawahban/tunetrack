import { Link, NavLink, Outlet } from "react-router-dom"
import { Disc3, LogOut } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ShopShell() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-shop-brass/25 bg-shop-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Disc3 className="size-6 text-shop-amber" strokeWidth={1.5} />
            <span className="font-heading text-lg font-semibold tracking-tight text-shop-paper">
              TuneTrack
            </span>
            <span className="text-catalog hidden text-[0.65rem] text-shop-brass sm:inline">
              est. in the crates
            </span>
          </Link>

          <nav className="text-catalog flex items-center gap-1 text-xs uppercase tracking-wider">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-sm px-3 py-1.5 transition-colors ${isActive ? "bg-shop-oxblood text-shop-paper" : "text-muted-foreground hover:bg-white/5"}`
              }
            >
              Shop Floor
            </NavLink>
            <NavLink
              to="/crate"
              className={({ isActive }) =>
                `rounded-sm px-3 py-1.5 transition-colors ${isActive ? "bg-shop-oxblood text-shop-paper" : "text-muted-foreground hover:bg-white/5"}`
              }
            >
              My Crate
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {session && (
              <Badge variant={session.role === "LISTENER" ? "outline" : "default"}>
                {session.role}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={logout} title="Leave the shop">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
