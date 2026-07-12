import { cn } from "@/lib/utils"
import type { AlbumResponseDto } from "@/lib/api/generated/model"

// A small, restrained set of worn-sleeve tints so the crate doesn't look uniform,
// the way a real shelf of used records never has two identical sleeves.
const SLEEVE_TINTS = [
  "bg-shop-oxblood-dim",
  "bg-[oklch(0.3_0.05_95)]", // faded mustard
  "bg-[oklch(0.28_0.04_230)]", // washed denim
  "bg-[oklch(0.26_0.03_150)]", // faded army green
  "bg-[oklch(0.3_0.06_30)]", // rust
]

function tintFor(id: number) {
  return SLEEVE_TINTS[id % SLEEVE_TINTS.length]
}

export function VinylSleeve({
  album,
  className,
}: {
  album: AlbumResponseDto
  className?: string
}) {
  const tint = tintFor(album.id)

  return (
    <div
      className={cn(
        "group relative aspect-square w-full select-none",
        className,
      )}
    >
      {/* the disc — sits behind the sleeve, slides out on hover */}
      <div
        className="absolute inset-0 z-0 rounded-full bg-shop-vinyl shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out group-hover:translate-x-[18%] group-hover:-translate-y-[10%] group-hover:rotate-12"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 50% 50%, var(--shop-vinyl-groove) 0px, var(--shop-vinyl-groove) 1px, transparent 2px, transparent 4px)`,
        }}
        aria-hidden
      >
        <div className="absolute top-1/2 left-1/2 flex size-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-shop-amber text-center">
          <span className="font-heading text-[0.55rem] leading-none font-semibold text-shop-ink line-clamp-2 px-1">
            {album.artist?.name ?? "Unknown"}
          </span>
          <span className="mt-0.5 size-1.5 rounded-full bg-shop-ink/70" />
        </div>
      </div>

      {/* the sleeve — the printed jacket, in front. Tint always sits underneath as a
          fallback fill so a broken/blocked cover image never leaves a transparent hole. */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex flex-col justify-between overflow-hidden rounded-[2px] border border-black/30 p-3 shadow-[2px_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out group-hover:-translate-x-[6%] group-hover:translate-y-[3%] group-hover:-rotate-2",
          tint,
        )}
        style={
          album.imageUrl
            ? { backgroundImage: `url(${album.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {album.imageUrl && <div className="pointer-events-none absolute inset-0 bg-black/25" />}
        {/* spine shadow */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-black/25" />
        {/* worn corner */}
        <div className="pointer-events-none absolute -right-4 -top-4 size-10 rotate-45 bg-black/15" />

        <div className="text-catalog flex items-start justify-between text-shop-paper/70">
          <span className="text-[0.6rem]">{album.releaseYear ?? "—"}</span>
          <span className="rounded-sm border border-shop-paper/30 bg-black/20 px-1 text-[0.55rem]">
            LP
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="font-heading text-sm leading-tight font-semibold text-shop-paper line-clamp-2">
            {album.title}
          </p>
          <p className="text-catalog text-[0.65rem] text-shop-paper/70 line-clamp-1">
            {album.artist?.name ?? "Unknown artist"}
          </p>
        </div>
      </div>
    </div>
  )
}
