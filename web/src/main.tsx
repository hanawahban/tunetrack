import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureBoneyard } from 'boneyard-js/react'
import './index.css'
import './bones/registry'
import App from './App.tsx'
import boneyardConfig from '../boneyard.config.json'

// boneyard.config.json only drives the CLI/Vite-plugin capture -- the runtime
// <Skeleton> reads its theme from configureBoneyard(), so feed it the same file.
configureBoneyard({
  color: boneyardConfig.color,
  darkColor: boneyardConfig.darkColor,
  animate: boneyardConfig.animate as "pulse" | "shimmer" | "solid",
  speed: boneyardConfig.speed,
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
