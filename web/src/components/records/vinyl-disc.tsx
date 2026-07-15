import { cn } from "@/lib/utils"

/** The grooved vinyl disc with a centered amber label -- used both as the
 *  disc peeking out from behind a VinylSleeve thumbnail and as the no-cover
 *  fallback on the album detail page. `className` controls the disc's own
 *  position/size/hover; `labelClassName`/`textClassName` the label circle
 *  and its text, which scale very differently between a small grid card and
 *  the full detail view. */
export function VinylDisc({
  label,
  className,
  labelClassName,
  textClassName,
  dotClassName,
}: {
  label: string
  className?: string
  labelClassName?: string
  textClassName?: string
  dotClassName?: string
}) {
  return (
    <div
      className={cn("rounded-full bg-shop-vinyl", className)}
      style={{
        backgroundImage:
          "repeating-radial-gradient(circle at 50% 50%, var(--shop-vinyl-groove) 0px, var(--shop-vinyl-groove) 1px, transparent 2px, transparent 4px)",
      }}
      aria-hidden
    >
      <div
        className={cn(
          "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full bg-shop-amber text-center",
          labelClassName,
        )}
      >
        <span
          className={cn(
            "font-heading leading-none font-semibold text-shop-ink line-clamp-2",
            textClassName,
          )}
        >
          {label}
        </span>
        <span className={cn("size-2 rounded-full bg-shop-ink/70", dotClassName)} />
      </div>
    </div>
  )
}
