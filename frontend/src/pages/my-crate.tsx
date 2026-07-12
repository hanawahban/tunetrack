import * as React from "react"
import { Link } from "react-router-dom"
import { Disc3, Receipt } from "lucide-react"
import { toast } from "sonner"

import { useScrobblesControllerFindRecent } from "@/lib/api/generated/scrobbles/scrobbles"
import { useStatsControllerTopArtists } from "@/lib/api/generated/stats/stats"
import { ApiError } from "@/lib/api-error"
import { Skeleton } from "@/components/ui/skeleton"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function MyCratePage() {
  const { data: scrobbles, isPending: scrobblesPending, error: scrobblesError } =
    useScrobblesControllerFindRecent()
  const { data: topArtists, isPending: topArtistsPending } = useStatsControllerTopArtists()

  React.useEffect(() => {
    if (scrobblesError) {
      toast.error(
        scrobblesError instanceof ApiError ? scrobblesError.message : "Couldn't pull your receipt.",
      )
    }
  }, [scrobblesError])

  const maxPlays = Math.max(1, ...(topArtists ?? []).map((a) => a.playCount))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-shop-paper">My Crate</h1>
        <p className="text-sm text-muted-foreground">
          What's been spinning on your turntable lately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* receipt tape of recent plays */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="size-4 text-shop-amber" />
            <h2 className="text-catalog text-xs uppercase tracking-wider text-muted-foreground">
              Recent spins
            </h2>
          </div>

          <div
            className="rounded-sm border border-shop-brass/25 bg-[oklch(0.9_0.015_85)] p-5 text-shop-ink shadow-lg"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0 27px, oklch(0 0 0 / 0.05) 27px 28px)",
            }}
          >
            {scrobblesPending && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full bg-black/10" />
                ))}
              </div>
            )}

            {scrobbles?.length === 0 && (
              <p className="text-catalog py-6 text-center text-sm text-shop-ink/60">
                No spins logged yet. Open a record and hit play.
              </p>
            )}

            {scrobbles?.map((s) => (
              <div
                key={s.id}
                className="text-catalog flex items-center justify-between gap-3 py-1 text-sm leading-7"
              >
                <span className="min-w-0 truncate">
                  {s.track?.title ?? "Unknown track"}
                  {s.track?.album?.artist && (
                    <>
                      {" — "}
                      <Link
                        to={`/artists/${s.track.album.artist.id}`}
                        className="text-shop-oxblood hover:underline"
                      >
                        {s.track.album.artist.name}
                      </Link>
                    </>
                  )}
                </span>
                <span className="shrink-0 text-shop-ink/50">{timeAgo(s.playedAt)}</span>
              </div>
            ))}

            {scrobbles && scrobbles.length > 0 && (
              <div className="mt-3 border-t border-dashed border-black/20 pt-2 text-center text-[0.65rem] tracking-widest text-shop-ink/40">
                * * * END OF RECEIPT * * *
              </div>
            )}
          </div>
        </div>

        {/* top artists chalkboard */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Disc3 className="size-4 text-shop-amber" />
            <h2 className="text-catalog text-xs uppercase tracking-wider text-muted-foreground">
              Most played
            </h2>
          </div>

          <div className="rounded-sm border border-shop-brass/40 bg-[oklch(0.2_0.02_150)] p-5 shadow-lg">
            {topArtistsPending && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            )}

            {topArtists?.length === 0 && (
              <p className="font-heading text-sm text-shop-paper/70">
                Nothing on the charts yet — start spinning.
              </p>
            )}

            <div className="space-y-3">
              {topArtists?.map((a, i) => (
                <div key={a.artistId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/artists/${a.artistId}`}
                      className="font-heading text-sm text-shop-paper hover:text-shop-amber"
                    >
                      {i + 1}. {a.name}
                    </Link>
                    <span className="text-catalog text-xs text-shop-paper/60">
                      {a.playCount} play{a.playCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-shop-amber"
                      style={{ width: `${(a.playCount / maxPlays) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
