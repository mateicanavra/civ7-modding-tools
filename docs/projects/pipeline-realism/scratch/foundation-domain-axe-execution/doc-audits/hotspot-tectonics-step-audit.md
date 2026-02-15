---
docs_anchor:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md
audited_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
branch: codex/prr-m4-s06-test-rewrite-architecture-scans
audit_date: 2026-02-15
audit_type: hotspot-architecture
---

## Verdict

`tectonics.ts` is functionally rich but architecture-hotspot prone: orchestration, era-policy, and visualization side effects are tightly interleaved in one large runtime block. The current shape works, but it obscures sequencing contracts and creates hidden coupling to config/default ownership, which raises regression risk when tectonics behavior evolves.

## Severity Findings

### HIGH — F1: Hidden config contract bypass via hardcoded era strategies

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:4`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:24`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:102`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:110`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:27`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:658`
- Why this is a hotspot:
  - The step imports and pins per-era defaults from a deep op-internal helper file, then calls `computePlateMotion`/`computeTectonicSegments` with those constants rather than the stage-compiled config path.
  - This creates split authority for defaults and makes tuning behavior harder to reason about (compile surface says one thing, runtime era loop can do another).
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:64` (compile-first canonicalization).
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:96` and `SPEC-DOMAIN-MODELING-GUIDELINES.md:97` (step should own explicit orchestration contracts).
  - `DOMAIN-MODELING.md:43` and `DOMAIN-MODELING.md:47` (shared semantics/ids should remain stable and legible).

### HIGH — F2: Sequencing entanglement from policy logic embedded in step runtime

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:22`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:92`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:93`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:138`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:150`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:161`
- Why this is a hotspot:
  - The step encodes tectonic-policy heuristics (era gain ramp, fallback plate-id selection, era skipping behavior) directly inside orchestration.
  - A contract mismatch path is possible: the loop can skip eras (`continue`) while downstream ops still receive `eraCount`/`plateIdByEra` from the original membership contract, creating hidden assumptions about array alignment.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:35` (planning lives in ops).
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:40` (avoid domain heuristics in steps).
  - `DOMAIN-MODELING.md:34` and `DOMAIN-MODELING.md:37` (ops as algorithm units; steps as orchestration).

### MEDIUM — F3: Failure path can leave partial artifact state (publish-before-complete)

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:80`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:164`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/artifact/runtime.ts:221`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/artifact/runtime.ts:251`
- Why this is a hotspot:
  - `foundationTectonicSegments` is published before the step proves the full tectonics history/current/provenance pipeline succeeds.
  - Artifact publish is immediate and non-transactional (`context.artifacts.set`), so a later exception can leave partial outputs in context.
- Anchor mismatch:
  - `SPEC-DOMAIN-MODELING-GUIDELINES.md:95` and `SPEC-DOMAIN-MODELING-GUIDELINES.md:96` (step as clean action boundary).

### MEDIUM — F4: Visualization and execution are tightly coupled in one mega-step body

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:63`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:200`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:431`
- Why this is a hotspot:
  - The step mixes core sequencing with a long tail of viz emission responsibilities, increasing cognitive load and making sequencing regressions harder to isolate.
  - Debug-output expansion now directly increases step complexity rather than remaining a clearly isolated concern.
- Anchor mismatch:
  - `DOMAIN-MODELING.md:39` (orchestration should remain visible/debuggable; this shape is trending toward opaque).

## Concrete Actions

1. Move era-internal strategy selection to explicit step config plumbing (or a dedicated op contract), and stop importing runtime defaults from `compute-tectonic-history/lib/era-tectonics-kernels` in the step layer.
2. Extract era-policy decisions (`eraGain` ramp, era fallback/skip policy) into op-owned logic so the step only sequences op calls and artifact publication.
3. Make era-chain alignment an explicit invariant: either assert `eraFieldsChain.length === eraCount` before downstream ops or pass normalized counts derived from the built chain.
4. Publish artifacts after successful completion of the full tectonics bundle (or introduce staged scratch outputs + single commit point).
5. Split viz emission into a helper boundary (e.g., `emitTectonicsViz(...)`) to keep the step body focused on dependency flow and failure handling.

## Commands Run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
pwd && git rev-parse --abbrev-ref HEAD
git status --short --branch
rg --files -g 'AGENTS.md'
sed -n '1,220p' AGENTS.md
sed -n '1,240p' mods/mod-swooper-maps/AGENTS.md
sed -n '1,260p' mods/mod-swooper-maps/src/AGENTS.md
nl -ba docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md | sed -n '1,260p'
nl -ba docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md | sed -n '1,260p'
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts | sed -n '1,260p'
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts | sed -n '261,520p'
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts | sed -n '1,260p'
rg -n "createStage|steps:|tectonics" mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts | sed -n '620,760p'
rg -n "function implementArtifacts|publish\(" packages/mapgen-core/src/authoring -g '*.ts'
nl -ba packages/mapgen-core/src/authoring/artifact/runtime.ts | sed -n '140,280p'
```

## Proposed Target

- Keep `tectonics` step as a narrow orchestration boundary: read required artifacts, invoke op contracts with compiled config, assert sequencing invariants, then publish outputs.
- Keep algorithm/policy ownership in op/rule surfaces (including per-era gain/fallback behavior), not in step runtime literals.
- Keep observability emission isolated so runtime sequencing remains auditable and failure contracts stay explicit.

## Changes Landed

- Added this audit report:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/hotspot-tectonics-step-audit.md`
- No source code edits were made.

## Open Risks

- Refactoring policy ownership from step to ops can shift deterministic snapshots unless tie-order and normalization are preserved.
- Tightening era-chain invariants may surface latent data-shape issues currently hidden by fallback/skip behavior.
- Delaying publish to a single commit point may change downstream debug workflows that currently expect early `tectonicSegments` availability.

## Decision Asks

1. Should per-era motion/segment config be fully authorable via stage compile config, or intentionally fixed as internal history-kernel policy?
2. Do we want hard failure on any missing era plate membership (strict invariant) or explicit degradation semantics (soft fallback) as a documented contract?
3. Is it acceptable to split viz emission out of the step now, even if it introduces one additional internal helper surface for foundation-stage telemetry?
