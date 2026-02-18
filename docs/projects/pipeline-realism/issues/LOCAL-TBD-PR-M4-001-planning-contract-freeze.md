id: LOCAL-TBD-PR-M4-001
title: planning + contract freeze
state: planned
priority: 1
estimate: 8
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, foundation]
parent: null
children: []
blocked_by: []
blocked: [LOCAL-TBD-PR-M4-002, LOCAL-TBD-PR-M4-005]
related_to: [LOCAL-TBD-PR-M4-003, LOCAL-TBD-PR-M4-004]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Freeze the M4 contract and dependency map so all downstream slices execute against one explicit no-shim architecture baseline.

## Deliverables
- Finalized M4 milestone index with explicit issue dependencies, gate mapping, and stack sequencing.
- Contract-freeze matrix for Foundation ops/stages/artifacts/configs with dead-surface removals identified.
- Stack ledger mapping issues to Graphite slices (`S00..S09`) and required verification gates.
- Decision log entries for all locked posture choices used by implementation slices.

## Acceptance Criteria
- [ ] Milestone doc `M4-foundation-domain-axe-cutover.md` exists and includes canonical issue checklist + stack/gate mapping.
- [ ] Contract-freeze matrix explicitly lists break surfaces for ops, stages, artifacts, and configs.
- [ ] No unresolved architecture decisions remain for M4-002..M4-006.
- [ ] Scratch docs (`00-plan`, `master-scratch`, `decision-log`, `stack-ledger`) are initialized and active.

## Testing / Verification
- `rg -n "LOCAL-TBD-PR-M4-00[1-6]" docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`
- `rg -n "S0[0-9]|G[0-5]" docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md`
- `rg -n "lock_3_stage|no_shim|remove_dead" docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md`

## Dependencies / Notes
- Blocks: `LOCAL-TBD-PR-M4-002`, `LOCAL-TBD-PR-M4-005`
- Related: `LOCAL-TBD-PR-M4-003`, `LOCAL-TBD-PR-M4-004`
- Paper trail: `docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Path map
```yaml
files:
  - path: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
    notes: milestone index and sequencing authority
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
    notes: integration ledger and conflict resolution log
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
    notes: explicit architecture decisions
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
    notes: issue to slice to gate mapping
```

### Prework Findings (Complete)
1. Spike produced decision-ready contracts and open decision set; this issue hard-locks those decisions for execution.
2. No additional discovery required before starting M4-002 and M4-005.
