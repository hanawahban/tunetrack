import * as React from "react"
import { toast } from "sonner"

import { api, ApiError, type Track } from "@/lib/api"
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

export function TrackFormDialog({
  open,
  onOpenChange,
  albumId,
  track,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  albumId: number
  track?: Track
  onSaved: (track: Track) => void
}) {
  const [title, setTitle] = React.useState(track?.title ?? "")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) setTitle(track?.title ?? "")
  }, [open, track])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = track
        ? await api.updateTrack(track.id, { title: title.trim() })
        : await api.createTrack({ title: title.trim(), albumId })
      toast.success(track ? "Track relabeled." : "Track pressed onto the record.")
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that track.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{track ? "Relabel track" : "Add a track"}</DialogTitle>
          <DialogDescription>
            {track ? "Update the title on this CD." : "Press a new track onto this record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="track-title">Title</Label>
            <Input
              id="track-title"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dreams"
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="oxblood" disabled={saving}>
              {saving ? "Saving…" : track ? "Save changes" : "Add track"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
