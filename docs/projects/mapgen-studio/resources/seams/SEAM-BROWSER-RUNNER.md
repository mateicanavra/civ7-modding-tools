# agent-browser-runner — browser pipeline runner seam (MapGen Studio)

Scope: document the current browser runner orchestration in `apps/mapgen-studio/src/App.tsx` and the worker/protocol in `apps/mapgen-studio/src/browser-runner/*`, with a focus on retention semantics (step/layer selection, seed reroll, cancel, errors) and extraction boundaries.

## 1) Files reviewed

- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
- `apps/mapgen-studio/src/browser-runner/foundation.worker.ts`
- `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- `apps/mapgen-studio/vite.config.ts`
- `apps/mapgen-studio/tsconfig.json`
- `apps/mapgen-studio/package.json`
- `apps/mapgen-studio/scripts/check-worker-bundle.mjs`

## 2) Runner responsibilities today (state + side effects)

### UI-owned state that is currently “runner adjacent”

The `App` component owns *both* runner state and unrelated viz/UI state.

Runner-adjacent state (not exhaustive):

- Worker lifecycle
  - `browserWorkerRef: Ref<Worker|null>` (current worker instance)
  - `browserRunTokenRef: Ref<string|null>` (current “run token” used to ignore stale events)
  - `browserRunning: boolean` (UI gating + retention behavior gate)
- Run identity and progress
  - `browserManifest: VizManifestV0|null` (in-memory manifest assembled from streamed events)
  - `browserLastStep: {stepId, stepIndex}|null` (used for header status line)
- Run inputs
  - `browserSeed: number`
  - `browserMapSizeId: Civ7MapSizePreset["id"]`
  - `browserConfigOverridesEnabled: boolean`
  - `browserConfigOverrides: BrowserTestRecipeConfig`
  - JSON edit state for overrides (`browserConfigTab`, `browserConfigJson`, `browserConfigJsonError`)
- Error surface
  - `error: string|null` (single multiline string; shared by dump + browser mode)

Non-runner but coupled via “selection retention”:

- Step selection: `selectedStepId: string|null` + `selectedStepIdRef`
- Layer selection: `selectedLayerKey: string|null` + `selectedLayerKeyRef`
- View fitting and other viz toggles (`viewState`, `tileLayout`, `showMeshEdges`, `eraIndex`, etc.)

### Side effects / orchestration performed by `App`

`App` acts as the browser-runner “controller”:

- Starts runs
  - Clears error.
  - Validates config override JSON (if overrides enabled and JSON tab active).
  - Computes “pinned selection” from refs and applies retention rules (see §3).
  - Clears or retains selection + view based on retention.
  - Generates `runToken` and stores it in `browserRunTokenRef`.
  - Creates `new Worker(new URL("./browser-runner/foundation.worker.ts", import.meta.url), { type: "module" })`.
  - Installs `worker.onmessage` handler for `BrowserRunEvent` and `worker.onerror`.
  - Builds `BrowserRunRequest` (`type: "run.start"`) and posts it.
- Receives events and mutates UI state
  - `run.started`: creates new in-memory manifest skeleton (empty `steps` and `layers`).
  - `run.progress` (`step.start` only): updates `browserLastStep`; appends unique step records to `browserManifest.steps`.
  - `viz.layer.upsert`: upserts a `VizLayerEntryV0` into `browserManifest.layers` and stores the transferred `ArrayBuffer`s directly on the entry.
  - `run.finished`: sets `browserRunning=false`.
  - `run.error`: sets `browserRunning=false` and formats a user-visible multiline error string.
- Stops runs (cancel)
  - “Cancel” terminates the worker (hard stop) via `worker.terminate()`.
  - Clears `browserWorkerRef` and `browserRunTokenRef` so late events are ignored.
  - Clears `browserLastStep` and sets `browserRunning=false`.
  - Does **not** clear `browserManifest` (partial data remains visible).
- Mode switching coupling
  - Switching `mode` to `"dump"` triggers `stopBrowserRun()` via `useEffect`.
  - Unmount triggers `stopBrowserRun()` via `useEffect` cleanup.

## 3) State machine / UX invariants (explicit retention semantics)

### High-level state machine (browser runner)

Practical states in the UI:

- **idle**: no worker; `browserRunning=false`; `browserManifest` may be `null` or “previous run” data
- **running**: `browserRunning=true`; worker exists; `browserRunTokenRef` set
- **finished**: `browserRunning=false`; worker still exists (idle); run token remains set until next start/cancel/unmount
- **errored**: `browserRunning=false`; `error` set; worker still exists (idle); run token remains set until next start/cancel/unmount
- **canceled**: `browserRunning=false`; worker terminated; run token cleared; `browserManifest` is **not** cleared

Notes:

- `browserRunning` is the main UX gate (disables Run/Map size, enables Cancel, and affects step retention logic).
- There is no separate “status enum”; error vs finished is inferred from `error` + last received events.

### Invariants / behaviors (as implemented today)

#### Rerun retains selected step

On `startBrowserRun()`:

- The “pinned” step is captured *immediately before reset* from `selectedStepIdRef.current`.
- Retention rule: `retainStep = Boolean(pinnedStepId)`.
- If `retainStep` is true:
  - `selectedStepId` is **not** cleared when the run is reset.
  - `App` allows the step dropdown to remain “pinned” to that step even while the new manifest is empty.
  - During the run, if the pinned step hasn’t been streamed yet, the step dropdown shows an explicit `(pending)` option for it.
- A separate effect prevents auto-resetting the selected step while a run is active:
  - If `mode === "browser" && browserRunning && selectedStepId` and the selected step is not in `manifest.steps` yet, the effect returns early (keeps the pinned step).

Edge case (important): if the run ends in error *before* the pinned step is reached, behavior depends on whether `run.started` was ever received:

- If `run.started` **was received** (so `browserManifest` is non-null), `browserRunning` becomes false and the “keep pinned while running” guard no longer applies. The selection effect will snap selection to the first available step in `manifest.steps` (and clear layer selection).
- If `run.started` **was not received** (e.g. worker rejects config overrides before posting `run.started`), `browserManifest` remains `null`, so the selection effect never runs and the pinned step/layer remain visible as `(pending)` even after the error.

#### Rerun retains selected layer

On `startBrowserRun()`:

- The “pinned” layer is captured from `selectedLayerKeyRef.current`.
- Retention rule: `retainLayer = Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(\`\${pinnedStepId}::\`))`.
- If `retainLayer` is true:
  - `selectedLayerKey` is **not** cleared when the run is reset.
  - The layer dropdown can remain “pinned” to a layer key that does not yet exist in the new run’s manifest; it renders a `(pending)` option until the layer arrives.
- If `retainLayer` is false:
  - `selectedLayerKey` is cleared on rerun.

Layer auto-selection when nothing is chosen:

- When a `viz.layer.upsert` arrives, if `selectedLayerKey` is currently `null`, `App` tries to auto-select the first layer for the **desired step**:
  - `desiredStep = selectedStepIdRef.current ?? msg.layer.stepId`
  - Only selects the first layer if the incoming layer belongs to `desiredStep`.
- Additionally, a `useEffect` ensures that when `selectedStepId` is set and there is no layer key for that step, the first layer for the step is auto-selected and the view is fitted.

#### Seed reroll triggers auto-run and preserves retention

The “Reroll” button:

- Generates `next = randomU32()`
- Calls `setBrowserSeed(next)`
- Immediately calls `startBrowserRun({ seed: next })`

Retention behavior on seed reroll is **identical** to a normal rerun: it uses the same `pinnedStepId/pinnedLayerKey` capture and the same `retainStep/retainLayer` rules.

#### Cancel semantics (what “cancel” means in worker/client)

Current “Cancel” behavior is **hard termination**, not a protocol cancel:

- Client (`App.tsx`):
  - Calls `worker.terminate()`
  - Clears `browserRunTokenRef` so any late messages from the old worker are ignored
  - Sets `browserRunning=false` and clears `browserLastStep`
  - Leaves `browserManifest` intact (partial run data remains visible)
- Protocol (`protocol.ts`):
  - Defines `BrowserRunCancelRequest` (`type: "run.cancel"`), but…
- Worker (`foundation.worker.ts`):
  - Does **not** handle `run.cancel` at all (only `run.start` is implemented).

So: “cancel” today means “kill the worker and ignore anything it might have posted”, not “gracefully stop a run and emit `run.finished`”.

#### Error capture + formatting behavior

There are two distinct error surfaces:

- Worker-reported run error (`run.error` event)
  - Worker wraps thrown values via `describeThrown()` and posts `{ name?, message, details?, stack? }`.
  - UI formatting:
    - Header: `\`${name}: ${message}\`` if `name` exists, else `${message}`
    - Appends `details` (if present) and `stack` (if present)
    - Joined with blank lines (`\n\n`)
  - Sets `browserRunning=false`
- Worker runtime error (`worker.onerror`)
  - UI uses `formatErrorForUi(e)` which:
    - For `ErrorEvent`: includes message, filename:line:col, and formats nested `.error` recursively.
    - For `Error`: includes name/message, JSON-ish details (if non-empty), and stack.
  - Sets `browserRunning=false`

## 4) Hidden couplings (viz + overrides rely on event streams/timing)

### Coupling: ordering and indexing are defined by streaming, not a plan

- `worker-trace-sink.ts` assigns `stepIndex` by **first-seen `step.start` order**, not by a compiled plan order.
- `App.tsx` sorts the step dropdown by `stepIndex`, so the UX assumes that “start order” corresponds to the intended “pipeline order”.
  - If steps were ever parallelized or events reordered, the step list ordering could drift.
- For layers:
  - The manifest stores layers in insertion order (upsert into an array).
  - Layer dropdown lists are not explicitly sorted; ordering is implicitly “first time we saw each layer key”.

### Coupling: retention UX assumes `(pending)` is meaningful during a rerun

The “pinned to a later step while rerunning from step 0” behavior depends on:

- `startBrowserRun()` not clearing `selectedStepId` when pinned
- The selection effect explicitly allowing `selectedStepId` to be absent from `manifest.steps` **while** `browserRunning=true`
- Event stream eventually reaching the pinned step (or else error completion may snap selection back; see §3)

### Coupling: layer auto-selection expects step and layer events to be correlated

Auto-selection for the first layer relies on:

- The “desired step” being stable via `selectedStepIdRef.current`.
- Layers arriving for that step; otherwise layer selection remains pending and the “fit view” effect may not run.

### Coupling: certain visual toggles assume specific layer IDs exist

Examples in `App.tsx`:

- Mesh overlay assumes existence of a segments layer with `layerId === "foundation.mesh.edges"`.
- “Odd-q” grid interpretation is applied when:
  - `effectiveLayer.kind === "grid"` **or**
  - `layerId.startsWith("foundation.plateTopology.")`
- Era slider behavior is *stringly typed*:
  - `parseTectonicHistoryEraLayerId` and `eraMax` scanning assume layer IDs like `foundation.tectonicHistory.era{n}.{baseLayerId}`.
  - `effectiveLayer` swaps the currently selected layer by synthesizing `desiredId` from the same naming scheme.

### Coupling: config overrides flow is split across UI and worker

- UI has two override authoring modes (form + JSON) and conditionally normalizes/validates JSON **only on run start**.
- Worker independently merges and normalizes `configOverrides` against `BROWSER_TEST_RECIPE_CONFIG` using `normalizeStrict`.
  - This means the “true” validation source of truth is the worker.
  - The UI validation gate only applies when JSON tab is active; form edits are trusted and only validated by the worker.

## 5) Extraction proposal (documentation-only plan)

Goal: isolate the “browser runner controller” into a dedicated feature/service layer while preserving the retention semantics and keeping the worker bundle clean (no React/deck.gl imports, no cyclic imports).

### Recommended module layout (paths)

Suggested structure under MapGen Studio:

- `apps/mapgen-studio/src/features/browserRunner/`
  - `useBrowserRunner.ts` — React hook boundary (worker lifecycle + state machine + retention)
  - `types.ts` — UI-facing state types (manifest model, selection keys, error model)
  - `retention.ts` — retention rules (step/layer pinning, edge cases)
  - `selectors.ts` — helpers to derive `steps`, `layersForStep`, etc. from manifest
- `apps/mapgen-studio/src/services/browserRunner/`
  - `workerClient.ts` — non-React worker wrapper (“start, cancel, onEvent”)
  - `protocol.ts` — shared message protocol (or re-export from existing location)
- Keep worker-only code in place (or move as a unit):
  - `apps/mapgen-studio/src/browser-runner/foundation.worker.ts`
  - `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
  - `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`

Key extraction boundary: `App.tsx` should only “bind UI controls” to `useBrowserRunner()` outputs and callbacks; it should not manage `Worker` instances directly.

### Proposed `useBrowserRunner()` API surface (types and callbacks; no code)

#### Inputs

```ts
import type { BrowserRunEvent, BrowserRunStartRequest } from "../../services/browserRunner/protocol";

export type BrowserRunnerPinnedSelection = {
  stepId: string | null;
  layerKey: string | null;
};

export type BrowserRunnerStartOptions = {
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: unknown; // see “protocol ownership rules”
  pin?: BrowserRunnerPinnedSelection; // retention input
};

export type BrowserRunnerEventHandlers = {
  onEvent?: (event: BrowserRunEvent) => void;
  onStepStart?: (info: { stepId: string; stepIndex: number; phase?: string }) => void;
  onLayerUpsert?: (info: { layerKey: string; stepId: string }) => void;
  onFinished?: () => void;
  onError?: (err: { message: string; details?: string; stack?: string }) => void;
};
```

#### Outputs

```ts
export type BrowserRunnerStatus = "idle" | "running" | "finished" | "error" | "canceled";

export type BrowserRunnerState = {
  status: BrowserRunnerStatus;
  runToken: string | null;
  runId: string | null;
  planFingerprint: string | null;
  lastStep: { stepId: string; stepIndex: number; phase?: string } | null;
  manifest: { version: 0; steps: Array<any>; layers: Array<any> } | null; // concrete type in `types.ts`
  error: { message: string; details?: string; stack?: string } | null;
};

export type BrowserRunnerActions = {
  start: (options: BrowserRunnerStartOptions) => void;
  cancel: (options?: { kind?: "terminate" /* current semantics */ | "protocol" }) => void;
  resetError: () => void;
};

export function useBrowserRunner(handlers?: BrowserRunnerEventHandlers): {
  state: BrowserRunnerState;
  actions: BrowserRunnerActions;
};
```

Retention semantics to encode in the API contract (so `App` doesn’t re-implement it):

- `pin.stepId !== null` => retain selected step across reruns, including “pending” placeholder while streaming.
- `pin.layerKey` retained only if it belongs to `pin.stepId` (same `\`${stepId}::\`` prefix rule).
- A “failed before pinned step arrived” behavior should be explicit: either keep pin even after error (today: conditional; see §3) or define a new behavior; if changed, document and validate.

