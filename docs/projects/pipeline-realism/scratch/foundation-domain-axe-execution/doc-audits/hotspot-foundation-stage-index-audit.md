---
docs_anchor:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/STANDARD-RECIPE.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/stage.ts
audited_file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
branch: codex/prr-m4-s06-test-rewrite-architecture-scans
audit_date: 2026-02-15
audit_type: hotspot-architecture
---

## Verdict

`foundation/index.ts` is over-indexed on stage-level translation/defaulting and currently acts as a second normalization authority. It should remain a stage-owned public-surface mapper, but the compile body should be reduced to a thin mapping layer; direct pass-through is not viable with the current public schema shape.

## Severity Findings

### HIGH — F1: Duplicate normalization authority (stage compile vs step/op normalize)

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:534`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:603`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:646`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:17`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts:17`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:283`
- Why this is a hotspot:
  - Stage compile applies `plateCount` knob transforms and clamps, but the same transform is also applied in `step.normalize` for both `mesh` and `plate-graph`.
  - This creates split ownership for one policy and increases drift risk whenever ranges or knob semantics change.
- Boundary mismatch:
  - Compile-first posture expects normalization hooks to stay in canonical normalize surfaces (`step.normalize` / `op.normalize`) rather than duplicated across layers.

### HIGH — F2: Stage compile re-authors op defaults already owned by op contracts

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:280`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:371`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:598`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/compiler/normalize.ts:185`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-forcing/contract.ts:8`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/contract.ts:10`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts:10`
- Why this is a hotspot:
  - The compiler can prefill op envelope defaults directly from op contracts, but this stage manually inlines many of those same defaults (`COMMON_*` constants + explicit envelope config objects).
  - This duplicates canonical default ownership and turns compile into a broad defaulting engine instead of a mapper.

### MEDIUM — F3: Public-schema ranges, compile clamps, and op-contract ranges are misaligned

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:55`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:564`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/contract.ts:7`
- Why this is a hotspot:
  - `advanced.mantleForcing.plumeCount/downwellingCount` are exposed as `0..128`, then compile clamps to `2..16`, while op strategy allows `0..32`.
  - This is a stage-boundary smell: three authorities define different semantics for the same value, increasing surprise and reducing predictability of authoring behavior.

### MEDIUM — F4: Compile emits config that is not consumed by the tectonics step runtime path

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:659`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:102`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:24`
- Why this is a hotspot:
  - Stage compile writes `tectonics.computePlateMotion`, but the step uses hardcoded `ERA_PLATE_MOTION_STRATEGY` for era replay.
  - This creates a false authoring affordance and makes stage-level tuning appear broader than what runtime actually honors.

### LOW — F5: Compile fallback and duplicate profile constants suggest dead/overlapping logic

- Evidence:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:261`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:532`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:350`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:357`
- Why this is a hotspot:
  - `profiles` is required in schema, but compile still carries a fallback default path.
  - `COMMON_CRUST_BALANCED` and `COMMON_CRUST_STANDARD` are currently identical, adding indirection without behavior distinction.

## Concrete Actions

1. Keep stage compile, but reduce it to stage-owned translation only: `public -> step/op key mapping` and profile selection.
2. Remove duplicate knob transforms from stage compile (`plateCount`) and rely on step/op normalize ownership.
3. Replace hand-authored default envelopes with sparse outputs that let `prefillOpDefaults` and op contracts own defaults.
4. Align semantic ranges in one place: either tighten public schema to effective bounds or stop extra clamping in compile where op schemas already enforce limits.
5. Resolve tectonics config authority: either wire `config.computePlateMotion` into era replay or remove that compile output so the surface matches runtime.
6. Trim dead/overlapping constants (`profiles` fallback path and duplicate crust presets) to keep compile intent legible.

## Commands Run

```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
pwd && git rev-parse --abbrev-ref HEAD
git status --short --branch
rg --files -g 'AGENTS.md'
cat mods/mod-swooper-maps/AGENTS.md
cat mods/mod-swooper-maps/src/AGENTS.md
cat packages/mapgen-core/AGENTS.md
cat packages/mapgen-core/src/AGENTS.md
wc -l docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md docs/system/libs/mapgen/reference/STANDARD-RECIPE.md docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md packages/mapgen-core/src/authoring/stage.ts mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
nl -ba docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md
nl -ba docs/system/libs/mapgen/reference/STANDARD-RECIPE.md
nl -ba docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md | sed -n '1,420p'
nl -ba packages/mapgen-core/src/authoring/stage.ts
nl -ba packages/mapgen-core/src/compiler/recipe-compile.ts | sed -n '1,260p'
nl -ba packages/mapgen-core/src/compiler/normalize.ts | sed -n '1,360p'
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts | sed -n '1,760p'
find mods/mod-swooper-maps/src/recipes/standard/stages/foundation -maxdepth 3 -type f | sort
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*.contract.ts
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts
nl -ba mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts | sed -n '1,260p'
rg -n "normalize:" mods/mod-swooper-maps/src/domain/foundation/ops/*/index.ts
nl -ba mods/mod-swooper-maps/src/domain/foundation/ops/*/contract.ts | sed -n '1,460p'
```

## Proposed Target

- Keep `foundation` stage as a public-surface translator (profiles + advanced selectors -> internal keys).
- Make compile thin and declarative:
  - map aliases/grouping,
  - emit only non-default deltas,
  - leave defaulting and canonicalization to op contracts + normalize hooks.
- Preserve profile authoring power, but centralize numeric authority in one layer per concern (public validation vs normalize vs op strategy defaults).

## Changes Landed

- Added this audit report:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/hotspot-foundation-stage-index-audit.md`
- No source code edits were made.

## Open Risks

- Converging default ownership to op contracts may change current tuned outputs unless profile deltas are migrated carefully.
- Removing stage-side clamps without aligning schema bounds could expose values currently silently coerced.
- If tectonics config authority is changed, deterministic outputs may shift and require golden test updates.

## Decision Asks

1. Confirm target posture: should `foundation` compile become thin mapping (not default authority) in this slice?
2. For profile tuning, should we encode only deltas from op defaults, or maintain a full profile table with explicit duplication by policy?
3. For tectonics era replay, should stage config drive per-era motion/segment settings, or should those remain intentionally fixed internal policy?
