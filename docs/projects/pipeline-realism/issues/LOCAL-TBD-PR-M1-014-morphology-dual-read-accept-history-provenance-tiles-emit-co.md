id: LOCAL-TBD-PR-M1-014
title: Morphology dual-read: accept history/provenance tiles + emit comparison diagnostics
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-002]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add a dual-read Morphology wiring path that can consume the new `tectonicHistoryTiles`/`tectonicProvenanceTiles` drivers while still supporting legacy drivers long enough to validate coupling.

## Deliverables
- Update Morphology stage wiring to accept new tile driver artifacts (from `LOCAL-TBD-PR-M1-002`) alongside legacy inputs:
  - new required drivers (tile space):
    - `artifact:foundation.tectonicHistoryTiles`
    - `artifact:foundation.tectonicProvenanceTiles`
  - legacy drivers (current required by Morphology today):
    - `artifact:foundation.plates`
    - `artifact:foundation.crustTiles`
- Implement “comparison diagnostics” (must be actionable, not just plots):
  - emit side-by-side driver layers (old vs new) and their deltas (viz),
  - emit at least one quantitative correlation summary suitable for gating later (`LOCAL-TBD-PR-M1-020`).
- Make the bridge explicit:
  - dual-read is transitional and must have a deletion target (`LOCAL-TBD-PR-M1-024` / `LOCAL-TBD-PR-M1-025`).

## Acceptance Criteria
- Morphology can compile and run with:
  - legacy drivers only (baseline),
  - and with new drivers enabled (dual-read mode).
- The comparison output makes it possible to answer:
  - “Do new drivers change belts in the expected places?”
  - “Are differences explainable by event/provenance mechanisms (not sampling artifacts)?”
- The dual-read path is fenced:
  - it is not the default “authoritative” path at the end of the milestone (cutover happens in `LOCAL-TBD-PR-M1-016`),
  - and it cannot silently remain forever (explicit deletion target).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend a morphology integration test that runs with both driver modes and asserts:
  - determinism for each mode,
  - and that the delta between modes is non-trivial for a seed with active tectonics.
  Suggested area: `mods/mod-swooper-maps/test/morphology/` or `mods/mod-swooper-maps/test/pipeline/`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-002`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (declares `foundationArtifacts.*` ids; add `tectonicHistoryTiles`/`tectonicProvenanceTiles` here)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (current Morphology requires `foundationArtifacts.plates`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts` (current requires `foundationArtifacts.plates` + `foundationArtifacts.crustTiles`)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts` (viz sink/dump output path; comparison diagnostics should be visible here)
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (physics-anchored morphology regression patterns)
- `mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts` (asserts viz emissions are present + stable)

### References
- docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md
- docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md
- docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Implementation Decisions
- Dual-read wiring lives in `landmass-plates` (morphology-coasts): it now requires `tectonicHistoryTiles` + `tectonicProvenanceTiles` and emits comparison diagnostics while keeping legacy plates as the authoritative driver for outputs.
- Diagnostics use newest-era history fields vs legacy plates (uplift/rift) and provenance overlays, emitting `morphology.dualRead.*` layers plus a `morphology.dualRead.summary` trace event with boundary match + mean-abs deltas.
- Added a dedicated dual-read diagnostic test and extended viz emissions to lock the new diagnostic layers.

### Current State (Observed)

Morphology (standard recipe) currently requires two upstream Foundation artifacts:
- `artifact:foundation.plates`
- `artifact:foundation.crustTiles`

Anchor: `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (“Requires” section).

### Proposed Change Surface

Expected wiring touchpoints (standard recipe):
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/**`
- any step contracts that declare required artifacts (so compilation fails loudly if drivers are missing):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-*/steps/*.contract.ts`

Expected diagnostics emission (viz):
- Morphology step(s) that compute belt drivers or intermediate masks should emit:
  - stable `dataTypeKey`s (reserved in `LOCAL-TBD-PR-M1-003`)
  - delta layers (variantKey) for old vs new.

### Pitfalls / Rakes

- Dual-read becomes an excuse to avoid cutover (“we’ll decide later”): it must be transitional with a deletion target.
- Comparing drivers in tile space without controlling for mapping differences (must use the same `tileToCellIndex` policy).

### Wow Scenarios

- **Causal deltas:** in a single run, the viewer can show “legacy belts” vs “new belts” and a delta layer that correlates to provenance/history drivers, letting implementers tune mechanisms rather than stare at mountains.
