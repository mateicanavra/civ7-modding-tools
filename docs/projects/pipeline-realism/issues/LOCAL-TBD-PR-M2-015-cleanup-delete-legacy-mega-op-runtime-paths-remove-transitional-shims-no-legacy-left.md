id: LOCAL-TBD-PR-M2-015
title: Cleanup: delete legacy mega-op runtime paths + remove transitional shims (no legacy left)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-011]
blocked: [LOCAL-TBD-PR-M2-016]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Remove legacy code paths after gates are green.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] No legacy mega-op remains in the runtime path.
- [ ] Transitional compile shims have explicit deletion targets and are removed by end of milestone.

## Testing / Verification
- Gate G0.
- Gate G1/G2 (no step bypasses remain).
- Gate G3/G4 (parity + viz keys unchanged).

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-011`
- Blocks: `LOCAL-TBD-PR-M2-016`
- Paper trail:
  - `$SPIKE/DRIFT.md` (removal targets correspond to recorded drift)
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

Remove legacy code paths after gates are green.

**Acceptance Criteria**
- [ ] No legacy mega-op remains in the runtime path.
- [ ] Transitional compile shims have explicit deletion targets and are removed by end of milestone.

**Scope boundaries**
- In scope: delete legacy implementations and transitional compile/binding shims once parity gates are green.
- Out of scope: any “keep forever” compatibility bridges (every bridge must have a deletion target inside this milestone).

**Verification**
- Gate G0.
- Gate G1/G2 (no step bypasses remain).
- Gate G3/G4 (parity + viz keys unchanged).

## Prework Prompt (Agent Brief)
- Search for external usages of legacy mega-ops (outside standard recipe).
- Expected output: a yes/no list; if any exist, add a migration sub-issue before deleting.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/contracts.ts
    notes: Update op registry exports.
  - path: $MOD/test/ecology/op-contracts.test.ts
    notes: Update to the new op catalog.
```

**Paper trail**
- `$SPIKE/DRIFT.md` (removal targets correspond to recorded drift)

---
