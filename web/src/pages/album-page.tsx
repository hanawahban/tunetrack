import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Pencil, Trash2, Disc3 } from "lucide-react"
import { Skeleton } from "boneyard-js/react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  useGetAlbumsById,
  useDeleteAlbumsById,
  getGetAlbumsQueryKey,
  getGetAlbumsByIdQueryKey,
} from "@/lib/api/generated/albums/albums"
import { useDeleteTracksById } from "@/lib/api/generated/tracks/tracks"
import {
  usePostScrobbles,
  getGetScrobblesRecentQueryKey,
} from "@/lib/api/generated/scrobbles/scrobbles"
import { getGetStatsTopArtistsQueryKey } from "@/lib/api/generated/stats/stats"
import type { AlbumResponseDto, TrackResponseDto } from "@/lib/api-types"
import { ApiError } from "@/lib/api-error"
import { CdTrackRow } from "@/components/records/cd-disc"
import { AlbumFormDialog } from "@/components/records/album-form-dialog"
import { TrackFormDialog } from "@/components/records/track-form-dialog"
import { ConfirmDeleteDialog } from "@/components/records/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FIXTURE_ALBUM_DETAIL } from "@/lib/boneyard-fixtures"
import { Show } from "@/lib/control-flow"
import { RoleGate } from "@/lib/role-gate"

export function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const albumId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: album } = useGetAlbumsById(albumId, {
    query: { meta: { errorMessage: "Couldn't find that record." } },
  })
  const scrobble = usePostScrobbles()
  const removeAlbum = useDeleteAlbumsById()
  const removeTrack = useDeleteTracksById()

  const [spinningId, setSpinningId] = React.useState<number | null>(null)
  const [editAlbumOpen, setEditAlbumOpen] = React.useState(false)
  const [deleteAlbumOpen, setDeleteAlbumOpen] = React.useState(false)
  const [trackDialog, setTrackDialog] = React.useState<{ open: boolean; track?: TrackResponseDto }>({
    open: false,
  })
  const [deleteTrack, setDeleteTrack] = React.useState<TrackResponseDto | null>(null)

  async function handleSpin(track: TrackResponseDto) {
    setSpinningId(track.id)
    try {
      await scrobble.mutateAsync({ data: { trackId: track.id } })
      queryClient.invalidateQueries({ queryKey: getGetScrobblesRecentQueryKey() })
      queryClient.invalidateQueries({ queryKey: getGetStatsTopArtistsQueryKey() })
      toast.success(`Spinning "${track.title}"`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "The needle skipped.")
    } finally {
      setTimeout(() => setSpinningId(null), 1600)
    }
  }

  async function handleDeleteAlbum() {
    try {
      await removeAlbum.mutateAsync({ id: albumId })
      queryClient.invalidateQueries({ queryKey: getGetAlbumsQueryKey() })
      toast.success("Pulled from the crate.")
      navigate("/")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove that record.")
    }
  }

  async function handleDeleteTrack() {
    if (!deleteTrack) return
    try {
      await removeTrack.mutateAsync({ id: deleteTrack.id })
      queryClient.invalidateQueries({ queryKey: getGetAlbumsByIdQueryKey(albumId) })
      toast.success("Track lifted off the record.")
      setDeleteTrack(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove that track.")
    }
  }

  const loading = !album
  const shown = album ?? FIXTURE_ALBUM_DETAIL

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="text-catalog inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to the shop floor
      </Link>

      <Skeleton name="album-detail" loading={loading} fixture={<AlbumDetail album={FIXTURE_ALBUM_DETAIL} />}>
        <AlbumDetail
          album={shown}
          spinningId={spinningId}
          onSpin={handleSpin}
          onEditAlbum={() => setEditAlbumOpen(true)}
          onAddTrack={() => setTrackDialog({ open: true })}
          onDeleteAlbum={() => setDeleteAlbumOpen(true)}
          onEditTrack={(track) => setTrackDialog({ open: true, track })}
          onDeleteTrack={setDeleteTrack}
        />
      </Skeleton>

      <AlbumFormDialog open={editAlbumOpen} onOpenChange={setEditAlbumOpen} album={shown} />

      <TrackFormDialog
        open={trackDialog.open}
        onOpenChange={(open) => setTrackDialog({ open })}
        albumId={shown.id}
        track={trackDialog.track}
      />

      <ConfirmDeleteDialog
        open={deleteAlbumOpen}
        onOpenChange={setDeleteAlbumOpen}
        title="Remove this record?"
        description={`"${shown.title}" and its tracklist will be pulled from the shop for good.`}
        onConfirm={handleDeleteAlbum}
      />

      <ConfirmDeleteDialog
        open={!!deleteTrack}
        onOpenChange={(open) => !open && setDeleteTrack(null)}
        title="Remove this track?"
        description={deleteTrack ? `"${deleteTrack.title}" will be lifted off the record for good.` : ""}
        onConfirm={handleDeleteTrack}
      />
    </div>
  )
}

