import { toast } from "sonner"

import { ApiError } from "@/lib/api-error"

/** Return this from a `withToast` action to skip the success toast (and
 *  `onSuccess`) without treating the action as failed -- e.g. a form that
 *  legitimately has nothing to save yet. */
export const skipToast = Symbol("skip-toast")

/** Wraps the mutate -> toast.success / catch -> ApiError-toast ceremony
 *  repeated at every mutation call site. `onSuccess` is where callers put
 *  what should only happen once the mutation actually succeeded (query
 *  invalidation, closing a dialog, navigating away). */
export async function withToast<T>(
  action: () => Promise<T | typeof skipToast>,
  opts: {
    success: string | ((result: Exclude<T, typeof skipToast>) => string)
    error: string
    onSuccess?: (result: Exclude<T, typeof skipToast>) => void
  },
): Promise<void> {
  try {
    const result = await action()
    if (result === skipToast) return
    const value = result as Exclude<T, typeof skipToast>
    toast.success(typeof opts.success === "function" ? opts.success(value) : opts.success)
    opts.onSuccess?.(value)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : opts.error)
  }
}