### Protocol ownership rules (keep worker bundle clean, layering acyclic)

Recommended rules:

1. **Shared protocol must be leaf-only.**
   - `protocol.ts` may define types, string literals, and small structural helpers only.
   - No imports from React, deck.gl, or other UI code.
2. **Worker entry imports only:**
   - mapgen core/recipes/runtime deps (`@swooper/mapgen-core`, `mod-swooper-maps/recipes/*`, Civ7 tables)
   - worker-local helpers (`worker-trace-sink`, `worker-viz-dumper`)
   - shared protocol types
3. **UI runner code imports only:**
   - shared protocol types
   - worker client wrapper (`workerClient.ts`)
   - should not import worker-local helpers directly.
4. **Config override typing should not force runtime coupling.**
   - Today `protocol.ts` uses a `type`-only import of `BrowserTestRecipeConfig` (safe at runtime).
   - If protocol is meant to be recipe-agnostic, model overrides as `unknown` + “schema name/version” metadata, and let UI/worker own validation separately.
5. **Enforce via build checks.**
   - Keep `apps/mapgen-studio/scripts/check-worker-bundle.mjs` (or tighten it to explicitly target the worker chunk) to prevent Node builtins and forbidden references from leaking into the shipped bundle.

## 6) Risks + validation

### Risks / sharp edges in the current seam

