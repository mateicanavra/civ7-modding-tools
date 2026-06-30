# MapGen Studio — Product Model

> **What this is.** A classification-first, product-level model of MapGen Studio: the full set of things a user can do, the canonical story that strings them together, the flows behind each capability, the invariants that must hold, and the global operation state machine that coordinates them. It describes what the app **should be** — a standard event-driven React SPA — folding in what it correctly **is**. This is the lens the `StudioShell` decomposition (Pass 3) is built *toward*: every controller-hook the refactor mints should map onto a domain in §7.
>
> **How to read it.** §2 is the taxonomy (browse by domain). §3 is the narrative spine (read once, top to bottom). §4 is the per-flow reference (look up a flow). §5 separates invariants that a clean rebuild **must** preserve from those it may discard. §6 is the global state machine and the busy-gate rules — the highest-value section for the refactor. §7 is the domain→authority bridge to controller-hook ownership.
>
> **Provenance.** Drafted by a 4-agent investigator fan-out (authoring · run/viz · game-integration · synthesis) on 2026-06-28 against the worktree source at `apps/mapgen-studio/src/`. Synthesized, deduped, and cross-checked against source by the workstream owner (Claude Opus 4.8), same day. Load-bearing or non-obvious claims cite file paths; uncertain claims are flagged inline and collected in §8. Compatible with — and feeds — [`OWNER-FRAME.md`](./OWNER-FRAME.md) (parity registry §6) and [`FRAME.md`](./FRAME.md) (scope).
>
> **What MapGen Studio is.** A React + TypeScript SPA (Vite) for authoring, previewing, and deploying Civilization VII map-generation configs. It runs map-gen in a browser Web Worker, renders the result with deck.gl, saves/deploys configs to the game mod, launches a config *in game* via a local daemon (oRPC over `/rpc` + SSE push), and reads live state back from a running Civ7 instance. The client is **event-driven**: the daemon owns operation lifecycle and pushes state; the client adopts `studio.operations.current` on reconnect. There is no client polling and no localStorage operation recovery.

---

## 1. The eight product domains

The capability surface partitions cleanly into eight domains, each with a single conceptual authority (full table in §7):

| Domain | One-line charter |
|---|---|
| **Authoring** | Define *what map to generate*: recipe, preset, pipeline config, world settings, seed. |
| **Browser Run** | Generate the map *in the browser* against the authored config (Web Worker). |
| **Visualization** | Inspect the generated output: stage/step/layer/era/overlay selection on a deck.gl canvas. |
| **Pipeline (DAG)** | Inspect the recipe's *structure*: the stage dependency graph. |
| **Game Integration** | Cross the browser↔game boundary: Save & Deploy a config, Run it In Game. |
| **Live Runtime** | Observe and steer a *running* Civ7 session: status, snapshot, autoplay, explore, sync-back. |
| **Civ7 Setup** | Author the game-side launch parameters: leader, civ, difficulty, speed, saved `.civgame` config. |
| **App Shell** | Host concerns: layout, panels, keyboard shortcuts, theme, persistence, a11y, the busy gate. |

A recurring discipline note: **the same English word means different things across domains.** "Preset", "stage", "layer", "setup", and "snapshot" are each overloaded. Each is called out where it appears, and consolidated in §8.

---

## 2. Product capability set

Grouped by domain. Each capability: **name** — description · *user value* · **primary control(s)** · `surface`.

### 2.1 Authoring

| Capability | Description / value / controls / surface |
|---|---|
| **Recipe selection** | Pick which map-gen recipe runs (catalog currently holds exactly one: `mod-swooper-maps/standard`, label "Swooper Maps / Standard"). Selecting a recipe resets pipeline config to that recipe's schema defaults and resets preset to `none`. *Value:* route to a different algorithm without losing world settings. **Recipe dropdown** (RecipePanel). `ui/components/RecipePanel.tsx` |
| **Preset selection** | Load a named config from the Config dropdown — grouped None / Live / Config(built-in) / Scratch(local). Selecting deep-merges the preset over the recipe skeleton, normalizes, and replaces the active config atomically. *Value:* start from a known-good config. **Config dropdown**. `features/presets/usePresets.ts` |
| **Schema-driven config form** | Edit pipeline config via an rjsf form (booleans→Switch, enums→Select, etc.), in *focus mode* (selected step only) or *all-steps mode*. *Value:* adjust individual pipeline knobs with type safety. **rjsf form**, **Focus toggle**, **collapse chevrons**. `features/configOverrides/SchemaConfigForm.tsx` |
| **Raw JSON config view** | Read-only preformatted JSON of the current config (or focused slice). *Value:* inspect/copy the exact config. **Braces icon button**. `ui/components/RecipePanel.tsx` |
| **Overrides enable/disable** | Global Switch that disables all overrides; the form dims (pointer-events-none) and the runner uses recipe defaults. Persisted. *Value:* baseline behavior without losing entered overrides. **Switch in Config header**. `ui/components/RecipePanel.tsx` |
| **Config reset to defaults** | Eraser button → confirm dialog → `buildDefaultConfig()` (skeleton + defaultConfig + normalizeStrict) replaces the config. *Value:* recover a clean baseline. **Eraser button + dialog**. `ui/components/RecipePanel.tsx` |
| **World settings** | Set map size (Tiny…Huge → pixel dims), player count (2–12), seed (numeric string, range `CIV7_STUDIO_SEED_MIN..MAX`), resource mode. *Value:* configure the physical map. **Size / Players / Seed controls**. `ui/components/AppFooter.tsx` |
| **Seed reroll** | Dice button → new random seed → immediate run (atomic). *Value:* explore map instances in one click. **Dice button** / Cmd+Shift+Enter. `app/StudioShell.tsx` |
| **Last-run history** | Clock button shows last completed run's seed/size/players; click copies seed. *Value:* recover the seed of an interesting map. **History button**. `ui/components/AppFooter.tsx` |
| **Save & Deploy (to current)** | Save the current config to the mod filesystem + deploy. Overwrites the current local/scratch preset. Busy-gated. *Value:* make the config playable in Civ7. **Save & Deploy button**. `ui/components/RecipePanel.tsx` |
| **Save & Deploy As… (new local preset)** | Dialog (label required, description optional) → new `LocalPresetV1` with UUID in `localStorage['mapgen-studio.scratchConfigs']`; preset key → `local:<uuid>`. *Value:* save a named working copy. **Save As item + PresetSaveDialog**. `features/presets/usePresets.ts` |
| **Export preset to file** | Download `StudioPresetExportFileV1` JSON (`{recipeId}__{label-slug}__studio-preset.json`). *Value:* share / version-control a config. **Export item**. `features/presets/importExport.ts` |
| **Import preset from file** | Parse + validate file: check recipeId against this build's catalog, migrate, normalizeStrict; on failure show `PresetErrorDialog`; on success run Save-As. *Value:* load a config from another user / VCS. **Import item + file picker**. `features/presets/importFlow.ts` |
| **Delete local preset** | Remove the selected `local:` preset; key → `none`. No confirm. *Value:* clean up throwaway presets. **Delete Scratch item**. `features/presets/usePresets.ts` |
| **Repo-backed preset overrides** | Per-recipe overrides replace/append built-in presets (`mergeBuiltInPresets`), persisted in authoring state. No direct UI control found (programmatic). *Value:* pin a preset variant without editing the recipe package. `features/presets/repoBacked.ts` |

### 2.2 Browser Run

