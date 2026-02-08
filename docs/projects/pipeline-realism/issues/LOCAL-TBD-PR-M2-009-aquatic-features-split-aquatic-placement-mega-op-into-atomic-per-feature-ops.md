id: LOCAL-TBD-PR-M2-009
title: Aquatic features: split aquatic-placement mega-op into atomic per-feature ops
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-005]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Split `ecology/features/aquatic-placement` into atomic per-feature ops:

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] One plan op per aquatic feature key.
- [ ] `op-contracts` tests cover the new ops.

## Testing / Verification
- Gate G0.
- `$MOD/test/ecology/op-contracts.test.ts` includes normalization + a smoke run for each new atomic op.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-005`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/CONTRACTS.md` (op inventory)
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

Split `ecology/features/aquatic-placement` into atomic per-feature ops:
- `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ATOLL`, `FEATURE_LOTUS`

**Acceptance Criteria**
- [ ] One plan op per aquatic feature key.
- [ ] `op-contracts` tests cover the new ops.

**Scope boundaries**
- In scope: split the op into atomic per-feature planners + any shared compute substrate they require.
- Out of scope: changing which aquatic features are enabled in the standard recipe (this op is currently unused by the standard recipe; keep it that way unless explicitly adopted later).

**Verification**
- Gate G0.
- `$MOD/test/ecology/op-contracts.test.ts` includes normalization + a smoke run for each new atomic op.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-aquatic-feature-placements/**
    notes: Multi-feature op to replace.
```

**Paper trail**
- `$SPIKE/CONTRACTS.md` (op inventory)

---
