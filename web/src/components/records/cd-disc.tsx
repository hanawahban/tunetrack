import { Disc3, Play, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TrackResponseDto } from "@/lib/api-types"

export function CdTrackRow({
  track,
  index,
  onSpin,
  onEdit,
  onDelete,
  canCurate,
  spinning,
}: {
  track: TrackResponseDto
  index: number
  onSpin: () => void
  onEdit?: () => void
  onDelete?: () => void
  canCurate?: boolean
  spinning?: boolean
}) {
  return (
    <div className="group flex items-center gap-3 rounded-sm border border-white/10 bg-black/15 px-3 py-2.5 transition-colors hover:bg-black/25">
      {/* the CD itself */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.6)]",
            "bg-[conic-gradient(from_90deg,oklch(0.85_0.02_260),oklch(0.7_0.05_320),oklch(0.85_0.05_60),oklch(0.75_0.04_200),oklch(0.85_0.02_260))]",
            spinning && "animate-spin [animation-duration:1.6s]",
          )}
        >
          <div className="size-3 rounded-full bg-shop-ink" />
        </div>
      </div>

      <span className="text-catalog w-5 shrink-0 text-right text-xs text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>

      <p className="min-w-0 flex-1 truncate text-sm text-foreground">{track.title}</p>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" title="Spin this track" onClick={onSpin}>
          {spinning ? <Disc3 className="animate-spin" /> : <Play />}
        </Button>
        {canCurate && (
          <>
            <Button variant="ghost" size="icon" title="Edit track" onClick={onEdit}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Remove track"
              className="hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