| Capability | Description / value / controls / surface |
|---|---|
| **Manual run** | Generate the map in a Web Worker against current recipe/seed/size/players/resources/overrides. Blocked during run-in-game or save-deploy. *Value:* see the map without deploying. **Run button** / Cmd+Enter. `app/StudioShell.tsx` (startBrowserRun) |
| **Reroll (new seed + run)** | New random seed → immediate run; seed passed directly to `startBrowserRun` (not read back from store). *Value:* map variation in one click. **Reroll** / Cmd+Shift+Enter. `app/StudioShell.tsx` |
| **Cancel in-flight run** | Send `run.cancel` to the worker (keyed by runToken+generation); reset to idle; abort in-flight renders. *Value:* abandon a long run. **Cancel button**. `features/browserRunner/useBrowserRunner.ts` |
| **Auto-run on config change** | When enabled, a config change (vs. last-run snapshot) auto-triggers a run after a 300 ms debounce. Suppressed while busy or overrides disabled; a pending flag ensures one more run fires after an in-flight run completes. *Value:* live map updates while tuning. **Bolt toggle** (in-memory). `app/StudioShell.tsx` |

### 2.3 Visualization

| Capability | Description / value / controls / surface |
|---|---|
| **Stage / Step navigation** | Pick a recipe stage (UI grouping of steps from uiMeta), then a step; drives the viz selection. *Value:* inspect a specific pipeline step's output. **Stage/Step lists** / Cmd+(Shift+)Up/Down. `ui/components/ExplorePanel.tsx` |
| **Data type (layer) selection** | Choose a data type produced by the step; resolves a concrete layerKey. *Value:* drill into a specific map quantity. **Data list** / Opt+Up/Down. `ui/components/ExplorePanel.tsx` |
| **Space / Render-mode / Variant selection** | Switch coordinate space (`tile.hexOddR`/`tile.hexOddQ`/`world.xy`/`mesh.world`), render mode (`grid`/`points`/`segments`/…), and semantic variant. Era-aware in fixed mode. *Value:* see the same data through different representations. **Segmented controls + variant dropdown**. `ui/components/ExplorePanel.tsx` |
| **Era control** | For era-keyed variants (`era:N`), an Auto/Fixed toggle + slider; Fixed snaps to nearest available era and re-selects. *Value:* scrub a multi-era quantity over time. **Era toggle + slider**. `features/viz/era.ts` |
| **Overlay / correlation layer** | Composite a second (recipe-suggested) data type over the primary at 10–90% opacity; era-synced in fixed mode. *Value:* visually correlate two quantities. **Overlay dropdown + opacity slider**. `features/viz/useVizState.ts` |
| **Debug / Edge / Grid toggles** | Show/hide debug-class layers, the edge overlay (on points/segments only), and the CSS background graticule. *Value:* reveal diagnostic detail / spatial reference. **Bug / Edges / Grid buttons**. `ui/components/ExplorePanel.tsx`, `app/CanvasStage.tsx` |
| **Fit view** | Re-frame the camera to the active layer bounds (~8% pad). Auto-fits on first manifest and on spaceId change. *Value:* recenter on the map. **Maximize button**. `features/viz/DeckCanvas.tsx` |
| **Pan / zoom** | Orthographic camera via drag / scroll / arrow keys (150px step). Interactivity off pre-run. *Value:* navigate the map. Mouse + arrows. `features/viz/DeckCanvas.tsx` |
| **River/Lake/Floodplain inspector** | Water Stats proof-chain rows with clickable layer chips that jump the canvas to the evidence layer (enabling debug layers if needed). *Value:* trace hydrology generation evidence. **Water Stats section + chips**. `features/viz/riverLakeInspector.ts`, `inspectorSelection.ts` |
| **Viz legend** | Color swatches / palette / scalar stats for the effective layer. *Value:* read the map's encoding. (Passive.) `features/viz/presentation.ts` |
| **Stage-view switcher** | Floating pill tabs: Map ↔ Pipeline. Canvas stays mounted under Pipeline. *Value:* toggle between output and structure. **Map/Pipeline tabs**. `ui/components/StageViewTabs.tsx` |

### 2.4 Pipeline (DAG)

| Capability | Description / value / controls / surface |
|---|---|
| **Pipeline DAG view** | Render the recipe's stage dependency graph (rank × phase-lane waterfall) with per-stage artifact provides/requires and edges. Fetched once per recipe (`staleTime: Infinity`) over oRPC, gated on the Pipeline tab being visible. *Value:* understand stage order and artifact flow without reading source. **Stage nodes / expand chevrons / artifact-edge labels**. `features/recipeDag/PipelineStage.tsx` |

### 2.5 Game Integration

| Capability | Description / value / controls / surface |
|---|---|
| **Save & Deploy** | Persist the config as a named versioned JSON in the mod repo and deploy it to the game Mods folder — one atomic server workflow, daemon-pushed phases. *Value:* the map appears in Civ7's map-selection dropdown with no manual file handling. **Save button (phase label) + status chip**. `features/mapConfigSave/api.ts`, `ui/components/GameConsole.tsx` |
| **Run in Game** | Launch the current config into a live Civ7 session via the daemon: materialize → deploy → (restart Civ) → check → prepare setup → start → wait-for-proof. *Value:* close the authoring↔play loop with proof the exact authored config ran. **Play/Run button (dynamic label) + GameConsole hang-off + terminal toast**. `features/runInGame/api.ts`, `clientState.ts`, `status.ts` |

### 2.6 Live Runtime

| Capability | Description / value / controls / surface |
|---|---|
| **Live runtime monitoring** | Read live game state (turn, seed, readiness, autoplay) via daemon push; show a merged status dot + identity. *Value:* see game state without switching windows. **GameConsole signal chip + hang-off**. `features/liveRuntime/model.ts` |
| **Sync Studio from live game** | When the proved live source diverges from Studio (`relation=stale`), apply the live seed + setup back into Studio. *Value:* recover from divergence without retyping. **Apply to Studio button** (gated). `features/runInGame/liveSource.ts` |
| **Autoplay control** | Start/stop Civ7 autoplay from Studio. *Value:* advance turns without the Civ7 window. **Autoplay button** (gated). `features/civ7Setup/api.ts` |
| **Explore (full map reveal)** | Reveal the full map for the local player via `display.explore.request`. *Value:* inspect terrain without fog. **Explore button** (gated). `lib/control/liveControlPort.ts` |
| **Live tile snapshot** | Read a bounded tile readback (terrain/biome/feature/resource, ≤512 plots) with request-key staleness guard + abort. *Value:* sample what the engine actually placed. (Triggered by live events.) `features/liveRuntime/model.ts` |

### 2.7 Civ7 Setup

| Capability | Description / value / controls / surface |
|---|---|
| **Game setup configuration** | Author leader / civ / difficulty / speed; or start from a saved `.civgame` config. Dropdowns merge the live setup snapshot's possible values with the saved catalog. *Value:* control what launches in Civ7. **Saved-config selector + gear disclosure**. `features/civ7Setup/setupConfig.ts`, `setupOptions.ts` |
| **Saved-config drift detection** | After selecting a saved config, any setup edit (or live sync) flips the selector to "Custom" (warning orange); Re-apply restores the file exactly. *Value:* never silently launch a custom-modified setup believing it's the saved file. **Custom sentinel + Re-apply**. `features/civ7Setup/setupConfig.ts`, `ui/components/AppHeader.tsx` |

### 2.8 App Shell

