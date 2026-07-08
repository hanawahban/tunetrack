import { useState } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { api, auth, ApiError, type Artist } from "@/lib/api"

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [artists, setArtists] = useState<Artist[] | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { access_token } = await api.login(email, password)
      auth.setToken(access_token)
      toast.success("Logged in")
      setArtists(await api.artists())
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reach the API")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>TuneTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {artists && (
            <ul className="mt-6 flex flex-col gap-1 text-sm">
              {artists.map((artist) => (
                <li key={artist.id}>{artist.name}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
