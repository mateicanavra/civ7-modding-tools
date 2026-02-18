---
docs_anchor:
  audited_at: 2026-02-15
  target_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
  required_docs:
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
      anchors:
        - "Steps orchestrate; ops are stable pure contracts."
        - "Favor focused ops over mega-ops; split divergent responsibilities."
        - "Compile-first: move canonicalization/normalization out of runtime run()."
        - "Avoid shims/dual paths for the same guarantee."
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
      anchors:
        - "Legacy router; canonical architecture lives in explanation/reference docs."
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
      anchors:
        - "Ops are algorithm units; steps are orchestration boundaries."
        - "Dependency direction should remain stage/step -> domain ops."
---

verdict: fail

## Severity findings

### [P1] Legacy mega-op orchestration remains inside a single op boundary
- Refs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:68`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:81`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:107`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:113`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:118`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:125`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:133`
- Why this is a violation:
  - This op performs a full pipeline orchestration (era membership -> event generation -> rollups -> current snapshot -> tracer advection -> provenance) instead of one focused contract boundary.
  - It matches the spec anti-pattern of a mega-op carrying multiple responsibilities that are now better modeled as separate ops plus step-layer orchestration.

### [P2] Compile-first posture is violated by runtime config invariant checks in `run`
- Refs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:29`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:50`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:52`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:56`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:57`
- Why this is a violation:
  - Strategy config shape/invariant enforcement (`eraWeights` length parity with `driftStepsByEra`, era count bounds) is executed at runtime in `run`.
  - Per compile-first guidance, these checks belong in compile-time normalization/validation (`strategy.normalize`/`op.normalize` and/or step normalize), not execution path throws.

### [P2] Dual-path contract posture persists (legacy aggregate output surface)
- Refs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:14`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:17`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:18`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:22`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:23`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:133`
- Why this is a violation:
  - This file preserves a legacy aggregate-op output shape (`tectonicHistory`, `tectonics`, `tectonicProvenance`) and imports all corresponding pipeline phases in one runtime path.
  - Under no-shims/single-path posture, retaining this aggregate path alongside focused op surfaces increases divergence risk and architectural ambiguity.

## Concrete refactor actions (delete / move / split)

1. Delete legacy orchestration op surface.
- Delete `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` after call-site verification.
- Remove `computeTectonicHistory` export wiring from:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts`

2. Move config invariants to compile-time normalization.
- Add `normalize` for the relevant focused op envelope(s) so `eraWeights`/`driftStepsByEra` parity and era-count bounds are validated before runtime.
- Eliminate runtime config guard throws currently in this op run path.

3. Split/retain only focused contracts.
- Keep only focused ops for: era membership, per-era fields, rollups, current tectonics, tracer advection, provenance.
- Remove aggregate return-shape dependency for `{ tectonicHistory, tectonics, tectonicProvenance }` as a single-op contract unless there is a hard external consumer requiring it.

4. Move any remaining shared math helpers to neutral shared modules only.
- Keep pipeline math in pure helper libraries; orchestration order belongs in step runtime, not op runtime.

## Commands run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && pwd && git rev-parse --abbrev-ref HEAD && git status --short --branch
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg --files -g '**/AGENTS.md'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat AGENTS.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat mods/mod-swooper-maps/AGENTS.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat mods/mod-swooper-maps/src/AGENTS.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && wc -l docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && wc -l docs/system/libs/mapgen/architecture.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && wc -l docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && sed -n '1,220p' docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && sed -n '221,383p' docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat docs/system/libs/mapgen/architecture.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg "normalize:\s*\(" -n mods/mod-swooper-maps/src/domain/foundation/ops
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/lib/require.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg "compute-tectonic-history|tectonicHistory|tectonicProvenance" -n mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/src/recipes --glob '*.ts'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts | sed -n '1,280p'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg "computeTectonicHistory\(" -n mods/mod-swooper-maps/src --glob '*.ts'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/index.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/index.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
```

## Proposed target

- Single orchestration lane in step runtime (`tectonics` step), with focused foundation ops only.
- No aggregate fallback op for history/current/provenance once migration is complete.
- Compile-time normalized config envelopes; runtime ops remain compute-only.

## Changes landed

- Audit only: created this report.
- No code changes were made.

## Open risks

- Removing `compute-tectonic-history` may break out-of-tree or stale tests/tools still bound to the aggregate op id.
- Docs/reference surfaces that still list the aggregate op may drift from runtime reality until updated.
- If compile-time invariant migration is skipped, runtime failures remain possible in partially-validated authoring paths.

## Decision asks

1. Confirm whether `foundation/compute-tectonic-history` should be fully removed now vs. explicitly deprecated for one release window.
2. Confirm whether any non-standard recipe still requires aggregate-op compatibility before contract surface cleanup.
3. Approve compile-time-only invariant policy for era config (reject invalid envelopes at compile, not runtime).
