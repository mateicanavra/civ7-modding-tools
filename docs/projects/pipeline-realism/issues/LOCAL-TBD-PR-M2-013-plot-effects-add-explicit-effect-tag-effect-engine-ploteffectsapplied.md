id: LOCAL-TBD-PR-M2-013
title: plot-effects: add explicit effect tag (effect:engine.plotEffectsApplied)
state: planned
priority: 2
estimate: 3
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
- Implement the locked effect tagging decision.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] `plot-effects` contract provides `effect:engine.plotEffectsApplied`.
- [ ] The tag is registered/owned in `$MOD/src/recipes/standard/tags.ts`.

## Testing / Verification
- Gate G0.
- Ensure tag registry includes owner metadata and the step contract `provides` includes the new id.

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-002`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/DECISIONS/DECISION-plot-effects-effect-tag.md`
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

Implement the locked effect tagging decision.

**Acceptance Criteria**
- [ ] `plot-effects` contract provides `effect:engine.plotEffectsApplied`.
- [ ] The tag is registered/owned in `$MOD/src/recipes/standard/tags.ts`.

**Scope boundaries**
- In scope: add a mod-owned effect id and provide it from the step contract.
- Out of scope: adapter-owned verification (can be a later milestone if required).

**Verification**
- Gate G0.
- Ensure tag registry includes owner metadata and the step contract `provides` includes the new id.

**Implementation guidance**
- Complexity: low.

```yaml
files:
  - path: $MOD/src/recipes/standard/tags.ts
    notes: Add `M4_EFFECT_TAGS.engine.plotEffectsApplied` and owner metadata.
  - path: $MOD/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts
    notes: Provide the effect tag.
  - path: $SPIKE/DECISIONS/DECISION-plot-effects-effect-tag.md
    notes: Normative decision.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-plot-effects-effect-tag.md`

---
