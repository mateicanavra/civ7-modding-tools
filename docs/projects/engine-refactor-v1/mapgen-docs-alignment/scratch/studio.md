<toc>
  <item id="purpose" title="Purpose"/>
  <item id="local-plan" title="Local plan (this pass)"/>
  <item id="current-code" title="Current code path (ground truth)"/>
  <item id="doc-posture" title="Docs posture + classification notes"/>
  <item id="drift" title="Drift + risks (docs vs code)"/>
  <item id="recommendations" title="Recommendations (DX-first)"/>
</toc>

# Scratch: MapGen Studio (consumer + examples alignment)

## Purpose

Align MapGen Studio’s documentation and “example posture” with:
- the actual current code (`apps/mapgen-studio/**`)
- the actual current recipe import surfaces (`mod-swooper-maps/recipes/*` and `*-artifacts`)
- and the intended MapGen DX-first architecture (engine-refactor-v1 specs)

Goal: treat Studio as a **reference consumer** and dev loop, not as architecture authority.

## Local plan (this pass)

1) Map the current end-to-end runner path from code (worker + protocol + recipe imports).
2) Compare the key seams docs to the code path and classify drift.
3) Extract “what should be canonical guidance” vs “what should be archived/research”.
4) Promote outcomes into `../SPIKE.md` as concrete recommendations/backlog.

## Current code path (ground truth)

**Recipe runtime modules (execution)**
- `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
  - Imports runtime recipes from built mod entrypoints:
    - `mod-swooper-maps/recipes/standard`
    - `mod-swooper-maps/recipes/browser-test`

**Recipe artifacts (UI config + UI metadata)**
- `apps/mapgen-studio/src/recipes/catalog.ts`
  - Imports artifacts from built mod entrypoints:
    - `mod-swooper-maps/recipes/standard-artifacts`
    - `mod-swooper-maps/recipes/browser-test-artifacts`
  - Treats artifacts as recipe-agnostic:
    - `configSchema: unknown` (TypeBox-ish, validated in worker via `normalizeStrict`)
    - `defaultConfig: unknown`
    - `uiMeta` (precomputed stage/step catalog for UI navigation only)

**Worker runner (end-to-end example)**
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
  - Receives `BrowserRunRequest` messages (`run.start`, `run.cancel`).
  - Merges defaults + overrides deterministically (`mergeDeterministic`) and validates strictly:
    - `normalizeStrict(recipeEntry.configSchema, mergedRaw, "/config")`
  - Compiles a plan and derives a stable identity:
    - `plan = recipe.compile(envBase, config)`
    - `runId = deriveRunId(plan)` (fingerprint; trace toggles excluded)
  - Constructs a browser-safe adapter:
    - `createMockAdapter({ ... tables ..., rng: createLabelRng(seed), ... })`
  - Creates context and injects a viz dumper:
    - `context = createExtendedMapContext(dimensions, adapter, env)`
    - `context.viz = createWorkerVizDumper()`
  - Runs async with trace enabled and cooperative cancellation:
    - `recipe.runAsync(context, env, config, { traceSink, abortSignal, yieldToEventLoop: true })`

**Important observation**
- This worker is the best “DX-first consumer example” in the repo today.
- Cancel semantics are implemented as **AbortController-based cooperative cancellation** keyed by `{ runToken, generation }` (not “terminate the worker”).

## Docs posture + classification notes

Docs that are currently strong and mostly align with code:
- ✅ `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
  - Good capability spec; maps adapter requirements by stage and correctly treats engine-coupled calls as a separate bucket.

Docs that are valuable but read more like “agent scratch” than canonical guidance:
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`

They contain real, useful observations, but they:
- are time-stamped and refactor-specific,
- include implementation-level extraction proposals,
- and in at least one case reference packages that no longer exist.

## Drift + risks (docs vs code)

High-impact drift:
- `SEAM-RECIPES-ARTIFACTS.md` references `@mapgen/browser-recipes` / `packages/browser-recipes` as an active system; it now includes an update note that this was deleted and Studio imports built artifacts directly from `mod-swooper-maps/recipes/*`.
  - Canonical docs must teach the *current* import surfaces (and avoid advertising deleted packages).
- `BROWSER-RUNNER-V0.1.md` describes a proposed protocol/shape that does not match the implemented worker protocol and recipe IDs (implemented IDs are `${namespace}/${recipeId}`).
- Some seam docs still claim cancel is “terminate the worker” or that `run.cancel` is unimplemented; this is now incorrect (worker implements `run.cancel`).

Potentially misleading posture:
- Several “seams” docs are written as if they are the primary docs to follow; in practice, they are project-history exploration and should be labeled/positioned accordingly so new readers don’t treat them as the canonical MapGen docs.

## Recommendations (DX-first)

1) Treat `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` as the canonical **end-to-end example** for “how to run a recipe”.
2) Ensure canonical docs teach the *current* Studio recipe seams:
   - runtime recipes: `mod-swooper-maps/recipes/*`
   - UI artifacts: `mod-swooper-maps/recipes/*-artifacts`
3) Either:
   - (a) rewrite the Studio seams docs to be short, evergreen “how it works today” docs, or
   - (b) relabel them clearly as “agent notes / exploration” and create a new small canonical Studio overview doc.
