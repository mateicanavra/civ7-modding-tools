id: LOCAL-TBD-PR-M2-005
title: Compute substrate scaffolding: ecology feature substrate ops (shared layers)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-004]
blocked: [LOCAL-TBD-PR-M2-007, LOCAL-TBD-PR-M2-008, LOCAL-TBD-PR-M2-009, LOCAL-TBD-PR-M2-010]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Create compute ops that produce reusable, shared layers consumed by multiple per-feature plan ops.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] At least one shared compute substrate op exists for feature planning (river adjacency masks, coastal masks, etc).
- [ ] Substrate ops import `rules/**` for behavior policy and use core helpers (clamp, RNG, typed array utils).

## Testing / Verification
- Gate G0.
- Unit tests for substrate ops (shape + determinism) if cheap; otherwise covered by parity gate.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-004`
- Blocks: `LOCAL-TBD-PR-M2-007`, `LOCAL-TBD-PR-M2-008`, `LOCAL-TBD-PR-M2-009`, `LOCAL-TBD-PR-M2-010`
- Paper trail:
  - `$SPIKE/FEASIBILITY.md` (locked directive: compute substrate model)
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts` (reference substrate pattern)
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

Create compute ops that produce reusable, shared layers consumed by multiple per-feature plan ops.

**Acceptance Criteria**
- [ ] At least one shared compute substrate op exists for feature planning (river adjacency masks, coastal masks, etc).
- [ ] Substrate ops import `rules/**` for behavior policy and use core helpers (clamp, RNG, typed array utils).

**Scope boundaries**
- In scope: compute ops + rules modules.
- Out of scope: switching `features-plan` runtime to use them (that cutover happens in `LOCAL-TBD-PR-M2-011`).

**Verification**
- Gate G0.
- Unit tests for substrate ops (shape + determinism) if cheap; otherwise covered by parity gate.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops
    notes: Add new compute ops under a consistent compute-substrate naming scheme.
  - path: $CORE/src/lib
    notes: Search for generic helpers first (clamp, RNG, adjacency helpers).
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (locked directive: compute substrate model)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts` (reference substrate pattern)

---
