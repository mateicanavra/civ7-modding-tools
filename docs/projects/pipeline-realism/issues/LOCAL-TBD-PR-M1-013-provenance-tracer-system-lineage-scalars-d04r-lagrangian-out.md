id: LOCAL-TBD-PR-M1-013
title: Provenance/tracer system + lineage scalars (D04r Lagrangian outputs)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-012, LOCAL-TBD-PR-M1-011]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the mandatory Lagrangian provenance system (`artifact:foundation.tectonicProvenance`) with bounded memory/budgets, updated by events and consumable downstream via tile projections.

## Deliverables
- Publish the mandatory provenance truth artifact:
  - `artifact:foundation.tectonicProvenance` (mesh-space truth; D04r Lagrangian outputs)
- Ensure provenance is materially updated by event mechanics:
  - events must update lineage scalars/tracer state in corridors (no “provenance is just derived from history rollups”).
- Ensure provenance is consumable by tile-only consumers:
  - tile projection artifacts are emitted in `LOCAL-TBD-PR-M1-002` (`artifact:foundation.tectonicProvenanceTiles`).
- Enforce boundedness:
  - explicit budgets for any tracer count/state size,
  - explicit policies for initialization, retention, and aggregation.

## Acceptance Criteria
- `artifact:foundation.tectonicProvenance` exists with the fields required by the spec section and decision packet.
- Provenance changes are causal:
  - in a synthetic event corridor, provenance scalars change in the affected region in a way a test can assert.
- Determinism:
  - same inputs => identical provenance buffers.
- Boundedness:
  - provenance memory use is capped by explicit budgets (no unbounded tracer growth).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a provenance unit test suite:
  - determinism: identical inputs => identical output buffers
  - boundedness: tracer counts/state sizes respect budgets
  - causality: events update provenance (detectable change)
  Suggested location: `mods/mod-swooper-maps/test/foundation/` (new file).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-012`
  - `LOCAL-TBD-PR-M1-011`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/` (new; provenance truth artifact + tracer/lineage scalars)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*` (provenance/historical coupling; provenance must not be a rollup-only derivative)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (declare `artifact:foundation.tectonicProvenance` schema + ids)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` (tile projection consumers; provenance must project to tiles via `LOCAL-TBD-PR-M1-002`)
- `mods/mod-swooper-maps/test/foundation/` (new provenance causality/boundedness tests; pattern: `m11-tectonic-segments-history.test.ts`)

### References
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md
- docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md
- docs/projects/pipeline-realism/resources/spec/budgets.md
- docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md

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

The current Foundation implementation does not have a provenance/tracer truth artifact analogous to D04r’s mandatory Lagrangian outputs.

There are existing “causality” style tests that can serve as patterns for future provenance assertions (example domain):
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (determinism + derived-field assertions)

### Proposed Change Surface

Expected new op placements (project-local; naming may vary):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/*`
  - or the provenance system may be a submodule of the event engine op introduced in `LOCAL-TBD-PR-M1-011`.

Expected consumers:
- tile projections: `LOCAL-TBD-PR-M1-002`
- morphology dual-read/belt synthesis: `LOCAL-TBD-PR-M1-014..015`

### Pitfalls / Rakes

- Treating provenance as “just another visualization” instead of a correctness-relevant truth artifact.
- Letting provenance state grow without an explicit cap (tracer explosion).
- Making provenance updates non-local or nondeterministic (small changes in event ordering cause global lineage drift).

### Wow Scenarios

- **Lineage has teeth:** a belt region can be tagged with a provenance story (age/lineage scalars) that explains why “this mountain chain is older” and gates can assert that story is consistent with event history.
