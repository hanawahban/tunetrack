import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Disc3 } from "lucide-react"
import { Skeleton } from "boneyard-js/react"

import { useGetAlbumsInfinite } from "@/lib/api/generated/albums/albums"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { AlbumFormDialog } from "@/components/records/album-form-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FIXTURE_ALBUMS } from "@/lib/boneyard-fixtures"
import { QueryErrorState } from "@/components/records/query-error-state"
import { Switch, Match } from "@/lib/control-flow"
import { RoleGate } from "@/lib/role-gate"

export function ShopFloorPage() {
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useGetAlbumsInfinite(
    {},
    {
      query: {
        initialPageParam: undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        meta: { errorMessage: "Couldn't open the shop today." },
      },
    },
  )

  const albums = React.useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

  // ponytail: filters only the pages already fetched into `albums` -- an album
  // on a cursor page the user hasn't scrolled to yet is invisible to search.
  // GET /albums has no `q` param (unlike GET /artists, since #17), so a real
  // fix means adding server-side search there too; that's backend scope, not
  // this pass's frontend-hooks cleanup.
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
        <Switch>
          <Match when={error}>
            <QueryErrorState message="Couldn't open the shop today." />
          </Match>
          <Match when={filtered.length === 0}>
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-shop-brass/30 py-16 text-center">
              <Disc3 className="size-8 text-shop-brass" />
              <p className="text-sm text-muted-foreground">
                {query ? "Nothing in the crate matches that." : "The crate is empty. Be the first to shelve a record."}
              </p>
            </div>
          </Match>
          <Match when={true}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((album) => (
                <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
                  <VinylSleeve album={album} />
                </Link>
              ))}
            </div>
          </Match>
        </Switch>
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
