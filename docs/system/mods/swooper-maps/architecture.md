# Status: Mod doc (Swooper Maps)

This page documents the Swooper Maps mod’s own architecture.
It is **not** canonical MapGen SDK documentation.

Canonical MapGen docs:

- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/REFERENCE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`

# Map Generator Runtime Architecture

## Overview

This mod uses **explicit overrides + recipe selection** so variants can share one codebase while choosing configuration and step enablement explicitly (no preset composition in the TS runtime).

## Physics-Truth Cutover (Ecology + Placement)

Current architecture for ecology, lakes, and placement is intentionally physics-first:

- Pipeline artifacts are canonical truth (`hydrography`, `lakePlan`, biome/feature intents, resource/wonder/discovery plans).
- Map and placement stages project those artifacts to engine state; they do not delegate generation authority to engine random generators.
- Hydrology projection evidence is map-owned (`artifact:map.hydrology.engineProjectionLakes`, `artifact:map.rivers.engineProjectionRivers`); Hydrology hydrography remains truth-only (`artifact:hydrology.hydrography`, `artifact:hydrology.lakePlan`).
- Runtime parity is now treated as a contract boundary:
  - lake plan vs engine water mask mismatch is emitted as projection evidence,
  - biome/placement land-water drift is always emitted and remains a strict-candidate gate until a post-hydrology authoritative land mask artifact is finalized.

Placement runtime now uses:

- deterministic stamping for natural wonders,
- deterministic resource/discovery plans materialized through typed adapter intent APIs,
- typed per-placement outcome artifacts for resource/discovery reconciliation.

The adapter, not a downstream mod-specific generator path, owns Civ7 feasibility
checks and effect materialization. Resource rejections are accepted only when
typed by the adapter; resource readback mismatches are fail-hard drift evidence.
Discovery materialization records typed acceptance/rejection because Civ7 does
not expose resource-like discovery readback.

## Current mod code pointers

- Map definitions: `mods/mod-swooper-maps/src/maps/*`
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

Headless generation via an `InMemoryAdapter` proved impractical (the pipeline still depends on Civ VII engine globals such as `GameplayMap`, `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`, `GameInfo`, etc.), so the stub adapter has been removed. For rapid iteration we instead rely on FireTuner-driven workflows to trigger map generation without restarting the client.

## Legacy JS Architecture (Archived)

The pre-M4 JS architecture relied on presets, global runtime config storage, and `tunables` rebinds to feed the orchestrator. That flow (including `bootstrap({ presets })` and `stageConfig` enablement) is intentionally removed in M4 and should not be used for current mod entrypoints.
