import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronsUpDownIcon } from "lucide-react"

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
import type { AlbumResponseDto } from "@/lib/api-types"
import { withToast, skipToast } from "@/lib/mutation-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Switch, Match } from "@/lib/control-flow"

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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  album?: AlbumResponseDto
}) {
  const queryClient = useQueryClient()
  const createArtist = usePostArtists()
  const createAlbum = usePostAlbums()
  const updateAlbum = usePatchAlbumsById()
  const [artistPopoverOpen, setArtistPopoverOpen] = React.useState(false)
  const [artistSearch, setArtistSearch] = React.useState("")
  const [debouncedArtistSearch, setDebouncedArtistSearch] = React.useState("")
  const [selectedArtistName, setSelectedArtistName] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedArtistSearch(artistSearch), 250)
    return () => clearTimeout(timeout)
  }, [artistSearch])

  // Server-side search: the API filters by `q`, not a client-side filter over one fetched
  // page -- the artist picker works past the old 100-row page cap.
  const { data: artists, isFetching: artistsFetching } = useGetArtists({
    q: debouncedArtistSearch || undefined,
    limit: 20,
  })

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
        artistId: album?.artistId?.toString() ?? "",
        newArtistName: "",
      })
      setSelectedArtistName(album?.artist?.name)
      setArtistSearch("")
      setDebouncedArtistSearch("")
    }
  }, [open, album, form])

  const saving = createArtist.isPending || createAlbum.isPending || updateAlbum.isPending

  async function onSubmit(values: AlbumFormValues) {
    await withToast(
      async () => {
        let artistId = values.artistId ? Number(values.artistId) : undefined

        if (!artistId && values.newArtistName) {
          const created = await createArtist.mutateAsync({ data: { name: values.newArtistName } })
          queryClient.invalidateQueries({ queryKey: getGetArtistsQueryKey() })
          artistId = created.id
        }

        if (!artistId) return skipToast

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
      },
      {
        success: album ? "Sleeve updated." : "New record shelved.",
        error: "Couldn't save that record.",
        onSuccess: () => onOpenChange(false),
      },
    )
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
              render={({ field }) => {
                const pendingNewArtistName = form.watch("newArtistName")
                const triggerLabel = pendingNewArtistName || selectedArtistName || "Pick an artist"

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Artist</FormLabel>
                    <Popover open={artistPopoverOpen} onOpenChange={setArtistPopoverOpen}>
                      <PopoverTrigger
                        render={
                          <FormControl>
                            <button
                              type="button"
                              role="combobox"
                              aria-expanded={artistPopoverOpen}
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                "w-full justify-between font-normal",
                                !selectedArtistName && !pendingNewArtistName && "text-muted-foreground"
                              )}
                            >
                              {triggerLabel}
                              <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                            </button>
                          </FormControl>
                        }
                      />
                      <PopoverContent className="w-(--anchor-width) p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search artists…"
                            value={artistSearch}
                            onValueChange={setArtistSearch}
                          />
                          <CommandList>
                            {!artistsFetching && (
                              <CommandEmpty>
                                <button
                                  type="button"
                                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                                  onClick={() => {
                                    form.setValue("newArtistName", artistSearch)
                                    field.onChange("")
                                    setSelectedArtistName(undefined)
                                    setArtistPopoverOpen(false)
                                  }}
                                >
                                  Create "{artistSearch}"
                                </button>
                              </CommandEmpty>
                            )}
                            <CommandGroup>
                              {artists?.items.map((a) => (
                                <CommandItem
                                  key={a.id}
                                  value={a.id.toString()}
                                  onSelect={() => {
                                    field.onChange(a.id.toString())
                                    form.setValue("newArtistName", "")
                                    setSelectedArtistName(a.name)
                                    setArtistPopoverOpen(false)
                                  }}
                                >
                                  {a.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <DialogFooter>
              <Button type="submit" variant="oxblood" disabled={saving}>
                <Switch>
                  <Match when={saving}>Saving…</Match>
                  <Match when={album}>Save changes</Match>
                  <Match when={true}>Add to the crate</Match>
                </Switch>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
