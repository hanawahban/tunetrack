import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Disc3 } from "lucide-react"
import { toast } from "sonner"

import { api, ApiError, type Artist } from "@/lib/api"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { Skeleton } from "@/components/ui/skeleton"

export function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const artistId = Number(id)
  const [artist, setArtist] = React.useState<Artist | null>(null)

  React.useEffect(() => {
    api
      .artist(artistId)
      .then(setArtist)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Couldn't find that artist."),
      )
  }, [artistId])

  if (!artist) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  const albums = artist.albums ?? []

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="text-catalog inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to the shop floor
      </Link>

      {/* the divider tab */}
      <div className="flex items-center gap-3 border-b-2 border-shop-amber/60 pb-4">
        <div className="flex size-10 items-center justify-center rounded-sm bg-shop-oxblood text-shop-paper">
          <Disc3 className="size-5" />
        </div>
        <div>
          <p className="text-catalog text-[0.65rem] text-shop-brass">artist divider</p>
          <h1 className="font-heading text-2xl font-semibold text-shop-paper">{artist.name}</h1>
        </div>
      </div>

      {albums.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records shelved under this name yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {albums.map((album) => (
            <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
              <VinylSleeve album={{ ...album, artist }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
