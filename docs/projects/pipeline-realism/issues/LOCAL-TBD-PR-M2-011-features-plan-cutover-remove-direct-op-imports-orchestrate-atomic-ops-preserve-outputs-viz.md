id: LOCAL-TBD-PR-M2-011
title: features-plan cutover: remove direct op imports; orchestrate atomic ops; preserve outputs + viz
state: planned
priority: 2
estimate: 16
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-007, LOCAL-TBD-PR-M2-008]
blocked: [LOCAL-TBD-PR-M2-015]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Perform the main cutover of `features-plan` to the new architecture:

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] Gate G1 + G2 are green.
- [ ] `artifact:ecology.featureIntents` matches baseline.
- [ ] `dataTypeKey: ecology.featureIntents.featureType` emission is unchanged.

## Testing / Verification
- Gate G0.
- Gate G1 and Gate G2.
- Gate G3.
- Scenario: omit `vegetatedFeaturePlacements` and `wetFeaturePlacements` and assert the internal per-feature ops remain disabled (no new placements).

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-007`, `LOCAL-TBD-PR-M2-008`
- Blocks: `LOCAL-TBD-PR-M2-015`
- Paper trail:
  - `$SPIKE/FEASIBILITY.md`
  - `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
  - `$SPIKE/DECISIONS/DECISION-step-topology.md` (topology stable; modularize via ops)
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

Perform the main cutover of `features-plan` to the new architecture:
- no direct op imports
- orchestration in the step
- atomic ops only
- outputs/viz unchanged

**Acceptance Criteria**
- [ ] Gate G1 + G2 are green.
- [ ] `artifact:ecology.featureIntents` matches baseline.
- [ ] `dataTypeKey: ecology.featureIntents.featureType` emission is unchanged.

**Scope boundaries**
- In scope: switch the runtime path to injected atomic ops only (no direct imports), preserve public config entrypoints via stage.compile translation.
- Out of scope: changing the set of feature intents produced.

**Verification**
- Gate G0.
- Gate G1 and Gate G2.
- Gate G3.
- Scenario: omit `vegetatedFeaturePlacements` and `wetFeaturePlacements` and assert the internal per-feature ops remain disabled (no new placements).

**Implementation guidance**
- Complexity: high (central wiring + parity sensitivity).

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: Remove `ecologyOps` import; call injected ops; keep viz output stable.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Declare internal per-feature ops (disabled default) and remove manual schema bypasses.
  - path: $MOD/src/recipes/standard/stages/ecology/index.ts
    notes: Ensure stage.compile produces the internal config shape.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md`
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
- `$SPIKE/DECISIONS/DECISION-step-topology.md` (topology stable; modularize via ops)

---
