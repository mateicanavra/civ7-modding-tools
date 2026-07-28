<toc>
  <item id="purpose" title="Purpose"/>
  <item id="why" title="Why determinism matters"/>
  <item id="mechanics" title="Mechanics (what makes runs reproducible)"/>
  <item id="debug" title="Debug posture (trace/viz)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Determinism and reproducibility (explanation)

## Purpose

Explain how MapGen achieves deterministic runs (and where determinism can be accidentally broken).

## Why determinism matters

- Debugging: you can reproduce a failure from a seed.
- Review: you can compare changes by holding inputs constant.
- Authoring: knob/preset tuning needs stable deltas, not random noise.

## Mechanics (what makes runs reproducible)

Key contributors:
- one immutable `MapSetup` with `mapSeed`, dimensions, and latitude bounds,
- one schema-admitted recipe initial value whose complete snapshot participates in plan identity,
- a deterministic RNG state tracked in context and derived from `context.setup.mapSeed`,
- a distinct admitted `gameSeed` for gameplay-facing choices such as player-seat assignment,
- strict config compilation (no silent unknowns),
- stable plan fingerprinting for trace/viz identity.

For Standard generation, `mapSeed` and `gameSeed` are separate authorities. Physics and geographic
generation use `mapSeed`; gameplay placement uses `gameSeed`. Exact map selection, ordered
alive-major player identities, and setup-option evidence are also retained in the initial value, so
reproducing a run does not depend on later ambient engine reads.

`ctxRandom(...)`, `deriveStepSeed(...)`, and `createLabelRng(...)` are the
pipeline-owned entropy surfaces. They must not delegate to
`EngineAdapter.getRandomNumber(...)`; the adapter RNG is a Civ7 compatibility
surface for adapter-owned behavior, not authored MapGen physics.

## Debug posture (trace/viz)

When determinism is in doubt:
- run twice with the same inputs and compare trace/viz artifacts,
- focus on the first step where outputs diverge,
- and identify the nondeterministic source (e.g. unseeded randomness, time-based input).

## Ground truth anchors

- Map setup: `packages/mapgen-core/src/core/map-setup.ts`
- Map context: `packages/mapgen-core/src/core/map-context.ts`
- RNG helpers: `packages/mapgen-core/src/core/random.ts`
- Stable plan identity: `packages/mapgen-core/src/engine/execution-plan.ts`
- Standard initial setup: `plugins/mod/map/swooper-physics/src/recipes/standard/initial-setup.ts`
- Fresh execution-attempt identity: `packages/mapgen-core/src/core/map-context.ts`
- Public trace contracts + stable stringify: `packages/mapgen-core/src/trace/index.ts`
- Executor-owned trace session: `packages/mapgen-core/src/trace/session.ts`
