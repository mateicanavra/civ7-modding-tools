# Spike: MapGen Studio App Architecture

Using the spike workflow + architecture method: I reviewed the current MapGen Studio `App.tsx` and the existing MapGen Studio + pipeline visualization specs, then cross-checked modern React/TS patterns in official docs.

### 1) Objective
Propose a scalable, modern React + TypeScript architecture for MapGen Studio (a browser-based pipeline runner + visualization tool) that cleanly separates:
- generation/run orchestration (worker),
- visualization protocol + data model,
- deck.gl rendering + viz-specific processing,
- UI + feature logic,
- state management.

### 2) Assumptions and Unknowns
- Assumption: MapGen Studio will grow into multiple “modes” (dump replay viewer, in-browser runner, pipeline graph/plan viewer, later editor).
- Assumption: The “gen core SDK” you refer to is primarily `@swooper/mapgen-core` + `@civ7/adapter` and recipes/config from the mod/authoring side.
- Unknown (important): whether MapGen Studio should depend on `mods/mod-swooper-maps` sources directly (recipes, tags), or whether we want a browser-safe “recipes SDK” package that the app/worker imports instead.

### 3) What We Learned (Current State + Specs)
**Current `App.tsx` reality**
- `apps/mapgen-studio/src/App.tsx:10` defines `VizLayerEntryV0` / `VizManifestV0` locally and implements: dump loading (folder picker), manifest parsing, binary decoding, coordinate transforms, deck.gl layer construction, legend/color logic, and all UI in one file. `apps/mapgen-studio/src/App.tsx:296`
- It’s a V0 “dump replay viewer”: open a folder containing `manifest.json` and `data/*` and render via deck.gl. `apps/mapgen-studio/src/App.tsx:384`, `apps/mapgen-studio/src/App.tsx:934`
- The manifest types are duplicated from the Node dump producer in `mods/mod-swooper-maps/src/dev/viz/dump.ts:8`. (That file also defines the dump sink and viz dumper.)

**Where “Viz” currently lives in the pipeline**
- The pipeline-side contract today is `VizDumper` in `@swooper/mapgen-core` (`packages/mapgen-core/src/core/types.ts:165`). It’s dump-oriented, but conceptually already the “viz sink hook point”.

**Specs emphasize a clean boundary**
- V0.1 explicitly wants: Web Worker runs recipe + streams viz layers in-memory via a versioned protocol; dumps become optional. `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md:1`
- Pipeline visualization doc calls out coordinate spaces (tile vs mesh) as a first-class concern and sketches a viewer shape that matches what `App.tsx` is doing. `docs/system/libs/mapgen/pipeline-visualization-deckgl.md:1`

### 4) Proposed Architecture (Recommendation)
This is a **hybrid**: *feature-based app organization* + *domain packages for shared “viz runtime” concerns*.

#### A) New packages (recommended extractions)
1) **`packages/mapgen-viz` (new, environment-agnostic)**
   Purpose: the shared “viz protocol + model” that both the worker and the UI can depend on, without pulling React or deck.gl.
   - `protocol/` — versioned message + layer payload types (e.g., `viz.layer.upsert`, `run.progress`), and dump manifest types (V0).
     - Consolidate the duplicated types currently in `apps/mapgen-studio/src/App.tsx:10` and `mods/mod-swooper-maps/src/dev/viz/dump.ts:8`.
   - `schema/` — runtime validators (Zod recommended) for protocol messages + manifests (prevents drift and makes upgrades explicit).
   - `coords/` — coordinate-space utilities + bounds helpers (tile hex layout, mesh space).
   - `palette/` — palette registry + legend helpers (so “layerId → legend” doesn’t live in the React component).

2) **`packages/mapgen-browser-runner` (new, worker-first)**
   Purpose: a browser-safe runner that wraps `@swooper/mapgen-core` execution and emits `mapgen-viz` protocol events.
   - `worker/` — the actual worker entrypoint (no UI imports, no deck.gl).
   - `adapter/` — “BrowserAdapter” composition (built on `createMockAdapter` posture from `docs/projects/mapgen-studio/BROWSER-ADAPTER.md:1`).
   - `viz-sinks/` — `StreamingSink` (postMessage + transferables) and optional `DumpSink` (later, OPFS/zip/export).
   - This keeps MapGen Studio (React app) small: it becomes “start worker, show UI, render layers”.

3) **`packages/civ7-tables` (new, generated artifacts wrapper)**
   Purpose: the bundled Civ7-derived lookup tables that the worker imports (terrain/biome/feature indices, map sizes) as described in `docs/projects/mapgen-studio/BROWSER-ADAPTER.md:15`.
   - Key property: worker imports modules; no runtime fetching; consistent with V0.1 spec.

4) **(Optional, but likely) `packages/mapgen-recipes` (browser-safe recipe entrypoints)**
   If we decide the app/worker should *not* import from `mods/`, package the browser-approved recipes/config schemas here.
   - Today, Foundation recipe entrypoint is in the mod: `mods/mod-swooper-maps/src/recipes/foundation/recipe.ts:1`.

