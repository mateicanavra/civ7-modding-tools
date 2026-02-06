id: LOCAL-TBD-PR-M1-012
title: Era loop + field emission budgets (D04r Eulerian outputs)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-011]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the fixed-budget evolution era loop and emit the required Eulerian per-era fields + rollups for `artifact:foundation.tectonicHistory` (D04r).

## Deliverables
- Implement the D04r Eulerian “era loop”:
  - fixed target/max era counts (as specified in the SPEC),
  - fixed per-era iteration budgets (no adaptive “until stable” loops),
  - and explicit ordering guarantees (oldest→newest era indexing).
- Publish the required history truth artifact:
  - `artifact:foundation.tectonicHistory` (mesh-space truth),
  - including rollups required by downstream consumers and validation gates.
- Align visualization emission posture:
  - do not encode era index into `dataTypeKey` (use `variantKey` for eras),
  - provide at least one refined overview + debug per-era variants.

## Acceptance Criteria
- `artifact:foundation.tectonicHistory` is published with era semantics that match the SPEC:
  - `eraCount` honors target/max bounds,
  - per-era arrays are correctly sized and consistent,
  - rollups (e.g., cumulative totals, last-active indices) are deterministic and interpretable.
- Boundedness is explicit (constants live in code and are referenced in docs/tests).
- Downstream systems can consume without guessing:
  - Morphology drivers (via projections; `LOCAL-TBD-PR-M1-002`) can read the required channels with clear semantics.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Update/extend existing tectonic history tests (current implementation expects 3 eras):
  - `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts`
- Update/extend any step validation guards that hardcode era counts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts`
- Add at least one determinism test for history rollups across two identical runs.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-011`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*` (era loop + rollups; likely refactor/replace to match D04r budgets)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` (already emits per-era `variantKey=era:<n>`; expand to D04r semantics)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (currently hardcodes an era count; must be removed)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (currently assumes 3 eras; must be updated to D04r budgets)
- `apps/mapgen-studio/src/features/viz/dataTypeModel.ts` (Studio variant model; era scrubber depends on `variantKey=era:<n>` staying consistent)

### References
- docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md
- docs/projects/pipeline-realism/resources/spec/budgets.md

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
- D04r era loop now enforces bounded counts: target `5` eras with `8` as the hard max; `eraWeights` and `driftStepsByEra` must match `eraCount`.
- Defaults align to the 5-era posture (`eraWeights=[0.3,0.25,0.2,0.15,0.1]`, `driftStepsByEra=[2,2,2,2,2]`) and validation now enforces `5..8` eras (no legacy `3`-era acceptance).
- Determinism check for rollups is asserted via identical-run comparisons in `m11-tectonic-segments-history.test.ts` (e.g., `upliftTotal`, `lastActiveEra`).
- Generated `mods/mod-swooper-maps/mod/maps/*` configs still carry 3-era arrays; do not hand-edit. Regenerate via build once the new defaults are ready to ship.

### Current State (Observed)

Today’s Foundation history already exists as a multi-era artifact, but with hardcoded assumptions:
- `artifact:foundation.tectonicHistory` exists and includes `eras[]` and rollups.
- Current validation expects exactly 3 eras in at least one place:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts`
- Current tests assume 3 eras:
  - `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts`

### Proposed Change Surface

Expected implementation touchpoints:
- history op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*` (likely replaced or significantly refactored)
- any consumers that treat `eraCount` as fixed:
  - Morphology belt drivers (future issues `LOCAL-TBD-PR-M1-014..016`)
  - viz emissions/tests (`mods/mod-swooper-maps/test/pipeline/viz-emissions.test.ts`)

### Pitfalls / Rakes

- Quietly keeping a 3-era posture and only “renaming” it to D04r; this violates the explicit budgets and semantics in the SPEC.
- Exploding per-era layers into the `dataTypeKey` namespace (breaks decluttering and violates existing regression tests).
- Building rollups that depend on floating nondeterminism (hash/fingerprint drift across platforms).

### Wow Scenarios

- **Era scrubber is meaningful:** a human can scrub eras and see drivers evolve (not just re-colored noise), and provenance/belt synthesis later can cite the “last active era” semantics as causal evidence.
