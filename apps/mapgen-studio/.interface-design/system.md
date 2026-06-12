# MapGen Studio — Design System (decisions)

> **This file holds DECISIONS, not extraction.** The as-built baseline lives in
> [`../system.md`](../system.md). When they disagree, this file wins — it is the
> target the redesign realizes. Confirmed with the user 2026-06-08. Downstream
> slices and agents APPLY this; they do not re-litigate it.
>
> Realized + value-tuned in the P1 implementation slice (Tailwind v4 + shadcn).
> Starting token values below are the committed intent; exact final values are
> validated against the running app during P1.

## Direction

**Cartographer's instrument.** A dense, dark-first precision tool for *sculpting a
world by adjusting generation parameters and reading the map*. The deck.gl map is
the hero and carries all terrain color; the chrome is a recessed graphite
instrument bezel that never competes with it. **The instrument makes way for the
matter:** it lives in its own robust substrate layers but never steals the show.
Keep the existing DNA — dense, border-tiered, micro-typography, a single restrained
cool accent — but make every choice intentional.

**Accent decision (user-confirmed, refined 2026-06-08):** the accent is an
**elevated cool-steel slate**, not a vivid hue. Teal/cyan was considered and set
aside *because the map is the matter* — a saturated accent would pull the eye to
the chrome. The commodity tell today is not "slate" itself; it is that slate is
*unintentional* (declared indigo, used gray, no system). The fix is to make slate
**deliberate and robust**: a committed cool-steel hue with a defined ramp, a
rigorous substrate-elevation system, and a contour signature carried by
**luminance** rather than color. Craft, not chroma.

- **Who:** a Civ7 map-mod author in long, dark, tweak-and-observe sessions.
- **Verb:** tune a recipe → watch the world respond → run it in-game.
- **Feel:** quiet, technical, precise. Like a DAW / topographic survey console.
- **Light mode:** dark-first, but ship a genuinely correct light theme via
  shadcn's single `.dark` class strategy (one switch, no prop drilling).

## Signature

The **contour line**, carried by **luminance, not a loud hue**. The map domain's
defining mark (topographic contour / graticule) becomes the interface's signature:

- **Focus** renders as a 1px *contour ring* in a brighter cool-steel slate — a
  luminance step above the chrome, not a saturated glow block.
- **Active/selected** states use a thin steel rule/underline (a contour), not a
  filled slab — fills are reserved for the one primary action, itself a restrained
  elevated slate.
- **Hypsometric mini-legends:** elevation/rainfall/biome readouts use real
  cartographic ramps (relief greens→tans→snow; bathymetric blues) so data viz
  belongs to the product's world. This is the one place real color appears in the
  chrome — and it appears as *the matter*, the same domain color the map carries,
  not as instrument identity.

## Primary craft lever (from the live app, 2026-06-08)

A screenshot of the running app revealed the real departure is **not color** — it
is **flatness**. Page, panel, and nested surfaces sit ~4% lightness apart with no
floating-layer shadows, so borders carry all structure and the UI reads as one
hollow dark plane (the squint test shows almost no hierarchy). The empty map
center reads as *dead space*, not *a stage awaiting matter*.

So P1's highest-value work, in order:
1. **Robust substrate elevation** — widen the (still whisper-quiet) page→panel→
   nested lightness tiers + a real border progression so structure is *felt*. This
   is what makes a neutral slate instrument feel machined instead of flat.
2. Elevate the slate as quiet identity (committed steel hue, contour-luminance focus).
3. Make "awaiting matter" intentional — the empty stage frames the map
   (graticule/contour), reads as ready, not hollow.
4. Under the hood: named tokens, real overlay motion, `.dark`-class theming repair.

## Foundation & depth

- **Foundation:** cool graphite/ink, near-monochrome. Same hue across surfaces;
  hierarchy by lightness step only (never different hues per surface).
