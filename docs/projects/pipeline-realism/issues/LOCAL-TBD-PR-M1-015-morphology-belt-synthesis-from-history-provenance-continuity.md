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

## Implementation Decisions

### Seed belts from history/provenance tiles (defer explicit segment projection)
- **Context:** The spec prefers segment-derived corridors, but the current pipeline does not expose a tile-level segment projection artifact.
- **Options:** (A) build an ad-hoc segment→tile projection inside Morphology, (B) seed belts from `tectonicHistoryTiles`/`tectonicProvenanceTiles` boundary regimes and enforce continuity in tile space.
- **Choice:** Option B.
- **Rationale:** Keeps Morphology tile-first and uses the canonical projected history/provenance drivers that are already required; avoids introducing a one-off segment projection surface.
- **Risk:** If segment topology diverges from era boundary projections, belt continuity may deviate from segment intent until a dedicated segment tile projection is introduced.

### Approximate anisotropic diffusion with seed-based isotropic diffusion
- **Context:** The contract specifies anisotropic diffusion along belt tangents, but we do not yet have a stable tangent field for belts in tile space.
- **Options:** (A) delay diffusion until a tangent field exists, (B) use isotropic diffusion with belt-seed width/age parameters and enforce monotonic decay.
- **Choice:** Option B.
- **Rationale:** Delivers age-aware belt widening now and preserves determinism while keeping a clear path to upgrade to anisotropic diffusion later.
- **Risk:** Belt shapes may be rounder than intended; correlation gates may need tighter tuning once anisotropic tangents land.

### Propagate belt drivers from nearest belt seed
- **Context:** Diffusion belts can create non-zero boundaryCloseness outside the original driver tiles.
- **Options:** (A) keep per-tile blended drivers unchanged, (B) propagate driver magnitudes from the nearest belt seed alongside boundaryCloseness.
- **Choice:** Option B.
- **Rationale:** Ensures belt regions carry causal driver intensity instead of “empty” belts, aligning orogeny potential with diffusion width.
- **Risk:** Localized driver variation inside belts may be smoothed more than desired until per-belt tangent-aware diffusion is implemented.
