id: LOCAL-TBD-PR-M1-011
title: Event engine: subduction/collision/rift/transform + mandatory force emission (D06r)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-010, LOCAL-TBD-PR-M1-006]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement event mechanics that update crust state and provenance (no “force-only” tectonics).

## Deliverables
- Implement D06r event mechanics as a first-class subsystem:
  - consumes the authoritative boundary segments/regimes (`LOCAL-TBD-PR-M1-010`) plus crust/lithosphere state (`LOCAL-TBD-PR-M1-006`),
  - produces material changes (crust state updates) and provenance changes (lineage/scalars).
- Emit per-era force corridors consumed by Morphology:
  - force opportunity fields must be explicit artifacts (or explicit fields inside the history/provenance artifacts) with stable semantics,
  - budgets are fixed per era (no unbounded “until stable” loops).
- Ensure event emission is causal (not decorative):
  - events that emit forces must also change crust/provenance in ways later gates can detect.

## Acceptance Criteria
- For each event class (subduction/collision/rift/transform):
  - event detection rules are explicit and deterministic,
  - and at least one crust variable and one provenance variable changes in the affected corridor.
- The outputs required by Morphology belt synthesis exist and are wired:
  - Morphology dual-read can attribute belts to specific event corridors (not “tectonics noise”).
- A failure mode “force-only tectonics” is made impossible (or is explicitly asserted as a failing invariant in `LOCAL-TBD-PR-M1-019`).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a focused unit test suite for event mechanics that asserts:
  - determinism (same inputs => same outputs),
  - polarity-sensitive subduction behavior (oceanic-under-continental pairing),
  - and “material change happens” (crust/provenance scalars change when a convergent corridor exists).
  Suggested location: `mods/mod-swooper-maps/test/foundation/` (new file, or extend existing segments/history tests).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-010`
  - `LOCAL-TBD-PR-M1-006`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (existing “history” surfaces; event engine must produce/update these causally, not just post-hoc rollups)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/*` (segment regime classification provides the raw materials for events)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/*` (event engine must update crust state variables; no “forces-only” tectonics)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (existing determinism/regime tests; extend for event causality)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (ensure event outputs are published as first-class artifacts, not implied by viz)

### References
- docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md
- docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md

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

Today’s Foundation “tectonics” is derived primarily from segment intensities and history rollups:
- segments: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/*`
- history/tectonics: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*`

There is not currently a dedicated “event engine” that updates crust/provenance as a material model.

### Proposed Change Surface

Expected new op placements:
- Event mechanics are implemented in `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*` to keep the pipeline single-op for now.

Expected artifact updates:
- crust truth artifact (state variables that events mutate): `artifact:foundation.crust`
- provenance truth artifact (lineage/scalars): `artifact:foundation.tectonicProvenance`

### Implementation Decisions

- Event mechanics are implemented by extending `foundation/compute-tectonic-history` to emit event-driven era fields and mesh-space provenance, rather than introducing a separate op (keeps existing pipeline wiring intact while making events canonical).
- Each tectonic segment is treated as a boundary event seed; intraplate hotspot events are seeded from `mantleForcing.upwellingClass` peaks.
- Per-channel force emission uses fixed D06r radii/decays with max-influence scoring + deterministic tie-breaks (score → intensity → eventType → eventIndex).
- Provenance `tracerIndex` is initialized as identity per era for now; full tracer advection is deferred to `LOCAL-TBD-PR-M1-013`.
- Lineage resets use the D06r thresholds (`rift >= 160`, `hotspot volcanism >= 200`, `arc volcanism >= 170`); origin plate is overriding plate for subduction, min plate id for rift/collision, and plateGraph plate for hotspots.
- Event-driven “crust change” is recorded via provenance scalars (`originEra`, `crustAge`) rather than mutating `artifact:foundation.crust` (single-provider constraint).

### Pitfalls / Rakes

- Emitting “event forces” without changing crust/provenance (this makes belt synthesis non-causal).
- Using deck.gl/viz layers as the correctness definition (“looks like a trench”), instead of asserting invariant changes in artifacts.
- Encoding “event classes” in a way that downstream Morphology cannot consume deterministically (must be projected into stable tile drivers via `LOCAL-TBD-PR-M1-002`).

### Wow Scenarios

- **Trenches have receipts:** a subduction corridor produces a trench/belt signal in Morphology that can be traced back to event classification, and provenance shows material lineage consistent with oceanic-under-continental polarity.
