import { Link, Outlet, useLocation } from "react-router-dom"
import { Disc3, LogOut } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

const navLinkClassName =
  "text-catalog rounded-sm px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:bg-white/5 hover:text-muted-foreground data-active:bg-shop-oxblood data-active:text-shop-paper data-active:hover:bg-shop-oxblood"

export function ShopShell() {
  const { session, logout } = useAuth()
  const { pathname } = useLocation()

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

          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink
                  active={pathname === "/"}
                  className={navLinkClassName}
                  render={<Link to="/" />}
                >
                  Shop Floor
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  active={pathname.startsWith("/crate")}
                  className={navLinkClassName}
                  render={<Link to="/crate" />}
                >
                  My Crate
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
