import { useQuery } from "@tanstack/react-query"

import { getScrobblesRecent } from "@/lib/api/generated/scrobbles/scrobbles"
import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model"

// ponytail: safety ceiling, not a product limit -- personal-scale app, just guards
// against a runaway loop if the backend's page cap or usage pattern ever changes.
const MAX_PAGES = 50

async function fetchAllScrobbles(): Promise<GetScrobblesRecent200OneItemsItem[]> {
  const items: GetScrobblesRecent200OneItemsItem[] = []
  let cursor: string | undefined
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await getScrobblesRecent({ cursor, limit: 100 })
    items.push(...res.items)
    if (!res.nextCursor) break
    cursor = res.nextCursor
  }
  return items
}

export function useScrobbleHistory() {
  return useQuery({
    queryKey: ["scrobbleHistory"],
    queryFn: fetchAllScrobbles,
  })
}
