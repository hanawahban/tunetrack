# TuneTrack Web — "The Crate-Digger's Shop"

A full React + Vite + Tailwind v4 + shadcn-style frontend for the TuneTrack NestJS API,
styled as a dim, warm used-record shop. Albums are vinyl sleeves with a disc that
physically slides out on hover; tracks are CDs that spin when you hit play.

## What's in here

- `src/lib/api.ts` — full client for every endpoint your Nest API exposes
  (auth, artists, albums, tracks, scrobbles, stats). Drop-in replacement for
  your existing `web/src/lib/api.ts`.
- `src/lib/auth-context.tsx` + `src/lib/jwt.ts` — session handling. Since the
  API doesn't expose `/users/me`, the role and user id are read straight out
  of the JWT payload after login.
- `src/components/ui/*` — hand-written shadcn-style primitives (button, input,
  dialog, alert-dialog, select, tabs, card, badge, separator, skeleton, sonner)
  built on individual `@radix-ui/react-*` packages.
- `src/components/records/*` — the record-store components:
  - `vinyl-sleeve.tsx` — the signature piece. An album card with the disc
    tucked behind the sleeve; hover and it slides out at an angle.
  - `cd-disc.tsx` — a track row with a spinning CD, a "spin" (scrobble)
    button, and edit/delete controls for curators.
  - `album-form-dialog.tsx` / `track-form-dialog.tsx` — add/edit forms, with
    inline "type a new artist" support.
  - `confirm-delete-dialog.tsx` — generic delete confirmation.
- `src/pages/*` — Auth (login/join), Shop Floor (browse/search), Album (opened
  sleeve + CD tracklist), Artist (crate divider), My Crate (recent scrobbles as
  a receipt + a top-artists chalkboard using `/stats/top-artists`).
- `src/index.css` — the committed palette: oxblood, warm ink, worn paper,
  brass/amber, plus Fraunces (display serif) + Geist (body) + Geist Mono
  (catalog/label text).

## Role-aware UI

Only `ADMIN` / `CURATOR` accounts see "shelve a record," "press a track,"
edit, and delete controls, matching your `RolesGuard` — `LISTENER` accounts
can browse and scrobble (the shop's version of "playing" a track) but not
edit the catalog. This maps directly to what your API actually allows today;
there's no separate "collection" table in your schema, so adding/removing
albums and tracks is catalog management (curator/admin), and a listener's
personal activity is the scrobble log shown in My Crate.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your Nest API
npm run dev
```

Make sure your Nest API's `WEB_ORIGIN` env matches wherever this runs
(`http://localhost:5173` by default) so CORS allows it.

## Merging into your existing `web/` folder

Your existing project already had `shadcn`/`radix-ui` (the newer unified
package) wired up via `components.json`. This build uses plain
`@radix-ui/react-*` packages instead so I could fully verify every import and
type against a real `npm run build` — it's the same components either way,
just a different (very well-trodden) way of importing Radix. Two ways to
bring it in:

1. **Easiest** — copy this whole `web/` folder over your existing one
   (back up your `.env` first), then `npm install`.
2. **Merge by hand** — copy `src/` in, keep your `components.json`/fonts if
   you'd rather run the `shadcn` CLI yourself, and add the `dependencies`
   listed in this `package.json` that you're missing (`react-router-dom`,
   `@radix-ui/react-*`, `@fontsource-variable/fraunces`,
   `@fontsource-variable/geist-mono`).

## Notes / things you may want to adjust

- No `/users/me` endpoint exists, so the header shows the role from the JWT
  rather than the email. Add that endpoint if you'd like a nicer "signed in
  as…" display.
- `npm run build` and `oxlint` both pass clean on this exact tree.
