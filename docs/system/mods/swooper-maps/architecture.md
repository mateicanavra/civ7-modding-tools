# Status: Mod doc (Swooper Maps)

This page documents the Swooper Maps mod’s own architecture.
It is **not** canonical MapGen SDK documentation.

Canonical MapGen docs:

- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/REFERENCE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`

# Map Generator Runtime Architecture

## Overview

This mod uses **canonical JSON map configs + recipe selection** so shipped
variants share one codebase while keeping each selectable world's identity and
full recipe config in one source file.

Shipped map variants are authored only as
`mods/mod-swooper-maps/src/maps/configs/*.config.json`. Each file contains the
map id, display name, description, recipe id, sort order, optional latitude
bounds, and the full flat standard-recipe config payload. `bun run --cwd
mods/mod-swooper-maps gen:maps` validates that directory and generates the
per-map entry modules plus Civ7 map rows, modinfo imports, localization rows,
and the Studio built-in config catalog. Do not hand-author shipped map wrappers
or shipped `.config.ts` files.

## Physics-Truth Cutover (Ecology + Placement)

Current architecture for ecology, lakes, and placement is intentionally physics-first:

- Pipeline artifacts are immutable products owned and cataloged by their direct
  domain modules (`hydrography`, `lakePlan`, biome/feature intents, and
  resource/wonder plans). Recipe stages select and publish those authorities;
  they do not define artifact catalogs.
- Map and placement stages project admitted Swooper products to engine state.
  Discovery placement is the explicit exception: Civ7's narrative-coupled
  generator owns that product because Swooper has no independent discovery
  policy or stable catalog to materialize.
- The Hydrology hydrography module owns both physical truth and the immutable
  Civ7-projectable river selection
  (`artifact:map.rivers.projectedNavigableRivers`). The stable `map.rivers`
  runtime namespace identifies that projection product, not a stage catalog.
- Mutable/current Civ7 state is observed fresh through declared adapter
  capabilities and remains invocation-local. Metrics facets may retain
  completed scalar or component evidence, but neither the observation nor the
  facet evidence is a pipeline artifact.
- Runtime parity is now treated as a contract boundary:
  - lake plan vs engine water mask mismatch is emitted as projection evidence,
  - biome/placement land-water drift is always emitted and remains a strict-candidate gate until a post-hydrology authoritative land mask artifact is finalized.

Placement runtime now uses:

- deterministic stamping for natural wonders,
- deterministic resource plans materialized through typed adapter intent APIs,
- typed per-placement outcome artifacts for resource reconciliation,
- Civ7's official discovery generator, with completion and observed counts
  retained as effect, metric, and log evidence rather than a second
  Swooper-authored discovery product.

The adapter, not a downstream mod-specific generator path, owns Civ7 feasibility
checks and effect materialization. Resource rejections are accepted only when
typed by the adapter; resource readback mismatches are fail-hard drift evidence.
Discovery materialization delegates to Civ7 because no independent Swooper
discovery policy exists. Swooper supplies the already-assigned major starts and
polar exclusion margin, then retains attempted, placed, and rejected totals
without claiming per-tile reconciliation that Civ7 does not expose.

## Current mod code pointers

- Map config authority: `mods/mod-swooper-maps/src/maps/configs/*.config.json`
- Generated map entry sources: `mods/mod-swooper-maps/src/maps/generated/*`
- Recipes: `mods/mod-swooper-maps/src/recipes/*`

## Legacy TypeScript Architecture (M6)

- Entry scripts resolve map init data via `applyMapInitData` / `resolveMapInitData` in `src/maps/_runtime/map-init.ts`.
- Entry scripts build run settings + recipe config (see `src/maps/_runtime/standard-config.ts`).
- Entry scripts select a recipe (e.g., `standardRecipe`) and execute via `runStandardRecipe` (or `recipe.run` directly).
- Steps read per-step config from the recipe config; run-global overrides live in `RunRequest.settings` and surface as `context.settings`.

This section is retained as historical context and is not used by the current mod code pointers above.

Example (minimal runnable pipeline):

```ts
import standardRecipe from "./recipes/standard/recipe.js";
import { applyMapInitData } from "./maps/_runtime/map-init.js";
import { runStandardRecipe } from "./maps/_runtime/run-standard.js";

const init = applyMapInitData({ logPrefix: "[MOD]" });
runStandardRecipe({ recipe: standardRecipe, init, overrides: {} });
```

## Dependency Chain Visualization (M6)

```
┌─────────────────────────────────────────────────┐
│ CIV VII Engine                                  │
│ Loads: entry script (map variant)               │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────▼──────────┐
        │ Entry File           │
        │ ├─ applyMapInitData  │  ← Adapter seed + init
        │ └─ runStandardRecipe │  ← Executes recipe
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │ recipe.run()         │
        │ ├─ compile plan      │  ← ExecutionPlan
        │ └─ execute plan      │  ← PipelineExecutor
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │ Step graph            │
        │ └─ steps read config  │  ← recipe config + context.settings
        └──────────────────────┘
```

## Operational Note

Headless generation via an `InMemoryAdapter` proved impractical (the pipeline still depends on Civ VII engine globals such as `GameplayMap`, `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`, `GameInfo`, etc.), so the stub adapter has been removed. For rapid iteration we use the repo-owned direct control package (`@civ7/direct-control`) to send tuner-socket commands such as `Network.restartGame()` and the native Begin Game action (`UI.notifyUIReady()`) to a running Civ7 client. FireTuner remains useful reference-client evidence, but it is no longer the default runtime control path for repo tooling.

## Legacy JS Architecture (Archived)

The pre-M4 JS architecture relied on presets, global runtime config storage, and `tunables` rebinds to feed the orchestrator. That flow (including `bootstrap({ presets })` and `stageConfig` enablement) is intentionally removed in M4 and should not be used for current mod entrypoints.