| Capability | Description / value / controls / surface |
|---|---|
| **Keyboard shortcuts** | Cmd+Enter run · Cmd+Shift+Enter reroll · Cmd+B left panel · Cmd+I right panel · Cmd+(Shift+)Up/Down stage/step · Opt+Up/Down data type. Global keydown, suppressed in editable targets (modifier combos still pass). *Value:* fast keyboard-driven authoring. `app/StudioShell.tsx` (shortcutsRef + keydown effect) |
| **Theme** | Cycle system/light/dark via single `.dark` class; `lightMode` forwarded only to the deck `<canvas>`. *Value:* readable in either theme. `app/StudioShell.tsx` |
| **A11y announcements / skip-link** | Live region announces run/live/operation status; skip-link to the map preview. *Value:* assistive-tech support. `app/StudioShell.tsx` |
| **Authoring persistence & recovery** | Persist worldSettings/recipeSettings/setupConfig/pipelineConfig/overridesDisabled/repoBacked overrides to `localStorage['mapgen-studio.authoring-state.v1']` (schemaVersion 1); restore + migrate on load. Failures are swallowed. *Value:* survive a refresh. `features/studioState/persistence.ts` |
| **Operation adoption** | On mount and every daemon `hello`, fetch `studio.operations.current` and reconcile in-flight/recent run-in-game + save-deploy operations (with daemon-identity TOCTOU guard). *Value:* recover operation state across reload / daemon restart. `app/operationAdoption.ts`, `app/hooks/useStudioEvents.ts` |
| **Busy gate** | A cross-domain mutual-exclusion gate (`browserRunning` / `runInGameRunning` / `saveDeployRunning`) that blocks conflicting operations and disables controls, with a user-facing toast/label. *Value:* prevents data races and clobbered state. `app/studioEventRecovery.ts` (`studioBusyGateMessage`) |

---

## 3. Primary scenario (the product story)

The canonical end-to-end narrative — open → author → run → tune → save & deploy → run in game → observe live → sync back.

1. **Open.** The user opens MapGen Studio in the browser. Authoring state loads from `localStorage` (schemaVersion-1 envelope, pipelineConfig migrated on read); the default recipe and its default config (or the persisted config) are selected. The SSE event stream to the local daemon connects immediately and retries indefinitely.

2. **Pick a recipe / preset.** The user picks a recipe from the catalog, then a preset (built-in, repo-backed, local scratch, or — if a proved run matches — Live Game). The preset config is deep-merged over the recipe skeleton, normalized, and applied **atomically** — if it fails `normalizeStrict`, a `PresetErrorDialog` appears and the config is left untouched.

3. **Edit the config.** The user tweaks parameters in the rjsf form (e.g. continental shelf width, biome weights). The `isDirty` flag lights up (current config/world/recipe triple diverges from the last-run snapshot); a "Modified" dot appears.

4. **Run in the browser.** The user presses Cmd+Enter (or Run). `startBrowserRun` parses the seed, resolves map-size dimensions, migrates the config, issues a `runToken`+`generation` pair, and posts `run.start` to the Web Worker. The footer shows "Generating map". Viz events stream in step-by-step; the deck.gl canvas updates live. The user's pinned step/layer selection is retained across the rerun if the same step re-emits it. On `run.finished`, the footer shows "Ready" and `isDirty` clears.

5. **Tune the visualization.** The user explores: switches stage/step in the Explore dock, changes data type / space / render mode, toggles the overlay, enables Fixed era and scrubs the slider, toggles debug layers, pans/zooms. Switching to the **Pipeline** tab shows the recipe DAG; the canvas stays mounted (hidden via CSS) so generation and camera state survive.

6. **Save & Deploy.** Satisfied, the user clicks Save & Deploy (or Save As… and fills the label dialog). After the busy gate clears it, the client fires one oRPC `mapConfigs.saveDeploy`; the daemon streams `queued → saving → deploying → complete`. A terminal-waiter promise (5-minute timeout) resolves on the SSE terminal event; a toast reports the written path.

7. **Run in Game.** The user clicks Run in Game. The client builds a **fingerprint** (canonical stable-JSON of all run inputs) and source snapshot, computes `materializationMode` (durable if a matching saved config is selected, else disposable), and calls `runInGame.start`. The daemon streams `materializing → deploying → (restarting-civ) → checking-civ7 → preparing-setup → starting-game → waiting-for-proof → complete`. During `waiting-for-proof` it reads the Civ7 `Scripting.log` for `[mapgen-proof]`/`[mapgen-complete]` lines matching the requestId/hashes/seed. On `complete`, `provedRunInGameSource` is set and a success toast fires (with the map-script name).

8. **Observe live.** After the game loads, `live-game` events arrive: `liveRuntime` → `status=ok`. A bounded tile snapshot and the live setup are fetched, each committed only if its request key still matches (staleness guard). The GameConsole chip shows turn, seed, readiness, and autoplay. The user clicks **Explore** to lift fog and toggles **Autoplay** to advance turns — both without leaving Studio.

9. **Sync back.** The user edits a config knob; the live game now diverges (`liveGameStudioRelation=stale`, warning ring). They click **Apply to Studio**: the proved source's seed + setup are written back into authoring state; the relation returns to `current` and the ring clears. The user can re-run in-browser to preview the exact config the game loaded.

---

## 4. Product flows

One subsection per distinct flow: **trigger → steps → observable states → outputs → essential invariants**.

### 4.1 Recipe change
- **Trigger:** select a different recipe.
- **Steps:** update `recipeSettings.recipe` → `getRecipeArtifacts(new)` → `buildDefaultConfig()` (skeleton + defaultConfig + normalizeStrict) → replace `pipelineConfig` → reset `preset` to `none` → persist.
- **States:** dropdown shows new recipe; Config shows None; form re-renders with new schema.
- **Outputs:** new default `pipelineConfig`; persisted recipe settings.
- **Invariants:** the new config must pass `normalizeStrict` for the new recipe; `preset` must reset to `none` (cross-recipe preset keys are meaningless).

### 4.2 Preset application
- **Trigger:** select a preset key.
- **Steps:** update `recipeSettings.preset` → `resolvePreset(key)` → `applyPresetConfig` (skeleton → migrate → mergeDeterministic → normalizeStrict). On error: `PresetErrorDialog`, **no config change**. On success: replace `pipelineConfig`; persist.
- **States:** dropdown shows the prefixed label (Config/Scratch/Live); `isDirty` recomputed.
- **Outputs:** updated `pipelineConfig` + preset.
- **Invariants:** **atomic** — config replaces only if `normalizeStrict` returns zero errors (`features/configOverrides/configBuilders.ts`).

### 4.3 Config form edit
- **Trigger:** change a field in the rjsf form.
- **Steps:** rjsf `onChange` → focus-mode `mergeBack()` patches only the focused stage/step path (all-steps mode replaces the whole object) → `onConfigChange` sets `pipelineConfig` → persist.
- **States:** field updates; `isDirty` recomputed; Modified badge appears.
- **Outputs:** updated `pipelineConfig`.
- **Invariants:** focus-mode `mergeBack` must only mutate the focused sub-tree; `overridesDisabled` must block edits (pointer-events-none).

### 4.4 Save As New (create local preset)
- **Trigger:** Save & Deploy As… → fill dialog.
- **Steps:** `saveAsNew()` creates `LocalPresetV1` (UUID, ISO timestamps) → `upsertLocalPreset` → persist to `scratchConfigs` → preset key → `local:<uuid>` → server save/deploy.
- **States:** dialog → on success "Scratch / <label>" selected.
- **Outputs:** new local preset in localStorage; config deployed.
- **Invariants:** label non-empty; UUID unique within the recipe's preset list (collision loop).

