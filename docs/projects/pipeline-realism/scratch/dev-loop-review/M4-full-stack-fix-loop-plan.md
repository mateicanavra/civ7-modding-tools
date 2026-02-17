# M4 Full-Stack Fix Loop Plan (Agent IGNEZ)

## Canonical Scope
- Review ledger anchor: `docs/projects/pipeline-realism/reviews/REVIEW-M4-full-stack-chain.md`
- Carried review-loop plan: `docs/projects/pipeline-realism/scratch/dev-loop-review/M4-full-stack-review-loop-plan.md`
- Triage sink: `docs/projects/pipeline-realism/triage.md`
- Milestone traceability: `docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`

## Fix Objective
1. Re-run every branch that carried a prior `FAIL` verification signal in deterministic stack order.
2. Convert each prior `FAIL` to one of:
   - `PASS` (fixed or resolved-no-change with evidence), or
   - explicit deferred disposition with rationale and downstream evidence.
3. Close PR `#1348` unresolved review-thread risk with explicit disposition.

## Deterministic Execution Log
- 2026-02-17: Preflight captured stack/worktree state (`git status`, `gt ls`, `gt log`) and prepared loop worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-IGNEZ-fix-1243`.
- 2026-02-17: First sweep reproduced broad default-check failures caused by stale adapter build artifacts in the temporary worktree (`getDefaultDiscoveryPlacement` type surface mismatch against stale package build output).
- 2026-02-17: Confirmed root-cause on earliest failing branch (`agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max`): running `bun run --cwd packages/civ7-adapter build` immediately before `bun run --cwd mods/mod-swooper-maps check` turned the failure to PASS without source edits.
- 2026-02-17: Re-ran full deterministic branch list with family-specific gates and adapter preflight for default-check branches.
- 2026-02-17: Closed PR `#1348` unresolved review thread (`PRRT_kwDOOOKvrc5u5nDJ`) and recorded rationale at https://github.com/mateicanavra/civ7-modding-tools/pull/1348#issuecomment-3912716285.

## Sweep Outcome Summary
- Total branches in deterministic fail-set: `30`
- PASS after rerun: `27`
- FAIL after rerun: `3`

### PASS Cohort
- Default-check family (`bun run --cwd packages/civ7-adapter build && bun run --cwd mods/mod-swooper-maps check`):
  - `agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max`
  - `agent-SWANKO-PRR-s11-c01-fix-belt-influence-distance-contract`
  - `agent-SWANKO-PRR-s93-c01-fix-round-clampint-knobs`
  - `agent-SWANKO-PRR-s94-c01-fix-sea-level-constraints-first`
  - `agent-SWANKO-PRR-s97-c01-fix-polarity-bootstrap-oceanic-only`
  - `agent-SWANKO-PRR-s98-c01-fix-era-fields-dijkstra`
  - `agent-SWANKO-PRR-s101-c01-fix-crust-thickness-evolution`
  - `agent-SWANKO-PRR-s108-c01-fix-plateau-seeding`
  - `agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional`
  - `agent-SWANKO-PRR-s113-c01-fix-mountainThreshold-candidates`
  - `agent-SWANKO-PRR-s115-c01-fix-hill-cap-floor`
  - `agent-SWANKO-PRR-s118-c01-fix-studio-artifacts-preflight`
  - `agent-SWANKO-PRR-s119-c01-fix-pass-plateMotion`
  - `agent-SWANKO-PRR-s120-c01-fix-era-plateMotion-recompute`
  - `agent-SWANKO-PRR-s124-c01-fix-diag-analyze-mountains-guard`
  - `codex/prr-m4-s02-contract-freeze-dead-knobs`
  - `codex/prr-m4-s03-tectonics-op-decomposition`
  - `codex/prr-m4-s05-ci-strict-core-gates`
  - `codex/prr-m4-s06-test-rewrite-architecture-scans`
  - `codex/prr-m4-s06a-foundation-knobs-surface`
  - `codex/prr-m4-s06b-foundation-tectonics-local-rules`
  - `codex/prr-m4-s06c-foundation-guardrails-hardening`
  - `codex/prr-m4-s06e-earthlike-studio-typegen-fix`
  - `codex/spike-ecology-placement-regression`
- Docs-lint family: `codex/prr-m4-s06d-foundation-scratch-audit-ledger` (`bun run lint:mapgen-docs`) PASS.
- Architecture family: `codex/prr-m4-s07-lane-split-map-artifacts-rewire` (`bun run test:architecture-cutover`) PASS.
- Top CI family: `codex/prr-pr-comments-discovery-count-enforcement` (`bun run test:ci`) PASS.

### Deferred (No Backport) Cohort
- `codex/agent-A-placement-s1-runtime-hardening` (`bun run test:ci` FAIL)
- `codex/agent-B-placement-s2-verification-docs` (`bun run test:ci` FAIL)
- `codex/agent-ORCH-m4-reanchor-docs` (`bun run test:ci` FAIL)
- Disposition rationale:
  - These are intermediate stack slices with branch-local acceptance posture drift.
  - A/B fail on `mapgen-studio` D08r foundation schema expectations.
  - ORCH fails on `test/map-hydrology/lakes-area-recalc-resources.test.ts`.
  - Descendant evidence shows the active cutover path is stable without backport shims:
    - `codex/prr-m4-s08-config-redesign-preset-retune` => `bun run test:ci` PASS.
    - `codex/prr-m4-s09-docs-comments-schema-legacy-purge` => `bun run test:ci` PASS.
    - `codex/prr-pr-comments-discovery-count-enforcement` => `bun run test:ci` PASS.

## Direct Fixes Applied During Stabilization
- Existing fix commit retained in stack: `b1951721b`
  - `fix(placement): keep official discovery count mismatch diagnostic-only`
  - Branch: `codex/prr-pr-comments-discovery-count-enforcement`
  - Effect: removes fail-hard abort on official discovery count mismatch while preserving fail-hard for invalid adapter return/throw paths.

## Consolidated Top-Of-Stack Gates
On `codex/prr-pr-comments-discovery-count-enforcement`:
- `bun run lint` => PASS
- `bun run lint:adapter-boundary` => PASS
- `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails` => FAIL (existing full-profile hydrology/ecology guardrail debt)
- `bun run check` => PASS
- `bun run test:architecture-cutover` => PASS
- `bun run test:ci` => PASS
- `bun run lint:mapgen-docs` => PASS (warnings only)
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes` => PASS

## Finalization Checklist
- [x] Review ledger updated with per-branch stabilization outcomes.
- [x] PR #1348 review-thread risk closed with explicit rationale.
- [x] Triage updated: closed resolved thread risk, retained true deferrals, and added artifact-preflight follow-up.
- [x] Milestone updated with fix-pass traceability lines.
- [ ] Submit stack after docs commit.
- [ ] Remove temporary IGNEZ worktree(s) and re-check clean states.
