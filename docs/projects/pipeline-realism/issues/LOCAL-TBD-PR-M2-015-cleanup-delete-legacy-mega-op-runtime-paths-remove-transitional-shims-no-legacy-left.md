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

### Prework Results (Resolved)

Result: **no external runtime consumers** of the legacy mega-op ids were found outside the standard recipe/test surfaces.

Evidence (search-based):
- `rg "ecology/features/(plan-vegetation|vegetated-placement|wet-placement|aquatic-placement|vegetation-embellishments|reef-embellishments)"`:
  - matches only the op contract definitions + docs (no other runtime call sites).
- `rg "from \\\"@mapgen/domain/ecology/ops\\\""`:
  - runtime: standard recipe wiring (`mods/mod-swooper-maps/src/recipes/standard/recipe.ts`) and the known drift (`.../features-plan/index.ts`)
  - non-runtime: ecology tests under `mods/mod-swooper-maps/test/ecology/**` and archived docs.

Conclusion:
- No additional “migration sub-issue” is required for third-party consumers.
- Cleanup can delete legacy mega-op runtime paths once `LOCAL-TBD-PR-M2-011` has cut over `features-plan` and gates are green.

**Implementation anchors**

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