### 4.5 Import / Export preset
- **Import trigger:** Import… → pick `.json`. **Steps:** `parsePresetExportFile` → verify recipeId in this build's catalog → migrate → `normalizeStrict` → on failure `PresetErrorDialog`; on success pre-fill the Save dialog → Save-As. **Invariants:** reject files whose recipeId isn't in `STUDIO_RECIPE_ARTIFACTS`; run migrations **before** `normalizeStrict` (`features/presets/importFlow.ts`).
- **Export trigger:** Export… **Steps:** `buildPresetExportFile` (`$schema`, version 1, recipeId, label, description, config) → stringify → blob download. **Invariant:** filename derives from recipeId (`/`→`__`) + label slug.

### 4.6 Config reset to defaults
- **Trigger:** Eraser → confirm.
- **Steps:** `buildDefaultConfig()` → replace `pipelineConfig` → persist.
- **Outputs:** config reset to recipe defaults.
- **Invariant:** result must pass `normalizeStrict`.

### 4.7 Browser run (manual)
- **Trigger:** Run / Cmd+Enter while not blocked.
- **Steps:** validate seed (toast+abort on failure) → `capturePinnedSelection` → `viz.clearStream()` (conditionally retain step/layer) → clear error → write `lastRunSnapshot` → post `run.start` (runToken, generation, recipe, seed, dims, latitude bounds, players, resources, `configOverrides` null when disabled) → worker streams VizEvents → VizStore batches on rAF (50 ms backstop) → `useVizState` renders deck layers (abort-gated) → `run.finished`/`run.error`.
- **States:** idle → running → finished | error.
- **Outputs:** populated `VizManifest`; canvas renders the default tile-grid layer (or retained selection); `lastRunSnapshot` updated; `isDirty=false`.
- **Invariants:** events with stale `runToken`/`generation` are dropped; pinned step retained, layer retained only if its key belongs to the pinned step; `DeckCanvas` never remounts (setProps only).

### 4.8 Reroll
- **Trigger:** Reroll / Cmd+Shift+Enter (not blocked by run-in-game/save-deploy).
- **Steps:** `randomCiv7StudioSeed()` → `setRecipeSettings` seed → `startBrowserRun` with the **override seed** (bypasses the store-read race).
- **Invariant:** the seed override is passed directly, not read back from the store.

### 4.9 Auto-run on config change
- **Trigger:** config edit while `autoRunEnabled` and not busy.
- **Steps:** detect `pipelineConfig !== lastRunSnapshot` → 300 ms debounce (reset on each edit) → if already running set `autoRunPendingRef`; else on timer fire `startBrowserRun` → on completion, a set pending flag fires one more run.
- **States:** debouncing → running → pending.
- **Invariants:** suppressed while `overridesDisabled`, `runInGameRunning`, or `saveDeployRunning`; a config change made during a run is never silently dropped (pending flag).

### 4.10 Layer-selection machine (viz)
- **Trigger:** select data type / space / render mode / variant / era.
- **Steps:** data type → first space + first render mode (era-aware in fixed mode) → `viz.setSelectedLayerKey`; space/mode keep upstream selections; variant → if era-shaped update `manualEra`, if non-era in fixed mode reset to auto; era slider → clamp `[eraMin,eraMax]`, snap to nearest available era, re-select.
- **States:** empty (no manifest) · selected · era-auto · era-fixed.
- **Outputs:** resolved `selectedLayerKey`; async (abort-gated) render; legend + bounds update; auto-fit on spaceId change.
- **Invariants:** the layer key must belong to the current step's manifest (stale keys cleared on step/manifest change); default preference is the **first tile-space grid layer** over the first-emitted layer; era snap never picks outside the available set.

### 4.11 Streaming viz ingest
- **Trigger:** worker emits VizEvents during a run.
- **Steps:** `run.started` → fresh manifest; `step.start` → add step + auto-select first; `viz.layer.upsert` → upsert by layerKey + auto-select first layer of the selected step; VizStore batches via rAF (50 ms backstop) → `commit()` notifies via `useSyncExternalStore` → `useVizState` recomputes → `renderDeckLayers` (prior render aborted).
- **States:** streaming (accumulating) · idle (committed after finish).
- **Invariants:** layer upsert idempotent by layerKey; user-driven selection bypasses the rAF batch (immediate); ingest is a no-op when `useVizState` is disabled.

### 4.12 River/Lake inspector navigation
- **Trigger:** click a layer chip in a Water Stats proof row.
- **Steps:** resolve the chip's stepId against the uiMeta stages → if owned, `setSelectedStageId`+`setSelectedStepId` → if debug-class, `setShowDebugLayers(true)` → `viz.setSelectedStepId`/`setSelectedLayerKey`.
- **Invariant:** if no stage owns the step (stale manifest), leave the panels but still select the viz layer.

### 4.13 Fit view
- **Trigger:** Fit button, new manifest, or spaceId change.
- **Steps:** compute `activeBounds` → `fitToBounds` (zoom = log2 fit, 8% pad) → `applyViewState` writes deck's internal viewState (no React re-render).
- **Invariants:** auto-fit on space change fires once per spaceId (`lastAutoFitSpaceRef`); first-manifest fit fires once per session (`hasEverSeenVizManifestRef`).

### 4.14 Pipeline DAG view
- **Trigger:** open the Pipeline tab.
- **Steps:** `useRecipeDagQuery(enabled=true)` → `recipeDag.get({recipeId})` once (`staleTime: Infinity`) → `buildRecipeDagLayout` → render SVG edges + stage nodes → interact (select/expand/artifact-edge).
- **States:** idle · loading · ready · error.
- **Invariants:** fetch gated on the tab being visible (no prefetch); not re-fetched on focus/interval; clicking a selected stage deselects it.

### 4.15 Save & Deploy
- **Trigger:** Save button.
- **Steps:** `mapConfigs.saveDeploy({requestId, id, sourcePath, envelope})` → daemon runs the atomic workflow → SSE `operation` events (`kind=save-deploy`) drive `setSaveDeployOperation` → terminal status sets `saved`/`deployed`.
- **States:** idle → queued → saving → deploying → complete | failed.
- **Outputs:** config JSON in repo; file deployed to Mods folder; status in GameConsole.
- **Invariants:** save+deploy is one atomic server workflow (no separate deploy button); operation state is daemon-owned and recovered on reconnect.

### 4.16 Run in Game (full launch)
- **Trigger:** Play / Run in Game.
- **Steps:** build fingerprint (canonical recipe+preset+seed+mapSize+players+resources+materializationMode+normalizedSetupConfig+migratedPipelineConfig) + client snapshot + source snapshot → compute `materializationMode` (durable if a matching saved config selected) → set `restartCivProcess` iff `reloadBoundary='process-restart-required'` AND relation≠stale → `runInGame.start` → daemon workflow → `waiting-for-proof` reads `Scripting.log` for matching proof lines → proof checks (source identity, file hashes, content markers, setup readback, runtime summary) → terminal toast → persist client+source snapshots.
- **States:** idle → materializing → deploying → restarting-civ → checking-civ7 → reload-needed → preparing-setup → starting-game → waiting-for-proof → complete | blocked | failed | uncertain.
- **Outputs:** materialized+deployed map script; Civ7 launched at setup with the authored config; exact-authorship proof (empty `unresolvedLinks` = complete); terminal toast; persisted snapshots.
- **Invariants:** fingerprint equality is the staleness check; `relation=stale` requires matching requestId (else `unknown`); restart flag only when relation≠stale; the deployed bundle must embed the requestId (`SWOOPER_STUDIO_RUN_ID`) or proof zombies until log timeout; proof complete only when `unresolvedLinks` is empty.

