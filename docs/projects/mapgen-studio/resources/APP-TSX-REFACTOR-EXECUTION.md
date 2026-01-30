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
  - [ ] Contract vs internal/debug layers: internal hidden by default, toggleable.
  - [ ] If an internal layer is currently selected and internal layers are hidden, selection remains usable (don’t strand the UI).

### Paper trail (must remain true)
- Contract layer definitions remain consistent with `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`.
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

### Acceptance criteria (verifiable)
- [ ] The overrides UI appears and behaves the same (form + JSON).
- [ ] Wrapper collapsing remains presentation-only; stage container remains visible/collapsible.
- [ ] JSON editor blocks run when invalid (same as today).
- [ ] Running with overrides produces the same worker behavior (worker remains merge/validate authority).
- [ ] No new worker bundle deps introduced.
- [ ] `$APP_TSX` no longer contains RJSF templates and the large overrides CSS blob.

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
  - path: $FEATURES/browserRunner/workerClient.ts
    notes: Typed postMessage wrapper; runId correlation; terminate+recreate policy
  - path: $FEATURES/browserRunner/retention.ts
    notes: Step/layer pinning rules; “pending” selection handling; explicit helpers
  - path: $FEATURES/browserRunner/adapter.ts
    notes: Map BrowserRunEvent -> VizEvent (runner-agnostic ingest model)
  - path: $FEATURES/browserRunner/useBrowserRunner.ts
    notes: Hook API consumed by App.tsx (start/cancel + state + events)
```

### Acceptance criteria
- [ ] Cancel semantics remain `worker.terminate()` (no soft cancel introduced).
- [ ] Rerun retains selected step and selected layer.
- [ ] Seed reroll auto-runs and retains selection.
- [ ] Runner still streams events progressively and UI remains responsive.
- [ ] No new imports into `$WORKER`.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Run; select a non-default step and layer; rerun; ensure selection is retained.
  - Reroll seed; ensure it auto-runs and keeps retention behavior.
  - Cancel mid-run; ensure worker terminates and subsequent run still works.

---

## Slice: RFX-03 — Extract `viz` feature (model + ingest + deck.gl) + layer catalog

**Primary references:**
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
- `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`

### Objective
Move viz model/types, layer registry/selection, and deck.gl rendering out of `$APP_TSX` into `$FEATURES/viz/*`, including the **contract vs internal** layer catalog behavior introduced in `agent-CODEX-viz-layer-contract`.

### Dependency rules
- `features/viz/*` consumes runner outputs only via `VizEvent[]` (IoC), not runner internals.
- Contract/internal layer catalog must not be hardcoded in `App.tsx` long-term.

### Proposed modules
```yaml
files:
  - path: $FEATURES/viz/model.ts
    notes: Normalized types; layer registry; selection; legend model; VizEvent type
  - path: $FEATURES/viz/ingest.ts
    notes: Reducer applying VizEvent -> viz state
  - path: $FEATURES/viz/catalog.ts
    notes: Contract/internal policy + labels; aligns to VIZ-LAYER-CATALOG.md
  - path: $FEATURES/viz/deckgl/render.ts
    notes: Pure mapping from viz state -> deck.gl layers
  - path: $FEATURES/viz/DeckCanvas.tsx
    notes: deck.gl host component; viewState wiring; input handlers
  - path: $FEATURES/viz/useVizState.ts
    notes: Selection + view fitting + derived memoization boundaries
```

### Decision (binding) — where the contract catalog lives
- **Choice:** `$FEATURES/viz/catalog.ts` owns contract/internal policy for now.
- **Rationale:** isolates UI behavior from `App.tsx` immediately; later we can optionally source catalog/prefixes from recipe artifacts (`@mapgen/browser-recipes`) without another rewrite.
- **Risk:** catalog may drift from docs; mitigate by treating `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` as canonical and updating it when changing catalog code.

### Acceptance criteria
- [ ] Contract/internal layer filtering behavior remains identical:
  - [ ] internal layers hidden by default, toggleable
  - [ ] contract layers prioritized in ordering/labels
  - [ ] selected internal layer remains selectable even when hidden
- [ ] Deck rendering output matches pre-refactor behavior for existing runs/dumps.
- [ ] `App.tsx` no longer contains deck.gl layer builders, palettes, or hex math.

### Verification
- `bun run --cwd apps/mapgen-studio build`
- Manual smoke (`bun run --cwd apps/mapgen-studio dev`):
  - Run and confirm at least one contract layer renders.
  - Toggle internal layers; ensure the list changes but selection remains stable.
  - If possible, select an internal layer, hide internal layers, ensure it remains selected/usable.

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
