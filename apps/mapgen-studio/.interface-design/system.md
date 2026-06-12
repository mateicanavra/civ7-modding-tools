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

## Pass-4 amendment (2026-06-11, user-grounded): vertical zoning + console icon contract

Decisions (see `docs/projects/mapgen-studio-redesign/pass-4-design-fixes.md`):

- **Vertical zoning: top = game, bottom = studio.** The header zone carries the
  world definition (inputs shared by studio generation and live launches) with
  the **Game console docked directly beneath the world bar** (AppHeader
  `gameConsole` slot, centered row, after the transient setup panel). The
  footer is the **Studio console alone**, simply centered. The Pass-3 console
  *split* (named, modular GameConsole; relation chips ride it) is unchanged —
  only the dock moved. Side panels reflow via the measured-header mechanism.
- **Icon-only contract for consoles:** secondary repeated-use actions in dense
  consoles are icon-only and MUST carry `aria-label` + `title` + Tooltip.
  Primary CTAs (Run, Save & Deploy) and disclosures (Setup) keep labels.
  Console glyphs: autoplay start `FastForward` / stop `Square`; Run in Game
  `SquareArrowOutUpRight` (launches the external app); Explore `Binoculars`
  (tile visibility). `Eye` stays reserved for layer-visibility toggles.
  *(Glyph assignments superseded by the Z-wave registry v3 below; the
  icon-only contract itself is unchanged.)*
- **Config objects collapse:** every config object renders a per-object header
  row (chevron + title + trailing action zone — future home of object-local
  Reset/Show-JSON); collapsed by default, manual expand; optional sticky
  auto-expand-on-scroll toggle in the config toolbar, default OFF; identical in
  focused and unfocused modes.

## Pass-5 amendment (2026-06-11, user-grounded): zoning v2 — Game bar / World console

Decisions (see `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md`);
supersedes the Pass-4 dock placement, keeps the console split + icon contract:

- **Top bar = THE Game toolbar.** One bar (identity `Gamepad2` + "Game")
  unifies the saved-config selector, the GameConsole command cluster (inline,
  no panel chrome or "Civ7" label of its own), and a trailing **icon-only**
  game-setup disclosure (`SlidersHorizontal` + chevron — the dropdown row is
  the label) expanding pure game setup: Leader · Civ · Difficulty · Speed.
  **No map/world settings in the top bar, ever.**
- **Bottom bar = THE World/Map console** (identity `Globe` + "World"): studio
  status · History · Size · Players · Seed · reroll · auto-run · Run. Map
  settings author here; the relocated selects ride the shared operation gate.
- **Zone boundary rule (X7, settles "where does this control go"):** a
  control belongs to the World console **iff the map pipeline reads it to
  generate the map**; a setting only the Civ7 session reads belongs to Game
  setup. Players qualifies (`playerCount` → `PlayersLandmass1/2` → landmass
  balancing/placement); leader/civ/difficulty/speed don't. A setting NEITHER
  reads (resources today) gets no authoring control at all — its state may
  still flow through runs (`WorldSettings.resources` does, deliberately
  reserved for the resources vertical), and the rule re-admits the select
  the day a pipeline reader exists.
- **History affordance:** the last-run cluster compresses into one icon button
  (`History`); hover tooltip presents the run (seed/size/players), the
  accessible name mirrors it, click copies the last seed (the affordance
  the old inline seed button carried). Tooltip, never a popup. It speaks the
  console's own vocabulary: only parameters the console authors appear.
- **Tile grid (X6, user-grounded):** tile layers render the GAME's plot
  geometry — regular pointy-top hexes on the odd-R row-offset lattice (the
  hex-convention audit proved `tile.hexOddQ` mislabels that grid; the model's
  column-offset projection is not a regular tiling, hence the "squished"
  look it produced). Border ink: see the Y-wave amendment below — the X6
  constant-graphite ink (`#0d0d11`, α200) is superseded by the fill-derived
  border rule (a page-colored seam dissolved the lattice into dots at fit
  zoom). Unfilled tiles draw nothing (unchanged).