### 4.17 Live runtime adoption (daemon push)
- **Trigger:** daemon pushes a `live-game` event.
- **Steps:** `useStudioEvents` receives it → `applyLiveGameState(event.state)` → update `liveRuntime` → GameConsole reflects it → recompute `liveGameStudioRelation` (`liveSourceMatchesStudio`).
- **States:** idle · ok · error.
- **Invariants:** a stale snapshot/setup response never overwrites a newer one (`shouldCommitLiveRuntimeSnapshot`/`...Setup`: commit only if active request key matches and not aborted); request keys are stable JSON hashes of their inputs.

### 4.18 Operation adoption on reconnect (hello)
- **Trigger:** daemon `hello` event (connect/reconnect).
- **Steps:** detect helloKey change → `readAndAdoptStudioOperationsCurrent` → fetch `operations.current` → `shouldAdopt` daemon-identity check (serverInstanceId+serverStartedAt) → `adoptStudioOperationsCurrent` applies `selectOperationForAdoption` per type → mark adopted terminal run-in-game toasts handled.
- **States:** adopting · adopted · skipped (identity mismatch).
- **Invariants:** daemon-identity TOCTOU guard discards mismatched responses; adoption never reverts a newer local terminal state to an older in-flight one.

### 4.19 Civ7 setup selection + drift
- **Trigger:** select a saved config in AppHeader.
- **Steps:** `onSavedConfigChange(id)` → fetch `Civ7SavedSetupConfigFile` → `studioSetupConfigFromSavedConfigFile` **replaces the entire setupConfig** → any later edit makes `studioSetupDriftsFromSavedConfig=true` → selector flips to "Custom"; Re-apply restores exactly.
- **States:** none · saved selected · drifted (Custom + Re-apply).
- **Invariants:** selection **replaces** (never merges) — the engine applies every studio option on top of the file, so a stale key would silently override it; "Custom" (`__custom-setup__`) is a sentinel, not selectable; drift uses normalized JSON equality (catches invisible fields).

### 4.20 Sync Studio from live game
- **Trigger:** Apply to Studio in the GameConsole hang-off.
- **Steps:** `onSyncFromLiveGame` → apply proved-source suggestion records (seed, setupConfig) into authoring state → recompute relation → ring + button disappear.
- **States:** stale → syncing → current.
- **Invariants:** available only when `liveRuntime.status=ok` AND `relation=stale` AND `!operationControlsDisabled` (verified `ui/components/GameConsole.tsx:208-212`); applies only visible-control paths (`recipeSettings.seed`, `setupConfig`) — never silently overwrites hidden fields.

### 4.21 Authoring persistence & recovery
- **Trigger:** any change to a persisted authoring field.
- **Steps:** store adapter → `saveStudioAuthoringState` (schemaVersion 1, savedAt, normalized setup, migrated pipelineConfig). On load: `loadStudioAuthoringState` → `parseStudioAuthoringState` (validate + migrate) → `buildInitialAuthoringData`.
- **Invariants:** persistence must not throw (errors swallowed); snapshots missing schemaVersion/savedAt are discarded; pipelineConfig migration runs on **both** read and write.

### 4.22 Keyboard shortcuts
- **Trigger:** window keydown.
- **Steps:** read latest values from `shortcutsRef` → suppress bare keys in editable targets (modifier combos pass) → dispatch run/reroll/panel-toggle/stage/step/data-type.
- **Invariants:** `shortcutsRef.current` is reassigned every render (latest-value pattern); arrows require modifiers so deck.gl keeps bare-arrow panning; `event.repeat` ignored for toggles.

---

## 5. Invariants — essential vs. incidental

### 5.1 Essential invariants (a clean rebuild must preserve)

Cross-referenced to the **do-not-break registry** in [`OWNER-FRAME.md` §6](./OWNER-FRAME.md).

