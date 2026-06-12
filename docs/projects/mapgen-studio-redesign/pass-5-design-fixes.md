# Pass 5 — design fixes (toolbar architecture v2, tile rendering, canvas affordances)

Fifth user-feedback wave on the redesign stack. Base: `design/config-collapse`
(Pass-4 tip). Same discipline: one OpenSpec slice + one Graphite branch per
change, visual verification on :5173, categorical sweeps, behavior parity is
hard core.

User-supplied direction (decided, not open): the top/bottom split moves from
Pass-4's "game console docked under the world bar" to a full **Game vs
World/Map** zoning — the top bar IS the game toolbar, the bottom bar IS the
map console. Pass-4's E1 colocation is superseded (the frame predicted this:
"the slot makes relocation cheap").

## X1 — Toolbar architecture v2: top = Game, bottom = World/Map

### Layout (user-specified)

- **Top bar = the Game toolbar.** Identity renames World → Game. One bar
  carries: saved-config selector · live Civ7 status chip (with the
  sync-suggestion bridge) · autoplay · Explore · save-deploy + run-status
  chips · retry/diagnostics · Run in Game · and, at the very END of the bar,
  an **unlabeled disclosure** (no "Setup" text) that drops down the
  game-setup row. There is no separate game console anywhere else.
- **Bottom bar = the World/Map console.** Map size and Players move DOWN,
  placed LEFT of Seed. Bar contents: studio status · History · Size ·
  Players · Resources · Seed · reroll · auto-run · Run. No map settings
  remain in the top bar.
- **Last-run stats collapse into a History affordance:** one icon button
  whose hover shows a well-designed tooltip with the last run (seed · size ·
  players · resources). User preference: tooltip, not a popup toolbar.

### Decisions (mine, within the user's frame)

- **Resources moves to the bottom bar.** It lives in `WorldSettings`, feeds
  map generation, and appears in the last-run map stats — it is a map
  setting, and the rule is "no map settings in the top bar at all". The
  setup dropdown therefore carries pure Civ7 game setup only: Leader · Civ ·
  Difficulty · Speed. *Falsifier: if the user treats resource mode as game
  setup, move one select back — the dropdown row still exists.*
  **Superseded by X7 (same session):** the falsifier fired in a third
  direction — resources is neither game setup nor a live map parameter
  (no pipeline reader exists), so the select leaves the UI entirely while
  ALL `WorldSettings.resources` plumbing stays (see X7).
- **GameConsole stops being a panel and becomes the bar's command cluster.**
  It keeps its component boundary (props, tests, behavior parity intact) but
  renders an inline flex row with no border/background of its own; AppHeader
  composes it INTO the Game bar row between the live area and the setup
  disclosure. The "Civ7" identity label drops — the bar's "Game" identity
  covers it, and the live chip text already says Civ7.
- **The setup disclosure is icon-only** (`SlidersHorizontal` + chevron,
  `aria-expanded`, `aria-label="Game setup"`) per the Pass-4 icon contract:
  it is a repeated-use secondary control; the dropdown panel itself is the
  label. It sits last in the bar (user-specified).
- **History button doubles as copy-seed.** The old seed button copied on
  click; History keeps that (click = copy last seed) so no affordance is
  lost. Tooltip carries the full last-run line + "click to copy seed", and
  the same content rides `aria-label`/`title` (a11y + static-markup parity,
  same pattern as the console diagnostics).
- **Run-with-what's-on-screen is already true** (`Run in Game` reads current
  authored state) — X1 must not change operation semantics, gating, or
  storage. Behavior parity hard core.

### Mechanism notes

- `WorldSettings` flow: `mapSize`/`playerCount`/`resources` currently update
  via AppHeader's `onGlobalSettingsChange`; AppFooter gains
  `globalSettings`/`onGlobalSettingsChange` and AppHeader loses them (it
  keeps `setupConfig` + saved-config). StudioShell wiring moves accordingly.
- Width check: footer ≈ status(80) + History(32) + Size(120) + Players(80)
  + Resources(110) + Seed(130) + 3 icon buttons + Run ≈ 800px — fits the
  1280 viewport with margin; the header sheds ~320px of selects and gains
  ~580px of console, net narrower than Pass-4's two stacked rows.
- *Falsifiers: header wraps at 1280 (then the bar's flex-wrap order must
  keep the disclosure last); History tooltip unreadable as data (then
  structure the tooltip content in rows, not a sentence).*

## X2 — Grid icon missing (root cause found) + categorical icon sweep

`ViewControls.tsx:109` renders a literal empty `<div className="w-4 h-4" />`
where the grid toggle's icon belongs — restore a lucide glyph (`Grid3x3`),
matching the established `w-4 h-4` size in that cluster. Categorical: the
icon system IS lucide-react (sole system, 0.522); a src sweep found no other
empty icon placeholders — re-verify live, and assert the button has visible
glyph content in a test if cheap.

## X3 — Tile orientation (odd-Q flat-top) + tile-mesh standard

