## Why

A direct visual inspection of the running studio (2026-06-11, dark, 1600×950)
confirmed the user's verdict that the chrome is **squished**, and located the
geometry roots in code rather than styling:

1. The recipe dock is `w-[280px]` — carried over verbatim from the pre-redesign
   `RecipePanel`. At 280px the rjsf helper prose wraps 3–4 lines per field and the
   form reads as a cramped wall of text.
2. An ~88px **dead band** sits between the 48px header bar and the docks:
   `AppHeader` forces `minHeight: 104` (`LAYOUT.HEADER_HEIGHT`) even though a
   ResizeObserver already reports the real header height to `StudioShell`, which
   derives `panelTop` from it. The static reserve is a stale belt-and-suspenders
   that permanently wastes vertical space the form is starving for.
3. The recipe panel caps itself at `max-h-[calc(100vh-180px)]` — a magic number
   that neither tracks the real header height nor the footer — and its scroll
   edge cuts helper text mid-sentence with no affordance that more content exists.

This is the geometry half of the Pass-2 reframe recorded in
`docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md`: the Pass-1
"preserve as-built dimensions" decision is amended — control *density* stays,
chrome *geometry* is redesigned.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (Pass-2 frame; issues 1–3)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-2 amendment: 340px left dock, content-driven header reserve, header→footer docks, fade affordance)
- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core = behavior parity)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` (§7 do-not-break registry)

## What Changes

- **`LAYOUT` constants become the single geometry authority**
  (`src/ui/constants/layout.ts`): `PANEL_WIDTH` 280 → **340**;
  `EXPLORE_PANEL_WIDTH` corrected 240 → **260** (it never matched the rendered
  `w-[260px]`); `HEADER_HEIGHT` re-documented as the *initial estimate* of the
  measured header (≈48 single-row), not a reserve. Panels consume the constants
  (inline `style` width) instead of hardcoded arbitrary-value classes.
- **`AppHeader` drops the static `minHeight` reserve.** The ResizeObserver →
  `onHeaderHeightChange` → `panelTop` pipeline (already in place) becomes the only
  authority; docks rise to sit one `SPACING` below the real header.
- **Docks span header→footer**: `LeftDock`/`RightDock` receive a `bottom`
  constraint (`FOOTER_HEIGHT + 2×SPACING`) so panels get the full working column;
  `RecipePanel` replaces `max-h-[calc(100vh-180px)]` with `max-h-full`, and
  `ExplorePanel` gains `max-h-full` + internal scrolling so it can no longer
  underlap the footer on short viewports. Panels still shrink to fit short
  content (max-h, not h).
- **Scroll-edge fade affordance**: the recipe panel's scrollable body gets a
  sticky bottom gradient (token-driven, `from-card`) so a cut never reads as the
  end of content.

## Out Of Scope / Parity Guarantees

- No behavior change: run/poll/storage/transport semantics untouched; this slice
  is positioning, sizing, and scroll chrome only.
- No control-density change: button/input/switch/field-row dimensions stay as
  committed in `.interface-design/system.md`.
- The deck.gl canvas, camera, and fit behavior are untouched (C5 owns first-run
  visibility).
- Typography/hierarchy inside the form is C2 (`mapgen-studio-form-hierarchy`).

## Verification Gates

- `bun run openspec -- validate mapgen-studio-layout-geometry --strict`
- `bun run --cwd apps/mapgen-studio check` (tsc) + mapgen-studio vitest project green
- Visual proof on :5173 (dark + light): dock top aligns one SPACING below the real
  header; left dock measures 340px; no mid-sentence hard cut at the scroll edge;
  footer never overlapped.
