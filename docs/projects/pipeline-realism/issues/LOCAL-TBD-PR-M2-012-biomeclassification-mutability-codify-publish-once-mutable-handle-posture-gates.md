id: LOCAL-TBD-PR-M2-012
title: BiomeClassification mutability: codify publish-once mutable handle posture + gates
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
- Make the current artifact mutability posture explicit and guarded.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] Documentation and tests explicitly assert that `biome-edge-refine` mutates `biomeIndex` in-place.
- [ ] Parity harness covers this ordering-sensitive mutation.

## Testing / Verification
- Gate G0.
- Gate G3 (biomeIndex layer remains identical).
```yaml
files:
  - path: $SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md
    notes: Normative decision.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts
    notes: The in-place mutation location.
```

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-002`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md`
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

Make the current artifact mutability posture explicit and guarded.

**Acceptance Criteria**
- [ ] Documentation and tests explicitly assert that `biome-edge-refine` mutates `biomeIndex` in-place.
- [ ] Parity harness covers this ordering-sensitive mutation.

**Scope boundaries**
- In scope: documentation + tests that make the mutability posture explicit and protected.
- Out of scope: switching to immutable republish (explicitly deferred by decision packet).

**Verification**
- Gate G0.
- Gate G3 (biomeIndex layer remains identical).

```yaml
files:
  - path: $SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md
    notes: Normative decision.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts
    notes: The in-place mutation location.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md`

---