## DAG-tab amendment (2026-06-12, handoff-mandated): stage views

Decisions (see `openspec/changes/mapgen-studio-dag-tab/design.md`):

- **Stage-view furniture rule:** what the center stage presents (Map vs
  Pipeline) is the STAGE's own concern — not Game bar (not a game setting),
  not World console (not a map parameter), not a dock (not authoring or
  map inspection). View switchers float at the stage's top edge, centered,
  in the popover-tier pill chrome, using the segmented-control idiom
  (active segment lifts one surface tier).
- **Pipeline stage (recipe DAG):** chrome is token-driven (no `lightMode`
  forks); the ONLY surviving light/dark fork is the preserved
  `domainPresentation` data palette (domain accents ARE data color). The
  neutral connector ink is `PIPELINE_EDGE_INK` (muted-foreground luminance
  token). The map canvas stays mounted-but-invisible under the pipeline so
  deck camera state and in-flight runs survive view flips; the Explore
  dock (map-scoped) leaves the stage in pipeline view; Recipe dock, Game
  bar, World console stay.
- **Pipeline data:** TanStack Query (`["recipeDag", recipeId]`, enabled on
  view activation, staleTime ∞) — fetch on first activation, cached per
  recipe; pipeline selection/expansion live in `viewStore` as
  pipeline-prefixed fields, distinct from map-explore selection.

## Y-wave amendment (2026-06-12, user-grounded): tile border rule, flat config accordion, selector drift

