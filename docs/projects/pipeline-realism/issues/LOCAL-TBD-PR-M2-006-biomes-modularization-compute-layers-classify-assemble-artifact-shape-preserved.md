id: LOCAL-TBD-PR-M2-006
title: Biomes modularization: compute layers -> classify/assemble (artifact shape preserved)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-002]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Split the biome classifier into modular compute layers while preserving the published artifact.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] `artifact:ecology.biomeClassification` output is byte-identical to baseline.
- [ ] Viz keys emitted by `biomes` and `biome-edge-refine` are unchanged.

## Testing / Verification
- Gate G0.
- Gate G3.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-002`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/DECKGL-VIZ.md` (biome `dataTypeKey` inventory)
  - `$SPIKE/CONTRACTS.md` (artifact schema + validation pointers)
  - ---

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Source (Extracted From Milestone, Preserved)

Split the biome classifier into modular compute layers while preserving the published artifact.

**Acceptance Criteria**
- [ ] `artifact:ecology.biomeClassification` output is byte-identical to baseline.
- [ ] Viz keys emitted by `biomes` and `biome-edge-refine` are unchanged.

**Scope boundaries**
- In scope: refactor `ecology/biomes/classify` internals into compute-substrate ops.
- Out of scope: any changes to how biomes are chosen.

**Verification**
- Gate G0.
- Gate G3.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/classify-biomes/**
    notes: Split into compute layers and an assembler; keep strategy outputs identical.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/biomes/index.ts
    notes: Ensure step continues to publish the same artifact.
```

**Paper trail**
- `$SPIKE/DECKGL-VIZ.md` (biome `dataTypeKey` inventory)
- `$SPIKE/CONTRACTS.md` (artifact schema + validation pointers)

---
