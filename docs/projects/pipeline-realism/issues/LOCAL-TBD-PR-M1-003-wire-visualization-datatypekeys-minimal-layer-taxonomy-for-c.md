id: LOCAL-TBD-PR-M1-003
title: Wire visualization dataTypeKeys + minimal layer taxonomy for causal spine
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-001, LOCAL-TBD-PR-M1-002]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Define stable `dataTypeKey` identities (and debug/refined taxonomy) for the new maximal Foundation causal spine layers, and wire them through the existing VizDumper contract.

## Deliverables
- Define stable `dataTypeKey` values for the new artifacts (no temporal info encoded in `dataTypeKey`; use `variantKey` for eras/variants):
  - mantle (mesh / world space): `foundation.mantle.potential`, `foundation.mantle.forcing`
  - plate motion (mesh / world space): `foundation.plateMotion.motion`
  - provenance/history projections (tile space): `foundation.tectonicHistoryTiles.*`, `foundation.tectonicProvenanceTiles.*`
  - belt-driver diagnostics (tile space; for dual-read): `morphology.drivers.*` (wired in Morphology issues, but keys must be reserved here)
- Establish a minimal taxonomy posture consistent with the canonical viz doc:
  - **Debug layers:** raw intermediate tensors (divergence, residuals, per-era fields) are behind `meta.visibility = "debug"`.
  - **Refined layers:** author-facing “story” layers default visible (causal spine overview; stable legend).
- Wire new keys using the canonical step surface:
  - emit only via `context.viz?.dumpGrid/dumpGridFields/dumpPoints/dumpSegments` (do not invent new trace envelopes).

## Acceptance Criteria
- New visualization emissions use:
  - stable `dataTypeKey`,
  - correct `spaceId` (`world.xy` for mesh-space coordinates, `tile.hexOddR` for tile tensors),
  - `variantKey` for eras/variants (never `...era3...` in `dataTypeKey`).
- Studio decluttering rules remain true:
  - noisy layers are debug-only by default,
  - refined layers remain discoverable and grouped by consistent `meta.group` naming.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Extend the existing viz emission regression tests:
  - `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts`
    - add expected `dataTypeKey`s for the new Foundation causal spine layers,
    - preserve the existing guard that bans “eraN” in `dataTypeKey`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-001`
  - `LOCAL-TBD-PR-M1-002`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` (already emits per-era `variantKey=era:<n>`; proving ground for taxonomy + variants)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts` (VizDumper consumer; validates that emitted meta/keys are useful in dumps)
- `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts` (pins `dataTypeKey` stability; bans “eraN” in keys)
- `packages/mapgen-viz/src/index.ts` (shared viz contract types; keep identity semantics aligned)
- `apps/mapgen-studio/src/features/viz/dataTypeModel.ts` (Studio grouping: `dataTypeKey → spaceId → kind[:role] → variantKey`)

### References
- docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md
- docs/system/libs/mapgen/pipeline-visualization-deckgl.md
- docs/system/libs/mapgen/reference/VISUALIZATION.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

Visualization emission is already centralized through `VizDumper` and tested for stability:
- Canonical deck.gl/viz contract: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- DataTypeKey regression tests (including “no era in key”): `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts`

Foundation step emissions today use:
- `spaceId: "world.xy"` for mesh-space plotting (mesh/crust/plate graph/tectonics),
- `spaceId: "tile.hexOddR"` for tile tensors (plates/crustTiles).

### Proposed Change Surface

Expected wiring points for new keys:
- Foundation steps (mesh-space): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*.ts`
- Foundation projections (tile-space): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Meta/taxonomy helpers: `defineVizMeta(...)` callsites across the steps (group/label/palette/visibility conventions).

### Pitfalls / Rakes

- Encoding “era count” into `dataTypeKey` (this breaks Studio decluttering and violates an existing regression guard).
- Adding viewer-dependent correctness (e.g., “this only works if deck.gl renders it”): viz is external; correctness must be asserted elsewhere.
- Splitting taxonomy across steps without a shared naming posture (causes unsearchable layer catalogs and key collisions).

### Wow Scenarios

- **One-click causal inspection:** in Studio, a single “Foundation / Mantle” group provides a refined overview (potential + forcing), while debug toggles reveal residuals and per-era details without cluttering the default view.
