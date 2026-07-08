import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Disc3 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function AuthPage() {
  const { login, register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (mode === "login") {
        await login(email, password)
        toast.success("Welcome back to the shop.")
      } else {
        await register(email, password)
        toast.success("Membership card punched. You're in.")
      }
      navigate("/")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong."
      toast.error(message)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.35 0.08 40 / 0.6), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Disc3 className="size-9 text-shop-amber" strokeWidth={1.3} />
          <h1 className="font-heading text-2xl font-semibold text-shop-paper">TuneTrack</h1>
          <p className="text-catalog text-xs text-shop-brass">the crate-digger's shop</p>
        </div>

        <div className="rounded-md border border-shop-brass/30 bg-card p-6 shadow-2xl">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Join up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <p className="mb-4 text-sm text-muted-foreground">
                Show your card at the counter.
              </p>
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <p className="mb-4 text-sm text-muted-foreground">
                Get a membership card for the shop.
              </p>
            </TabsContent>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourlabel.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" variant="oxblood" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "One moment…"
                  : mode === "login"
                    ? "Step inside"
                    : "Punch my card"}
              </Button>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