- **The one tile-border RULE (supersedes X6's constant ink):** a tile's
  border is its OWN fill pulled toward black (`fill × 0.55`, fully opaque) —
  self-grout, owned by `tileBorderColorForFill` in `presentation.ts`. The X6
  page-substrate constant was invisible between dark fills at fit zoom
  (Huge-map tiles are a few pixels wide), dissolving the tessellation into
  dots; a fill-derived seam is darker than its fill BY CONSTRUCTION, so the
  lattice reads at every zoom, both themes, every palette — and still
  recedes like etched grout up close. Unfilled tiles still draw nothing.
- **Default layer preference: the map studio defaults to the MAP.** When
  layer selection resets (step/stage switch, fresh manifest), prefer the
  step's tile-space GRID layer over whichever layer the worker emitted
  first (points/mesh). Owned by `useVizState`'s selection fallback.
- **The graticule is CANVAS substrate, not layer furniture.** Once a
  manifest exists, the background grid follows the user's grid toggle on
  EVERY stage — kind-independent, including steps with no visible layers
  (the canvas stays a ready survey field, never dead space); a layer may
  opt out via `meta.showGrid: false`. The old points/segments-only gate
  made the grid vanish on most stage switches. Pre-manifest, the
  awaiting-matter overlay carries its own graticule.
- **Flat config accordion (supersedes the Pass-3 stage CARD):** top-level
  config objects lay flat on the panel — full-bleed disclosure rows,
  hairline dividers (`divide-border-subtle`), zero inter-item margin, no
  card chrome. Expanding opens a RECESSED slab (`bg-surface-sunken/60`,
  hairline top) — the interaction reads as a door opening INTO the
  graphite, never a card lifting off it. Group wells keep their one
  machined-slot tier inside the slab; the Pass-3 4/8px field rhythm is
  unchanged; the 12px inter-card step is retired.
- **Selector drift affordance (categorical):** any selector that names a
  source of truth (saved game config; world/map config) must SHOW when the
  current state has drifted from that source — warning(orange) ring on the
  control + a warning "Modified" pill whose click re-applies the source
  (sync back). Drift for a saved game config = "re-applying the file would
  change the state" (`studioSetupDriftsFromSavedConfig`): the file governs
  the options it specifies + its player options; ungoverned keys never count
  as drift. The game-setup dropdowns may never silently supersede a selected
  saved config.

## Z-wave amendment (2026-06-12, user-grounded): Game bar v3 — one status, one popup, launch CTA

Rearranges the Game bar (supersedes the Pass-4/5 console glyph registry and
the trailing-disclosure placement; keeps the icon-only contract + zoning):

- **Bar order:** `Gamepad2` Game · │ · Config select + Modified pill +
  **gear** (`Settings`, icon-only Button) · │ · signal chip · autoplay ·
  explore · **Play** CTA. The game-setup disclosure rides the CONFIG cluster
  (the setup it opens is exactly what drifts a saved config); open state =
  `ring-1 ring-ring border-primary text-primary` (the footer auto-run idiom).
- **ONE status, held by the signal chip.** The chip's dot folds live runtime
  + Run in Game + save/deploy into one color (any failure → destructive;
  in-flight or stale → warning; live ok → success); while an operation runs
  the chip text narrates its phase, then settles back to `Turn N · Seed S`.
  No secondary status pills ride the bar — the run-relation pill
  (Current/Stale/Previous), request ids, errors, and recovery hints live in
  the **status hang-off**: a popup panel docked under the chip (`popover`
  tier, chevron-disclosed, outside-click + Escape dismissal — popup
  semantics keep it from ever stacking against the setup row). Secondary
  per-operation affordances live inside it: Apply-live-to-Studio, refresh
  status (`RotateCw`), copy diagnostics (**`Bug`** — it's the debug action).
- **Console glyph registry (v3):** autoplay idle = composed glyph (one
  `Play` triangle inside the clockwise `RotateCw` loop — "keep playing
  forward"); stop `Square` unchanged. Explore = **`ScanEye`** (reveal/vision
  without the toy binoculars; bare `Eye` stays reserved for layer-visibility
  toggles). Run in Game = labeled **`Play`** CTA, filled primary, SAME
  Button size as the World console's Run (the two bars mirror: World "Run"
  authors the map, Game "Play" launches it) with a **`Rocket`** glyph —
  launch-the-external-app semantics, replacing `SquareArrowOutUpRight`.
  `SlidersHorizontal` retired from the header (gear owns setup).

## P7 amendment (2026-06-12, user-grounded): config explorer v2 — flat nested accordion + responsive chip + Water proof + Custom precedence

- **Config explorer v2 (supersedes the Pass-3 "group well" tier).** Nested
  config objects are a FLAT collapsible object explorer: every object/array
  at depth ≥2 is a flush, full-bleed disclosure row — no well cards, no
  rounded borders, no side margins, no inter-section gaps. Hairlines come
  from the parent container's `divide-y divide-border-subtle`; depth reads
  through a compounding `pl-3` indent on each expanded body plus the heading
  tier (group eyebrow at depth 2, the dimmer sub-group eyebrow below). Runs
  of consecutive scalar fields are the only padded blocks (`px-2.5` + the
  sibling gap); array items are hairline rows, never bordered boxes. The
  stage slab (`surface-sunken`) remains the single recess tier — surface
  count goes DOWN with this amendment, not up.
- **Responsive status chip.** The Game bar's center column is an
  `@container`; the signal chip's seed suffix rides a `@max-3xl:hidden` span
  so the chip collapses to `Turn N` before the bar wraps. Full
  `Turn N · Seed S` stays in the tooltip/accessible name.
- **Water proof section (ExplorePanel).** The river/lake/floodplain
  inspector renders as a collapsible section between Step and Layers: lane
  eyebrow per truth class, claim status as status-dot + word (`ready` /
  `inspect` / `fail` / `open` / `skip`; projection evidence is steel
  "inspect", NEVER success-green — projection masks don't masquerade as
  engine truth), module-owned data-color dots on the layer-jump chips.
- **Saved-config precedence shows "Custom".** Selection applies the saved
  config file EXACTLY (full replace); ANY divergence flips the selector
  value itself to a warning-tinted `Custom` entry with a `Re-apply`
  affordance beside it. The Modified pill wording is retired.
