# Status: Mod doc (Swooper Maps)

This page documents the Swooper Maps mod’s own architecture.
It is **not** canonical MapGen SDK documentation.

Canonical MapGen docs:

- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/REFERENCE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`

# Map Generator Runtime Architecture

## Overview

Swooper Maps has two repository owners with one stable runtime identity. The
reusable `@swooper/swooper-physics` definition owns domains, the Standard
recipe, authored configs/catalog, metrics, visualization authorship, and
product diagnostics. The `@swooper/swooper-physics-mod` application owns Civ7
entry generation, mod files, bundling, deployment, and live proof for its own
production realization. The qualified MapGen Studio
`swooper-map-realization` adapter independently composes the public definition
with pure run-workspace and mod-install capabilities for ephemeral Studio
materialization; it neither imports nor invokes the production app. The
application depends on the definition, and the definition never imports either
application. Both realization paths preserve the existing `mod-swooper-maps`
runtime namespace and Civ7 mod identity where that identity is part of the
result they materialize.

Canonical JSON map configs plus recipe selection let shipped variants share
one product definition while keeping each selectable world's identity and full
recipe config in one source file.

Shipped map variants are authored only as
`plugins/mod/map/swooper-physics/src/maps/configs/*.config.json`. Each file contains the
map id, display name, description, recipe id, sort order, optional latitude
bounds, and the full flat standard-recipe config payload.
`nx run swooper-physics-mod:build` consumes and validates that directory, bundles
each virtual map entrypoint, and materializes the complete Civ7 mod tree under
`dist/mod`. `nx run swooper-physics:gen:studio-map-catalog` separately
projects the same source index into Studio's built-in catalog. Do not
hand-author shipped map wrappers or shipped `.config.ts` files. Generated
TypeScript entrypoints and a tracked deployment tree are intentionally absent:
the build plan derives the deployable output directly from admitted definition
data.

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
- Mutable/current Civ7 state is observed fresh through exact, declared adapter
  bulk-layer capabilities and remains invocation-local. Terrain, elevation,
  biome, feature, water, lake, area, and river reads return detached storage;
  steps request only the layers needed at that lifecycle boundary rather than a
  privileged complete-surface snapshot. Metrics facets may retain completed
  scalar or component evidence, but neither the observation nor the facet
  evidence is a pipeline artifact.
- Runtime parity is now treated as a contract boundary:
  - lake plan vs engine water mask mismatch is emitted as projection evidence,
  - biome/placement land-water drift is always emitted and remains a strict-candidate gate until a post-hydrology authoritative land mask artifact is finalized.

Placement runtime now uses:

- deterministic stamping for natural wonders,
- deterministic resource plans materialized through typed adapter intent APIs,
- typed per-placement outcomes for resource reconciliation,
- Civ7's official discovery generator, with observed counts retained as metric
  and log evidence rather than a second Swooper-authored discovery product.

The adapter, not a downstream mod-specific generator path, owns Civ7 feasibility
checks and engine materialization calls. Resource rejections are accepted only when
typed by the adapter; resource readback mismatches are fail-hard drift evidence.
Discovery materialization delegates to Civ7 because no independent Swooper
discovery policy exists. Swooper supplies the already-assigned major starts and
polar exclusion margin, then retains attempted, placed, and rejected totals
without claiming per-tile reconciliation that Civ7 does not expose.

## Current code pointers

- Definition owner: `plugins/mod/map/swooper-physics/`
- Map config authority: `plugins/mod/map/swooper-physics/src/maps/configs/*.config.json`
- Recipes and domains: `plugins/mod/map/swooper-physics/src/{recipes,domain}/*`
- Civ7 realization owner: `apps/mods/map/swooper-physics/`
- Map realization compiler: `apps/mods/map/swooper-physics/src/runtime/map-script/*`
- Generated Civ7 mod tree: `apps/mods/map/swooper-physics/dist/mod/*`

## Legacy TypeScript Architecture (M6)

- Entry scripts resolve map init data via `applyMapInitData` / `resolveMapInitData` in `src/maps/_runtime/map-init.ts`.
- Entry scripts build run settings + recipe config (see `src/maps/_runtime/standard-config.ts`).
- Entry scripts select a recipe (e.g., `standardRecipe`) and execute via `runStandardRecipe` (or `recipe.run` directly).
- Steps read per-step config from the recipe config; run-global overrides live in `RunRequest.settings` and surface as `context.settings`.

This section is retained as historical context and is not used by the current code pointers above.

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

The portable definition and the Civ7 realization have separate proof. A
headless or browser run proves deterministic MapGen behavior only; it does not
prove loader acceptance or live Civ7 behavior. Live iteration flows through a
qualified app: the app acquires the selected Tuner provider, binds the public
controller client through a narrow typed-envelope transport, and supplies the
MapGen-runs service with that client plus the public Swooper definition and its
exact host adapters. The binding never regenerates a mature controller
operation body. FireTuner and raw Tuner commands remain explicit app-owned
diagnostic evidence, never a second product control path. A live claim closes
only when materialization, installation, loader, and bounded engine observation
all name the same run correlation.

## Legacy JS Architecture (Archived)

The pre-M4 JS architecture relied on presets, global runtime config storage, and `tunables` rebinds to feed the orchestrator. That flow (including `bootstrap({ presets })` and `stageConfig` enablement) is intentionally removed in M4 and should not be used for current mod entrypoints.
