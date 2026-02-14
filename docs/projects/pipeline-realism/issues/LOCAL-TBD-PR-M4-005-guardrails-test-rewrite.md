id: LOCAL-TBD-PR-M4-005
title: guardrails + test rewrite
state: planned
priority: 1
estimate: 8
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, testing]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M4-001]
blocked: [LOCAL-TBD-PR-M4-004, LOCAL-TBD-PR-M4-006]
related_to: [LOCAL-TBD-PR-M4-002, LOCAL-TBD-PR-M4-003]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Activate strict no-legacy architecture enforcement via CI + structural scans, and rewrite tests to prevent reintroduction of shims or dual paths.

## Deliverables
- Required CI gate plan for G1/G2, plus explicit G5 handoff contract to M4-006.
- Structural test suite plan: op-calls-op, no dual contracts, no shim surfaces, topology lock.
- Contract-consistency test rewrites aligned to new stage/op/lane boundaries.
- Guardrail rollout matrix by slice.

## Acceptance Criteria
- [ ] Strict core commands are defined as required status checks.
- [ ] Structural scans/tests are mapped to explicit files or scripts.
- [ ] Legacy-surface denylist posture is documented with enforcement semantics.
- [ ] Guardrail sequencing is aligned to slice order (`S05`, `S06`), with final no-legacy closeout (`G5`) delegated to M4-006.

## Testing / Verification
- `bun run lint`
- `bun run lint:adapter-boundary`
- `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
- `bun run check`
- `rg -n "no-op-calls-op|no-dual|no-shim|topology" docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-D-testing-guardrails.md`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M4-001`
- Blocks: `LOCAL-TBD-PR-M4-004`, `LOCAL-TBD-PR-M4-006`
- Related: `LOCAL-TBD-PR-M4-002`, `LOCAL-TBD-PR-M4-003`
- Paper trail: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-F-testing-docs-guardrails.md`
- Final `S09` ownership remains under `LOCAL-TBD-PR-M4-006`.

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
  - path: .github/workflows/ci.yml
    notes: required status/check wiring target
  - path: scripts/lint/lint-domain-refactor-guardrails.sh
    notes: strict profile enforcement
  - path: scripts/lint/lint-adapter-boundary.sh
    notes: adapter boundary required gate
  - path: mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts
    notes: baseline no-legacy scan reference
```

### Prework Findings (Complete)
1. Existing CI gap analysis is complete in spike outputs; no additional discovery required before issue execution.
2. Policy precedence is locked to strict no-shim for M4.