- **Depth:** **borders-only**, tiered by background lightness step + 1px hairline.
  This substrate-elevation system is where the craft lives — the layering must be
  *felt, not seen* (whisper-quiet lightness steps; the squint test must still show
  hierarchy with nothing jumping out). A robust tier system is what makes a neutral
  slate read as intentional rather than flat. Shadows appear ONLY on floating
  layers (dialog/popover/toast). `backdrop-blur` on chrome that floats over the
  map. Do not mix depth strategies.
- **Accent:** ONE elevated cool-steel slate, used with restraint (primary action +
  active/focus contours). It replaces the commodity declared-indigo-but-used-gray
  non-choice by being *committed and systematic*, not by being louder.

## Tokens (HSL, shadcn `:root` / `.dark`)

Dark is the default app theme. Values are the committed starting point.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--background` | `240 20% 5%` | `240 20% 96%` | page / deck.gl backdrop tint |
| `--foreground` | `240 14% 92%` | `215 28% 17%` | primary text |
| `--card` | `240 9% 9%` | `0 0% 100%` | panels, headers |
| `--card-foreground` | `240 14% 92%` | `215 28% 17%` | |
| `--popover` | `240 8% 11%` | `0 0% 100%` | one tier above card (dropdowns) |
| `--popover-foreground` | `240 14% 92%` | `215 28% 17%` | |
| `--muted` | `240 8% 13%` | `240 14% 93%` | hover/active surface, tags |
| `--muted-foreground` | `240 6% 56%` | `220 9% 46%` | secondary/label text |
| `--primary` | `216 18% 42%` | `216 22% 32%` | elevated cool-steel slate accent |
| `--primary-foreground` | `210 20% 96%` | `0 0% 100%` | text on primary |
| `--border` | `240 9% 18%` | `220 13% 91%` | workhorse hairline |
| `--input` | `240 9% 25%` | `220 13% 86%` | control border |
| `--ring` | `212 28% 60%` | `216 25% 45%` | focus contour (luminance step, not chroma) |
| `--destructive` | `350 70% 58%` | `350 72% 48%` | rose (commit; kill rose/red drift) |
| `--destructive-foreground` | `0 0% 98%` | `0 0% 100%` | |
| `--radius` | `0.25rem` | — | base; card = `0.5rem` |

Secondary text tiers: a tertiary/muted level (`240 7% 38%` dark) for placeholders/
help. Semantic (used sparingly, slightly desaturated in dark): success
`160 55% 45%`, warning `40 80% 55%`, info = the steel-slate accent (no separate
info hue — keep the chrome monochrome-cool).

## Type

- **Sans:** Inter. **Mono:** JetBrains Mono (tabular numerals for data). Self-host
  (remove render-blocking Google Fonts `@import`).
- **Named scale (replace ad-hoc `text-[11px]`):** `text-data` 11px / `text-label`
  10px uppercase `tracking-wider` / `text-xs` 12px / `text-sm` 14px (dialog
  titles). Weights: medium (500) default emphasis, semibold (600) headers. No bold
  in chrome. 11px is the body default; 10px the eyebrow label.

## Spacing / radius / motion

- **Spacing base 4px.** Scale: 4, 6, 8, 10, 12, 16. Field rows `py-1`, label↔input
  `gap-3`. Cards `p-2.5`. Nested `p-2`.
- **Radius:** 4px inputs/buttons/tags, 8px cards/dialogs/dropdowns, full for pills/
  switch. (Drop the 6px/`xl`/`2xl` noise.)
- **Motion:** real, quiet, deceleration easing — install the Tailwind v4 animate
  layer so the (currently dead) `animate-in` overlay transitions actually run.
  150ms fast / 200ms normal. No spring/bounce. `animate-pulse-subtle` stays for
  running state.

## Theming mechanism (the repair)

- Single **`.dark` class** on `<html>` (shadcn strategy). Set Tailwind
  `darkMode: 'class'` (v4 equivalent). One theme switch writes the class.
- **Delete** `createTheme()` runtime string interpolation (JIT-invisible — a real
  bug), the `lightMode` boolean prop threaded through ~24 files, the duplicate
  `colors.light|dark` config, and the dead `--spacing-*`/`--radius-*` vars. The
  `lightMode`-prop removal lands as components migrate (P3/P4); P1 establishes the
  `.dark` system and tokens so both can briefly coexist without conflict.

## Component patterns (preserve control density, re-skin onto shadcn)

Keep the dense control dimensions from the extraction baseline — Button `h-8`/`h-7`,
Input `h-7`, Switch 36×20, Field row `justify-between gap-3 py-1` with `min-w-[96px]`
label, Card `rounded-lg border p-2.5`, eyebrow label uppercase 10px. The migration
changes the *mechanism* (Radix shadcn primitives, token-driven) and adds the
contour-focus signature + motion — not the density.

## Pass-2 amendment (2026-06-11, user-grounded): chrome geometry is NOT preserved

Pass 1 read "preserve as-built dimensions" as covering chrome *geometry* too, and
shipped the pre-redesign skeleton (280px left dock, stale 104px header reserve,
flat label/help typography). The user judged the result **squished**. Amended
decisions (see `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md`):

- **Left dock 340px** (was 280). The recipe form is the instrument's main working
  surface; at 280 its helper prose wraps into noise. Explore dock stays 260 —
  lists fit it.
- **Header reserve is content-driven.** The measured header height (ResizeObserver)
  is the only authority; no static `minHeight` band. Docks rise to the header.
- **Docks span header→footer** with internal scroll; the scroll edge carries a
  fade affordance, never a mid-sentence hard cut.
- **Form text hierarchy:** field labels sit a full tier above descriptions —
  labels `text-foreground` medium, descriptions stay muted `text-data`. Two-tier
  gray-on-gray is a defect, not density.
- **One Run CTA.** The footer is the run console (seed, auto-run, run, run-in-game);
  panel-local duplicates are removed.
- Control density (button/input/switch/field-row dimensions above) is unchanged.

## Pass-3 amendment (2026-06-11, user-grounded): spacing substrate + form elevation + console split

Pass-3 grounding found the spacing scale above had **never rendered**: an
unlayered `* { margin:0; padding:0 }` reset in `index.html` outranks Tailwind
v4's `@layer utilities`, zeroing every padding/margin utility app-wide. Decisions
(see `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md`):

- **No unlayered author CSS.** `index.html` may carry only the pre-paint flash
  guard (`body` colors); resets belong to Tailwind preflight (layered). Any
  future global CSS outside `index.css` must live in a cascade layer.
- **Form surface elevation (config panel):** nesting is expressed by *surfaces,
  not indent rules*. Panel (popover) → stage card (card, one recess) → **group
  well** (one further recess: `bg-background/40`-class tint, `border-border-subtle`,
  rounded, padded). Two surface tiers maximum; deeper nesting differentiates by
  eyebrow heading + rhythm only. Arrays ride the same well treatment. `border-l`
  indent ladders are removed.
- **Form rhythm (4px base):** 4px within a field block (label/input/help),
  8px between fields, 12px between groups and between stage cards. Owned by the
  FORM constant in `rjsfTemplates.tsx`.
- **Footer = two consoles.** A centered **Studio console** (status, last run,
  seed, reroll, auto-run, Run) and a right-docked, named **Game console**
  (live Civ7 status/sync, autoplay, Run in Game + status, save-deploy chip).
  Studio↔game relation chips (Current/Stale/Previous, stale sync ring) live on
  the Game console; studio dirty state stays on the Studio console.
- **Explore toolbar groups by target:** VIEW (camera fit, edges overlay) and
  DATA (render, space, era, variant, overlay) clusters with eyebrow labels;
  the debug toggle is a DATA-list filter and lives on the DATA section header.
