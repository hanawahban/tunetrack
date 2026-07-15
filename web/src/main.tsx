import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureBoneyard } from 'boneyard-js/react'
import { toast } from 'sonner'
import './index.css'
import './bones/registry'
import App from './App.tsx'
import boneyardConfig from '../boneyard.config.json'
import { ApiError } from './lib/api-error'

// boneyard.config.json only drives the CLI/Vite-plugin capture -- the runtime
// <Skeleton> reads its theme from configureBoneyard(), so feed it the same file.
configureBoneyard({
  color: boneyardConfig.color,
  darkColor: boneyardConfig.darkColor,
  animate: boneyardConfig.animate as "pulse" | "shimmer" | "solid",
  speed: boneyardConfig.speed,
})

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // one place for the "query failed" toast, instead of a useEffect pasted
    // onto every page that reads one -- each query supplies its own fallback
    // copy via `meta.errorMessage`, shown unless the API sent a real message.
    onError: (error, query) => {
      const fallback =
        typeof query.meta?.errorMessage === "string"
          ? query.meta.errorMessage
          : "Something went wrong."
      toast.error(error instanceof ApiError ? error.message : fallback)
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
