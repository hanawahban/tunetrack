<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: TuneTrack
description: A personal scrobble log styled as a dim, warm used-record shop you dig through.
---

# Design System: TuneTrack

## 1. Overview

**Creative North Star: "The Crate-Digger's Shop"**

TuneTrack reads like a used-record shop at closing light: warm, low, a little dusty, every album a physical object you have to reach for rather than a thumbnail you glance past. The mood is Letterboxd's personal-log intimacy crossed with a record shop's tactile browsing and a zine's rough print texture — not a slick, algorithmic streaming dashboard and not a retail storefront trying to sell you something. This system explicitly rejects Spotify/Apple Music's glossy rounded-card grids on slick dark themes, and rejects any e-commerce/"add to cart" retail polish. It also carries PRODUCT.md's standing anti-references: no generic SaaS admin card-grid, no cream/sand AI-default gradients, no uppercase eyebrows, no gradient text.

**Key Characteristics:**
- Warm, dim, sodium-lamp-lit surface — the color IS the room's lighting, not decoration on top of it.
- Physical objects (CD jewel cases, vinyl sleeves) as real navigable UI, not illustrative flourish.
- Print/zine texture in typography and materials over digital-native flatness.
- Personal collection intimacy, never storefront or dashboard.

## 2. Colors

**Color strategy: Committed.** [to be resolved during implementation — one saturated warm tone, oxblood-red or amber-brown, carries roughly 30–60% of the surface]

**The Sodium-Lamp Rule.** The dominant surface color reads as warm shop lighting, not a UI background — if it could be swapped for a cool neutral without changing the feel, it's wrong.

### Primary
- **[Deep oxblood or amber-brown — to be resolved during implementation]**: dominant surface tone, carries the "dim shop" mood directly.

### Neutral
- **[Near-black / warm charcoal — to be resolved during implementation]**: body text, low-light surfaces.
- **[Worn paper/cream, used sparingly — to be resolved during implementation]**: sleeve/label surfaces, not the page background.

## 3. Typography

**Display Font:** [Serif — to be chosen at implementation; record-sleeve/print-catalog character]
**Body Font:** [Sans — to be chosen at implementation; clean, legible against the warm dim background]

**Character:** Serif display against sans body — the contrast of a printed sleeve credit line against plain catalog-card text.

### Hierarchy
- **Display**: album/artist titles, sleeve-credit feel.
- **Body**: track lists, metadata; must hold ≥4.5:1 contrast against the warm dim background — mood must never cost legibility.
- **Label**: catalog metadata (year, format, track number) — zine/print-catalog register.

## 4. Elevation

Responsive motion implies light interaction feedback rather than deep layering: flat by default, with a lifted/tilted treatment only on direct interaction (picking up a CD/vinyl), not ambient drop shadows everywhere.

### Named Rules
**The Reach-For-It Rule.** Elevation change signals a physical pick-up (hover/focus on an album), not decorative depth on static surfaces.

## 5. Components

[No components exist yet — to be documented from real code via `/impeccable document` once the shelf/CD/vinyl components are built.]

## 6. Do's and Don'ts

### Do:
- **Do** let the warm oxblood/amber tone carry the surface directly — the room's lighting is the palette, not an accent on a neutral background.
- **Do** make every CD/vinyl a real clickable object with its own hover/focus feedback (responsive motion — transitions and state feedback, no orchestrated choreography).
- **Do** pair a serif display against a sans body for a printed-sleeve contrast.
- **Do** keep body text at ≥4.5:1 contrast against the dim background even as the mood stays low-light.

### Don't:
- **Don't** look like Spotify or Apple Music — no glossy rounded-card grids of album art on a slick dark theme, no algorithmic-feed dashboard polish.
- **Don't** look like retail/e-commerce (Shopify-style) — no "add to cart" storefront polish, no commercial sheen.
- **Don't** default to a generic SaaS admin card-grid catalog view, regardless of mood.
- **Don't** use cream/sand AI-default gradients, tiny uppercase eyebrows, numbered section markers, or gradient text.
