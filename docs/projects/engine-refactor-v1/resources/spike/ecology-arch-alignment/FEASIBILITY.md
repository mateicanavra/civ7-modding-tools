# FEASIBILITY: Ecology Architecture Alignment (Spec-Ready Prework)

## Objective

Convert the completed Ecology architecture-alignment spike into:
- a grounded **feasibility verdict**, and
- a **spec-ready refactor blueprint** (still no production refactor code),

so the next stage can become a hardened implementation plan with minimal uncertainty.

## Locked Directives (Non-Negotiable)

- **Atomic per-feature ops**: each feature family is a distinct op (no multi-feature mega-ops).
- **Compute substrate model**: shared **compute ops** produce reusable layers; **plan ops** consume them to emit discrete intents/placements.
- **Maximal modularity**: target the maximal ideal modular architecture (recover perf via substrate/caching later).
- **Docs posture**: prioritize canonical MapGen specs/policies/guidelines; avoid ADRs as primary references (and treat older ADRs as non-authoritative).
- **Ops posture**: policies live in `rules/**` imported by ops; steps never import rules.
- **Shared libs posture**: generic helpers belong in shared core MapGen SDK libs; look there first.
- **Narsil posture**: do not reindex Narsil MCP; use native tools for anything missing.

## Feasibility Verdict

**Verdict: Feasible with caveats.**

There are no “hard” blockers to aligning Ecology with the target architecture **without changing behavior**, but there are a few seams that must be made explicit and designed carefully to avoid accidental behavior drift.

### Caveats (must be addressed explicitly in Phase 3 planning)

1. **`features-plan` currently bypasses compiler-owned op binding/normalization for “advanced” planners.**
   - This is the single most important contract drift to fix (details below).
2. **`artifact:ecology.biomeClassification` is currently a publish-once mutable handle.**
   - Behavior-preserving refactors must preserve this posture (or cut over with explicit consumer changes + proof).
3. **`plot-effects` is an adapter-write boundary without an explicit effect guarantee.**
   - Decide whether to introduce an effect tag now (recommended) and what its verification semantics are.
4. **DeckGL/Studio compatibility surface is key-based.**
   - Keys (`dataTypeKey`, `spaceId`, kinds) must be preserved (or migrated intentionally).
5. **Build-order matters for parity gates.**
   - Baseline tests require building workspace packages that export `dist/*` before running mod tests.

## Key Evidence (Current-State Audit)

The evidence pass is captured in:
- `_scratch/feasibility/02-feasibility-audit.md`

Top findings:

### A) Step↔Op contract binding drift (must-fix)

`features-plan` imports and executes op implementations directly:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
  - imports `@mapgen/domain/ecology/ops`
  - calls `planVegetatedFeaturePlacements.run(...)` and `planWetFeaturePlacements.run(...)`

It also manually builds an op envelope schema instead of declaring ops in `contract.ops`:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`

Why this is a real seam (not “just cleanup”):
- `defineStep` merges `contract.ops[*].config` into the step schema and rejects collisions:
  - `packages/mapgen-core/src/authoring/step/contract.ts`
- The recipe compiler prefills + normalizes op envelopes only for declared ops:
  - `packages/mapgen-core/src/compiler/recipe-compile.ts`
  - `packages/mapgen-core/src/compiler/normalize.ts`

### B) The tricky part: `contract.ops` implies “default envelope always exists”

If an op is declared in `contract.ops`, the compiler will inject its `defaultConfig` into the step config when omitted.
That’s correct for “always-on” ops, but it is a footgun for *optional* op envelopes.

Implication for Ecology:
- Today `features-plan` treats `vegetatedFeaturePlacements` / `wetFeaturePlacements` as optional “advanced” toggles.
- If we naïvely declare them in `contract.ops`, they become “always present” (and likely “always on”) unless we change their default semantics.

This is why the feasibility stage must lock a concrete modeling choice for “optional advanced planners”.

## Spec-Ready Blueprint (Behavior-Preserving, Maximal Modularity)

This section is the actionable output: what we will implement later, but locked enough that Phase 3 planning doesn’t need to re-decide.

### 1) Keep the truth vs projection posture (two stages)

- Truth stage: `ecology` (phase `ecology`)
  - Publishes: `artifact:ecology.*` truth artifacts (indices, soils, biomes, intents)
  - No adapter writes
- Gameplay stage: `map-ecology` (phase `gameplay`)
  - Owns engine-facing writes and any `artifact:map.*` projections
  - Provides `field:*` and `effect:*` tags

See: `GREENFIELD.md`, `TARGET.md`.

### 2) Enforce atomic per-feature ops by splitting mega-ops (non-negotiable)

Two existing ops violate the “one feature = one op” intent:
- `ecology/features/vegetated-placement` (plans multiple vegetated features)
- `ecology/features/wet-placement` (plans multiple wet features)

Target posture:
- Replace each mega-op with **per-feature** plan ops (and optional compute ops) and move orchestration into the step.
- Preserve behavior by running the same logic, just re-homed behind smaller atomic op boundaries.

### 3) Compute substrate model (compute ops vs plan ops)

Target:
- **Compute ops** produce reusable layers/fields (typed arrays) that multiple features reuse.
- **Plan ops** consume compute layers to emit discrete intents/placements.

Behavior-preserving refactor strategy:
- Prefer “extract then reuse”: split “compute inside a plan op” into a compute op + a plan op that consumes it, but keep formulas/thresholds identical.
- Policies live in `rules/**` imported by ops (already the prevailing pattern in Ecology ops).

### 4) How we model `features-plan` advanced toggles (lock this)

Goal:
- No step imports of `@mapgen/domain/ecology/ops`.
- Compiler-owned envelope normalization (declare ops in `contract.ops` where they are truly op envelopes).
- Preserve existing config entrypoints in presets/configs (`vegetatedFeaturePlacements`, `wetFeaturePlacements`) or provide an explicit migration story.

Recommended feasibility default:
- Treat `vegetatedFeaturePlacements` / `wetFeaturePlacements` as **step-owned orchestration config** (not a mega-op envelope).
- Internally, the step runs a set of **atomic per-feature ops** whose envelopes are declared in `contract.ops` (and default to “disabled” to avoid turning features on by default).
- Stage compile can optionally translate the legacy config shape into internal per-feature op envelopes to preserve compatibility.

This decision is captured explicitly as a decision packet (see `DECISIONS/`).

## Target Contract Matrix

See: `CONTRACT-MATRIX.md`

## Decisions (Locked In This Stage)

See: `DECISIONS/README.md` and the individual packets under `DECISIONS/`.

## Parity Gates (Feasibility Baseline)

Baseline ecology tests pass, but require build-order:
- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd packages/mapgen-core build`
- `bun --cwd mods/mod-swooper-maps test test/ecology`

Recorded details: `_scratch/feasibility/03-experiments.md`

## Next Output: Phase 3 Skeleton

See: `PHASE-3-SKELETON.md`
