import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Disc3 } from "lucide-react"
import { Skeleton } from "boneyard-js/react"
import { toast } from "sonner"

import { useGetAlbums } from "@/lib/api/generated/albums/albums"
import type { AlbumResponseDto } from "@/lib/api-types"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api-error"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { AlbumFormDialog } from "@/components/records/album-form-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FIXTURE_ALBUMS } from "@/lib/boneyard-fixtures"

export function ShopFloorPage() {
  const { canCurate } = useAuth()
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [albums, setAlbums] = React.useState<AlbumResponseDto[]>([])

  const { data, isPending, isFetching, error } = useGetAlbums({ cursor })

  React.useEffect(() => {
    if (!data) return
    setAlbums((prev) => (cursor ? [...prev, ...data.items] : data.items))
  }, [data, cursor])

  React.useEffect(() => {
    if (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't open the shop today.")
    }
  }, [error])

  const filtered = React.useMemo(() => {
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
            Every tune in the crate. Dig in.
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

      <Skeleton
        name="shop-floor-album-grid"
        loading={isPending && albums.length === 0}
        fixture={
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {FIXTURE_ALBUMS.map((album) => (
              <VinylSleeve key={album.id} album={album} />
            ))}
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-shop-brass/30 py-16 text-center">
            <Disc3 className="size-8 text-shop-brass" />
            <p className="text-sm text-muted-foreground">
              {query ? "Nothing in the crate matches that." : "The crate is empty. Be the first to shelve a record."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((album) => (
              <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
                <VinylSleeve album={album} />
              </Link>
            ))}
          </div>
        )}
      </Skeleton>

      {!query && data?.nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setCursor(data.nextCursor!)} disabled={isFetching}>
            {isFetching ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <AlbumFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
