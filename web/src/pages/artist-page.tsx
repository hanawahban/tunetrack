import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Disc3 } from "lucide-react"
import { Skeleton } from "boneyard-js/react"

import { useGetArtistsById } from "@/lib/api/generated/artists/artists"
import { VinylSleeve } from "@/components/records/vinyl-sleeve"
import { FIXTURE_ARTIST_DETAIL } from "@/lib/boneyard-fixtures"

export function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const artistId = Number(id)
  const { data: artist } = useGetArtistsById(artistId, {
    query: { meta: { errorMessage: "Couldn't find that artist." } },
  })

  const loading = !artist
  const shown = artist ?? FIXTURE_ARTIST_DETAIL
  const albums = shown.albums ?? []

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="text-catalog inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to the shop floor
      </Link>

      <Skeleton
        name="artist-header"
        loading={loading}
        fixture={
          <div className="flex items-center gap-3 border-b-2 border-shop-amber/60 pb-4">
            <div className="flex size-10 items-center justify-center rounded-sm bg-shop-oxblood text-shop-paper">
              <Disc3 className="size-5" />
            </div>
            <div>
              <p className="text-catalog text-[0.65rem] text-shop-brass">artist divider</p>
              <h1 className="font-heading text-2xl font-semibold text-shop-paper">
                {FIXTURE_ARTIST_DETAIL.name}
              </h1>
            </div>
          </div>
        }
      >
        {/* the divider tab */}
        <div className="flex items-center gap-3 border-b-2 border-shop-amber/60 pb-4">
          <div className="flex size-10 items-center justify-center rounded-sm bg-shop-oxblood text-shop-paper">
            <Disc3 className="size-5" />
          </div>
          <div>
            <p className="text-catalog text-[0.65rem] text-shop-brass">artist divider</p>
            <h1 className="font-heading text-2xl font-semibold text-shop-paper">{shown.name}</h1>
          </div>
        </div>
      </Skeleton>

      <Skeleton
        name="artist-albums-grid"
        loading={loading}
        fixture={
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {FIXTURE_ARTIST_DETAIL.albums!.map((album) => (
              <VinylSleeve key={album.id} album={{ ...album, artist: FIXTURE_ARTIST_DETAIL }} />
            ))}
          </div>
        }
      >
        {albums.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records shelved under this name yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.map((album) => (
              <Link key={album.id} to={`/albums/${album.id}`} className="shelf-lip">
                <VinylSleeve album={{ ...album, artist: shown }} />
              </Link>
            ))}
          </div>
        )}
      </Skeleton>
    </div>
  )
}
