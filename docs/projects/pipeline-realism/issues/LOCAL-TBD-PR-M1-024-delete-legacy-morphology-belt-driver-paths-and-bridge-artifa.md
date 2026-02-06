id: LOCAL-TBD-PR-M1-024
title: Delete legacy morphology belt driver paths and bridge artifacts
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-016, LOCAL-TBD-PR-M1-020]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Remove legacy Morphology belt-driver consumption paths and any transitional bridge artifacts post-cutover, so the new history/provenance drivers are the only Morphology SSOT.

## Deliverables
- Delete transitional dual-read / bridge plumbing introduced for validation:
  - remove the “legacy + new” dual-read mode from `LOCAL-TBD-PR-M1-014`,
  - remove any temporary “bridge artifacts” created solely to keep legacy belt planning alive during comparison.
- Remove legacy belt-driver consumption:
  - Morphology belt planning must not require or read `artifact:foundation.plates` for belt/orogeny drivers post-cutover.
  - any remaining uses of `foundationArtifacts.plates` in Morphology must be explicitly justified as non-belt concerns (or removed).
- Tighten contracts so regressions fail at compile time:
  - Morphology step contracts should require the new driver artifacts (`tectonicHistoryTiles` / `tectonicProvenanceTiles` or the derived Morphology driver artifacts), not “optional if present” logic.

## Acceptance Criteria
- There is no legacy belt-driver fallback path:
  - attempting to run without the new driver artifacts fails at compile time (contract requires), not at runtime via “if present”.
- Belt-driver consumption is clean:
  - `rg -n "foundationArtifacts\\.plates" mods/mod-swooper-maps/src/recipes/standard/stages` shows no belt-planning dependency on plates (mountain/belt path must be clean).
- The diagnostic comparisons from `LOCAL-TBD-PR-M1-014` are removed or moved behind an explicit dev-only toggle that is slated for deletion in `LOCAL-TBD-PR-M1-025` (recommended: delete outright once gates are green).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend a contract guard that asserts the belt planning path does not depend on legacy plates tensors:
  - recommended home: `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts`
- Ensure the morphology correlation gates stay green after deletion:
  - `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`
  - and the M1 correlation gates introduced by `LOCAL-TBD-PR-M1-020`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-016`
  - `LOCAL-TBD-PR-M1-020`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts` (dual-read diagnostics + bridge plumbing removal)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts` (drop history/provenance requires once dual-read removed)
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges-and-foothills/contract.ts` (belt planning input driver tensors; upstream extraction must come from new drivers)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (new driver artifact ids; Morphology contracts should require these)
- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts` (enforce “no legacy plates for belts” posture)

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

- Morphology dual-read diagnostics currently live in `landmassPlates.ts`, comparing legacy plate tensors to newest-era history/provenance tiles and emitting `morphology.dualRead.*` grids + a `morphology.dualRead.summary` trace event.
  Anchor:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`
- `landmassPlates.contract.ts` requires `tectonicHistoryTiles` + `tectonicProvenanceTiles` solely to power those diagnostics.
- Plot-mountains belt synthesis already uses history/provenance tiles only (no legacy plates dependency).

### Proposed Change Surface

- Remove the transitional bridge:
  - delete the dual-read path and any “comparison-only” artifact plumbing.
- Make the new driver posture compile-time strict:
  - contracts require the new driver artifacts; no runtime branching.

### Implementation Decisions

- Remove dual-read diagnostics entirely once belt consumption is history/provenance-only; keep plates usage in `landmassPlates` limited to base topography/substrate (non-belt concerns).

### Pitfalls / Rakes

- Leaving dead bridge code that silently drifts (eventually no one knows which path is authoritative).
- Removing legacy dependencies without adding a guard, allowing them to creep back in later.

### Wow Scenarios

- **Cutover is real:** once this is done, Morphology cannot “accidentally” be powered by legacy plates; the new causal spine is enforced structurally.
