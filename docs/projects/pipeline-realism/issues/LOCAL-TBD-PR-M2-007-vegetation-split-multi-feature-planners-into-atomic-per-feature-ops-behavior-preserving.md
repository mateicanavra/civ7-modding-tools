id: LOCAL-TBD-PR-M2-007
title: Vegetation: split multi-feature planners into atomic per-feature ops (behavior-preserving)
state: planned
priority: 2
estimate: 16
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-004, LOCAL-TBD-PR-M2-005]
blocked: [LOCAL-TBD-PR-M2-011]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Replace multi-feature vegetation planners with atomic per-feature plan ops:

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] There is one plan op per vegetated feature key.
- [ ] Behavior matches baseline (parity diff is empty).
- [ ] RNG label strings and per-label call order are preserved.

## Testing / Verification
- Gate G0.
- Gate G3.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-005`
- Blocks: `LOCAL-TBD-PR-M2-011`
- Paper trail:
  - `$SPIKE/FEASIBILITY.md` (atomic per-feature ops + compute substrate is locked)
  - `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md` (config compatibility posture)
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

Replace multi-feature vegetation planners with atomic per-feature plan ops:
- `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`, `FEATURE_SAVANNA_WOODLAND`, `FEATURE_SAGEBRUSH_STEPPE`

**Acceptance Criteria**
- [ ] There is one plan op per vegetated feature key.
- [ ] Behavior matches baseline (parity diff is empty).
- [ ] RNG label strings and per-label call order are preserved.

**Scope boundaries**
- In scope: new per-feature plan ops + rules factoring.
- Out of scope: tuning rules.

**Verification**
- Gate G0.
- Gate G3.

**Implementation guidance**
- Complexity: high (RNG-sensitive; multi-feature split).
- Preserve RNG semantics: `createLabelRng` is per-label LCG; order within each label matters.
  - See `$CORE/src/lib/rng/label.ts`.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/features-plan-vegetation/**
    notes: This is currently multi-feature; it must be split.
  - path: $MOD/src/domain/ecology/ops/plan-vegetated-feature-placements/**
    notes: Advanced multi-feature placement op; replace with per-feature ops.
  - path: $MOD/src/domain/ecology/ops/plan-vegetated-feature-placements/rules/**
    notes: Reuse/extend rules; do not move policy into steps.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (atomic per-feature ops + compute substrate is locked)
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md` (config compatibility posture)

---
