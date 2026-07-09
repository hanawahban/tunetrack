import * as React from "react"
import { toast } from "sonner"

import { api, ApiError, type Album, type Artist } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AlbumFormDialog({
  open,
  onOpenChange,
  artists,
  album,
  defaultArtistId,
  onSaved,
  onArtistCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  artists: Artist[]
  album?: Album
  defaultArtistId?: number
  onSaved: (album: Album) => void
  onArtistCreated: (artist: Artist) => void
}) {
  const [title, setTitle] = React.useState(album?.title ?? "")
  const [year, setYear] = React.useState(album?.releaseYear?.toString() ?? "")
  const [imageUrl, setImageUrl] = React.useState(album?.imageUrl ?? "")
  const [artistId, setArtistId] = React.useState<string>(
    (album?.artistId ?? defaultArtistId)?.toString() ?? "",
  )
  const [newArtistName, setNewArtistName] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTitle(album?.title ?? "")
      setYear(album?.releaseYear?.toString() ?? "")
      setImageUrl(album?.imageUrl ?? "")
      setArtistId((album?.artistId ?? defaultArtistId)?.toString() ?? "")
      setNewArtistName("")
    }
  }, [open, album, defaultArtistId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let resolvedArtistId = artistId ? Number(artistId) : undefined

      if (!resolvedArtistId && newArtistName.trim()) {
        const created = await api.createArtist(newArtistName.trim())
        onArtistCreated(created)
        resolvedArtistId = created.id
      }

      if (!resolvedArtistId) {
        toast.error("Every record needs an artist on the sleeve.")
        setSaving(false)
        return
      }

      const dto = {
        title: title.trim(),
        releaseYear: year ? Number(year) : undefined,
        imageUrl: imageUrl.trim() || undefined,
        artistId: resolvedArtistId,
      }

      const saved = album
        ? await api.updateAlbum(album.id, dto)
        : await api.createAlbum(dto)

      toast.success(album ? "Sleeve updated." : "New record shelved.")
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that record.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{album ? "Edit the sleeve" : "Shelve a new record"}</DialogTitle>
          <DialogDescription>
            {album ? "Update the details printed on this sleeve." : "Add an album to the crate."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="album-title">Title</Label>
            <Input
              id="album-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rumours"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="album-year">Release year</Label>
            <Input
              id="album-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="1977"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="album-image">Cover image URL</Label>
            <Input
              id="album-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Artist</Label>
            <Select value={artistId} onValueChange={setArtistId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick an artist" />
              </SelectTrigger>
              <SelectContent>
                {artists.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-catalog pt-1 text-[0.65rem] text-muted-foreground">
              or type a new one below
            </p>
            <Input
              value={newArtistName}
              onChange={(e) => {
                setNewArtistName(e.target.value)
                if (e.target.value) setArtistId("")
              }}
              placeholder="New artist name"
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="oxblood" disabled={saving}>
              {saving ? "Saving…" : album ? "Save changes" : "Add to the crate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
