id: LOCAL-TBD-PR-M2-004
title: Compiler-owned op binding: curated public schema + compile translation (features-plan seam)
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
blocked: [LOCAL-TBD-PR-M2-005, LOCAL-TBD-PR-M2-007, LOCAL-TBD-PR-M2-008]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the locked modeling decision for advanced planners:

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] `vegetatedFeaturePlacements` / `wetFeaturePlacements` are step-owned public config keys.
- [ ] Internal per-feature op envelopes exist and default to **disabled**, using `defaultStrategy` override (`StepOpUse`).
- [ ] Stage `compile` translates legacy config keys into internal per-feature op envelopes.
- [ ] Compiler prefill cannot turn optional planners “always on.”

## Testing / Verification
- Gate G0.
- A targeted test that compiles the stage config with advanced keys omitted and asserts the internal per-feature ops remain disabled.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-002`
- Blocks: `LOCAL-TBD-PR-M2-005`, `LOCAL-TBD-PR-M2-007`, `LOCAL-TBD-PR-M2-008`
- Paper trail:
  - `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
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

Implement the locked modeling decision for advanced planners:
- public config keys remain stable
- stage.compile produces internal per-feature op envelopes
- step runtime calls only injected ops

**Acceptance Criteria**
- [ ] `vegetatedFeaturePlacements` / `wetFeaturePlacements` are step-owned public config keys.
- [ ] Internal per-feature op envelopes exist and default to **disabled**, using `defaultStrategy` override (`StepOpUse`).
- [ ] Stage `compile` translates legacy config keys into internal per-feature op envelopes.
- [ ] Compiler prefill cannot turn optional planners “always on.”

**Scope boundaries**
- In scope: stage public schema decoupling + compile translation scaffolding.
- Out of scope: implementing the new atomic ops (owned by later issues).

**Verification**
- Gate G0.
- A targeted test that compiles the stage config with advanced keys omitted and asserts the internal per-feature ops remain disabled.

**Implementation guidance**
- Key technique: use `StepOpUse` (`{ contract, defaultStrategy: "disabled" }`) so compiler prefill is safe.
  - See `$CORE/src/authoring/step/ops.ts` and `$CORE/src/authoring/step/contract.ts`.

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/index.ts
    notes: Decouple stage public schema from the internal step schema; add compile translation.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Internal step contract: declare per-feature ops (disabled by default) and keep only orchestration keys public.
  - path: $SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md
    notes: Normative decision.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`

---