#### B) React app layout (apps/mapgen-studio)
Adopt a **feature-sliced** layout so new modes don’t re-balkanize “components vs hooks vs state” folders:

```
apps/mapgen-studio/src/
  app/
    App.tsx            (router + providers)
    routes/            (mode-level routing)
    layout/            (shell, panels, split view)
  features/
    replay/            (V0 dump viewer)
    runner/            (V0.1 worker runner controls + progress)
    pipeline/          (plan/graph visualization; later editing)
    inspector/         (layer list, legend, hover probe; shared)
  viz/
    deckgl/
      renderers/       (grid/points/segments renderers)
      controller/      (viewState, fit-to-bounds, interactions)
      picking/         (hover/click inspect)
  components/
    ui/                (shadcn/ui landing zone)
    shared/            (SplitPane, Toolbar, ErrorPanel)
  state/
    studio.store.ts    (global store: runs, layers, selection, UI prefs)
  lib/
    file-access/       (folder picker + URL loader abstraction)
    errors/
    perf/
```

Notes:
- Make `App.tsx` the shell and keep each “mode” in `features/*` to avoid repeating the current “one mega file” anti-pattern.
- Keep deck.gl specifics in `src/viz/deckgl` (or in a future `packages/mapgen-viz-deckgl` if we end up reusing it outside Studio).

#### C) Separation of concerns (explicit boundaries)
1) **Visualization protocol/model (pure TS)**
- Lives in `packages/mapgen-viz`.
- Owns: `LayerDescriptor`, `LayerPayload` unions, `RunEvent` unions, versioning, schemas, palette metadata, coordinate space definitions.

2) **Generation/run orchestration**
- Lives in the worker package `packages/mapgen-browser-runner`.
- Owns: compiling/running recipe, cancellation, progress events, emitting layer payloads via the protocol.

3) **Rendering (deck.gl)**
- Lives in the app (`apps/mapgen-studio/src/viz/deckgl`) and depends on deck.gl.
- Consumes `mapgen-viz` protocol objects and turns them into deck.gl “binary data” layers (avoid per-point object allocation long-term).

4) **Feature logic**
- `features/runner`: worker lifecycle + run config UI + progress timeline.
- `features/replay`: dump source selection + manifest decode + “import run into store”.
- `features/pipeline`: visualize execution plan nodes + requires/provides graph (driven by `ExecutionPlanNode` shape in `packages/mapgen-core/src/engine/execution-plan.ts:49`).

5) **UI components**
- `components/ui`: shadcn-generated components (kept isolated so adopting Tailwind/shadcn doesn’t require a reorg).
- `components/shared`: app-specific primitives (layout, panels, toolbars).

#### D) State management (scales with modes)
Recommendation: **Zustand** as the global store for “studio state” (runs/layers/selection/view state), plus local component state for ephemeral UI. citeturn1search3

Store shape should be normalized and protocol-friendly:
- `runs[runId]`: status, config, planFingerprint, progress events.
- `layers[runId][layerKey]`: descriptor + payload handles (buffers) + derived stats (min/max) + bounds.
- `ui`: selected `runId`, selected layer, view state, palette overrides, toggles.

For “server-ish” data (later URL-based dumps, remote catalogs), add TanStack Query. citeturn1search2

React guidance still holds: don’t over-globalize; keep state close when it’s truly local. citeturn0search0

#### E) Routing / Modes
Because you explicitly expect multiple modes, adopt a real router now:
- Prefer **TanStack Router** for type-safe route params if you’re already comfortable with TanStack ecosystem. citeturn1search1
- Otherwise React Router is fine; the key is “mode = route”.

#### F) Worker mechanics (Vite)
Implement the runner worker using Vite’s recommended worker pattern. citeturn2search0
- This also helps enforce the “no node/engine imports in worker graph” constraint from `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md:170`.

### 5) Minimal Experiment (Optional)
Smallest validation that this architecture is “real” without a reorg:
- Create `packages/mapgen-viz` with just the shared `VizManifestV0` + `VizLayerEntryV0` types and update *both* producer and viewer to import it.
- This immediately removes duplication (`apps/mapgen-studio/src/App.tsx:10` vs `mods/mod-swooper-maps/src/dev/viz/dump.ts:8`) and proves the cross-boundary package shape.

### 6) Risks and Open Questions
- **Recipe packaging boundary:** do we want MapGen Studio to import recipes from `mods/` (fastest) or from a browser-safe “recipes SDK” package (cleaner, less accidental Node/Civ engine coupling)?
- **Protocol drift:** without runtime validation + explicit versioning, the worker/main/dump formats will drift quickly; recommend making “protocol v0” explicit in `packages/mapgen-viz`.
- **Performance:** current viewer allocates lots of JS objects for points/segments/tiles; fine for V0, but the renderer architecture should be able to switch to deck.gl binary attributes and/or texture-based grid rendering without touching feature/UI code.

### 7) Next Steps
If you want to continue from “architecture” into “how do we migrate and what’s the impact”, this becomes a `/dev-spike-feasibility` (because it’s integration + sequencing).

Skills used: `architecture`, `spike-methodology`, `git-worktrees`, `deep-search`, `web-search`.

