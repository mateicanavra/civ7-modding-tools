---
docs_anchor:
  audited_at: 2026-02-15
  target_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
  required_docs:
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
      anchors:
        - "Steps own dependency keys; ops own contracts."
        - "Compile-first: config canonicalization belongs in compile-time normalization."
        - "Favor focused ops over mega-ops; steps orchestrate multiple ops."
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md
      anchors:
        - "Step contract ops declarations are schema-enveloped strategy configs."
        - "Step modules execute run(context, config, ops, deps) using declared contract surfaces."
---

verdict: fail

## Severity findings

### [P2] `computePlateMotion` is contract-exposed but runtime era replay bypasses the compiled op config

- Refs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:27`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:102`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:108`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:659`
- Why this is a hotspot:
  - Declaring `computePlateMotion` in `contract.ops` injects a top-level step config envelope (`config.computePlateMotion`) as a first-class authored contract surface.
  - In runtime, era motion replay uses a hardcoded strategy object (`ERA_PLATE_MOTION_STRATEGY`) instead of `config.computePlateMotion`.
  - This is contract over-specification: the contract advertises a tunable that the step’s runtime path does not actually honor for era replay.

### [P2] Motion authority is split between required artifact and re-computed op without explicit precedence in the contract

- Refs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:17`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:27`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:68`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:102`
- Why this is a hotspot:
  - The contract requires precomputed `foundationArtifacts.plateMotion` and also declares `computePlateMotion` as a step op in the same boundary.
  - Runtime uses artifact motion for part of the chain and recomputed era motion for another part, but the contract does not express which source is authoritative when they diverge.
  - Under decomposed-op posture, this weakens contract legibility and increases drift risk as plate-motion strategy/config evolves.

## Artifact boundary correctness

- Pass for boundary posture in this contract:
  - Uses `artifact:foundation.*` truth artifacts only (`requires`/`provides` via `artifacts.*`).
  - No `artifact:map.*` or `effect:map.*` dependencies in this physics step contract.

## Concrete actions

1. Make contract/runtime alignment explicit for `computePlateMotion`.
- Option A (preferred if tunable): use `config.computePlateMotion` in era replay calls inside `tectonics.ts` and stop bypassing the compiled envelope.
- Option B (preferred if fixed): remove `computePlateMotion` from `tectonics.contract.ts` and use a dedicated fixed-policy helper surface that does not advertise authored config.

2. Collapse to one motion authority per step boundary.
- Either consume only the required `foundationArtifacts.plateMotion` for all tectonics calculations, or compute all motion inside the step from one op-config path.
- Avoid mixed authority unless precedence rules are explicit and tested.

3. Add a guard test to prevent silent contract drift.
- Add a foundation-stage characterization asserting that changing `tectonics.computePlateMotion` config actually changes tectonics-era outputs (if tunable), or is rejected/absent (if fixed-policy).

4. Keep decomposed op chain explicit and legacy aggregate path out of step wiring.
- Current contract correctly binds decomposed ops and does not bind `computeTectonicHistory`; preserve that posture.

## Commands run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && pwd && git rev-parse --abbrev-ref HEAD
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && git status --short --branch
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg --files -g 'AGENTS.md'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat mods/mod-swooper-maps/AGENTS.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && cat mods/mod-swooper-maps/src/AGENTS.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && rg -n "contract|artifact|ops|schema|boundary" docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md | sed -n '1,240p'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts | sed -n '600,760p'
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba packages/mapgen-core/src/authoring/step/contract.ts
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && nl -ba packages/mapgen-core/src/compiler/recipe-compile.ts | sed -n '1,260p'
```

## Proposed target

- `tectonics` step contract should expose only genuinely consumed authored-op configs.
- Plate-motion semantics inside tectonics should have one explicit authority (artifact-derived or op-derived), not mixed implicit precedence.
- Keep decomposed tectonics op wiring in step contracts; avoid rebinding aggregate legacy op surfaces.

## Changes landed

- Added audit report only:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/hotspot-tectonics-contract-audit.md`
- No source code edits were made.

## Open risks

- If `computePlateMotion` remains contract-exposed but unused at runtime for era replay, authored config changes can be misleading and silently ineffective.
- Mixed motion authority can produce hard-to-diagnose drift when plate-motion policy changes in one lane only.
- Existing tests may not fail on this mismatch unless a targeted contract-to-runtime alignment check is added.

## Decision asks

1. Should `tectonics.computePlateMotion` remain a user-authored/tunable contract surface, or become fixed/internal for this step?
2. Which motion source should be authoritative for tectonics: upstream `foundationArtifacts.plateMotion`, in-step recomputation, or a unified hybrid with explicit precedence?
3. Should we enforce a guardrail test that fails when declared op envelope configs are not consumed by runtime orchestration?
