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
- Split:

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

## Prework Prompt (Agent Brief)
- Identify the *actual* feature keys placed by each embellishment op today (the contracts accept `FEATURE_PLACEMENT_KEYS`, but implementations likely only place a subset).
- Expected output: a list of feature keys per op, plus file pointers, so the split set is exact and not speculative.

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
