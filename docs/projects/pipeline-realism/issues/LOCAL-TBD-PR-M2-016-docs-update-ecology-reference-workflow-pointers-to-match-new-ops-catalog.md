id: LOCAL-TBD-PR-M2-016
title: Docs: update ECOLOGY reference + workflow pointers to match new ops catalog
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M2-015]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Update canonical docs to match the refactor.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` reflects the new ops catalog and the features-plan modeling posture.
- [ ] Spike docs remain project-scoped; any evergreen rules are promoted into canonical docs.

## Testing / Verification
- Manual doc sanity pass: links resolve; key contracts reflect reality.
```yaml
files:
  - path: docs/system/libs/mapgen/reference/domains/ECOLOGY.md
    notes: Canonical reference.
  - path: $SPIKE/README.md
    notes: Paper trail reference remains valid.
```

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-015`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/DOCS-IMPACT.md`
  - ## Coverage Table (Spike/Decisions -> Issues)
  - | Source | Owner issue(s) |
  - |---|---|
  - | `$SPIKE/FEASIBILITY.md` | `LOCAL-TBD-PR-M2-001..016` |
  - | `DECISION-features-plan-advanced-planners` | `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-011` |
  - | `DECISION-step-topology` | `LOCAL-TBD-PR-M2-004` (topology stable; modularize via ops) |
  - | `DECISION-biomeclassification-mutability` | `LOCAL-TBD-PR-M2-012` |
  - | `DECISION-plot-effects-effect-tag` | `LOCAL-TBD-PR-M2-013` |
  - | `DECISION-map-ecology-split` | `LOCAL-TBD-PR-M2-013` (keep topology; tag boundary) |
  - ## Suggested Graphite Stacks (How We Land It Reviewably)

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

Update canonical docs to match the refactor.

**Acceptance Criteria**
- [ ] `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` reflects the new ops catalog and the features-plan modeling posture.
- [ ] Spike docs remain project-scoped; any evergreen rules are promoted into canonical docs.

**Scope boundaries**
- In scope: update canonical reference docs and link to the spike/feasibility paper trail; remove stale references.
- Out of scope: rewriting explanation/spec docs beyond what is required to keep references correct.

**Verification**
- Manual doc sanity pass: links resolve; key contracts reflect reality.

```yaml
files:
  - path: docs/system/libs/mapgen/reference/domains/ECOLOGY.md
    notes: Canonical reference.
  - path: $SPIKE/README.md
    notes: Paper trail reference remains valid.
```

**Paper trail**
- `$SPIKE/DOCS-IMPACT.md`

## Coverage Table (Spike/Decisions -> Issues)

| Source | Owner issue(s) |
|---|---|
| `$SPIKE/FEASIBILITY.md` | `LOCAL-TBD-PR-M2-001..016` |
| `DECISION-features-plan-advanced-planners` | `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-011` |
| `DECISION-step-topology` | `LOCAL-TBD-PR-M2-004` (topology stable; modularize via ops) |
| `DECISION-biomeclassification-mutability` | `LOCAL-TBD-PR-M2-012` |
| `DECISION-plot-effects-effect-tag` | `LOCAL-TBD-PR-M2-013` |
| `DECISION-map-ecology-split` | `LOCAL-TBD-PR-M2-013` (keep topology; tag boundary) |

## Suggested Graphite Stacks (How We Land It Reviewably)

**Stack A — Gates + guardrails (must land first)**
- `LOCAL-TBD-PR-M2-001` → `002` → `003` → `014`

**Stack B — Compiler binding seam**
- `LOCAL-TBD-PR-M2-004`

**Stack C — Substrate + biomes modularization**
- `LOCAL-TBD-PR-M2-005` → `006`

**Stack D — Feature planners (atomic ops) + features-plan cutover**
- `LOCAL-TBD-PR-M2-007` → `008` → `011`

**Stack E — Secondary planners (aquatic + embellishments)**
- `LOCAL-TBD-PR-M2-009` → `010`

**Stack F — Gameplay boundary + cleanup + docs**
- `LOCAL-TBD-PR-M2-012` → `013` → `015` → `016`

## Risks

- **RNG drift due to refactor ordering:** `createLabelRng` is per-label LCG; order within each label matters.
  - Mitigation: preserve label strings and the per-label call ordering; enforce parity dumps.
- **Compiler prefill footgun turns optional planners on:** declaring ops in `contract.ops` causes defaults to exist.
  - Mitigation: `StepOpUse.defaultStrategy = "disabled"` for internal per-feature ops.
- **Viz regressions due to key churn:** Studio grouping depends on `dataTypeKey`/`spaceId`.
  - Mitigation: explicit viz inventory gate.

## Open Questions (Minimized; Convert To Prework If Needed)

None required beyond the embedded prework prompts.
