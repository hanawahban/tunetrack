import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Disc3 } from "lucide-react"
import { toast } from "sonner"

import { api, ApiError, type Album, type Artist } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { AlbumFormDialog } from "@/components/records/album-form-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function ShopFloorPage() {
  const { canCurate } = useAuth()
  const [albums, setAlbums] = React.useState<Album[] | null>(null)
  const [artists, setArtists] = React.useState<Artist[]>([])
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const [a, ar] = await Promise.all([api.albums(), api.artists()])
      setAlbums(a)
      setArtists(ar)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't open the shop today.")
      setAlbums([])
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = React.useMemo(() => {
    if (!albums) return null
    const q = query.trim().toLowerCase()
    if (!q) return albums
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist?.name.toLowerCase().includes(q),
    )
  }, [albums, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-shop-paper">Shop Floor</h1>
          <p className="text-sm text-muted-foreground">
            Every sleeve in the crate. Dig in — the disc peeks out when you hover.
          </p>
        </div>
        {canCurate && (
          <Button variant="oxblood" onClick={() => setFormOpen(true)}>
            <Plus /> Shelve a record
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Flip through by title or artist…"
          className="pl-8"
        />
      </div>

      {filtered === null && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )}

      {filtered?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-shop-brass/30 py-16 text-center">
          <Disc3 className="size-8 text-shop-brass" />
          <p className="text-sm text-muted-foreground">
            {query ? "Nothing in the crate matches that." : "The crate is empty. Be the first to shelve a record."}
          </p>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((album) => (
            <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
              <VinylSleeve album={album} />
            </Link>
          ))}
        </div>
      )}

      <AlbumFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        artists={artists}
        onSaved={() => load()}
        onArtistCreated={(artist) => setArtists((prev) => [...prev, artist])}
      />
    </div>
  )
}
