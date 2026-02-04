id: LOCAL-TBD-PR-M1-015
title: Morphology belt synthesis from history/provenance (continuity + age-aware diffusion)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-014, LOCAL-TBD-PR-M1-013]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement belt synthesis driven by history/provenance tiles: wide belts, continuity, age-aware diffusion.

## Deliverables
- Implement belt synthesis driven by the new mandatory tile drivers:
  - consume `artifact:foundation.tectonicHistoryTiles` and `artifact:foundation.tectonicProvenanceTiles`,
  - and produce stable Morphology driver tensors that downstream ops can interpret deterministically.
- Encode belt continuity + “no wall mountains” by construction:
  - belts must be wide and continuous along event corridors (not single-tile walls),
  - diffusion must be age-aware (provenance/history controls smoothing and decay).
- Ensure correlation is explicit:
  - belt outputs must be traceable to driver signals (event corridors, uplift opportunity, provenance age/lineage),
  - and later gates (`LOCAL-TBD-PR-M1-020`) can validate correlation quantitatively.

## Acceptance Criteria
- Belts are produced primarily from causal drivers (history/provenance), not from fractal noise:
  - noise-only inputs cannot produce belts (regression guard).
- Belt continuity is measurable:
  - for a synthetic corridor input, belts form a contiguous region rather than sparse spikes.
- Age-aware diffusion is measurable:
  - “older” provenance yields broader/softer belts compared to “new” provenance at equal event intensity (or as specified by the Morphology contract).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Extend existing Morphology correlation regression tests to cover the new driver posture:
  - `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (pattern: belts correlate to convergence; noise-only cannot create belts)
- Add a continuity test:
  - synthetic corridor input => contiguous belt mask (new test file under `mods/mod-swooper-maps/test/morphology/` recommended).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-014`
  - `LOCAL-TBD-PR-M1-013`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (new mandatory tile drivers live as `foundationArtifacts.*`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (current belt planning reads driver tensors from `deps.artifacts.foundationPlates`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (artifact requires currently hardcode `foundationArtifacts.plates`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges-and-foothills/contract.ts` (current input driver tensor schema; this is the “target surface” to rebuild from history/provenance)
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (correlation + “noise-only cannot create belts” style guards)

### References
- docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md
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

Morphology belt/mountain planning today is driven by tile-space tensors such as:
- `boundaryType`, `upliftPotential`, `tectonicStress`, etc.
Example correlation guard:
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`

Those drivers are currently sourced from `artifact:foundation.plates` (legacy driver tensors).

### Proposed Change Surface

Expected implementation touchpoints:
- Morphology driver extraction/wiring in standard recipe:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/**`
- Morphology ops that consume belt drivers (do not change op contracts unless necessary):
  - `mods/mod-swooper-maps/src/domain/morphology/ops/*`

The goal is to keep downstream op contracts stable where possible by regenerating equivalent driver tensors from the new history/provenance tile artifacts.

### Pitfalls / Rakes

- “Wall mountains”: producing a narrow, high-amplitude ridge mask from an overly local driver without diffusion/continuity rules.
- Making belts depend on un-auditable noise sources (fractal masks overpowering causal drivers).
- Breaking existing “physics anchored” regression tests without replacing them with equivalent causal assertions.

### Wow Scenarios

- **Belts reflect tectonic memory:** two otherwise identical corridors produce different belt width/shape when provenance age differs, and a human can see that as “older orogeny is broader/eroded” rather than random variance.
