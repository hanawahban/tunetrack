import { AlertTriangle } from "lucide-react"

/** Shown in place of a page's real content when its query has actually
 *  failed (not just loading) -- pairs with the toast from QueryCache.onError,
 *  which says why; this says the content isn't there. */
export function QueryErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-destructive/40 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
