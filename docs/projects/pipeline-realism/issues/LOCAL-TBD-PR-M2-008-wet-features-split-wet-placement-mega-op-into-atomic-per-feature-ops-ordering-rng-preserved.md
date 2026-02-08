id: LOCAL-TBD-PR-M2-008
title: Wet features: split wet-placement mega-op into atomic per-feature ops (ordering + RNG preserved)
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
- Replace `ecology/features/wet-placement` with atomic per-feature ops:

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] One plan op per wet feature key.
- [ ] Step orchestration preserves precedence order across wet features.
- [ ] Parity diff is empty.

## Testing / Verification
- Gate G0.
- Gate G3.
- Advanced toggles scenario: when `wetFeaturePlacements` is omitted, extra wet feature planners must remain disabled by default.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-005`
- Blocks: `LOCAL-TBD-PR-M2-011`
- Paper trail:
  - `$SPIKE/FEASIBILITY.md` (hard seam: advanced planners + defaults)
  - `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
  - `$SPIKE/CONTRACT-MATRIX.md`
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

Replace `ecology/features/wet-placement` with atomic per-feature ops:
- `FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`

**Acceptance Criteria**
- [ ] One plan op per wet feature key.
- [ ] Step orchestration preserves precedence order across wet features.
- [ ] Parity diff is empty.

**Scope boundaries**
- In scope: new per-feature wet planners + any shared compute substrate they require (river adjacency masks, coastal checks), preserving precedence and RNG labeling.
- Out of scope: tuning chances/rules or introducing new wet feature keys.

**Verification**
- Gate G0.
- Gate G3.
- Advanced toggles scenario: when `wetFeaturePlacements` is omitted, extra wet feature planners must remain disabled by default.

**Implementation guidance**
- Complexity: high (ordering-sensitive; RNG-sensitive).
- Preserve precedence from the original mega-op by orchestrating per-feature ops in the same effective order.
  - Evidence (current precedence + label keys): `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/strategies/default.ts`

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-wet-feature-placements/**
    notes: Multi-feature op to replace.
  - path: $MOD/src/domain/ecology/ops/plan-wet-feature-placements/rules/**
    notes: Keep policy in rules.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (hard seam: advanced planners + defaults)
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
- `$SPIKE/CONTRACT-MATRIX.md`

---
