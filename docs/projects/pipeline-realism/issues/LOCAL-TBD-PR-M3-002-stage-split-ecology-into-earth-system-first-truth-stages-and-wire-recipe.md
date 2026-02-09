id: LOCAL-TBD-PR-M3-002
title: Stage split: earth-system-first truth stages for ecology + recipe wiring cutover (M3)
state: planned
priority: 1
estimate: 16
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-001]
blocked: [LOCAL-TBD-PR-M3-003, LOCAL-TBD-PR-M3-004, LOCAL-TBD-PR-M3-005, LOCAL-TBD-PR-M3-006, LOCAL-TBD-PR-M3-007, LOCAL-TBD-PR-M3-008, LOCAL-TBD-PR-M3-009]
related_to: [LOCAL-TBD-PR-M2-011]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Replace the single `ecology` truth stage with an ordered set of earth-system-first truth stages plus a dedicated score stage, preserving one projection stage (`map-ecology`).

## Deliverables
- New truth stage modules exist and are wired into the standard recipe in the order locked by the packet:
  - `ecology-pedology`
  - `ecology-biomes` (biome edge refinement integrated; no separate step)
  - `ecology-features-score`
  - `ecology-ice`
  - `ecology-reefs`
  - `ecology-wetlands`
  - `ecology-vegetation`
- Recipe wiring cutover:
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` uses the explicit ordered list above before `mapEcology`.
- Legacy topology removed:
  - the old single truth `ecology` stage is deleted (no shims, no dual wiring).

## Acceptance Criteria
- [ ] `TOPOLOGY.md` stage list exactly matches code stage ids and recipe ordering.
- [ ] Compile-time config boundaries remain correct:
  - each new stage compiles to its own step configs
  - no stage introduces runtime orchestration
  - no stage re-exports authoring SDK extensions
- [ ] Biomes step topology matches packet:
  - no `biome-edge-refine` step exists
  - refinement is integrated inside the single biomes op envelope
- [ ] `map-ecology` remains the only projection stage.

## Testing / Verification
- Baseline build+tests:
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism smoke (pre-M3 behavior change acceptance comes later; this just proves "it runs"):
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-stage-split-smoke`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-001`
- Blocks: `LOCAL-TBD-PR-M3-003` and all planner issues.
- Related: M2 kept topology stable; M3 intentionally changes topology (do not preserve old ids).

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Breadcrumbs (likely touch points)

```yaml
files:
  - path: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
    notes: Replace single truth ecology stage with the ordered stage list from the packet.
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts
    notes: Legacy multiplexer stage; must be deleted (no compatibility wrapper).
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts
    notes: Projection stage remains; it should consume the new truth artifacts without probabilistic gating.
```