- **Cancel is not graceful.** There is a `run.cancel` protocol type but no implementation; termination can leave the UI in “partial manifest” state without a clear “canceled” marker.
- **Pinned selection behavior changes on error.** Today pinning is honored only while `browserRunning=true`; after early failure (post-`run.started`), selection may snap to the first streamed step (see §3).
- **Step/layer ordering is stream-defined.** If event order changes, UX ordering changes (no plan-based ordering source of truth).
- **Memory pressure.** Layer payloads are stored as `ArrayBuffer` in React state; large maps or many layers can balloon memory quickly.
- **Worker lifetime ambiguity.** On `run.finished`/`run.error`, the worker is not terminated; it stays alive until the next start/cancel/unmount.
- **Duplicate logic.** Error formatting and bounds logic exists in both UI and worker; extraction should decide a single ownership (without importing UI into worker).

### Validation checklist for extraction (without changing behavior)

- **Retention**
  - Select a later step + layer; click `Run (Browser)` and observe step/layer remain selected as `(pending)` until data arrives.
  - Click `Reroll`; confirm it auto-runs and preserves pinned step/layer.
- **Cancel**
  - Start a run and click `Cancel`; confirm `browserRunning` stops quickly and partial results remain visible (current behavior).
  - Confirm there is no `run.finished` implied by cancel (status should be “canceled/idle”, not “finished”).
- **Errors**
  - Force a config override error and confirm the UI formats `{name,message,details,stack}` as today.
  - Confirm `worker.onerror` surfaces filename/line when available.
- **Bundling**
  - Run `bun run --cwd apps/mapgen-studio build` and ensure `check-worker-bundle` passes.
