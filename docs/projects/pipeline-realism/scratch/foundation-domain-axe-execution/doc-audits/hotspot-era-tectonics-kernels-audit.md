---
docs_anchor:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/explanation/ARCHITECTURE.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
audited_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
branch: codex/prr-m4-s06-test-rewrite-architecture-scans
audit_date: 2026-02-15
audit_type: hotspot-architecture
---

## Verdict

`era-tectonics-kernels.ts` is a pragmatic compatibility extraction (it removed direct peer-op runtime imports) but is not a good long-term architecture boundary. It currently carries duplicated op logic, embeds rule policy inline, and leaks defaults across layer boundaries. Determinism is mostly preserved in current behavior, but maintainability and testability risk are high.

## Severity Findings

### HIGH — F1: Kernel module duplicates two full op runtimes instead of factoring shared rules

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:101`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:402`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:42`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:32`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts:87`
- Why this is a hotspot:
  - The module re-implements the core algorithms from `compute-plate-motion` and `compute-tectonic-segments` (including helper math and policy transforms) rather than composing shared rules.
  - Any future bug fix or policy adjustment now has two implementation paths that can silently diverge.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:10` (rules should be small/pure), `:245` (rules as discrete policy units), `:309` (rules placed inside ops and composed explicitly).
  - `DOMAIN-MODELING.md:14` and `:34` (modular, testable algorithm units with clear boundaries).

### HIGH — F2: Hidden orchestration/config coupling through exported defaults from a deep internal file

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:13`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:22`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:113`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:413`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:5`
- Why this is a hotspot:
  - The step layer imports default strategy configs from a private op helper path; defaults become an implicit cross-layer contract.
  - Runtime fallback/clamp behavior inside kernels obscures where canonical config is owned (compile-time vs runtime).
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:64` (compile-first canonicalization), `:82` (stable op contracts), `:136` (boundaries).
  - `ARCHITECTURE.md:62` and `:64` (domains own algorithms, steps own orchestration/visible dependencies).

### MEDIUM — F3: Rule-level tectonic policy is embedded inline, reducing composability and auditability

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:85`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:479`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:493`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:506`
- Why this is a hotspot:
  - Regime classification, polarity bootstrap, and volcanism/fracture heuristics are embedded in one pass rather than isolated as rule units.
  - This makes focused unit testing and policy evolution harder (especially when mirrored elsewhere).
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:70`, `:73`, `:247`, `:248`.

### MEDIUM — F4: Kernel parity and determinism are under-tested as a first-class boundary

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:101`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts:402`
- Why this is a hotspot:
  - Repo-wide search shows no tests directly importing these kernels (`rg -n "era-tectonics-kernels|computePlateMotionFromState|computeTectonicSegmentsFromState" mods/mod-swooper-maps/test` returned no matches).
  - Current tests mostly exercise public ops/steps, so kernel-vs-op drift can hide until larger integration regressions appear.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:84` (units expected to be reusable and testable independently).

## Concrete Actions

1. Extract shared tectonic rules into explicit modules (e.g., regime classification, polarity selection, volcanism/fracture scoring) and have both op surfaces and era kernels compose those rules.
2. Stop importing defaults from `compute-tectonic-history/lib/era-tectonics-kernels.ts` in step code; source defaults from contract-owned surfaces.
3. Treat kernel input configs as already-canonicalized and remove runtime fallback/defaulting paths from kernels (keep canonicalization compile-time).
4. Add characterization parity tests that compare kernel outputs against public op outputs for fixed fixtures and seeded determinism cases.
5. Add a temporary “duplication debt” guardrail (or TODO gate) that requires synchronized changes whenever `compute-plate-motion` or `compute-tectonic-segments` logic is edited until convergence lands.

## Commands Run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
pwd && git rev-parse --abbrev-ref HEAD
git status --short --branch
command -v gt >/dev/null && gt --version || echo 'gt-not-found'
rg --files -g 'AGENTS.md'
cat AGENTS.md
cat mods/mod-swooper-maps/AGENTS.md
cat mods/mod-swooper-maps/src/AGENTS.md
nl -ba docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
nl -ba docs/system/libs/mapgen/architecture.md
nl -ba docs/system/libs/mapgen/explanation/ARCHITECTURE.md
nl -ba docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/contract.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
nl -ba mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts
nl -ba mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
rg -n "computePlateMotionFromState|computeTectonicSegmentsFromState|boundaryRegimeFromIntensities|velocityAtPoint|normalizeToInt8|clampByte" mods/mod-swooper-maps/src/domain/foundation/ops
rg -n "era-tectonics-kernels|computePlateMotionFromState|computeTectonicSegmentsFromState" mods/mod-swooper-maps/test
```

## Proposed Target

- Keep atomic op boundaries (`compute-plate-motion`, `compute-tectonic-segments`, etc.) as the only algorithm authorities.
- If a historical era path needs internal kernels, those kernels should be thin composition over shared rule modules, not a second full implementation.
- Defaults/policy ownership should live at contract/domain shared-config surfaces, not in a deep helper file imported by step orchestration.

## Changes Landed

- Added this audit report:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/hotspot-era-tectonics-kernels-audit.md`
- No source code edits were made.

## Open Risks

- Converging duplicated implementations can alter deterministic snapshots if tie ordering or numeric normalization changes.
- A naive fix that re-introduces direct sibling op runtime imports would fail the `no-op-calls-op` guardrail.

## Decision Asks

1. Should `era-tectonics-kernels.ts` be treated as a short-lived compatibility shim (with explicit removal target), or as a permanent shared kernel surface to harden?
2. Where should canonical defaults live going forward: op contract default envelope, domain shared policy module, or step-level authored config?
3. Do we want a mandatory kernel-vs-op parity test suite before further tectonics algorithm changes are merged?