function AlbumDetail({
  album,
  spinningId,
  onSpin,
  onEditAlbum,
  onAddTrack,
  onDeleteAlbum,
  onEditTrack,
  onDeleteTrack,
}: {
  album: AlbumResponseDto
  spinningId?: number | null
  onSpin?: (track: TrackResponseDto) => void
  onEditAlbum?: () => void
  onAddTrack?: () => void
  onDeleteAlbum?: () => void
  onEditTrack?: (track: TrackResponseDto) => void
  onDeleteTrack?: (track: TrackResponseDto) => void
}) {
  const tracks = album.tracks ?? []

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* opened sleeve, disc pulled all the way out */}
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <Show
          when={album.imageUrl}
          fallback={
            <div
              className="absolute top-[6%] left-[10%] size-[88%] rounded-full bg-shop-vinyl shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at 50% 50%, var(--shop-vinyl-groove) 0px, var(--shop-vinyl-groove) 1px, transparent 2px, transparent 4px)",
              }}
            >
              <div className="absolute top-1/2 left-1/2 flex size-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full bg-shop-amber text-center">
                <span className="font-heading text-xs leading-tight font-semibold text-shop-ink px-2 line-clamp-2">
                  {album.title}
                </span>
                <span className="size-2 rounded-full bg-shop-ink/70" />
              </div>
            </div>
          }
        >
          {(url) => (
            <div
              className="absolute inset-0 rounded-[3px] border border-black/30 bg-shop-oxblood-dim bg-cover bg-center shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
              style={{ backgroundImage: `url(${url})` }}
            />
          )}
        </Show>
        <div className="absolute inset-0 -z-10 -translate-x-[8%] translate-y-[4%] -rotate-3 rounded-[3px] border border-black/30 bg-shop-oxblood-dim shadow-[2px_2px_14px_rgba(0,0,0,0.5)]" />
      </div>

      <div className="space-y-5">
        <div>
          <div className="text-catalog mb-2 flex items-center gap-2 text-xs text-shop-brass">
            <Badge>{album.releaseYear ?? "year unknown"}</Badge>
            <Badge variant="outline">{tracks.length} track{tracks.length === 1 ? "" : "s"}</Badge>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-shop-paper">{album.title}</h1>
          {album.artist && (
            <Link
              to={`/artists/${album.artist.id}`}
              className="mt-1 inline-block text-sm text-shop-amber hover:underline"
            >
              {album.artist.name}
            </Link>
          )}
        </div>

        <RoleGate roles={["ADMIN", "CURATOR"]}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onEditAlbum}>
              <Pencil /> Edit sleeve
            </Button>
            <Button variant="outline" size="sm" onClick={onAddTrack}>
              <Plus /> Press a track
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDeleteAlbum}
            >
              <Trash2 /> Remove record
            </Button>
          </div>
        </RoleGate>

        <div className="space-y-1.5">
          {tracks.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-shop-brass/30 py-10 text-center">
              <Disc3 className="size-6 text-shop-brass" />
              <p className="text-sm text-muted-foreground">No tracks pressed yet.</p>
            </div>
          )}
          {tracks.map((track, i) => (
            <CdTrackRow
              key={track.id}
              track={track}
              index={i}
              spinning={spinningId === track.id}
              onSpin={() => onSpin?.(track)}
              onEdit={() => onEditTrack?.(track)}
              onDelete={() => onDeleteTrack?.(track)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
