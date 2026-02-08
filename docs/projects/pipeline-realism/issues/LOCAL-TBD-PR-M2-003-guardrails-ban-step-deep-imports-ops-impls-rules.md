id: LOCAL-TBD-PR-M2-003
title: Guardrails: ban step deep-imports (ops impls, rules)
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
- Prevent regressions where steps bypass op binding/normalization or import behavior policy.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] Gate G1 and Gate G2 are enforced (CI or deterministic local check).
- [ ] `features-plan` no longer contains manual `normalize` calls to domain ops.

## Testing / Verification
- Run Gate G1 and Gate G2.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-002`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/FEASIBILITY.md` (caveat: features-plan seam)
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

Prevent regressions where steps bypass op binding/normalization or import behavior policy.

**Acceptance Criteria**
- [ ] Gate G1 and Gate G2 are enforced (CI or deterministic local check).
- [ ] `features-plan` no longer contains manual `normalize` calls to domain ops.

**Scope boundaries**
- In scope: guard scripts, lint rules, or tests.
- Out of scope: refactor work.

**Verification**
- Run Gate G1 and Gate G2.

**Implementation guidance**
- Prefer deterministic `rg`-based checks if lint integration is expensive.

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: This is the known drift location.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Remove custom schema logic once internal op binding is compiler-owned.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (caveat: features-plan seam)

---
