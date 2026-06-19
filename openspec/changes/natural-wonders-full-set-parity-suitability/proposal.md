# Natural Wonders Full-Set, Parity, and Physical-Suitability Placement

## Why

The mod ships only **10 of the 20** Civ7 natural wonders, and the same lowest-id
subset appears on every map. Two evidence-verified root causes (full scope in
`output/nw-scope.md`, design inputs in `output/nw-design-inputs.md`):

1. **Catalog truncation.** `isSupportedNaturalWonder`
   (`packages/civ7-map-policy/src/catalogs/natural-wonders.ts`) silently drops 10
   wonders: 6 whose 4-tile placement classes (`FOURPARALLELAGRM`/`FOURADJACENT`/
   `FOURL`) return a `null` footprint, 3 carrying placement tags outside the
   12-entry `SUPPORTED_POLICY_TAGS` allowlist, and 1 (Valley of Flowers) blocked
   by a `placeFirst && tiles>1` guard.
2. **Deterministic greedy selection with a wrong footprint model.** The planner
   (`mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/strategies/default.ts`)
   has zero seeded sampling and one all-wonders `priority` scalar; it walks an
   ascending-`featureType` catalog and stops at the per-map target, so the same
   wonders saturate every run. Multi-tile footprints are laid from a single
   parity-agnostic offset table (`CIV7_DIRECTION_OFFSETS`, equal to odd-row
   offsets) with no `y&1` branch, so **even-row-anchored wonders compute the
   wrong cells**; the live engine (odd-R adjacency) rejects them by
   readback-mismatch while MockAdapter (write-and-echo) masks the defect in CI.

Two user decisions set the target shape (2026-06-18):

- **Variety is physically grounded, not random.** Selection MUST be weighted,
  biome-aware, and driven by every relevant physical input per wonder
  (groupable by requirement-class). Deterministic per map seed only because the
  seed drives terrain evaluation — wonders appear where the map is physically
  viable, so variety emerges from map diversity.
- **Wonder effects are in scope.** Investigation proved every effect of the 20
  vanilla wonders is **data-driven and engine-automatic on correct placement**
  (`REQUIREMENT_MAP_HAS_FEATURE`/`_PLAYER_HAS_FEATURE`/`<RandomEvents
  NaturalWonder>`), and `adapter.placeNaturalWonder` already calls the same
  `TerrainBuilder.setFeatureType` engine entry point the base generator uses.
  Reusing the 20 vanilla `FeatureType`s requires **no explicit effect wiring** —
  the effects work reduces to placing the correct wonder at a legal tile via the
  engine path.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` —
  "Placement splits at product/effect contracts"; map-policy is policy surface,
  the mod owns placement.
- `.agents/skills/civ7-product-authority` — official game data is the authority
  for the full wonder set (20 `Feature_NaturalWonders` rows).
- `openspec/changes/mapgen-core-hex-oddr-consumer-migration/` and
  `openspec/changes/mapgen-core-hex-oddr-adjacency-correction/` — the verified
  odd-R adjacency baseline this change consumes
  (`packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts`,
  `packages/civ7-map-policy/.../policy-grid.ts`).
- `output/nw-scope.md` and `output/nw-design-inputs.md` — the evidence-based
  corpus, parity site map, suitability inputs, effects corpus, and live-probe
  methodology produced for this change (mirrored into
  `workstream/corpus-ledger.md`).
- `packages/civ7-map-policy/**`, `packages/civ7-adapter/**`,
  `mods/mod-swooper-maps/**` — the policy, adapter, and placement surfaces.

## What Changes

- **Parity:** make natural-wonder footprints parity-aware (odd-R, keyed `y&1`
  at the anchor) across every consuming site; migrate the plan-op contract field
  `footprintOffsets` to a parity-keyed `{even,odd}` pair (a live-field migration,
  not a dead-code deletion); add even-row unit tests to the shared footprint
  function (which both adapters already use, so correcting it fixes the mock —
  the live readback, not the mock, is the parity gate).
- **Full set:** implement the 4-tile placement classes
  (`FOURPARALLELAGRM`/`FOURADJACENT`/`FOURL`) and the 5 new adjacency predicates
  (`ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN`,
  `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF`); honor `placeFirst` ordering so
  `placeFirst && tiles>1` wonders (Valley of Flowers) are placeable. Result:
  all 20 wonders are catalog-eligible.
- **Physical-suitability variety:** replace the single `priority` scalar with a
  per-group, biome-aware weighted `suitability(wonder, tile)` over the physical
  signals the pipeline already computes but currently drops before the planner
  (volcanoMask, shelfMask, bathymetry, distanceToCoast, vegetationDensity,
  discharge/slopeClass, freezeIndex, orogeny/roughness, moisture/temperature/
  fertility); deterministic per seed, engine remains final legality authority.
- **Effects by placement:** keep placement on the engine `setFeatureType` path
  so all data-driven wonder effects activate; verify they manifest live. No new
  effect code for the 20 vanilla types.
- **Test contract:** update the catalog tests and `verify-manual-catalogs.ts`
  length gate that currently certify the 10-entry truncation to expect the
  recovered full set, plus a no-silent-drop coverage assertion.
- **Authority for legality remains the engine.** The offline footprint and
  predicate models are conservative pre-filters; `canHaveFeatureParam` plus
  post-placement readback are the final gate. The exact 4-tile cell sets and
  cliff/opposite-cliff semantics are pinned by a live `getAdjacentPlotLocation`
  + place-then-readback probe recorded in `workstream/live-proof-ledger.md`
  before the corresponding implementation tasks land.

## Requires

- `mapgen-core-hex-oddr-consumer-migration` — the odd-R primitive baseline
  (`hex-oddq.ts` even/odd offset tables, `policy-grid.ts`) this change consumes
  as ground truth. This change is stacked on
  `agent-A-mapgen-oddr-consumer-migration`.
- A bootable live Civ7 single-player session for the geometry/predicate probe
  and the closure-gate render (`civ7 game exec`, `runCiv7SinglePlayerFromSetup`,
  reveal + appshot).

## Enables Parallel Work

- Wonder-tied effect *balancing* review (counts/quotas) over a now-complete,
  physically-placed wonder set.
- Any downstream that reads `NATURAL_WONDER_CATALOG` or the planner suitability
  signals (diagnostics, studio NW telemetry) over the full 20.

## Non-Goals

- No new `FeatureType`s and no hand-authored effect modifiers/events — the 20
  vanilla types' effects are engine-automatic on correct placement.
- No change to mapgen-core hex primitives, ecology/morphology/hydrology truth
  artifacts (signals are forwarded, not recomputed), or game-data resources.
- No change to vanilla per-map wonder counts; variety comes from suitability +
  the full corpus across seeds, not from packing more wonders per map.
- No product/parity closure on MockAdapter evidence alone — live readback is the
  closure gate.

## Verification Gates

- `bun run openspec -- validate natural-wonders-full-set-parity-suitability --strict`
- `bun run build` green across the affected packages.
- `nx run @civ7/map-policy:test` (incl. new even-row footprint + full-catalog
  tests), `nx run @civ7/adapter:test` (catalog test flipped to full set),
  `nx run mod-swooper-maps:test` (planner suitability + no-silent-drop coverage).
- Live geometry/predicate probe results recorded in
  `workstream/live-proof-ledger.md` before Tasks 4–5 implementation is closed.
- Live in-game render proving multiple distinct wonders place across ≥2 seeds,
  even-row anchors readback-match the offline footprint, and representative
  effects manifest — recorded in `workstream/live-proof-ledger.md`.
