# MapGen Studio: `App.tsx` Refactor — Executable Plan

This is the **execution-grade** companion to:
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md` (architecture + seams + rationale)
- `docs/projects/mapgen-studio/resources/APP-TSX-SEAMS-MAP.md` (navigation)

It applies the “hardening” discipline from `dev-harden-milestone` to make the refactor **unambiguous**, **sliceable**, and **verifiable**.

---

## Effort estimate (complexity × parallelism)

- **Complexity:** medium (most work is extraction/moves; invariants are subtle)
- **Parallelism:** low → medium (seams are coupled via shared state + `App.tsx`; safest as a linear stack with small PRs)

---

## Path roots (reference once)

```text
$APP = apps/mapgen-studio
$SRC = $APP/src
$APP_TSX = $SRC/App.tsx
$WORKER = $SRC/browser-runner
$FEATURES = $SRC/features
$SHARED = $SRC/shared
$APP_SHELL = $SRC/app
```

---

## Scope boundaries (global)

### In scope
- Refactor-by-extraction of `apps/mapgen-studio/src/App.tsx` into a stable module layout under `$FEATURES`, `$APP_SHELL`, and `$SHARED`.
- Preserve behavior and UX invariants (see “Quality gates”).
- Reduce `App.tsx` to composition + orchestration (target ~250–450 LOC).
- Keep the system ready for **many recipes** (aka “infinite recipes”) without forcing a full recipe selector UI right now.

### Out of scope (explicit)
- Introducing Tailwind, shadcn/ui, or a full component library migration.
- Introducing routing (TanStack Router or similar).
- Introducing a global store (Zustand/Redux) beyond feature-local reducers/hooks.
- Reworking recipe authoring/config schemas to “look nicer” in the UI (presentation-only flattening stays).
- Changing the worker protocol or dump format beyond moving types/constants into better homes.

---

## Quality gates (non-negotiable)

### Build / bundling
- [ ] `bun run --cwd apps/mapgen-studio build` stays green (includes `check:worker-bundle`).
- [ ] Worker bundle remains browser-safe (no Node-only deps pulled into `$WORKER`).
- [ ] No import cycles introduced (layering remains acyclic; see per-slice dependency rules).

### Determinism / correctness
- [ ] Seed + config → deterministic results unchanged.
- [ ] Config override merge/validation authority remains with the worker (UI may pre-validate, but the worker is final).

### UX invariants
- [ ] Rerun retains selected step + selected layer.
- [ ] Seed reroll auto-runs and preserves retention.
- [ ] Cancel semantics remain “hard terminate” (`worker.terminate()`), unless explicitly changed later.
- [ ] Config overrides:
  - [ ] Schema-driven form is primary editor.
  - [ ] JSON editor remains an advanced/fallback path and blocks run when invalid.
  - [ ] Schema wrapper collapsing is presentation-only; **top-level stage container remains visible/collapsible**.
- [ ] Layer list:
  - [ ] Layer labels are derived from `VizLayerMeta` (`layer.meta?.label ?? layer.layerId`).
  - [ ] `layer.meta?.visibility === "debug"` is surfaced in UI labeling (current behavior: suffix `", debug"`).
  - [ ] If `layer.meta?.categories` exists, legend and colors are categorical (meta-driven); otherwise fallback heuristic legends/palettes apply.

### Paper trail (must remain true)
- Viz presentation remains sourced from `@swooper/mapgen-core` layer metadata (`VizLayerMeta`) and propagated through the browser protocol (`BrowserVizLayerEntry.meta`).
- “Many recipes” direction remains consistent with `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`.

---

## Sequencing (Graphite stack shape)

Each slice below is intended to be **one PR/branch** stacked via Graphite.

```yaml
steps:
  - slice: RFX-01
    after: []
    description: Extract config overrides feature
  - slice: RFX-02
    after: [RFX-01]
    description: Extract browser runner (worker client + retention)
  - slice: RFX-03
    after: [RFX-02]
    description: Extract viz model + deck.gl rendering (incl. contract/internal catalog)
  - slice: RFX-04
    after: [RFX-03]
    description: Extract dump viewer mode (IO + reader + state machine)
  - slice: RFX-05
    after: [RFX-04]
    description: Extract app shell/layout + reduce App.tsx to composition
