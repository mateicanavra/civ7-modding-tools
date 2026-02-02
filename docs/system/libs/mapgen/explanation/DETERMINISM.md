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
- an explicit run `env` with seed and dimensions,
- a deterministic RNG state tracked in context,
- strict config compilation (no silent unknowns),
- stable plan fingerprinting for trace/viz identity.

## Debug posture (trace/viz)

When determinism is in doubt:
- run twice with the same inputs and compare trace/viz artifacts,
- focus on the first step where outputs diverge,
- and identify the nondeterministic source (e.g. unseeded randomness, time-based input).

## Ground truth anchors

- RNG state type: `packages/mapgen-core/src/core/types.ts`
- Run identity derivation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Trace session + stable stringify: `packages/mapgen-core/src/trace/index.ts`
