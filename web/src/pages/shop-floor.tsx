import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Disc3 } from "lucide-react"
import { Skeleton } from "boneyard-js/react"
import { toast } from "sonner"

import { useGetAlbumsInfinite } from "@/lib/api/generated/albums/albums"
import { ApiError } from "@/lib/api-error"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { AlbumFormDialog } from "@/components/records/album-form-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FIXTURE_ALBUMS } from "@/lib/boneyard-fixtures"
import { Show } from "@/lib/control-flow"
import { RoleGate } from "@/lib/role-gate"

export function ShopFloorPage() {
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useGetAlbumsInfinite(
      {},
      { query: { initialPageParam: undefined, getNextPageParam: (last) => last.nextCursor ?? undefined } },
    )

  const albums = React.useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

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
        <RoleGate roles={["ADMIN", "CURATOR"]}>
          <Button variant="oxblood" onClick={() => setFormOpen(true)}>
            <Plus /> Shelve a record
          </Button>
        </RoleGate>
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
        <Show
          when={filtered.length > 0}
          fallback={
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-shop-brass/30 py-16 text-center">
              <Disc3 className="size-8 text-shop-brass" />
              <p className="text-sm text-muted-foreground">
                {query ? "Nothing in the crate matches that." : "The crate is empty. Be the first to shelve a record."}
              </p>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((album) => (
              <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
                <VinylSleeve album={album} />
              </Link>
            ))}
          </div>
        </Show>
      </Skeleton>

      {!query && hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <AlbumFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
