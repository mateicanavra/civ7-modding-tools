# Placement Realignment S7 — Viz + Knob Surface

## Why

Placement was a near-blank surface in studio (diagnosis RC7;
audit-register studio-viz lane): only 3 of the stage's steps emitted any
viz layer (7 layers total), so selecting plan/stamp steps rendered an
empty canvas even though their artifacts carry per-plot decision data
(resource intents with type/phase, wonder coordinateRows with
placed/rejected+reason, StartRecord seats with per-component scores).
Start-scoring viz was emitted only AFTER a successful assignment — gone
exactly when selection degrades. The layers that did exist had presentation
defects (regionSlot's opaque alpha-210 "None" wash; viabilityScore's
stats-derived legend domain unstable across runs). No placement overlay
suggestions existed, and the "Gameplay / Placement" group label was
re-declared inline in three files with nothing guarding key coverage.
Separately, the audit flagged the studio knob surface: the hand-maintained
`apps/mapgen-studio/src/ui/data/defaultConfig.ts` shadow config (the
mechanism that once drove `getStageOrder()`) had drifted to exclude
placement entirely.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S7 scope)
- `docs/projects/placement-realignment/expectations.md` (E4.2, E4.3)
- `docs/projects/placement-realignment/diagnosis.md` (RC7)
- `docs/projects/placement-realignment/evidence/audit-register.md`
  (studio-viz lane; layer inventory, defects, and the morphology emission
  pattern, all cited file:line)

## What Changes

