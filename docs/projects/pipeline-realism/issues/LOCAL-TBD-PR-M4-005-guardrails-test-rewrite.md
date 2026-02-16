id: LOCAL-TBD-PR-M4-005
title: guardrails + test rewrite
state: landed
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
- Enforce strict no-legacy architecture via CI + structural scans, and keep tests strict enough to prevent reintroduction of shims/dual paths — including Studio/typegen verification for authored recipe surfaces.

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
- `DOMAIN_REFACTOR_GUARDRAILS_PROFILE=boundary bun run lint:domain-refactor-guardrails` (auto-detect all ops-backed domains)
- `REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails` (strict profile scoped to Foundation)
- `bun run check`
- `bun run test:architecture-cutover`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run dev:mapgen-studio` (smoke: confirm Studio boots and typegen does not crash on the Standard recipe)
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

### Anchor Pass Verification (2026-02-15)
```yaml
anchor_pass_2026_02_15:
  findings_synced:
    - ANCHOR-F001
    - ANCHOR-F002
    - ANCHOR-F004
  structural_verification:
    - test/foundation/no-op-calls-op-tectonics.test.ts: pass
    - no_rule_reexport_shims_scan: pass
    - foundation_stage_compile_scan: pass
  command_verification:
    - bun run --cwd mods/mod-swooper-maps check: pass
    - bun run --cwd mods/mod-swooper-maps lint: pass
    - REFRACTOR_DOMAINS=\"foundation\" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails: pass
  focused_suite:
    - test/foundation/contract-guard.test.ts: pass
    - test/foundation/no-op-calls-op-tectonics.test.ts: pass
    - test/foundation/m11-tectonic-events.test.ts: pass
    - test/foundation/m11-tectonic-segments-history.test.ts: pass
    - test/foundation/tile-projection-materials.test.ts: pass
    - test/m11-config-knobs-and-presets.test.ts: pass
    - test/standard-recipe.test.ts: pass
    - test/standard-compile-errors.test.ts: pass
```
