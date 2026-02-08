id: LOCAL-TBD-PR-M2-002
title: Contract freeze: compatibility ledger + enforcement tests
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-001]
blocked: [LOCAL-TBD-PR-M2-003, LOCAL-TBD-PR-M2-004, LOCAL-TBD-PR-M2-006, LOCAL-TBD-PR-M2-012, LOCAL-TBD-PR-M2-013]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Lock what we promise not to change, and make it mechanically checkable.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] A compatibility ledger exists (ids, viz keys, RNG labels) and is referenced by tests.
- [ ] At least one test fails loudly if:
  - step ids change
  - artifact ids change
  - ecology `dataTypeKey` emissions disappear/rename

## Testing / Verification
- Run Gate G0.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-001`
- Blocks: `LOCAL-TBD-PR-M2-003`, `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-006`, `LOCAL-TBD-PR-M2-012`, `LOCAL-TBD-PR-M2-013`
- Paper trail:
  - `$SPIKE/CONTRACT-MATRIX.md`
  - `$SPIKE/FEASIBILITY.md`
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

Lock what we promise not to change, and make it mechanically checkable.

**Acceptance Criteria**
- [ ] A compatibility ledger exists (ids, viz keys, RNG labels) and is referenced by tests.
- [ ] At least one test fails loudly if:
  - step ids change
  - artifact ids change
  - ecology `dataTypeKey` emissions disappear/rename

**Scope boundaries**
- In scope: tests/fixtures that encode the compatibility surfaces.
- Out of scope: refactor work.

**Verification**
- Run Gate G0.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $SPIKE/CONTRACT-MATRIX.md
    notes: Source of truth for what surfaces must remain stable.
  - path: $MOD/test/ecology/*.test.ts
    notes: Add/extend tests that enforce the ledger.
```

**Paper trail**
- `$SPIKE/CONTRACT-MATRIX.md`
- `$SPIKE/FEASIBILITY.md`

---
