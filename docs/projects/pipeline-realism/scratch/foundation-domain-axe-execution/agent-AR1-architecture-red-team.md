# Agent AR1 — Architecture Red-Team Review

## Charter
- Run an independent architecture red-team pass on hotspot implementation files for Foundation M4 slices.
- Identify boundary violations and structural/code-organization smells with ranked severity (`P0/P1/P2`).

## Startup Attestation
```yaml
agent: AR1
worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
branch_expected: codex/prr-m4-s06d-foundation-scratch-audit-ledger
absolute_paths_only: true
docs_read_required:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
hard_invariants:
  - no_stage_runtime_merge_or_defaulting
  - no_manual_public_to_internal_schema_translation
  - compile_is_not_runtime_normalization
  - step_orchestrates_ops_no_op_calls_op
  - strategies_internal_to_ops_and_powered_by_op_local_rules
  - no_shared_lib_rule_shim_pattern
  - no_duplicate_core_math_helpers_when_core_has_equivalent
```

## Scope and hotspots
```yaml
hotspot_paths:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/strategies/**
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/rules/**
required_output:
  ranked_findings:
    - severity: P0|P1|P2
    - evidence_path
    - why_it_violates_invariant
    - disposition: fix_now|keep_with_rationale
```

## Review method
1. Audit boundaries: stage vs step vs op vs strategy vs rules.
2. Detect orchestration leakage or hidden orchestration.
3. Flag cross-boundary imports and code-shape smells.
4. Verify no-op-calls-op and no shared-lib shim proxies.

## Findings log (append-only)
- Pending.

## Proposed target
- Independent, severity-ranked architecture findings with explicit fix-now vs keep decisions and path evidence.

## Findings landed
- Pending.

## Open risks
- Pending findings could require additional focused patch slices before integration.

## Decision asks
- none
## Docs-first attestation
```yaml
docs_read:
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
read_at: 2026-02-15T00:00:00Z
``` 
## Findings log (pass 1)
1. [P1] `foundation/m11-projection-boundary-band.test.ts` still calls `computeTectonicHistory.run` even though the op now throws and the new `tectonics` step is the single gate for history data. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts:117-138` invokes `computeTectonicHistory.run`, and the op stub at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:5-23` throws `ORCHESTRATION_MIGRATION_HINT`. Because the test bypasses the new step, it now fails and leaves the gating suite unrun. Disposition: Fix now (rewrite the test to exercise the decomposed ops/tectonics step instead of the disabled mega-op).
2. [P1] `foundation/mesh-first-ops.test.ts` still calls `computeTectonicHistory.run` for multiple assertions and therefore fails immediately in this branch. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts:235-242`, `:285-294`, and `:418-428` each invoke the disabled op, and the stub in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:5-23` throws. Disposition: Fix now (update the mesh-first ops regression to call the new focussed ops so the suite can run). 
3. [P1] `morphology/m11-crust-baseline-consumption.test.ts` still runs `computeTectonicHistory`, so as soon as the new op stub lands the morphology regression cannot execute. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts:40-63` and the stubbed op at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:5-23`. Disposition: Fix now (switch the test to drive the new op chain). 
4. [P1] The morphological realism tests (`m11-hypsometry-continental-fraction.test.ts` and `m12-mountains-present.test.ts`) still call `computeTectonicHistory.run` and therefore fail now that the mega-op throws. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-hypsometry-continental-fraction.test.ts:40-72` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m12-mountains-present.test.ts:40-68` touch the disabled op whose implementation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:5-23` throws. Disposition: Fix now (rewire these tests to call the new decomposed ops). 
5. [P2] The legacy `foundation/compute-tectonic-history` contract/implementation still lives under `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history` even though no production step or domain export uses it; it only emits an error that points testers to the new set of operations. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:15-75` defines an entire strategy schema that will never run, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:5-23` simply throws. Disposition: Keep (the stub enforces the new boundary right now, but plan to delete the mega-op artifacts once all callers move to the decomposed ops so the domain surface stays clean).

## Findings landed (pass 1)
- Documented four P1 blocking regressions (foundation and morphology tests still invoking the disabled mega-op) plus the residual P2 legacy op stub.

## Open risks (pass 1)
- The branch cannot run the foundation and morphology regression suites until every `computeTectonicHistory.run` call is rewired because the op now throws; the test baseline gating pipeline is currently broken.
- Leaving the legacy op/contract in place invites future authors to import it again, undoing the composition fix.

## Proposed target (pass 1)
- Replace every direct `computeTectonicHistory.run` call with the decomposed ops/tectonics step to unblock the foundation/morphology suites.
- Remove the legacy contract/implementation once no callers remain so the domain ops surface reflects the new architecture.

## Decision asks (pass 1)
- None.
## Implementation log (pass 2)
- Created `mods/mod-swooper-maps/test/support/tectonics-history-runner.js` to mirror the orchestrated op chain previously hidden behind `foundation/compute-tectonic-history`, so tests can exercise the decomposed ops without invoking the disabled mega-op. The helper runs era membership, era-per-plate motion/segment/event builds, era field synthesis, history rollups, current tectonics, tracer advection, and provenance, and it exposes the same `tectonicHistory` + `tectonics` payloads the old op returned.
- Rewired the hotspot regression in `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts` to import `runTectonicHistoryChain` and pass the same era/belt config instead of calling the disabled `computeTectonicHistory.run`.
- Replaced every `computeTectonicHistory.run` call inside `mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts`, `mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts`, `mods/mod-swooper-maps/test/morphology/m11-hypsometry-continental-fraction.test.ts`, and `mods/mod-swooper-maps/test/morphology/m12-mountains-present.test.ts` with `runTectonicHistoryChain`, cleaning up the imports and keeping the rest of the assertions intact.

## Verification log (pass 2)
1. `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test -- test/foundation/m11-projection-boundary-band.test.ts`
2. `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test -- test/foundation/mesh-first-ops.test.ts`
3. `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test -- test/morphology/m11-crust-baseline-consumption.test.ts test/morphology/m11-hypsometry-continental-fraction.test.ts test/morphology/m12-mountains-present.test.ts`
## AR1 quick re-check
- Verdict: pass — the helper in `mods/mod-swooper-maps/test/support/tectonics-history-runner.js` mirrors the tectonics op graph without surreptitiously reintroducing the disabled mega-op, and each hotspot test now imports that helper instead of `computeTectonicHistory`, keeping orchestration localized to the helper (tests) while preserving the op-level contracts previously enforced by the tectonics step. No new boundary violations (ops call ops internally only, no step/strategy mixups, no runtime compile merging) were introduced. Residual risk: future tests might reuse the helper outside the intended regression suites; keep awareness that this helper is for tests only so production pipelines remain tied to the officially published ops/step sequence.