| # | Invariant | Why it's essential | Where enforced | OWNER §6 |
|---|---|---|---|---|
| E1 | **Run-token + generation gating** — worker events with a stale runToken or generation are dropped before reaching state. | A slow superseded run must not overwrite a newer run's results. | `features/browserRunner/useBrowserRunner.ts` | ✓ browserRunner gating |
| E2 | **VizStore rAF batch with 50 ms backstop** — manifest commits fire even on backgrounded tabs. | rAF is throttled for hidden docs; without it the canvas stays on "awaiting matter". | `features/viz/vizStore.ts` (requestCommit) | (viz parity) |
| E3 | **User-driven selection bypasses the rAF batch** (immediate). | Batching interaction makes the UI feel unresponsive. | `features/viz/vizStore.ts` | (viz parity) |
| E4 | **Prior in-flight render aborted** before a new `renderDeckLayers`. | Prevents stacked heavy renders / UI freeze. | `features/viz/useVizState.ts` (AbortController) | (viz parity) |
| E5 | **DeckCanvas never remounts**; only `setProps`. | Remount destroys the WebGL context (visible flash). | `features/viz/DeckCanvas.tsx` | ✓ canvas stays mounted |
| E6 | **Canvas stays MOUNTED under the pipeline view** (CSS `invisible`, not unmounted). | Camera state + in-flight generation loops must survive a tab switch. | `app/StudioShell.tsx:2840` | ✓ canvas stays mounted |
| E7 | **Pinned step/layer retention** across reruns; layer retained only if its key belongs to the pinned step. | Preserve the user's selection across reruns; a foreign-step layer would be invalid. | `features/browserRunner/retention.ts` | ✓ retention UX |
| E8 | **Default selection prefers the first tile-space grid layer** over the first-emitted layer. | The pipeline emits world-space points first; landing on points each step is confusing. | `features/viz/useVizState.ts` | ✓ layer-list UX |
| E9 | **Layer upsert idempotent by layerKey** (replace, not append). | Re-emitted layers must not duplicate manifest entries. | `features/viz/ingest.ts` | (viz parity) |
| E10 | **Preset application is atomic** — config replaces only if `normalizeStrict` returns zero errors. | A partially-applied preset would silently produce wrong maps or crash gen. | `features/configOverrides/configBuilders.ts` | ✓ config-override merge semantics |
| E11 | **pipelineConfig migrations run on every read AND write** of persisted state. | Retired keys must not reach `additionalProperties:false` schemas. | `features/configMigrations/pipelineConfig.ts` | ✓ localStorage schema contract |
| E12 | **Import verifies recipeId against this build's catalog** before accepting. | A foreign-recipe config would corrupt against the wrong schema. | `features/presets/importFlow.ts` | (config-override semantics) |
| E13 | **localStorage schema contract** — authoring state under `mapgen-studio.authoring-state.v1` (`{schemaVersion:1, savedAt}`); bytes contract-identical; persistence failures never break authoring. | The store delegates to the reference serializer; a refactor must not change the on-disk format. | `features/studioState/persistence.ts`, `stores/authoringStore.ts` | ✓ localStorage schema contract |
| E14 | **Run-in-game fingerprint/relation equality** — `relation=current` iff `snapshot.fingerprint === buildRunInGameFingerprint(state)`; `stale` requires matching requestId. | Studio must not show an operation as current if any run input changed. | `features/runInGame/clientState.ts` | ✓ fingerprint/relation equality |
| E15 | **Materialization-mode decision** (durable vs disposable) is a deterministic pure function computed *before* the RPC and must match the files the daemon uses. | A wrong mode launches/retains the wrong artifact. | `app/StudioShell.tsx` (handleRunInGame), `clientState.ts` | ✓ materialization-mode decision |
| E16 | **Process-restart gate** — `restartCivProcess=true` only when relation≠stale AND `reloadBoundary='process-restart-required'`. | A destructive restart must not fire for a config the user no longer authors. | `features/runInGame/status.ts` | ✓ run-in-game relation |
| E17 | **Deployed bundle embeds the requestId** (`SWOOPER_STUDIO_RUN_ID`); proof waiter matches log lines on requestId+hashes+seed. | The only causal proof the authored config ran; absence zombies the op. | `server/runInGame/proofIdentity.ts`, `server/mapConfigs/deploy.ts` | ✓ assertNoRawControlFields / proof |
| E18 | **Live-snapshot/setup staleness guard** — commit only if the active request key matches and not aborted; abort the prior in-flight request on each new one; mounted-ref checked after every async boundary. | Out-of-order responses (abort+retry, overlapping event-triggered fetches) must not overwrite newer data. | `features/liveRuntime/model.ts` (`shouldCommitLiveRuntimeSnapshot`/`...Setup`), `app/StudioShell.tsx` (`readLiveRuntimeSnapshot`, `refreshLiveSetupFromEvent`) | ✓ live-runtime request-key staleness + abort |
| E18b | **`liveSnapshotFailureCountRef` is display-only** — it surfaces a `failureCount` in `liveRuntime`; it does **not** drive a client retry delay. | Reconciliation: arch/10 §7's "adaptive backoff" referred to the *pre-Pass-2 client poll loop* that Pass 2 **removed** (the client is now event-driven; the daemon owns cadence). The client must preserve staleness+abort (E18); backoff is **daemon-side / exterior**. | `app/StudioShell.tsx:517,675-684` | (was: adaptive backoff — now exterior) |
| E19 | **Operation adoption never reverts a terminal local state** to a stale in-flight incoming one (`selectOperationForAdoption`). | A daemon restart resets daemon state; a newer local terminal state must win. | `app/operationAdoption.ts` | ✓ operations.current adoption |
| E20 | **Daemon-identity TOCTOU guard** — if serverInstanceId+serverStartedAt differ between `hello` and `operations.current`, skip adoption + surface error. | Prevents adopting operations from a different daemon lifetime. | `app/hooks/useStudioEvents.ts`, `app/studioEventRecovery.ts` | ✓ operations.current adoption |
| E21 | **Save-deploy terminal-waiter semantics** — returns immediately if already terminal; else per-requestId resolve/reject with 5-min timeout; all rejected on unmount. | Defines when an operation is considered done; a refactor must keep the timeout contract. | `app/StudioShell.tsx` (waitForSaveDeployTerminalEvent) | ✓ terminal-waiter timeout |
| E22 | **Saved-config selection replaces (never merges) setup state**; any drift shows "Custom". | The engine applies every option over the file; a stale key silently overrides it. | `features/civ7Setup/setupConfig.ts`, `ui/components/AppHeader.tsx` | (setup parity) |
| E23 | **Busy-gate mutual exclusion** (see §6.3) — every user-initiated operation checks the three busy booleans and informs the user (no silent swallow). | Concurrent operations race / clobber server + config state. | `app/StudioShell.tsx`, `app/studioEventRecovery.ts` (`studioBusyGateMessage`) | ✓ serialized run queue + dual mutex |
| E24 | **Auto-run gate** — suppressed while `overridesDisabled` or any operation busy; a config change during a run fires exactly one queued run after. | Generating with overrides "disabled but applied" misleads; data races. | `app/StudioShell.tsx` (auto-run effects) | (run parity) |
| E25 | **Sync-from-live applies only visible-control paths** (`recipeSettings.seed`, `setupConfig`) and only when not busy. | Never silently overwrite fields the user cannot see; never mid-operation. | `ui/components/GameConsole.tsx`, `features/runInGame/liveSource.ts` | (live-runtime parity) |
| E26 | **Effect call order = fire order.** Three groups MUST be lifted as single atomic hooks preserving source order: **default-seed (410) → preset-apply (435)**, **stage (857) → step (862) → viz-sync (867)**, **auto-run trio (929/939/973)**. Lower-risk ordered pairs: deck-autofit (608/617), overlay (2188/2198 + era 2164), save-deploy waiter (548/558). | React fires effects in call order; reordering is a silent behavior change (duplicate/dropped run, clobbered config, wrong initial camera). | `app/StudioShell.tsx` — authoritative analysis in [`INVESTIGATION-FINDINGS.md` §1](./INVESTIGATION-FINDINGS.md) | ✓ (master parity hazard) |
| E27 | **DAG fetch gated on the Pipeline tab being visible** (no prefetch; `staleTime: Infinity`). | Prefetch wastes a round-trip and risks a stale result. | `features/recipeDag/useRecipeDagQuery.ts` | (query parity) |
| E28 | **Unfilled tile cells draw nothing** (noData/NaN/alpha=0 → transparent). | A page-colored mesh would obscure the substrate grid. | `features/viz/deckgl/render.ts` | (viz parity) |

### 5.2 Incidental (a clean rebuild need not preserve)

| Item | Why incidental |
|---|---|
| rjsf (`@rjsf`) as the schema-form engine + custom widget names + uiSchema shape | The essential behavior is "edit config through a schema-constrained form"; any schema-form library would satisfy it. |
| `LAYOUT.PANEL_WIDTH = 340px` and the DAG pixel constants (STAGE_WIDTH, RANK_GAP_X, …) | Layout geometry; the product intent is "fixed-width sidebar" / "stages by rank within phase bands". |
| `collectTransparentPaths()` single-child / label-match collapsing | A form-presentation heuristic; "no unnecessary nesting" is the intent. |
| DOM-driven sticky-scroll collapse (JSON-Pointer keys, `data-config-*` attrs) | An optimization to avoid a ref registry across rjsf re-renders. |
| `LocalPresetV1` `createdAtIso`/`updatedAtIso` (stored, never surfaced) | Speculative future use; no UI consumes them. |
| Export filename template + slug algorithm | Convention, not contract. |
| Recipe catalog bundled at build (`build:studio-recipes`) vs. dynamic fetch | An architectural choice; "Studio knows the available recipes + schemas" is the contract. |
| Storage key strings (`scratchConfigs`, `authoring-state.v1`, `live-game`/`live:live-game` ids) | Conventions; what matters is the stores are separate and in localStorage. |
| Config-dropdown group label prefixes ("Config / ", "Scratch / ", "Live / ") | Display convention; the four PresetKey kinds are the real taxonomy. |
| VizStore module-level singleton; hex-geometry cache (cap 4); two-level pending/committed | Implementation patterns; "viz state shared across canvas + panel, rAF-batched with backstop" is the requirement. |
| Core `Deck` (not `@deck.gl/react`); DPR cap 2; pointy-top 30° hex; 12 ms yield ticker | Renderer perf/quality details; "smooth canvas that doesn't freeze" is the contract. |
| Era snap tie-break (ties → lower era) | "Snap to nearest available era" is essential; tie direction isn't. |
| Overlay candidates via recipe `overlaySuggestions` | The overlay feature is essential; the suggestion-catalog mechanism is one way to populate it. |
| Background grid: CSS linear-gradient at 56×56px | "Readable pre-run survey grid" is the intent; CSS/size are cosmetic. |
| Daemon on Bun, port 5174; oRPC at `/rpc`; SSE via `experimental_liveOptions` (retry ∞, staleTime ∞, gcTime 0) | Deployment/transport choices; "a local server with an RPC contract + a push stream" is the contract. |
| Save path `mods/mod-swooper-maps/src/maps/configs/<id>.config.json`; envelope `$schema`/`recipe=standard` | Current mod repo layout; any discoverable path/schema works. |
| Live-snapshot defaults (bounds 8×8, fields terrain/biome/feature/resource, ≤512 plots) | Default sample params; only the request-key derivation is essential. |
| Seed range `0..0x7FFF_FFFF` | A real Civ7 constraint (must enforce equivalently) but the **error formatting** is incidental. |
| Global keydown listener + `shouldIgnoreGlobalShortcutsInEditableTarget` | "Shortcuts work globally except in text inputs" is essential; the listener mechanism is detail. |

