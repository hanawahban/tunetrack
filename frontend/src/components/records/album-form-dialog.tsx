import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import {
  usePostAlbums,
  usePatchAlbumsById,
  getGetAlbumsQueryKey,
  getGetAlbumsByIdQueryKey,
} from "@/lib/api/generated/albums/albums"
import {
  useGetArtists,
  usePostArtists,
  getGetArtistsQueryKey,
} from "@/lib/api/generated/artists/artists"
import type { AlbumResponseDto } from "@/lib/api/generated/model"
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const albumFormSchema = z
  .object({
    title: z.string().trim().min(1, "Every sleeve needs a title."),
    releaseYear: z.string().trim(),
    imageUrl: z.string().trim(),
    artistId: z.string(),
    newArtistName: z.string().trim(),
  })
  .refine((v) => v.artistId || v.newArtistName, {
    message: "Every record needs an artist on the sleeve.",
    path: ["artistId"],
  })

type AlbumFormValues = z.infer<typeof albumFormSchema>

export function AlbumFormDialog({
  open,
  onOpenChange,
  album,
  defaultArtistId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  album?: AlbumResponseDto
  defaultArtistId?: number
}) {
  const queryClient = useQueryClient()
  const { data: artists } = useGetArtists()
  const createArtist = usePostArtists()
  const createAlbum = usePostAlbums()
  const updateAlbum = usePatchAlbumsById()

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      releaseYear: "",
      imageUrl: "",
      artistId: "",
      newArtistName: "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: album?.title ?? "",
        releaseYear: album?.releaseYear?.toString() ?? "",
        imageUrl: album?.imageUrl ?? "",
        artistId: (album?.artistId ?? defaultArtistId)?.toString() ?? "",
        newArtistName: "",
      })
    }
  }, [open, album, defaultArtistId, form])

  const saving = createArtist.isPending || createAlbum.isPending || updateAlbum.isPending

  async function onSubmit(values: AlbumFormValues) {
    try {
      let artistId = values.artistId ? Number(values.artistId) : undefined

      if (!artistId && values.newArtistName) {
        const created = await createArtist.mutateAsync({ data: { name: values.newArtistName } })
        queryClient.invalidateQueries({ queryKey: getGetArtistsQueryKey() })
        artistId = created.id
      }

      if (!artistId) return

      const dto = {
        title: values.title,
        releaseYear: values.releaseYear ? Number(values.releaseYear) : undefined,
        imageUrl: values.imageUrl || undefined,
        artistId,
      }

      if (album) {
        await updateAlbum.mutateAsync({ id: album.id, data: dto })
        queryClient.invalidateQueries({ queryKey: getGetAlbumsByIdQueryKey(album.id) })
      } else {
        await createAlbum.mutateAsync({ data: dto })
      }
      queryClient.invalidateQueries({ queryKey: getGetAlbumsQueryKey() })

      toast.success(album ? "Sleeve updated." : "New record shelved.")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that record.")
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rumours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="releaseYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1977" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v)
                      if (v) form.setValue("newArtistName", "")
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick an artist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {artists?.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>or type a new one below</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newArtistName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="New artist name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (e.target.value) form.setValue("artistId", "")
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" variant="oxblood" disabled={saving}>
                {saving ? "Saving…" : album ? "Save changes" : "Add to the crate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
