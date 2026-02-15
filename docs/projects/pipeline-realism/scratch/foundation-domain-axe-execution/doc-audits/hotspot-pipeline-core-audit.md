---
docs_anchor:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
audited_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
branch: codex/prr-m4-s06-test-rewrite-architecture-scans
audit_date: 2026-02-15
audit_type: hotspot-architecture
---

## Verdict

`pipeline-core.ts` is carrying too much domain orchestration and policy for a single op helper module. It remains deterministic in most straightforward runs, but there are hidden coupling seams and tie-break dependencies that make behavior brittle under refactors. Overall posture: **needs architectural decomposition before further feature growth**.

## Severity Findings

### HIGH — F1: Mega-function orchestration inside helper/kernels boundary (`buildEraFields`)

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:561`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:730`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:994`
- Why this is a hotspot:
  - `buildEraFields` spans ~514 lines and mixes: propagation graph walk, scoring policy, event tie-break policy, boundary classification, and output materialization.
  - This collapses multiple rule-level decisions into one execution block, which is effectively step-like orchestration embedded in a helper.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:10` + `:30` + `:318` call for small rules and avoiding mega-ops.
  - `DOMAIN-MODELING.md:34` + `:36` expects clear split between algorithm units and orchestration boundaries.

### HIGH — F2: Hidden cross-op coupling via hard-coded kernel defaults in `computeEraSegments`

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1491`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1497`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1500`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1507`
- Why this is a hotspot:
  - `computeEraSegments` binds to `DEFAULT_PLATE_MOTION_CONFIG` and `DEFAULT_TECTONIC_SEGMENTS_CONFIG` from `era-tectonics-kernels.ts` with no local contract/config surface.
  - Behavior can drift when those defaults change, without explicit change at the `compute-tectonic-history` strategy level.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:82` + `:223` require stable op contracts; this is an implicit dependency path.

### MEDIUM — F3: Plate-id/index contract leak between era membership and kernel inputs

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:290`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:330`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1487`
- Why this is a hotspot:
  - `computePlateIdByEra` stores `plate.id` into `owner`; later this becomes `cellToPlate` used as index-addressable membership in kernel calls.
  - This assumes `plate.id === plates[index].id` (contiguous/index-safe) but that invariant is not enforced here.

### MEDIUM — F4: Determinism sensitivity to ordering/ties (neighbors and event order)

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:363`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:827`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1023`
- Why this is a hotspot:
  - `chooseDriftNeighbor` keeps the first max-dot neighbor; equal-dot ties are not canonically broken.
  - Event competition falls through to event index order, so subtle upstream ordering changes can alter boundary selection in tie conditions.

### MEDIUM — F5: Strategy/rule factoring is weak; policy constants are embedded and non-composable

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:18`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:41`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:792`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:1350`
- Why this is a hotspot:
  - Era gain, reset-threshold posture, emission multipliers, and event scoring priorities are hard-coded in this module.
  - The contract only exposes one strategy (`default`) with limited tunables, so policy evolution requires code edits instead of strategy-level composition.

### LOW — F6: Duplicate graph/heap machinery increases maintenance entropy

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:121`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:676`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:190`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts:651`
- Why this is a hotspot:
  - Two heap implementations and repeated mean-edge/graph-walk logic increase bug surface and drift risk.

## Concrete Actions

1. Split `buildEraFields` into internal rule modules (channel update, propagation, boundary selection) and keep `buildEraFields` as a thin composition wrapper.
2. Move hard-coded default-kernel wiring out of `computeEraSegments` into explicit strategy config (or a typed policy object) so cross-op coupling becomes visible at contract level.
3. Add an explicit invariant guard: validate that `plateGraph.plates[index]?.id === index` (or add an id->index remap before era membership is consumed by kernels).
4. Introduce deterministic tie-break helpers for neighbor/event ties (e.g., canonical `(score, intensity, eventType, eventId, cellId)` ordering).
5. Promote tectonic policy constants into a strategy policy surface (still with defaults) and keep runtime pure (compile-time canonicalization path).
6. Extract shared graph traversal/heap utilities into one local kernel helper to remove duplicate implementations.

## Commands Run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
pwd && git rev-parse --abbrev-ref HEAD && git status --short
rg --files -g 'AGENTS.md'
cat AGENTS.md
cat mods/mod-swooper-maps/AGENTS.md
cat mods/mod-swooper-maps/src/AGENTS.md
wc -l docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md docs/system/libs/mapgen/architecture.md docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
nl -ba docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
nl -ba docs/system/libs/mapgen/architecture.md
nl -ba docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts | sed -n '1,1509p' (reviewed in chunks)
rg -n "^(export\\s+function|function|class)\\s" mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
awk '...function/class span summary...' mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/internal-contract.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
```

## Proposed Target

- Keep `compute-tectonic-history` as one op contract externally.
- Internally refactor to a policy-driven composition:
  - `rules/` for atomic decisions (tie-break, thresholding, channel updates).
  - `kernels/` for reusable graph propagation + advection primitives.
  - `pipeline/` for era-level composition only.
- Surface policy knobs through strategy config (compile-normalized), not hard-coded constants spread across runtime paths.

## Changes Landed

- Added this audit report:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/hotspot-pipeline-core-audit.md`
- No source code edits were made.

## Open Risks

- Refactoring this hotspot without a characterization test harness can shift tectonic outputs subtly.
- Any change to tie-breaking or plate-id normalization can alter deterministic snapshots and should be rolled with explicit golden updates.

## Decision Asks

1. Approve a two-phase refactor sequence (`mechanical extraction first`, `policy surfacing second`) to minimize behavior drift risk.
2. Decide whether plate id/index invariants should be enforced hard (`throw`) or normalized (`id->index remap`) at op boundary.
3. Decide whether kernel defaults should remain coupled to `era-tectonics-kernels` or be copied/versioned under `compute-tectonic-history` strategy policy.
