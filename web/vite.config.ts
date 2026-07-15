import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { boneyardPlugin } from "boneyard-js/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // every route sits behind auth (see App.tsx's RequireAuth) -- it checks
    // window.__BONEYARD_BUILD, the same flag this plugin sets during capture,
    // so the real pages mount and render their `fixture` props instead of
    // redirecting to /login.
    boneyardPlugin({ routes: ["/", "/crate", "/artists/1", "/albums/1"] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
