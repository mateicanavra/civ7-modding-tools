# HARDENING: Behavior-Preserving Ecology Refactors (Parity + Invariants)

## Objective

Identify the “no behavior change” constraints/invariants for an ecology refactor and inventory existing tooling/tests that can act as a parity harness.

## Where To Start (Pointers)

- Diagnostics runner/tooling:
  - `mods/mod-swooper-maps/src/dev/diagnostics/README.md`
  - `mods/mod-swooper-maps/src/dev/diagnostics/run-standard-dump.ts` (`bun run diag:dump`)
  - `mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts` (`bun run diag:diff`)
  - `mods/mod-swooper-maps/src/dev/diagnostics/list-layers.ts` (`bun run diag:list`)
- Existing ecology test suite:
  - `mods/mod-swooper-maps/test/ecology/**`
  - Especially `mods/mod-swooper-maps/test/ecology/op-contracts.test.ts`
- Tag/effect registry:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Viz posture contract:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Findings (Grounded)

### A) Existing parity tooling: dump-first diagnostics

There is an explicit dump-first tooling suite intended for deterministic diffs:
- `mods/mod-swooper-maps/src/dev/diagnostics/README.md`
- `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label <label> [--override '{...}']`
  - Writes dumps under `mods/mod-swooper-maps/dist/visualization/<label>/<runId>/...` (under `dist/`, ignored by git).
- `bun --cwd mods/mod-swooper-maps run diag:diff -- <runA> <runB>` computes binary diffs for `u8`/`i16` grid layers.

This tooling is suitable as a “no behavior change” harness for a refactor as long as we:
- keep step ids stable (so the same layers are produced with the same layerKeys), and
- keep `dataTypeKey`/`spaceId` stable for ecology-related emissions.

### B) Existing tests already encode important invariants

`mods/mod-swooper-maps/test/ecology/op-contracts.test.ts` validates the runtime op surfaces:
- every op can be normalized (via `normalizeOpSelectionOrThrow`) and produces outputs of expected shapes.

There are additional “owned features” tests (examples):
- `features-owned-does-not-call-vanilla.test.ts`
- `features-owned-enforces-canHaveFeature.test.ts`
- `features-owned-navigable-river-exclusion.test.ts`
- `plot-effects-owned-snow.test.ts`

These tests are a strong baseline for behavior-preserving refactors because they are anchored on *contracts* and *invariants* rather than internal module shapes.

### C) Tag/effect invariants

`mods/mod-swooper-maps/src/recipes/standard/tags.ts` defines canonical dependency keys.
For ecology refactors that do not change behavior, we must preserve:
- `field:biomeId` and `field:featureType` satisfaction (provided by projection steps).
- engine effect ids provided by steps:
  - `effect:engine.biomesApplied`
  - `effect:engine.featuresApplied`

Note: `plot-effects` currently applies plot effects via adapter but does not provide an effect tag; this is likely a modeling drift vs the general “effects are guarantees” posture. For “no behavior change” we must preserve current behavior regardless, but the refactor might add an explicit effect tag later (that would be a behavior/contract change).

## No-Behavior-Change Invariants (Proposed)

### 1) Public-ish contract surfaces must remain stable

- Stage ids: `ecology`, `map-ecology` remain.
- Step ids remain stable:
  - `pedology`, `resource-basins`, `biomes`, `biome-edge-refine`, `features-plan`
  - `plot-biomes`, `features-apply`, `plot-effects`
- Artifact ids remain stable:
  - `artifact:ecology.soils`
  - `artifact:ecology.resourceBasins`
  - `artifact:ecology.biomeClassification`
  - `artifact:ecology.featureIntents`
- Viz emissions: keep existing `dataTypeKey` strings stable (see `_scratch/agent-deckgl.md`).

### 2) Behavioral parity targets

- Given fixed seed/config/dims, ecology truth artifacts should be byte-identical (or sufficiently equal where float computation is involved; prefer exact if deterministic).
- Engine-facing projection results should be stable:
  - `context.fields.biomeId` and `context.fields.featureType` after their steps run.
  - adapter calls sequence remains consistent (at least in the mock adapter run).

### 3) Determinism and RNG invariants

- Maintain stable `deriveStepSeed` labels for ecology steps (e.g., `ecology:planPlotEffects`, `ecology:planFeatureIntents`) so refactors do not perturb RNG streams.

### 4) Observability invariants

- Preserve `dataTypeKey` and `spaceId` emissions (breaks Studio continuity otherwise).
- Preserve “verbose step” behavior in dump runs (diagnostics depend on it).

## Minimal Experiment (Suggested)

Goal: establish an ecology-focused baseline that can be re-run after refactor.

1) Run baseline deterministic dump:
```bash
bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label ecology-baseline
```
2) Identify the run dir (printed JSON) and list layers:
```bash
bun --cwd mods/mod-swooper-maps run diag:list -- dist/visualization/ecology-baseline/<runId>
```
3) If we later do a refactor attempt, run the same dump and diff layers:
```bash
bun --cwd mods/mod-swooper-maps run diag:diff -- <baselineRunDir> <refactorRunDir>
```

We should additionally run the existing test suite subset:
```bash
bun --cwd mods/mod-swooper-maps test test/ecology
```

## Open Questions

- For behavior-preserving refactors, do we require exact float equality for `Float32Array` artifacts, or do we allow tolerance? (Tooling `diag:diff` currently focuses on `u8`/`i16` grids.)
- Should we add a dedicated ecology parity test that snapshots hashes of ecology artifacts for a fixed seed/config?

## Suggested Refactor Shapes (Conceptual Only)

- “Lock the contracts” first:
  - keep step ids and artifact ids stable
  - route all op calls through the injected `ops` surface so the compiler can enforce the contract
  - treat viz keys as a compatibility surface
