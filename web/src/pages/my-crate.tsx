import * as React from "react"
import { Link } from "react-router-dom"
import { endOfDay, startOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarDays, Disc3, LineChart, Receipt } from "lucide-react"
import { Skeleton } from "boneyard-js/react"
import { toast } from "sonner"

import { useGetScrobblesRecentInfinite } from "@/lib/api/generated/scrobbles/scrobbles"
import { useGetStatsTopArtists } from "@/lib/api/generated/stats/stats"
import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model"
import { ApiError } from "@/lib/api-error"
import { useScrobbleHistory } from "@/lib/hooks/use-scrobble-history"
import { Progress } from "@/components/ui/progress"
import { ListeningCalendar } from "@/components/records/listening-calendar"
import { ListeningTrendChart, TopGenresChart } from "@/components/records/listening-charts"
import { DateRangeFilter } from "@/components/records/date-range-filter"
import { FIXTURE_SCROBBLES, FIXTURE_TOP_ARTISTS } from "@/lib/boneyard-fixtures"
import { Show, Switch, Match } from "@/lib/control-flow"

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
  const {
    data: scrobblesData,
    isPending: scrobblesPending,
    isFetchingNextPage: scrobblesFetchingNextPage,
    hasNextPage: hasNextScrobblesPage,
    fetchNextPage: fetchNextScrobblesPage,
    error: scrobblesError,
  } = useGetScrobblesRecentInfinite(
    {},
    { query: { initialPageParam: undefined, getNextPageParam: (last) => last.nextCursor ?? undefined } },
  )
  const { data: topArtists, isPending: topArtistsPending } = useGetStatsTopArtists()
  const { data: scrobbleHistory, isPending: historyPending } = useScrobbleHistory()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const scrobbles = React.useMemo(
    () => scrobblesData?.pages.flatMap((p) => p.items) ?? [],
    [scrobblesData],
  )

  const filteredHistory = React.useMemo(() => {
    if (!scrobbleHistory) return []
    if (!dateRange?.from) return scrobbleHistory
    const from = startOfDay(dateRange.from)
    const to = endOfDay(dateRange.to ?? dateRange.from)
    return scrobbleHistory.filter((s) => {
      const playedAt = new Date(s.playedAt)
      return playedAt >= from && playedAt <= to
    })
  }, [scrobbleHistory, dateRange])

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
            <Skeleton
              name="recent-spins-list"
              loading={scrobblesPending && scrobbles.length === 0}
              fixture={<RecentSpinsList scrobbles={FIXTURE_SCROBBLES} />}
            >
              <Show
                when={scrobbles.length > 0}
                fallback={
                  <p className="text-catalog py-6 text-center text-sm text-shop-ink/60">
                    No spins logged yet. Open a record and hit play.
                  </p>
                }
              >
                <RecentSpinsList scrobbles={scrobbles} />
              </Show>
            </Skeleton>

            <Switch>
              <Match when={scrobbles.length > 0 && hasNextScrobblesPage}>
                <div className="mt-3 border-t border-dashed border-black/20 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => fetchNextScrobblesPage()}
                    disabled={scrobblesFetchingNextPage}
                    className="text-catalog text-[0.65rem] tracking-widest text-shop-ink/50 hover:text-shop-ink disabled:opacity-50"
                  >
                    {scrobblesFetchingNextPage ? "loading…" : "* * * load more * * *"}
                  </button>
                </div>
              </Match>
              <Match when={scrobbles.length > 0}>
                <div className="mt-3 border-t border-dashed border-black/20 pt-2 text-center text-[0.65rem] tracking-widest text-shop-ink/40">
                  * * * END OF RECEIPT * * *
                </div>
              </Match>
            </Switch>
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
            <Skeleton
              name="top-artists-list"
              loading={topArtistsPending}
              fixture={<TopArtistsList artists={FIXTURE_TOP_ARTISTS} maxPlays={42} />}
            >
              <Show
                when={topArtists && topArtists.length > 0}
                fallback={
                  <p className="font-heading text-sm text-shop-paper/70">
                    Nothing on the charts yet — start spinning.
                  </p>
                }
              >
                <TopArtistsList artists={topArtists ?? []} maxPlays={maxPlays} />
              </Show>
            </Skeleton>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-shop-paper">Listening activity</h2>
          <DateRangeFilter range={dateRange} onRangeChange={setDateRange} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="size-4 text-shop-amber" />
              <h3 className="text-catalog text-xs uppercase tracking-wider text-muted-foreground">
                Spin calendar
              </h3>
            </div>

            <div className="rounded-sm border border-shop-brass/25 bg-shop-vinyl p-3 shadow-lg">
              <Skeleton
                name="listening-calendar"
                loading={historyPending}
                fixture={<ListeningCalendar scrobbles={FIXTURE_SCROBBLES} />}
              >
                <ListeningCalendar scrobbles={filteredHistory} />
              </Skeleton>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <LineChart className="size-4 text-shop-amber" />
                <h3 className="text-catalog text-xs uppercase tracking-wider text-muted-foreground">
                  Listening trend
                </h3>
              </div>

              <div className="rounded-sm border border-shop-brass/25 bg-shop-vinyl p-3 shadow-lg">
                <Skeleton
                  name="listening-trend-chart"
                  loading={historyPending}
                  fixture={<ListeningTrendChart scrobbles={FIXTURE_SCROBBLES} />}
                >
                  <ListeningTrendChart scrobbles={filteredHistory} />
                </Skeleton>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Disc3 className="size-4 text-shop-amber" />
                <h3 className="text-catalog text-xs uppercase tracking-wider text-muted-foreground">
                  Top genres
                </h3>
              </div>

              <div className="rounded-sm border border-shop-brass/25 bg-shop-vinyl p-3 shadow-lg">
                <Skeleton
                  name="top-genres-chart"
                  loading={historyPending}
                  fixture={<TopGenresChart scrobbles={FIXTURE_SCROBBLES} />}
                >
                  <TopGenresChart scrobbles={filteredHistory} />
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentSpinsList({ scrobbles }: { scrobbles: GetScrobblesRecent200OneItemsItem[] }) {
  return (
    <>
      {scrobbles.map((s) => (
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
    </>
  )
}

function TopArtistsList({
  artists,
  maxPlays,
}: {
  artists: { artistId: number; name: string; playCount: number }[]
  maxPlays: number
}) {
  return (
    <div className="space-y-3">
      {artists.map((a, i) => (
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
          <Progress value={(a.playCount / maxPlays) * 100} />
        </div>
      ))}
    </div>
  )
}
