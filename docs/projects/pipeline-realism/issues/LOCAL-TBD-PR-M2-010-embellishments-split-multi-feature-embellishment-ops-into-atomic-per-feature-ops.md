id: LOCAL-TBD-PR-M2-010
title: Embellishments: split multi-feature embellishment ops into atomic per-feature ops
state: planned
priority: 2
estimate: 16
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
- Split vegetation/reef embellishment mega-ops into atomic per-feature embellishment ops (behavior-preserving).

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] One plan op per embellishment feature key.
- [ ] Rules/policy are in `rules/**` modules.

## Testing / Verification
- Gate G0.
- `op-contracts` tests updated to include the new atomic embellishment ops.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-005`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/CONTRACTS.md` (op inventory)

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

Split:
- `ecology/features/vegetation-embellishments`
- `ecology/features/reef-embellishments`

into atomic per-feature embellishment ops.

**Acceptance Criteria**
- [ ] One plan op per embellishment feature key.
- [ ] Rules/policy are in `rules/**` modules.

**Scope boundaries**
- In scope: split embellishment mega-ops into atomic per-feature ops, preserving behavior for any consumers that may be wired later.
- Out of scope: new embellishment behavior or tuning (this is architecture alignment only).

**Verification**
- Gate G0.
- `op-contracts` tests updated to include the new atomic embellishment ops.

**Implementation guidance**
- Complexity: medium-high (feature-key surface is broad).

### Prework Results (Resolved)

Actual feature-key subset placed today (so the atomic split set is exact, not speculative):

- `ecology/features/vegetation-embellishments` places:
  - `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`
  - Evidence: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/strategies/default.ts`
- `ecology/features/reef-embellishments` places:
  - `FEATURE_REEF`
  - Evidence: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/strategies/default.ts`

**Implementation anchors**

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-vegetation-embellishments/**
    notes: Multi-feature op to split.
  - path: $MOD/src/domain/ecology/ops/plan-reef-embellishments/**
    notes: Multi-feature op to split.
```

**Paper trail**
- `$SPIKE/CONTRACTS.md` (op inventory)

---