```

---

## Slice: RFX-01 — Extract `configOverrides` feature

**Primary reference:** `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`.

### Objective
Move the entire config overrides subsystem (panel + RJSF templates + presentation-only schema flattening + CSS blob + JSON editor) out of `$APP_TSX` into `$FEATURES/configOverrides/*` with minimal behavior change.

### Dependency rules
- `features/configOverrides/ui/*` may import React + `@rjsf/*`.
- Any worker-safe logic stays in `features/configOverrides/shared/*` (pure TS; browser-safe).
- Must not introduce `features/*` imports into `$WORKER`.

### Proposed modules (names are binding; contents move-only at first)
```yaml
files:
  - path: $FEATURES/configOverrides/ConfigOverridesPanel.tsx
    notes: Panel layout, tabs, form vs JSON switch, “enabled” UI
  - path: $FEATURES/configOverrides/SchemaForm.tsx
    notes: RJSF wrapper + validator + form submit/changes wiring
  - path: $FEATURES/configOverrides/rjsfTemplates.tsx
    notes: Field/Object/Array templates; stage container <details>/<summary>; wrapper collapsing
  - path: $FEATURES/configOverrides/schemaPresentation.ts
    notes: Presentation-only flattening rules; “transparent wrapper” logic
  - path: $FEATURES/configOverrides/formStyles.ts
    notes: CSS blob moved intact (string or CSS-in-TS)
  - path: $FEATURES/configOverrides/validate.ts
    notes: JSON parse + error normalization + (optional) schema validation wrapper
  - path: $FEATURES/configOverrides/useConfigOverrides.ts
    notes: Feature state machine (enabled, activeTab, overrides source-of-truth)
```

### Public API (binding; no redesign in this slice)

Hook:
```ts
export type ConfigOverridesTab = "form" | "json";

export type UseConfigOverridesArgs<TConfig> = {
  baseConfig: TConfig;
  schema: unknown;
  disabled?: boolean;
  basePathForErrors?: string; // default "/configOverrides"
};

export type UseConfigOverridesResult<TConfig> = {
  enabled: boolean;
  setEnabled(next: boolean): void;

  tab: ConfigOverridesTab;
  setTab(next: ConfigOverridesTab): void;

  value: TConfig;
  setValue(next: TConfig): void;

  jsonText: string;
  setJsonText(next: string): void;
  jsonError: string | null;

  reset(): void;
  applyJson(): { ok: boolean };

  configOverridesForRun: TConfig | undefined; // enabled ? value : undefined
};

export function useConfigOverrides<TConfig>(
  args: UseConfigOverridesArgs<TConfig>,
): UseConfigOverridesResult<TConfig>;
```

UI component:
```ts
export type ConfigOverridesPanelProps<TConfig> = {
  open: boolean;
  onClose(): void;
  controller: UseConfigOverridesResult<TConfig>;
  disabled: boolean;
  schema: unknown; // normalized for RJSF inside the component
};

export function ConfigOverridesPanel<TConfig>(props: ConfigOverridesPanelProps<TConfig>): JSX.Element;
```

### Acceptance criteria (verifiable)
- [ ] The overrides UI appears and behaves the same (form + JSON).
- [ ] Wrapper collapsing remains presentation-only; stage container remains visible/collapsible.
- [ ] JSON editor blocks run when invalid (same as today).
- [ ] Running with overrides produces the same worker behavior (worker remains merge/validate authority).
- [x] No new worker bundle deps introduced.
- [x] `$APP_TSX` no longer contains RJSF templates and the large overrides CSS blob.

### Verification (commands + manual)
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Toggle overrides on/off; run still works.
  - Edit a nested value in the schema form; rerun; observe changes applied.
  - Switch to JSON tab; introduce invalid JSON; ensure run is blocked with a readable error.
  - Confirm stage container is still present and collapsible; redundant wrappers are collapsed away.

### Risks (and how to mitigate)
- **Risk:** subtle coupling between overrides state and runner start/run button enabled state.
  - **Mitigation:** keep public surface small and explicit: `useConfigOverrides()` returns `{ enabled, configOverrides, canRun, error, uiProps }` rather than leaking internal state.

---

## Slice: RFX-02 — Extract `browserRunner` feature (worker client + retention)

**Primary reference:** `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`.

### Objective
Move worker lifecycle + request building + run token filtering + retention semantics out of `$APP_TSX` into `$FEATURES/browserRunner/*`, without changing cancellation behavior or “pinned selection” UX.

### Dependency rules
- Worker/protocol code in `$WORKER` remains React-free and browser-safe.
- `features/browserRunner/*` must not import from `features/viz/*` (avoid cycles). Instead expose runner-agnostic events.

### Proposed modules
```yaml
files:
  - path: $SHARED/vizEvents.ts
    notes: Runner-agnostic VizEvent type used to bridge runner -> viz without cycles
  - path: $FEATURES/browserRunner/workerClient.ts
    notes: Typed postMessage wrapper; runId correlation; terminate+recreate policy
  - path: $FEATURES/browserRunner/retention.ts
    notes: Step/layer pinning rules; “pending” selection handling; explicit helpers
  - path: $FEATURES/browserRunner/adapter.ts
    notes: Map BrowserRunEvent -> VizEvent (runner-agnostic ingest model)
  - path: $FEATURES/browserRunner/useBrowserRunner.ts
    notes: Hook API consumed by App.tsx (start/cancel + state + events)
```

### Public API (binding; keep semantics identical)

Runner hook:
```ts
// Stored in: $SHARED/vizEvents.ts
export type VizEvent =
  | { type: "run.started"; runId: string; planFingerprint: string }
  | {
      type: "run.progress";
      kind: "step.start" | "step.finish";
      stepId: string;
      phase?: string;
      stepIndex: number;
      durationMs?: number;
    }
  | {
      type: "viz.layer.upsert";
      layer: {
        key: string; // unique identity; use protocol-provided layer.key (do not recompute)
        kind: "grid" | "points" | "segments";
        layerId: string;
        stepId: string;
        phase?: string;
        stepIndex: number;
        bounds: [minX: number, minY: number, maxX: number, maxY: number];
        format?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        dims?: { width: number; height: number };
        count?: number;
      };
      payload:
        | { kind: "grid"; values: ArrayBuffer; valuesByteLength: number; format: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" }
        | { kind: "points"; positions: ArrayBuffer; values?: ArrayBuffer; valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" }
        | { kind: "segments"; segments: ArrayBuffer; values?: ArrayBuffer; valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" };
    }
  | { type: "run.finished" }
  | { type: "run.error"; name?: string; message: string; details?: string; stack?: string };

export type BrowserRunnerStatus = "idle" | "running" | "finished" | "error";

export type BrowserRunnerInputs = {
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: import("@mapgen/browser-recipes/browser-test").BrowserTestRecipeConfig;
};

export type BrowserRunnerState = {
  status: BrowserRunnerStatus;
  running: boolean;
  lastStep: { stepId: string; stepIndex: number } | null;
  error: string | null;
};

export type BrowserRunnerActions = {
  start(inputs: BrowserRunnerInputs): void;
  cancel(): void; // terminates worker
  clearError(): void;
};

export type UseBrowserRunnerArgs = {
  enabled: boolean; // false when mode != "browser"
  onVizEvent(event: VizEvent): void;
};

export type UseBrowserRunnerResult = {
  state: BrowserRunnerState;
  actions: BrowserRunnerActions;
};

export function useBrowserRunner(args: UseBrowserRunnerArgs): UseBrowserRunnerResult;
```

Notes:
- `useBrowserRunner` owns worker lifecycle and protocol message handling.
- Selection pinning stays outside the runner hook (in `retention.ts`) and is consumed by `App.tsx` and/or `features/viz` (no hidden implicit rules).
-
- Future (explicitly out-of-scope for this refactor): expand the request/protocol to be recipe-agnostic
  (`recipeId: string`, `configOverrides?: unknown`) as described in
  `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`.

### Acceptance criteria
- [ ] Cancel semantics remain `worker.terminate()` (no soft cancel introduced).
- [ ] Rerun retains selected step and selected layer.
- [ ] Seed reroll auto-runs and retains selection.
- [ ] Runner still streams events progressively and UI remains responsive.
- [x] No new imports into `$WORKER`.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Run; select a non-default step and layer; rerun; ensure selection is retained.
  - Reroll seed; ensure it auto-runs and keeps retention behavior.
  - Cancel mid-run; ensure worker terminates and subsequent run still works.

---

## Slice: RFX-03 — Extract `viz` feature (model + ingest + deck.gl) + meta-driven presentation

**Primary references:**
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
- `packages/mapgen-core/src/core/types.ts` (`VizLayerMeta`, `VizLayerVisibility`)
- `apps/mapgen-studio/src/browser-runner/protocol.ts` (`BrowserVizLayerEntry.meta`)

### Objective
Move viz model/types, layer registry/selection, and deck.gl rendering out of `$APP_TSX` into `$FEATURES/viz/*`, including the meta-driven labeling/legend/palette behavior introduced by embedding `VizLayerMeta` in layer entries.

### Dependency rules
- `features/viz/*` consumes runner outputs only via `VizEvent[]` (IoC), not runner internals.
- Meta/legend/palette heuristics must not be hardcoded in `App.tsx` long-term.

### Proposed modules
```yaml
files:
  - path: $FEATURES/viz/model.ts
    notes: Normalized types; layer registry; selection; legend model; VizEvent type
  - path: $FEATURES/viz/ingest.ts
    notes: Reducer applying VizEvent -> viz state
  - path: $FEATURES/viz/presentation.ts
    notes: Layer labeling + visibility tags + categorical legend/palette (meta-first; heuristics as fallback)
  - path: $FEATURES/viz/deckgl/render.ts
    notes: Pure mapping from viz state -> deck.gl layers
  - path: $FEATURES/viz/DeckCanvas.tsx
    notes: deck.gl host component; viewState wiring; input handlers
  - path: $FEATURES/viz/useVizState.ts
    notes: Selection + view fitting + derived memoization boundaries
```

### Public API (binding; runner-agnostic ingestion)

```ts
import type { VizEvent } from "../../shared/vizEvents";

export type UseVizStateArgs = {
  enabled: boolean; // false when no manifest loaded and no stream active
};

export type VizState = unknown; // internal; exposed through selectors below

export type UseVizStateResult = {
  ingest(event: VizEvent): void;

  // Selection
  selectedStepId: string | null;
  setSelectedStepId(next: string | null): void;
  selectedLayerKey: string | null;
  setSelectedLayerKey(next: string | null): void;

  // Data for UI
  steps: Array<{ stepId: string; stepIndex: number }>;
  selectableLayers: Array<{ key: string; label: string; visibility: "default" | "debug" | "hidden"; group?: string }>;
  legend: unknown | null;

  // Render host props
  deck: { layers: unknown[]; viewState: unknown; onViewStateChange(next: unknown): void };
};

export function useVizState(args: UseVizStateArgs): UseVizStateResult;
```

Notes:
- “Unknown” types above are intentionally internal: they become concrete when the implementation lands, but the *shape* is binding (it’s the wiring contract used to shrink `App.tsx`).
- `selectableLayers[].visibility` mirrors `VizLayerMeta.visibility` when present; when absent, it defaults to `"default"`.

### Decision (binding) — where layer presentation rules live
- **Choice:** `$FEATURES/viz/presentation.ts` owns label/visibility tags and meta-first categorical legend/palette rules for the layer picker + legend UI.
- **Rationale:** isolates UI behavior from `App.tsx` immediately while keeping the data contract (`VizLayerMeta`) owned by `@swooper/mapgen-core`.
- **Risk:** heuristics may drift from product intent; mitigate by preferring `VizLayerMeta` and treating heuristics as compatibility-only.

### Acceptance criteria
- [ ] Layer picker labels and legend match pre-refactor behavior:
  - [ ] `layer.meta?.label` drives picker labels and legend titles
  - [ ] `layer.meta?.visibility === "debug"` is surfaced in labeling (suffix `", debug"`)
  - [ ] `layer.meta?.categories` drives categorical legend + colors when present
- [ ] Deck rendering output matches pre-refactor behavior for existing runs/dumps.
- [ ] `App.tsx` no longer contains deck.gl layer builders, palettes, or hex math.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Run and confirm at least one layer renders.
  - Confirm at least one layer label comes from `meta.label` (not raw layerId).
  - Confirm a categorical/meta-driven layer shows a categorical legend (if present) and colors match legend.

---

## Slice: RFX-04 — Extract `dumpViewer` feature (IO + manifest + reader)

**Primary reference:** `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`.

### Objective
Move dump picker + file index/aliasing + manifest parsing + dump reading into `$FEATURES/dumpViewer/*` and keep the “dump mode” logic out of `App.tsx` aside from composition.

### Dependency rules
- Dump IO stays strictly browser APIs (no Node FS).
- Dump feature must not depend on browser runner internals.

### Proposed modules
```yaml
files:
  - path: $FEATURES/dumpViewer/pickers.ts
    notes: showDirectoryPicker + fallback webkitdirectory upload normalization
  - path: $FEATURES/dumpViewer/fileIndex.ts
    notes: “strip one leading segment” aliasing; collision detection policy
  - path: $FEATURES/dumpViewer/manifest.ts
    notes: parse + minimal validation for manifest.json
  - path: $FEATURES/dumpViewer/reader.ts
    notes: DumpReader interface; readText/readArrayBuffer
  - path: $FEATURES/dumpViewer/useDumpLoader.ts
    notes: React state machine (idle/loading/loaded/error)
```

### Public API (binding)

```ts
export type DumpLoadState =
  | { status: "idle" }
  | { status: "loading"; source: "directoryPicker" | "fileInput" }
  | { status: "loaded"; manifest: unknown; reader: unknown; warnings: string[] }
  | { status: "error"; message: string };

export type UseDumpLoaderResult = {
  state: DumpLoadState;
  actions: {
    openViaDirectoryPicker(): Promise<void>;
    loadFromFileList(files: FileList): Promise<void>;
    reset(): void;
  };
};

export function useDumpLoader(): UseDumpLoaderResult;
```

### Acceptance criteria
- [ ] Both directory picker and upload fallback still work.
- [ ] The “strip one leading segment” aliasing behavior is preserved.
- [ ] Dump mode can load and render the same as pre-refactor.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Load a known dump folder; confirm layers appear.
  - If using upload fallback, confirm it can still find `manifest.json`.

---

## Slice: RFX-05 — Extract `app` shell + reduce `App.tsx` to composition

**Primary reference:** `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`.

### Objective
Move layout/panels/overlays/error rendering into `$APP_SHELL/*` and keep `App.tsx` as the minimal coordinator for mode selection and feature wiring.

### Dependency rules
- `$APP_SHELL/*` should not contain domain logic (runner/viz/config IO).
- Features provide “bodies”; shell provides “slots”.

### Proposed modules
```yaml
files:
  - path: $APP_SHELL/Layout.tsx
    notes: Overlay slots + z-index policy + main regions
  - path: $APP_SHELL/ErrorBanner.tsx
    notes: Render-only error surface (no domain logic)
  - path: $APP_SHELL/AppShell.tsx
    notes: Mode selection UI until routing exists
```

### Public API (binding)

```ts
export type AppMode = "browser" | "dump";

export type AppShellProps = {
  mode: AppMode;
  onModeChange(next: AppMode): void;
  header: JSX.Element;
  main: JSX.Element;
  overlays: JSX.Element[];
  error: string | null;
};

export function AppShell(props: AppShellProps): JSX.Element;
```

### Acceptance criteria
- [ ] `App.tsx` is primarily composition/wiring and is < ~450 LOC.
- [ ] App layout behaves the same (panels/overlays/error placement).
- [ ] No domain logic moved into `$APP_SHELL/*`.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Verify both modes still reachable and functional.
  - Verify errors remain readable and don’t render raw objects.

---

## Final readiness definition (“ready to implement”)

We are “ready to implement” when:
- [ ] This execution doc is accepted as the source of truth for slice scope/AC/verification.
- [ ] No open questions remain that would force rework across multiple slices.
- [ ] We agree to keep the refactor **move-only** unless a behavior bug is discovered (fixes allowed but must be isolated).

## Implementation Decisions

### Compute config panel narrow breakpoint inside feature
- **Context:** `ConfigOverridesPanel` moved out of `App.tsx` per RFX-01 API, which does not accept layout props like `isNarrow`.
- **Options:** Pass `isNarrow` from `App.tsx`; compute container width with a ref; compute from `window.innerWidth`.
- **Choice:** Compute via `window.innerWidth < 760` inside `ConfigOverridesPanel`.
- **Rationale:** Keeps the public API aligned with the execution plan while preserving the existing breakpoint.
- **Risk:** If the app container becomes narrower than the window, the panel width could diverge slightly from prior behavior.

### Include `meta` in `VizEvent` layer payload
- **Context:** RFX-02 moves runner events to `VizEvent`, but the layer metadata (`VizLayerMeta`) is required for labels/groups and must continue to flow to the UI.
- **Options:** Drop `meta` in `VizEvent` and rehydrate later; add `meta` to `VizEvent.layer` now; keep `BrowserRunEvent` in App (violates runner-agnostic boundary).
- **Choice:** Add optional `meta` to `VizEvent.layer` and map it in the adapter.
- **Rationale:** Preserves existing UI behavior while keeping the runner-viz boundary intact.
- **Risk:** Slightly widens the shared event contract; must keep in sync in RFX-03 when viz is extracted.