1. **Per-step decision-substance viz (E4.2/E4.3).** Every placement step
   except `assign-advanced-starts` (decision-logged below) emits ≥1 layer
   via the established `context.viz?.dumpGrid/dumpPoints + defineVizMeta`
   pattern, all artifact-backed (no viz-only computation of new truth):
   - `derive-placement-inputs`: planned wonder + discovery sites (points,
     priority-colored) from the published plans.
   - `plan-resources`: per-type resource intent points (categories =
     RESOURCE_* policy identity), per-family habitat intensity grids
     (aquatic/cultivated/terrestrial/geological), and aggregate
     eligibility/legality grids (types-per-tile under policy legality and
     under policy∧habitat).
   - `assign-starts`: composite score (now with a stable unit valueSpec) +
     tier grids kept; NEW per-component score grids (freshwater, fertility,
     expansion, climate, resource, roughness — rebuilt from the retained
     per-candidate component vectors) and seat points categorized by
     selection-ladder rung. All of these now emit from the PLAN output
     BEFORE materialization, so the scoring surface survives degraded or
     failed stamping (the audit's P2).
   - `adjust-resources`: support adjustment points (move origin, move
     destination, addition — split by floor vs equity reason) plus the
     per-start support radius zone grid the pass adjusts toward.
   - `place-resources`: typed reconcile outcome points (placed /
     rejected-with-reason).
   - `place-natural-wonders`: outcome points (placed / placed-relocated /
     rejected) from coordinateRows.
   - `place-discoveries`: typed outcome points (placed /
     rejected-with-reason).
   - `prepare-placement-surface`: debug-visibility evidence grids — lake
     drift (accepted lake tiles dried/declassified by engine maintenance)
     and terrain-validation drift (per-tile data behind the published
     aggregate counters).
   - terminal `placement`: engine landMask kept; NEW debug waterDrift grid
     (the per-tile surface behind waterDriftCount parity evidence).
2. **Presentation defects fixed (audit P3).** regionSlot category 0 "None"
   is transparent (alpha 0, was 210); `placement.starts.viabilityScore`
   (and every new 0..1 score layer) carries
   `valueSpec { scale: linear, domain: unit }` so legend domains are stable
   across runs; the `sectorId` layer removed in S4 has zero dangling
   references (grep + regression test).
3. **Placement overlay suggestions.** 9 pairs added for
   `mod-swooper-maps/standard` (start seats / seat rungs over score and
   tier; resource intents over each habitat family and over eligibility;
   support adjustments over the support radius zone). Every pair is
   emitted by a single step because studio gates overlay candidates on the
   selected step's dataTypeModel; the emitted-key side is pinned by test.
4. **Knob surface: schema-driven path confirmed; hand-maintained shadow
   deleted.** Placement (knobs + naturalWonders/discoveries/resources/
   starts/support, 11 steps) already reaches studio through the generated
   recipe artifacts (`build:studio-recipes` →
   `STANDARD_RECIPE_CONFIG[_SCHEMA]` + `studioRecipeUiMeta`), regenerated
   in S4/S5. The legacy `src/ui/data/defaultConfig.ts` shadow (zero app
   importers; only legacy-reference tests) is deleted, and the stale studio
   guard tests are updated to the current placement surface (6 public
   groups, 11 steps in S5/D3 order).
5. **Group/key hygiene + coverage guard.** "Gameplay / Placement" is
   declared once in the stage-local `stages/placement/viz.ts` (shared
   constants/helpers; the three inline declarations now import it). A new
   `test/placement/viz-coverage.test.ts` runs the standard pipeline with a
   viz collector and asserts per-step expected dataTypeKeys, valid meta
   (label + shared group), transparent zero-categories, overlay-suggestion
   key existence, and sectorId absence.

## Decision Log

- **`assign-advanced-starts` emits no viz layer (recorded exception).** Its
  only product is two engine-side effect booleans (fertility recalc +
  advanced start regions); the adapter exposes no per-plot readback for
  either effect, so there is genuinely nothing visual to emit. Recording
  the exception was chosen over emitting a fake/unrelated layer. E4.2 is
  therefore 10/11 steps with content + 1 recorded no-content step. If the
  adapter ever grows a fertility or advanced-start-region readback, the
  coverage test's step table is the insertion point.
- **Knob surface mechanism: generated artifacts, no new plumbing.** The
  audit's cited gap (defaultConfig.ts/getStageOrder excludes placement)
  describes a mechanism the app no longer uses — the studio panel is
  schema-driven from `mod-swooper-maps/recipes/standard-artifacts`
  (SchemaConfigForm + uiMeta.stages), and placement is present in those
  generated artifacts. S7 therefore ships NO hand-authored schema and no
  parallel path; it deletes the dead hand-maintained shadow file (the
  drift surface itself) and repins the studio guard tests on the current
  generated surface. The two stale "legacy Studio source defaults" test
  blocks die with the file; the semantic-surface guards against
  `STANDARD_RECIPE_CONFIG` remain.
- **Registry stretch goal: OUT; per-step coverage test: IN.** A first-class
  emitted-key registry in `packages/mapgen-viz` is real API design
  (cross-package, all stages) and exceeds slice scope. The cheap durable
  guard shipped instead: the coverage test pins step→dataTypeKey expected
  sets and the overlay-suggestion keys, so placement coverage cannot
  silently drift. A registry remains a candidate follow-up for the
  workstream's S8 deferral list.
- **Per-component grids rebuilt from candidates, not re-scored.** The
  plan-starts op retains per-candidate component vectors (S4); the viz
  grids scatter those values onto tile grids (zero on non-candidates,
  matching scoreByTile's convention). No scoring logic is duplicated at
  the emit site (E4.3: artifact-backed, not viz-only truth).
- **Aggregate eligibility grids instead of ~31 per-type masks.** Emitting
  every per-type habitat/legal mask would add ~62 layers to one step. The
  shipped types-per-tile grids carry the step's decision surface (where
  anything can go and how contested tiles are); per-type masks remain in
  the `resourceEligibility` artifact for offline inspection. Revisit only
  with a studio-side layer-paging story.
- **Engine landMask layer kept default-visible.** The audit listed it as a
  plausible "doesn't belong" candidate; it is the terminal step's only
  product surface (engine parity evidence) and the new waterDrift grid is
  debug-gated next to it. Removing/demoting it is a presentation call for
  Milestone B's visual QA, not this slice.

## Verification

- `bun run --cwd mods/mod-swooper-maps check` — clean.
- `bun --cwd mods/mod-swooper-maps test` — 511 pass / 0 fail (includes the
  new viz-coverage tests).
- `bun run --cwd apps/mapgen-studio check` + `bun run --cwd apps/mapgen-studio test`
  (139 pass) + `bun run --cwd apps/mapgen-studio build` (worker bundle
  check passed).
- `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard`
  → `/tmp/pm-s7.json` is **bit-identical** to the S6 baseline
  `/tmp/pm-s6.json` (recursive diff: 0 differing fields) — viz emission
  changed no behavior.
- Evidence: `docs/projects/placement-realignment/evidence/s7-results-2026-06-10.md`
  (per-step before/after layer inventory, presentation fixes, knob surface
  outcome).

## Known Limits / Open Items (recorded, not faked)

- Studio visual QA of the new layers (colors, point sizing, overlay
  composites in the browser) is the Milestone B browser-runner review; this
  slice proves emission + meta validity headlessly.
- The coverage test pins expected keys per step; a NEW placement step would
  need a table entry (loud at review, but not automatic) — the registry
  follow-up would close that residual gap.