---

## 6. The global state machine

Three concurrent concerns run **in parallel**, coordinated by one shared mutex:

1. **Operation lane** — at most one of {browser-run, save-deploy, run-in-game} active at a time (the busy gate). This is the heart of the machine.
2. **Live-runtime sub-machine** — `idle ↔ ok ↔ error`, driven purely by daemon push; independent of the operation lane (but its *controls* are gated by it).
3. **Authoring dirtiness** — `clean ↔ dirty`, derived (not a stored state): the `(pipelineConfig, worldSettings, recipeSettings)` triple vs. `lastRunSnapshot`. A browser run resets it to clean.

### 6.1 Operation-lane states

| State | Meaning | Source of truth |
|---|---|---|
| `IDLE` | No operation running; authoring may be clean or dirty. | (absence of the below) |
| `BROWSER_GENERATING` | Web Worker run active (`browserRunner.state.running`). Viz streams; `isDirty` cleared at start. | client (`browserRunner`) |
| `BROWSER_ERROR` | Last browser run ended in `run.error`; ErrorBanner shown; nothing in flight. | client |
| `SAVE_DEPLOY_RUNNING` | `saveDeployOperation.status==='running'` (queued→saving→deploying). Terminal-waiter held. | **daemon** (pushed) |
| `RUN_IN_GAME_RUNNING` | `runInGameOperation.status==='running'` (materializing→…→waiting-for-proof). | **daemon** (pushed) |
| `RUN_IN_GAME_TERMINAL` | Run-in-game ended (complete/blocked/failed/uncertain); `provedRunInGameSource` set on complete. | **daemon** (pushed) |

### 6.2 Live-runtime sub-machine

| State | Meaning |
|---|---|
| `LIVE_IDLE` | No live game / explicitly idle (`liveRuntime.status='idle'`). |
| `LIVE_OK` | Game running + responding (`status='ok'`); snapshot/setup fetch sub-states tracked separately (`idle/loading/ok/error`). |
| `LIVE_ERROR` | Unreachable/erroring (`status='error'`); `failureCount` increments; abort prevents stale commits. |

### 6.3 Busy-gate mutual-exclusion rules (the crux)

Three booleans — `browserRunning` (`StudioShell.tsx:496`), `saveDeployRunning` (`:592`), `runInGameRunning` (`:593`) — gate every user-initiated operation. The message comes from `studioBusyGateMessage` (`app/studioEventRecovery.ts:60`), which reports the **first** active conflict in priority order: browser → run-in-game → save-deploy.

| Operation | Blocked when… | Message / effect |
|---|---|---|
| **Browser run / Reroll / Auto-run** | `runInGameRunning OR saveDeployRunning` (auto-run also: `overridesDisabled`, or `browserRunning`) | Toast: "<subject> is paused while …". Auto-run silently suppressed (queued via pending flag). (`:942-977`, `:1416-1431`) |
| **Save & Deploy** | `browserRunning OR runInGameRunning OR saveDeployRunning` (all three) | Button disabled (`isSaveDisabled`, `:2672`); footer phase label. (`:1029`) |
| **Run in Game** | `runInGameRunning OR saveDeployRunning` | Busy toast/label (`:1696`, `gameOperationBusyLabel` `:2033`). |
| **Autoplay / Explore / Sync** | `browserRunning OR runInGameRunning OR saveDeployRunning` (i.e. `operationControlsDisabled`) | Busy toast; controls disabled in GameConsole (`:1808`, `:1932`, `:1992`, `:2018`). |
| **World/seed/map controls** | `operationControlsDisabled` | Disabled in AppFooter (`worldOperationBusyLabel` `:2039`). |

`operationControlsDisabled = browserRunning || runInGameRunning || saveDeployRunning` (`:2619`) is the single derived flag the chrome consumes.

### 6.4 Transitions

| From | To | Trigger | Guard | Driven by |
|---|---|---|---|---|
| IDLE | BROWSER_GENERATING | Run / Cmd+Enter / reroll / auto-run timer | `!runInGameRunning && !saveDeployRunning`; seed parses | user / timer |
| BROWSER_GENERATING | IDLE | worker `run.finished`/`run.canceled` | runToken+generation match | worker |
| BROWSER_GENERATING | BROWSER_ERROR | worker `run.error`/onerror | active generation non-null | worker |
| BROWSER_ERROR | BROWSER_GENERATING | Run again (clears error) | `!runInGameRunning && !saveDeployRunning` | user |
| IDLE | SAVE_DEPLOY_RUNNING | Save / Save-As confirm | all three booleans false | user → daemon |
| SAVE_DEPLOY_RUNNING | IDLE | SSE terminal status OR 5-min waiter timeout | requestId matches | **daemon** / timeout |
| IDLE / RIG_TERMINAL | RUN_IN_GAME_RUNNING | Run in Game | `!runInGameRunning && !saveDeployRunning`; seed parses; daemon returns requestId | user → daemon |
| RUN_IN_GAME_RUNNING | RUN_IN_GAME_TERMINAL | SSE terminal phase | requestId matches | **daemon** |
| LIVE_IDLE | LIVE_OK | `live-game` event `status=ok` | — | **daemon** |
| LIVE_OK | LIVE_ERROR | `live-game` `status=error` OR fetch failure | — | **daemon** / query |
| LIVE_ERROR / LIVE_OK | LIVE_OK / LIVE_IDLE | `live-game` `status=ok` / `idle` | — | **daemon** |
| (any) | (adoption) | daemon `hello` | identity match (else recovery error) | **daemon** |

### 6.5 What drives each

- **User action** (button, shortcut, form edit, dialog confirm) — initiates operation-lane transitions (subject to the busy gate).
- **Web Worker messages** (`run.progress/finished/canceled/error`) — drive only the browser-run lane.
- **SSE event stream** (`hello` / `operation` / `live-game`) — a single persistent TanStack-Query subscription, infinite retry; drives save-deploy, run-in-game, live-runtime, and adoption. **This is the dominant driver:** save-deploy and run-in-game state is daemon-owned and *pushed*, not polled.
- **Auto-run debounce timer** (300 ms) and the **terminal-waiter promise** (5-min) are the two client-side timers.
- **Mount + every `hello`** trigger operation adoption.

### 6.6 ASCII overview

```
        ┌──────────── BUSY GATE (mutual exclusion) ────────────┐
        │  at most one operation-lane state active at a time    │
        │                                                       │
 user → │   IDLE ──run──▶ BROWSER_GENERATING ──finish──▶ IDLE   │
        │     │  ▲                  └─error─▶ BROWSER_ERROR      │
        │  save│  │daemon terminal / 5-min waiter                │
        │     ▼  │                                              │
        │   SAVE_DEPLOY_RUNNING ──────────────────────────────  │
        │     │                                                  │
        │  run-in-game (daemon-pushed phases)                    │
        │     ▼                                                  │
        │   RUN_IN_GAME_RUNNING ──terminal──▶ RUN_IN_GAME_TERMINAL
        └───────────────────────────────────────────────────────┘
                       ▲ controls gated by busy gate
   daemon push  ───────┘
        │
   LIVE_IDLE ⇄ LIVE_OK ⇄ LIVE_ERROR        (independent sub-machine)
        ▲
   hello ─▶ operation adoption (identity-guarded)
```

---

