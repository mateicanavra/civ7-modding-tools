# Agent: Config Overrides seam (MapGen Studio)

Mission scope: investigate ONLY the “Config Overrides” subsystem currently embedded in `apps/mapgen-studio/src/App.tsx`, plus the schema/types/merge/validation it relies on, and propose a clean extraction boundary (no refactor in this spike).

## 1) Files reviewed (paths)

- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- `mods/mod-swooper-maps/recipes/browser-test` (build output, consumed by Studio)
- `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- `packages/mapgen-core/src/compiler/normalize.ts`
- `packages/mapgen-core/src/authoring/stage.ts`

## 2) Responsibility inventory (what this subsystem does today)

### UI + state (in `apps/mapgen-studio/src/App.tsx`)

- Owns all config overrides state:
  - panel open/close (`browserConfigOpen`)
  - overrides enabled flag (`browserConfigOverridesEnabled`)
  - active editor tab (`browserConfigTab`: `"form" | "json"`)
  - current overrides value (`browserConfigOverrides`: `BrowserTestRecipeConfig`)
  - JSON editor text + parse/validate error (`browserConfigJson`, `browserConfigJsonError`)
- Renders an overlay “Config overrides” panel (absolute-positioned card) in browser mode only.
- Provides two editing modes:
  - **Schema-driven form** via RJSF:
    - `Form` uses a derived `browserConfigSchema` and `browserConfigUiSchema`.
    - Custom RJSF templates: `BrowserConfigFieldTemplate`, `BrowserConfigObjectFieldTemplate`, `BrowserConfigArrayFieldTemplate`.
    - Inline CSS blob `browserConfigFormCss` (scoped via `.browserConfigForm` class).
    - Form edits update `browserConfigOverrides` directly; no explicit “apply” step.
  - **JSON editor fallback**:
    - Textarea with “Apply JSON” button.
    - Switching JSON → Form forces `applyBrowserConfigJson()`; switching Form → JSON stringifies current `browserConfigOverrides`.
    - In JSON tab, `startBrowserRun()` blocks running if JSON is invalid.
- Derives a “presentation-only wrapper collapsing” map:
  - `collectTransparentPaths(schema)` walks the schema and marks “single-child object wrappers” to render transparently.
  - `BrowserConfigObjectFieldTemplate` reads `formContext.transparentPaths` and omits redundant group headers for those pointers.
  - Special casing based on schema path depth (`depth === 1` treated as “stage card”).
- Adapts the TypeBox-ish schema into something RJSF-friendly:
  - `normalizeSchemaForRjsf()` converts some `anyOf`/`oneOf` unions of `const` into `enum`, and converts scalar `const` to a readOnly enum.
  - `normalizeSingleVariantUnion()` removes a pointless selector when `anyOf/oneOf` has exactly one option.
- “Deterministic + strict” JSON validation in the JSON tab:
  - `applyBrowserConfigJson()` parses JSON then calls `normalizeStrict(BROWSER_TEST_RECIPE_CONFIG_SCHEMA, parsed, "/configOverrides")`.
  - On success, it stores the **cleaned** value as `browserConfigOverrides`.

### Runner integration (cross-file)

- App passes `configOverrides` to the worker in `BrowserRunRequest` only when enabled:
  - `const configOverrides = browserConfigOverridesEnabled ? browserConfigOverrides : undefined;`
- Worker is the authority for **merge semantics** and **final validation**:
  - `mergeDeterministic(BROWSER_TEST_RECIPE_CONFIG, configOverrides)` deep-merges plain objects.
  - `normalizeStrict(BROWSER_TEST_RECIPE_CONFIG_SCHEMA, mergedRaw, "/config")` validates + cleans after merge.

## 3) Hidden couplings (what app state / runner behavior depends on overrides)

- **Patch-vs-full-config ambiguity:** UI state is initialized to the full `BROWSER_TEST_RECIPE_CONFIG`, but worker treats `configOverrides` as a *patch* merged into `BROWSER_TEST_RECIPE_CONFIG`. This “works” either way, but it means:
  - Users typically edit a *full config snapshot* (because formData starts with base values).
  - The runner expects *partial overrides* semantics (missing keys mean “use base”).
  - The system behavior hinges on merge + schema defaults remaining stable.
- **Array replacement semantics are implicit:** `mergeDeterministic()` only recurses for “plain objects”; arrays are replaced wholesale. Any UI that tries to “edit a slice” of an array is misleading unless it always writes the entire array value.
- **Validation pathways differ by tab:**
  - JSON tab validates eagerly in-app via `normalizeStrict`.
  - Form tab does not gate “Run (Browser)” on strict validation; invalid values can reach the worker and fail there (UI relies on worker error surfacing).
- **Schema normalization split-brain:** the form uses a schema transformed by `normalizeSchemaForRjsf()`, but JSON validation (and worker validation) uses the original `BROWSER_TEST_RECIPE_CONFIG_SCHEMA`. If normalization ever diverges from TypeBox semantics, form-accepted values could be rejected by `normalizeStrict`/worker.
- **“Stage container” detection is structural:** `BrowserConfigObjectFieldTemplate` assumes:
  - root object (`depth === 0`) contains stage keys (e.g. `foundation`)
  - stage container is `depth === 1` (hard-coded; not schema-driven)
  - nested groups start at `depth >= 2`
  If the schema gains another wrapper layer above stages, stage cards disappear.
- **Wrapper-collapsing depends on schema hygiene:** `collectTransparentPaths()` only collapses wrappers when:
  - node has exactly one property
  - node has no `description`
  - child group has no `description`
  So whether a wrapper collapses is sensitive to incidental schema metadata (esp. `description` presence).
- **Cross-cutting duplication:** App and worker each define their own `formatConfigErrors()` and `safeStringify()` (not functionally coupled, but drift is easy).
- **Disabled/editability depends on runner state:** the entire panel is “read-only” while `browserRunning`, and enable toggling is disabled during runs. Any extraction must keep this “runner drives disabled state” contract.

## 4) Invariants (“don’t break”)

- **Schema-driven primary UX + JSON fallback**
  - Form remains the primary editor, driven by the canonical schema.
  - JSON textarea remains available and can round-trip with the form state.
- **Deterministic merge + validation**
  - Merge semantics remain deterministic and safe (no prototype pollution keys; stable key traversal).
  - Validation remains strict and produces cleaned values (schema defaults applied, unknown keys surfaced).
- **Stage containers remain present/collapsible**
  - Stage-level containers (e.g. `foundation`) remain the first visible, named grouping in the form UI.
  - Stages remain collapsible via `<details>` (default open behavior preserved).
- **Wrapper collapsing is presentation-only and exempt at stage top-level**
  - Collapsing must not change the actual schema/data semantics; it is only UI decoration.
  - The stage-level container remains visible even when schema has a single stage (no “collapse the whole stage away”).

## 5) Extraction proposal (no code)

Goal: move all “Config Overrides” behavior out of `App.tsx` behind a stable, cycle-safe feature boundary so App only *hosts* the panel and consumes a `configOverridesForRun` value.

### Suggested target paths (under `apps/mapgen-studio/src/features/configOverrides/`)

- `apps/mapgen-studio/src/features/configOverrides/index.ts` (barrel exports)
- `apps/mapgen-studio/src/features/configOverrides/ui/ConfigOverridesPanel.tsx`
  - owns the overlay card layout (header, enable toggle, tabs, reset button)
- `apps/mapgen-studio/src/features/configOverrides/ui/ConfigOverridesForm.tsx`
  - wraps RJSF `<Form>` with templates + CSS injection
- `apps/mapgen-studio/src/features/configOverrides/ui/ConfigOverridesJsonEditor.tsx`
  - textarea + apply button + error display
- `apps/mapgen-studio/src/features/configOverrides/ui/rjsfTemplates.tsx`
  - `BrowserConfigFieldTemplate`
  - `BrowserConfigObjectFieldTemplate`
  - `BrowserConfigArrayFieldTemplate`
- `apps/mapgen-studio/src/features/configOverrides/shared/schemaNormalization.ts`
  - `normalizeSchemaForRjsf`, `collectTransparentPaths`, helpers
- `apps/mapgen-studio/src/features/configOverrides/shared/validation.ts`
  - `validateAndNormalizeOverrides(schema, rawValue, basePath)` → `{ value, errors }` (thin wrapper over `normalizeStrict`)
- `apps/mapgen-studio/src/features/configOverrides/shared/mergeDeterministic.ts`
  - `mergeDeterministic(base, overrides)` + forbidden keys set
- `apps/mapgen-studio/src/features/configOverrides/useConfigOverrides.ts`
  - state machine for `enabled`, `tab`, `value`, `jsonText`, `jsonError`
  - provides “get overrides for run” output in a single place

This layout deliberately separates **UI** (React/RJSF) from **shared** (worker-safe, pure TS).

### Proposed public APIs (component + hook)

Hook (state + validation + tab switching):

- `useConfigOverrides<TConfig>(args)`
  - **inputs**
    - `baseConfig: TConfig`
    - `schema: unknown` (must be acceptable to `normalizeStrict` and RJSF after normalization)
    - `uiSchema?: UiSchema<TConfig, RJSFSchema, FormContext>`
    - `disabled?: boolean` (driven by `browserRunning`)
    - `basePathForErrors?: string` (default `"/configOverrides"`; consider matching worker `"/config"` for consistency)
  - **outputs**
    - `enabled: boolean`, `setEnabled(boolean)`
    - `tab: "form" | "json"`, `setTab(tab)` (internally enforces JSON→Form apply/validate)
    - `value: TConfig`, `setValue(TConfig)` (form writes here)
    - `jsonText: string`, `setJsonText(string)`
    - `jsonError: string | null`
    - `reset(): void`
    - `applyJson(): { ok: boolean }` (updates `value` on success)
    - `configOverridesForRun: TConfig | undefined`
      - definition: `enabled ? value : undefined` (no merge here; worker still merges)

Component (pure UI; no runner knowledge):

- `<ConfigOverridesPanel />`
  - **inputs**
    - `open: boolean`, `onClose(): void`
    - `disabled: boolean` (from runner)
    - `enabled/tab/value/jsonText/jsonError` + setters OR the hook result object
    - `schema: RJSFSchema` (already normalized for RJSF)
    - `uiSchema: UiSchema`
    - `formContext: { transparentPaths: ReadonlySet<string> }`
    - `cssText?: string` (default to current `browserConfigFormCss`)
  - **output**
    - none beyond invoking callbacks (panel remains controlled by the host)

### Dependency rules (avoid cycles / keep worker bundling sane)

- `features/configOverrides/ui/*` may import React + `@rjsf/*`.
- `features/configOverrides/shared/*` must remain “worker-safe”:
  - no React, no DOM APIs, no `window` references
  - only pure TS + imports like `@swooper/mapgen-core/compiler/normalize`
- `apps/mapgen-studio/src/browser-runner/*` may import `features/configOverrides/shared/*` (merge/validate helpers), but must never import from `ui/*` or `useConfigOverrides.ts`.
- `App.tsx` imports only the `ui/*` component + `useConfigOverrides` hook, not worker internals.

## 6) Risks + validation

### What can regress

- RJSF rendering differences (enum/const unions, default values, readOnly fields) if schema normalization is moved or altered.
- Wrapper collapsing regressions:
  - stage containers disappearing (depth assumptions)
  - redundant groups reappearing (transparent pointer calculation)
  - collapsibility/default-open behavior changing (knobs/advanced defaults)
- Merge/validation drift:
  - arrays accidentally deep-merged or partially merged
  - forbidden keys handling lost (prototype pollution vector)
  - error paths/messages changing enough to break UX expectations
- Worker bundle regressions if worker accidentally pulls in React/RJSF through imports.

### How to validate (build + smoke)

- Build + worker bundle verification:
  - `bunx turbo run build --filter=mapgen-studio`
  - `bun run --filter mapgen-studio check:worker-bundle`
- Manual smoke (in `bun run dev:mapgen-studio`):
  - Open “Config” panel → enable overrides → confirm form renders with styled stage card (“Foundation”).
  - Confirm stage card remains present and collapsible; nested groups collapse only when appropriate.
  - Switch Form → JSON and back; JSON→Form requires “Apply” / validation and preserves edits.
  - Paste invalid JSON → see error + run blocked in JSON tab.
  - Paste unknown keys → see strict “Unknown key” style errors (from `normalizeStrict`).
  - Run with a minimal partial override (e.g. only `foundation.knobs`) and confirm worker run succeeds (merge semantics intact).
