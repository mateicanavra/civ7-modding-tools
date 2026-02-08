id: LOCAL-TBD-PR-M2-014
title: DeckGL/Studio compatibility: enforce stable ecology dataTypeKeys + spaceIds
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
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Make viz identity stable and enforceable.

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] Gate G4 exists and is green.
- [ ] Any refactor that changes a `dataTypeKey` requires an explicit migration table + updated baseline.

## Testing / Verification
- Gate G0.
- Gate G4 (inventory diff is empty).

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M2-001`
- Blocks: (none)
- Paper trail:
  - `$SPIKE/DECKGL-VIZ.md`
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

Make viz identity stable and enforceable.

**Acceptance Criteria**
- [ ] Gate G4 exists and is green.
- [ ] Any refactor that changes a `dataTypeKey` requires an explicit migration table + updated baseline.

**Scope boundaries**
- In scope: enforce stable viz identity for existing keys (including debug keys treated as compatibility surface for this milestone).
- Out of scope: introducing new viz taxonomies; additive keys are allowed but must not rename/remove existing keys.

**Verification**
- Gate G0.
- Gate G4 (inventory diff is empty).

**Implementation guidance**
- Complexity: medium (tooling + fixtures).

```yaml
files:
  - path: $SPIKE/DECKGL-VIZ.md
    notes: Source of truth for ecology viz keys.
  - path: docs/system/libs/mapgen/pipeline-visualization-deckgl.md
    notes: Canonical viz posture.
```

**Paper trail**
- `$SPIKE/DECKGL-VIZ.md`

---
