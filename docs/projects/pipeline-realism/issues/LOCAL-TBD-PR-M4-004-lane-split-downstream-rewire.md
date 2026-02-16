id: LOCAL-TBD-PR-M4-004
title: lane split + downstream rewire
state: planned
priority: 1
estimate: 16
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, foundation, morphology]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M4-003, LOCAL-TBD-PR-M4-005]
blocked: [LOCAL-TBD-PR-M4-006]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Execute the hard lane cutover from Foundation-owned map-facing projection artifacts to `artifact:map.*`, with complete downstream consumer rewires and no dual publish.

Current implementation still publishes the projection tensors as `artifact:foundation.*` and the downstream consumer wiring remains unchanged; this issue documents the migration so slice `S07` can execute the hard lane cut once the projection stage is ready to hand off `artifact:map.foundation*`.

## Deliverables
- Complete downstream consumer inventory for old `artifact:foundation.*` projection outputs.
- Contract rewiring plan to new `artifact:map.*` ownership.
- No-dual-publish acceptance matrix and migration checks.
- Cutover verification suite for consumer completeness and compile integrity.

## Acceptance Criteria
- [ ] Every known downstream consumer of map-facing Foundation projection artifacts is rewired in the cutover plan.
- [ ] No dual-publish bridge path is allowed in planned final state, and the `S07` lane-cut slice gates the actual namespace transition so no runtime consumer assumes the new artifact IDs yet.
- [ ] Lane split verification commands are defined for compile + contract reads.
- [ ] Morphology contract rewires are explicitly enumerated.

## Testing / Verification
- `rg -n "artifact:foundation\.(plates|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles|tileToCellIndex)" mods/mod-swooper-maps/src/recipes/standard/stages`
- `rg -n "artifact:map\." mods/mod-swooper-maps/src/recipes/standard`
- `rg -n "dual publish|no-dual|lane split" docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-C-lane-and-downstream.md`
- Planned compile check command: `bun run --cwd mods/mod-swooper-maps check`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M4-003`, `LOCAL-TBD-PR-M4-005`
- Blocks: `LOCAL-TBD-PR-M4-006`
- Paper trail: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-D-integration-wiring-contracts.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Path map
```yaml
files:
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts
    notes: source projection artifacts and tags
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts
    notes: downstream consumer surface
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts
    notes: downstream consumer surface
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts
    notes: downstream consumer surface
  - path: mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts
    notes: target map-facing artifact namespace
```

### Prework Findings (Complete)
1. Lane split options are resolved; phased hard split with no final bridges is locked.
2. Downstream primary consumers are identified from spike evidence and seeded into verification commands.