Root cause candidate (pre-grounded): `render.ts` builds hex polygons with
`hexPolygonPointy` (vertices at 30°+60°·i) for BOTH `tile.hexOddR` and
`tile.hexOddQ`. Row-offset (odd-R) layouts are pointy-top; column-offset
(odd-Q) layouts are flat-top (vertices at 0°+60°·i) — every odd-Q
visualization renders tiles rotated 30° (user's "~45° counterclockwise"
observation). Fix: flat-top polygon + verify `oddQTileCenter` spacing and
the `boundsForTileGrid` odd-Q branch (spacing math looks transposed from
pointy-top). The geometry cache key (`spaceId:WxH:s{size}`) already
separates spaces, so no stale-cache hazard — but confirm.

**Implementation addendum (deeper grounding):** the textbook flat-top layout
(columns 1.5·s, rows √3·s) was rejected mid-slice. mapgen-core's canonical
hex space (`projectOddqToHexSpace`: HEX_WIDTH √3, HEX_HEIGHT 1.5, odd
columns +0.75) is the frame the Delaunay mesh — and therefore every
`world.xy` layer — is built in; tiles co-register with those stages only on
the same lattice. Odd-Q therefore renders flat-top hexes whose vertical
pitch is compressed to the 1.5·s row spacing (the exact tiling hexagon of
that lattice). Note for a future engine conversation: Civ7's native
adjacency (E/W/NE/NW/SE/SW, no N/S) is pointy-top row-offset, while
mapgen-core models odd-q column-offset — a model↔game convention gap that
is upstream of the studio and out of scope here.

**Superseded by X6 (same session):** the user flagged the compressed look
("grid looks squished vertically"), and the convention audit
(`research/03-hex-convention-audit.md`) proved Civ7's grid is pointy-top
odd-R — the model's odd-Q is a mislabel, and its "canonical lattice" is not
a regular hex tiling (which is WHY the tiling hexagon had to be squashed).
The renderer now draws the GAME's geometry for both tile spaces: regular
pointy-top hexes, odd rows shifted east. Same world frame, so world.xy
co-registration is unchanged. Border ink also retuned on user feedback:
graphite (#0d0d11), one ink in both themes (the slate clashed with the
palette). Engine-side odd-Q→odd-R migration spawned as its own task.

Second half — **the tile-mesh contract**, standardized across all
visualizations and both themes:

- Tile borders legible against any canvas background (white/black/graphite).
- Unfilled tiles render NOTHING (no phantom mesh) — only filled tiles show.
- The optional background grid is one consistent treatment everywhere.

*Falsifier: a visualization that intentionally shows an empty mesh (e.g. the
background grid toggle) — that is the one sanctioned mesh, and it must obey
the border-legibility rule rather than being removed.*

## X4 — White flash on browser refresh (investigate, then fix)

The `index.html` guard is verified correct for dark (unlayered body
`#0d0d11` + theme script before CSS) — the flash survives it, so the cause
is elsewhere. Method (user-specified): observe what renders when during
reload — earliest-inline-script sampler logging
`getComputedStyle(html/body).backgroundColor` + canvas presence over the
first ~1s into sessionStorage, plus rapid screenshots. Suspects, in order:
WebGL canvas init clear (white default before first deck draw), unstyled
`html` element showing through, Vite injecting `index.css` via JS after
first paint. User observation to honor: the DeckGL background seems to
persist while the rest flashes. Deliverable: identified culprit, then the
minimal fix.

## X5 — Pre-run cursor (decision: suppress the affordance)

Pre-run, the deck controller is live (`DeckCanvas.tsx` always passes a
controller) but the only visible texture is the DOM CSS graticule in
`CanvasStage` — panning works yet moves nothing visible, and the `grab`
cursor promises a drag that reads as broken. Decision (user delegated, both
options offered): **Option 2** — until a manifest exists, disable the
controller and show the default cursor; post-run unchanged. Option 1 (make
pre-run drag real) would require moving the background texture into deck
layers — unjustified now; X3's mesh standardization is the natural future
hook if we ever want it.

## X7 — World console is map-parameter-only (Resources UI out, plumbing stays)

User-flagged after X6. Original ask was an end-to-end resources removal;
**revised mid-flight: do NOT delete the backend plumbing** — the placement
stack carries the resources vertical (S3 demand planners, S5 resource-start
support, A2 live resource-policy evidence) and the codex-stack design doc
explicitly reserves the wire: "Studio `resourcesMode` is carried as
`MapInfo.StudioResourcesMode` in browser runs only (currently informational;
not consumed by the pipeline)." Verified: no reader of `StudioResourcesMode`
exists on any branch.

- **Scope:** AppFooter only — Resources label + select removed; the History
  tooltip/accessible name drop their resources line (the console speaks its
  own vocabulary; the value stays recorded in run snapshots). Footer:
  World · status · History · Size · Players · Seed · reroll · auto-run · Run.
- **Zone boundary rule (codified in system.md):** World console iff the map
  pipeline reads it (`playerCount` → `PlayersLandmass1/2` → landmass
  balancing qualifies Players); Civ7-session-only settings → Game setup;
  no reader anywhere → no control (resources, until the vertical consumes
  the reserved wire).
- **Players stays in the World bar** (user-delegated call) — the rule above
  is the line the user asked me to draw.

## Sequencing

X1 (centerpiece, while the console context is hot) → X2 (small) → X3 →
X5 (small) → X4 (investigation last; its fix may become its own slice).
Branches stack on `design/config-collapse`:
`design/pass5-frame` → `design/toolbar-architecture-v2` →
`design/grid-icon` → `design/tile-orientation` → `design/prerun-cursor` →
`design/flash-fix`.
