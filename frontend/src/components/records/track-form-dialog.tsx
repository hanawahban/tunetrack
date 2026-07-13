import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import {
  usePostTracks,
  usePatchTracksById,
} from "@/lib/api/generated/tracks/tracks"
import { getGetAlbumsByIdQueryKey } from "@/lib/api/generated/albums/albums"
import type { TrackResponseDto } from "@/lib/api/generated/model"
import { ApiError } from "@/lib/api-error"
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const trackFormSchema = z.object({
  title: z.string().trim().min(1, "Every track needs a title."),
})

type TrackFormValues = z.infer<typeof trackFormSchema>

export function TrackFormDialog({
  open,
  onOpenChange,
  albumId,
  track,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  albumId: number
  track?: TrackResponseDto
}) {
  const queryClient = useQueryClient()
  const createTrack = usePostTracks()
  const updateTrack = usePatchTracksById()

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: { title: "" },
  })

  React.useEffect(() => {
    if (open) form.reset({ title: track?.title ?? "" })
  }, [open, track, form])

  const saving = createTrack.isPending || updateTrack.isPending

  async function onSubmit(values: TrackFormValues) {
    try {
      if (track) {
        await updateTrack.mutateAsync({ id: track.id, data: { title: values.title } })
      } else {
        await createTrack.mutateAsync({ data: { title: values.title, albumId } })
      }
      queryClient.invalidateQueries({ queryKey: getGetAlbumsByIdQueryKey(albumId) })

      toast.success(track ? "Track relabeled." : "Track pressed onto the record.")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that track.")
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="e.g. Dreams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" variant="oxblood" disabled={saving}>
                {saving ? "Saving…" : track ? "Save changes" : "Add track"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
