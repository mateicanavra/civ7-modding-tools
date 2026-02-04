id: LOCAL-TBD-PR-M1-006
title: Basaltic lid init + lithosphere strength (mantle-coupled)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-001, LOCAL-TBD-PR-M1-005]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Initialize t=0 as a global basaltic (oceanic) lid and produce mantle-coupled lithosphere strength fields that upstream partition/events can treat as authoritative resistance.

## Deliverables
- Update the crust initialization model to the SPEC’s posture:
  - t=0 starts as oceanic/basaltic lid everywhere (no pre-authored continents),
  - “continents/cratons” must emerge through evolution + events + provenance, not initial random assignment.
- Define (and emit as part of the canonical crust state) the lithosphere resistance/strength surfaces required by:
  - plate partition resistance (D01),
  - event mechanics (D06r),
  - and provenance update rules (D04r).
- Document the post-cutover semantics in the project spec sections and decision packet (do not rely on “tribal knowledge” of what fields mean).

## Acceptance Criteria
- Running a Foundation-only pipeline produces a crust state consistent with “basaltic lid at t=0” (no “continentalRatio” semantics remain authoritative).
- Lithosphere strength/resistance fields exist and are:
  - bounded (explicit numeric ranges),
  - deterministic,
  - and consumed by partition/event codepaths (no duplicated strength computation elsewhere).
- Any transitional bridging that preserves legacy “continentalRatio” behavior is explicitly:
  - labeled as transitional,
  - blocked on deletion (`LOCAL-TBD-PR-M1-023..025`), and
  - excluded from maximal-authoring surfaces (D08r).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend a Foundation-level test that asserts the initial crust starts oceanic everywhere (at t=0), for a small mesh:
  - new test file under `mods/mod-swooper-maps/test/foundation/` (recommended).
- Identify and update any downstream tests that currently assume “initial continents”:
  - example current assumption: `mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts`

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-001`
  - `LOCAL-TBD-PR-M1-005`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` and `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (current “continental ratio” crust init to replace)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts` and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts` (step wiring + requires/provides)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (crust artifact schema/ids; strength/resistance fields must be first-class)
- `mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts` (downstream assumptions about initial continents; must be updated)
- `mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts` (mesh-first posture test patterns to extend)

### References
- docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md
- docs/projects/pipeline-realism/resources/decisions/d05r-crust-state-canonical-variables.md
- docs/system/libs/mapgen/reference/domains/FOUNDATION.md

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

Current Foundation crust generation is “continental ratio” driven:
- op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts`
- contract: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts`

Downstream Morphology currently treats crustTiles type/isostasy as an initial continent/ocean separator (example):
- `mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts`

### Proposed Change Surface

Expected touchpoints:
- crust op + schema: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/*`
- crust step wiring: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts`
- any consumers that assume initial continents (Morphology baseline, partition heuristics).

### Pitfalls / Rakes

- Leaving legacy “continentalRatio” semantics implicitly active while also adding basaltic-lid semantics (“two truths”).
- Updating crust init but forgetting to update partition/events to consume the new strength/resistance surfaces (then the lid is just a rename).
- Breaking Morphology in a way that makes failures look like “mountain tuning problems” rather than “driver semantics changed.” Call this out early in test failures.

### Wow Scenarios

- **Continents as consequences:** belts and continental emergence can be traced to event history + provenance, instead of being a randomized initial condition that tectonics merely decorates.
