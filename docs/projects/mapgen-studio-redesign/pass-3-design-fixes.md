# Pass 3 — Spacing substrate, config surface, console split, explore toolbar

> Frame for the third user-grounded fix wave (2026-06-11, evening). Same
> discipline as Pass 2 (`pass-2-design-fixes.md`): OpenSpec slice per change,
> Graphite stack (never submitted), a change is done only when SEEN in the
> running app.

## The reframe (perspective pass)

The user asked for "a full, thoughtful design pass from the ground up" on the
config UI's padding and margins. Grounding in the live page found something
prior passes missed: **the spacing system has never rendered.**

`index.html` ships an inline, *unlayered* reset — `* { margin: 0; padding: 0 }`.
Tailwind v4 emits every utility inside `@layer utilities`, and unlayered author
styles take cascade priority over ALL layered styles regardless of specificity.
Result: every `p-*`/`px-*`/`py-*`/`m-*` utility in the app computes to **0px**.
Gaps, heights, and widths survive (the reset doesn't set them), which is why the
layout half-works while every surface's internal texture is crushed. The old
Tailwind v3 build emitted unlayered utilities (specificity won, the reset was
harmless); the P1 migration to v4's native cascade layers silently inverted the
cascade. Proven live: deleting the rule in the running page restores 12px row
padding, 10px card padding, padded buttons/inputs/headers app-wide.

So the highest-leverage move is not redesigning spacing values — it is
**restoring the substrate (D0), then designing on truth (D1–D3)**. Every visual
decision made in Passes 1–2 was tuned against a zero-padding render; expect a
small re-tune wave after D0, owned by the slices that own those surfaces.

Second bootstrap defect found in the same file: the pre-paint theme script
reads `localStorage["mapgen-studio:theme"]`, but the app persists the
preference under `theme-preference`. The bootstrap reads a key nobody writes —
a light-theme user gets a dark pre-paint flash on every load. Same slice (D0).

## Hard core (unchanged + new)

- Behavior parity: run/poll/localStorage/transport semantics untouched.
- Control density tokens (h-7/h-8 controls, 11px data text) unchanged.
- Single `.dark` class theming; tokens only, no raw hex in chrome.
- OpenSpec `--strict` per slice; Graphite-only branch ops; stack never submitted.
- **NEW (user law, 2026-06-11): no hard-coded config overrides anywhere** — not
  in app code, not in tests. A literal pipeline-config value duplicating the
  recipe's source of truth is a defect to remove on sight (D4). Migration/
  round-trip fixtures that test *user data shapes* (legacy formats, preset
  payloads) are not overrides of defaults and remain legitimate, but must not
  mirror real default values as expectations.

## Issues → changes

| # | Observation (grounded) | Root cause | Change |
|---|---|---|---|
| 1 | All padding/margins "really bad" app-wide | Unlayered `*` reset beats `@layer utilities` | **D0** remove reset from index.html (Tailwind preflight already provides a layered one) |
| 2 | Light users get dark pre-paint flash | Bootstrap reads stale localStorage key | **D0** align bootstrap to `theme-preference` |
| 3 | Config nesting reads as code-indent ladder, not "slate" | depth≥2 groups are heading + `border-l` indent; no surface tiers | **D1** surface-elevation scheme: stage card → recessed group wells; cap at two surface tiers, deeper nesting by type/spacing only |
| 4 | No chunking rhythm in form (fields ≈ groups ≈ sections) | gap-0.5/1/1.5/2 ad hoc, within-group == between-group | **D1** codified form rhythm on the 4px base: 4 within-field / 8 field↔field / 12 group↔group; amend `.interface-design/system.md` |
| 5 | Two studio bars + game controls interleaved in footer | AppFooter grew accretively; no ownership boundary | **D2** split: one centered **Studio console** (status · last run · seed · reroll · auto-run · Run), one right-docked named **Game console** (live status/sync, autoplay, Run in Game + status/retry/diagnostics, save-deploy chip) |
| 6 | Studio↔game state legibility must survive the split | Relation cues exist (stale ring, Current/Stale/Previous chip) but are scattered | **D2** bridge: relation chips live on the Game console, computed against current studio state; studio dirty state stays on the Studio console (Modified + Run ring) |
| 7 | Explore bottom buttons uncategorized, zig-zag layout | View toolbar mixes camera, map-overlay, data, and list-filter controls | **D3** regroup by target: VIEW (fit, edges overlay) / DATA (render, space, era, variant, overlay); consistent label-left/control-right rows |
| 8 | Debug toggle misplaced | `showDebugLayers` filters the DATA *list*, it is not a view control | **D3** move it to the DATA section header (list filter lives with the list) |
| 9 | 330-line hand-maintained default-config duplicate | `src/ui/data/defaultConfig.ts` predates recipe artifacts; app never imports it; two test blocks pin its shape | **D4** delete file; retarget those tests at `STANDARD_RECIPE_CONFIG` (the generated artifact) |

## D1 design (the config surface, decided)

- **Elevation, not indentation.** Panel (popover, 11%) → stage card (card, 9%,
  one step recessed — already true) → **group well**: one further recess
  (`bg-background/40`-class tint over card, `border-border-subtle`, rounded,
  p-2). Groups read as machined slots in the slate, matching the instrument-
  bezel direction. Arrays unify onto the same well treatment.
- **Two surface tiers maximum.** Nesting deeper than stage→group does not add
  surfaces; it differentiates by eyebrow heading (text-label uppercase muted)
  and the group↔group rhythm. Indent ladders (`border-l` + `pl-*`) are removed.
- **Rhythm:** 4px within a field block (label/input/help), 8px between fields,
  12px between groups and between stage cards. One place owns these (the FORM
  constant in rjsfTemplates).
- Field labels stay `text-foreground` medium (Pass-2); descriptions stay muted
  and are NOT removed (docs are part of the instrument).

## D2 design (consoles, decided — user proposal incorporated)

Deliberation: accepted. The current footer already contains a latent boundary
(status/last-run + run controls are studio-runtime; live chip + autoplay +
run-in-game are Civ7-runtime). Making it structural gives the game side room to
grow (user: more live-game controls coming). One deviation from the literal
ask: **Run in Game moves to the Game console** (it commands the live game),
even though it sits in the run-controls bar today; the save-deploy status chip
follows it. Bars: centered Studio console (true centering, independent of right
content), right-pinned Game console with an eyebrow identity label ("Civ7" /
radio glyph) so the area is *named*, modular component `GameConsole` so future
controls land there.

## D3 design (explore toolbar, decided)

Inventory + categorization (verified in code):

| Control | Acts on | Disposition |
|---|---|---|
| Fit to view | camera | VIEW cluster |
| Edges toggle | map overlay (`showEdgeOverlay`) | VIEW cluster |
| Render mode segment | selected data's rendering | DATA cluster |
| Space segment | selected data's coordinate space | DATA cluster |
| Era mode+slider | selected data slice | DATA cluster (conditional) |
| Variant select | selected data slice | DATA cluster (conditional) |
| Overlay select + opacity | selected data correlation | DATA cluster (conditional) |
| Debug toggle | DATA **list** filter | moves to DATA section header |

No control is senseless; none removed. Layout: two eyebrow-labeled clusters
(VIEW / DATA) with consistent label-left/control-right rows replacing the
current left/right zig-zag.

## Slices (stacked on design/theme-class-sync)

1. `design/pass3-frame` — this doc, system.md amendment, OpenSpec changes.
2. `design/cascade-reset` — **D0** (root; everything downstream re-grounds on it).
3. `design/no-hardcoded-defaults` — **D4** (independent hygiene, early so later
   test work inherits the law).
4. `design/config-surface` — **D1**.
5. `design/footer-consoles` — **D2**.
6. `design/explore-toolbar-2` — **D3**.

Verification contract: per slice — OpenSpec `--strict`, tsc, vitest green, and
live visual proof on :5173; final gate — dark + light screenshots of the full
app, DOM-computed spacing spot-checks (px-3 ⇒ 12px), build + worker bundle.

## Falsifier

If after D0+D1 the config surface still reads cramped or hierarchy-flat, the
spacing *values* and tier tints are wrong (design problem), not the mechanism —
iterate values in D1's slice. If the Game console split confuses state instead
of clarifying it, the bridge chips are insufficient and D2 reverts to a single
bar with internal grouping (user explicitly allowed refusal).