## 7. Domain map — authority and adjacency

The bridge to the refactor: each product domain has one conceptual authority, which should become one controller-hook owner (candidate hook names from [`OWNER-FRAME.md` §3](./OWNER-FRAME.md)).

| Domain | Conceptual authority (state/logic owner) | Owns | Talks to | Candidate hook |
|---|---|---|---|---|
| **Authoring** | `authoringStore` + `usePresets` | recipe/preset/pipelineConfig/world/setup state; preset lifecycle (apply/save/import/export/delete); persistence delegation | Browser Run (config+seed), Game Integration (config+fingerprint), Live Runtime (sync-back targets), Pipeline (recipeId) | `usePresetLifecycle` / `usePresetCommands` |
| **Browser Run** | `useBrowserRunner` + `runStore` | runToken/generation lifecycle; auto-run debounce; `startBrowserRun`/`reroll`/`triggerRun`; `lastRunSnapshot`/`isDirty` | Authoring (reads config/seed), Visualization (clears+feeds the viz stream) | `useBrowserRun` |
| **Visualization** | `useVizState` + `vizStore` (`viewStore` for selection) | manifest ingest; dataType→space→mode→variant→era machine; render/abort; legend; fit/camera | Browser Run (ingests its stream), App Shell (shortcuts/viewport) | `useLayerSelection` + `useStageNavigation` |
| **Pipeline (DAG)** | `useRecipeDagQuery` (`viewStore` for stage selection/expansion) | the recipe DAG query (lazy, infinite-stale); stage select/expand; expansion pruning | Authoring (recipeId) | `usePipelineDag` |
| **Game Integration** | `runInGame` + `mapConfigSave` features (operations daemon-owned) | fingerprint/relation; materialization-mode; save-deploy terminal-waiter; handleRunInGame | Authoring (config+setup), Live Runtime (proved source), App Shell (busy gate + adoption) | `useRunInGameController` + `useSaveDeployController` |
| **Live Runtime** | `liveRuntime/model` + `useStudioEvents` | snapshot/setup request-key staleness machine; abort controllers; autoplay/explore; sync-from-live; `liveGameStudioRelation` | Game Integration (proved source), Authoring (sync targets), Civ7 Setup (live setup readback) | `useLiveRuntimeController` |
| **Civ7 Setup** | `civ7Setup/setupConfig` + `useSetupDataQueries` | leader/civ/difficulty/speed option derivation; saved-config selection + drift detection | Authoring (setupConfig lives in authoring state), Game Integration (launch params), Live Runtime (live readback) | `useSetupControls` |
| **App Shell** | `StudioShell` host (post-refactor: layout + error-boundary + shortcuts host) | layout/panels/viewport; keyboard shortcuts; theme; a11y; **the busy gate**; operation adoption wiring | every domain (assembles props, owns the shared busy booleans) | host + `useKeyboardShortcuts` + `useViewportLayout` |

**The cross-cutting coordination concern** is the busy gate: `browserRunning`/`runInGameRunning`/`saveDeployRunning` are produced by three different domains (Browser Run, Game Integration ×2) but consumed by all of them and by the chrome. Per [`OWNER-FRAME.md` §5](./OWNER-FRAME.md), this is the most cross-cutting shared value and the prime candidate for a small `useStudioBusy` surfaced by the host — avoid creating a second source of truth. **Hard constraint (INVESTIGATION-FINDINGS §2c):** the three booleans must be derived **synchronously** from the operation status each owning hook returns, and exposed **stable-from-first-render (default `false`)** — never republished via `useState`+`useEffect`, which opens a one-render operation-race window.

> **Authoritative hook list:** this domain→hook column is indicative. The verified target — **11 controller hooks** including the `useLayerSelection` + `useEraOverlayControl` split, with per-hook `dependsOn`/`provides`, risk, and init-order constraints — is [`INVESTIGATION-FINDINGS.md` §4–§5](./INVESTIGATION-FINDINGS.md). Phase 7 designs against that.

---

## 8. Discoveries, ambiguities, and owner-verification flags

**Genuine discoveries (verified against source):**

- **D1 — Run-in-Game recipe is hardcoded.** `handleRunInGame` sends `recipeId: "mod-swooper-maps/standard"` (literal, `StudioShell.tsx:1727`), while every other call site uses `recipeSettings.recipe`. With a single-recipe catalog this is invisible, but it would break multi-recipe in-game support. **Owner: confirm whether intentional (the game script name is recipe-invariant) or a latent bug.**
- **D2 — Repo-backed preset overrides have no UI.** `repoBackedPresetOverridesByRecipe` is persisted and consumed by `mergeBuiltInPresets` but is set programmatically only — no control was found in the read surface. **Owner: confirm the write path.**
- **D3 — Dead write-only state.** `const [, setLiveRuntimeSnapshot] = useState(...)` (`~:529`) — the value is never read. Already flagged in [`OWNER-FRAME.md` §6](./OWNER-FRAME.md) as a sanctioned cleanup.

**Language boundaries (domain seams — surface explicitly in the refactor):**

- **"preset"** — (a) a named config snapshot for a recipe (none/builtin/local/live) in the Config dropdown; (b) a Civ7 game-side *setup* preset read from a running game (`civ7Setup/livePreset.ts`). Distinct concepts, distinct code paths.
- **"stage"** — (a) Explore-panel UI grouping of steps (`selectedStageId`, viewStore); (b) which center view is shown (map vs pipeline, `StageViewTabs`); (c) a Pipeline-DAG node (`pipelineSelectedStageId`). Three usages, all in `viewStore`, never interacting.
- **"layer"** — (a) a `VizLayerEntryV1` in the manifest; (b) a deck.gl `Layer`; (c) "data type" in the Explore UI. The product-facing term for the manifest concept is **data type**.
- **"setup"** — (a) Civ7 setup-screen params; (b) the Studio-side representation of them (`Civ7StudioSetupConfig`); (c) the setup *catalog* of possible values (`useSetupDataQueries`).
- **"snapshot"** — `RunInGameClientSnapshot` (lightweight localStorage record) vs. `RunInGameSourceSnapshot` (full authoring capture) vs. `LiveRuntimeSnapshotState` (grid readback) vs. `Civ7SetupSnapshotLike` (raw tuner setup state).

**Open questions carried from the synthesis facet (for Phase 6 / owner verification):**

- **Q1 [RESOLVED]** Adaptive live backoff: confirmed there is **no client-side retry delay** — `liveSnapshotFailureCountRef` only feeds a displayed `failureCount`. arch/10 §7's "adaptive backoff" was the pre-Pass-2 client poll loop, now removed. Client invariant = staleness+abort (E18); backoff is daemon-side/exterior (E18b). Do **not** re-introduce a client backoff during the refactor.
- **Q2** Live-setup fetch fires on *every* `live-game` event (abort-cancelled but undebounced) — intentional during autoplay bursts?
- **Q3** Durable materialization keyed on `lastSaveDeployConfig` (overwritten each save) could flip "durable" off after a second save though the first file persists — intended, or should it key on per-save identity?
- **Q4** Explore uses `playerId:0` as the canonical local player while live setup reads `localPlayerId` — any case where they diverge?
- **Q5** Modifier shortcuts (Cmd+Enter) fire even inside editable targets (by design per `shouldIgnoreGlobalShortcutsInEditableTarget`) — confirm intended.

---

*Synthesized 2026-06-28 by the workstream owner from a 4-agent investigator fan-out. Capability/flow/invariant counts and structure summarized for the owner in the synthesis handoff. To be hardened in Phase 6 (investigation) and validated against the Phase-7 OpenSpec change set.*
