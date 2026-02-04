id: LOCAL-TBD-PR-M1-016
title: Cutover morphology to new drivers + remove legacy consumption paths
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-015]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Cut over Morphology so belt synthesis and downstream shaping are authored as consumers of the new mandatory history/provenance drivers (no legacy fallback).

## Deliverables
- Make the new driver path authoritative:
  - Morphology belt synthesis must consume `artifact:foundation.tectonicHistoryTiles` + `artifact:foundation.tectonicProvenanceTiles` (directly or via a derived Morphology driver artifact produced in Morphology).
- Remove legacy-only belt synthesis consumption:
  - remove any “dual-read” fallback logic introduced in `LOCAL-TBD-PR-M1-014`,
  - and ensure no code path can silently revert to legacy drivers.
- Explicitly decide what remains a valid dependency post-cutover:
  - recommended default: Morphology may still use `artifact:foundation.crustTiles` for isostasy/base elevation, but belt/orogeny drivers must not depend on legacy tectonics tensors as the SSOT.

## Acceptance Criteria
- Compilation fails loudly if the new driver artifacts are missing:
  - Morphology step contracts declare the new artifacts as required (no runtime “if present” behavior).
- There is no legacy fallback path:
  - remove flags/configs that toggle back to legacy drivers,
  - and add a regression guard that searches for banned dependency tags/usages.
- A representative Morphology run:
  - is deterministic under the new driver path,
  - and produces belts that pass the “no wall mountains” posture (with gates in `LOCAL-TBD-PR-M1-020`).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a regression “no legacy fallback” guard:
  - `rg -n \"legacy\" mods/mod-swooper-maps/src/recipes/standard/stages/morphology` (expect no legacy driver switching)
  - and/or a purpose-built contract guard test under `mods/mod-swooper-maps/test/morphology/`.
- Ensure existing morphology correlation tests still pass (or are replaced with D07r-aligned equivalents):
  - e.g. `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-015`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (new driver artifacts must exist and be required by Morphology contracts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (current legacy read: `deps.artifacts.foundationPlates`; must be removed/rewired)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (artifact requires currently include `foundationArtifacts.plates`; cutover should replace with new driver ids)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts` (another consumer of legacy `plates`/`crustTiles`; decide what remains required post-cutover)
- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts` (enforce “no legacy fallback” / required artifact posture)
- `mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts` (baseline crust/plates consumption tests likely need replacement with provenance/history posture)

### References
- docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md
- docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md

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

Morphology’s current standard recipe contract requires:
- `artifact:foundation.plates`
- `artifact:foundation.crustTiles`

Anchor: `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`.

### Proposed Change Surface

Expected touchpoints:
- Morphology stage wiring: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/**`
- Step contracts that declare required artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-*/steps/*.contract.ts`

### Pitfalls / Rakes

- Leaving the dual-read bridge in place indefinitely (“it’s still there just in case”).
- Cutting over belt synthesis but leaving other downstream paths to quietly use legacy drivers, creating hybrid semantics that no longer match the spec.

### Wow Scenarios

- **No legacy left (for Morphology drivers):** when you toggle the new driver mode off, compilation fails instead of silently producing mountains from legacy tensors — the new causal spine is the only way forward.
