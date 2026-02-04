# Studio Presets v1 — Decision-Complete Implementation Plan

> Planning-only doc (no feature implementation in this PR).
>
> Target: **Studio Presets v1** = built-in presets (from recipe artifacts) + local presets (localStorage) + import/export (single-preset exchange file).
>
> Hard guardrail: **Studio must remain recipe-agnostic** (no recipe-specific preset lists/labels inside Studio).

## Revision Notes

- v0: initial plan draft + decisions (this doc).

---

## Scope (v1)

- Preset sources
  - **Built-in** presets authored in recipe packages and exposed via recipe artifacts (read-only in Studio).
  - **Local** presets created by users in Studio (per-browser `localStorage`, recipe-scoped).
  - **Import** adds a preset to local store (may require switching recipes).
  - **Export** exports one preset file (built-in, local, or “current config”).
- Apply semantics
  - Selecting a preset applies it by validating via `normalizeStrict` against the recipe’s `configSchema`.
  - Invalid presets never silently apply.

## Non-goals (v1)

- Cross-device sync (no cloud).
- Multi-preset “pack” import/export.
- In-place editing of built-in presets (copy to local instead).
- Deep diff/merge UX.

---

## Mandatory Skill Introspection (key constraints)

Skimmed skills (high-signal constraints that affect this plan):

- **Graphite (`gt`)**
  - Graphite-first; avoid history rewriting (`git rebase`, force pushes, etc.).
  - If you edit mid-stack, restack descendants before submission when needed.
  - Multi-worktree safety: default to `gt sync --no-restack` unless intentionally restacking globally.
- **Git worktrees**
  - Ensure edits happen in the intended worktree; don’t mutate the primary checkout accidentally.
  - Use `git` freely for inspection; keep mutations intentional.
- **Bun**
  - Prefer `bun` workspace scripts; avoid lockfile churn.
- **Turborepo**
  - Preserve task graph correctness: generated artifacts must be produced by the correct task and live under declared `outputs`.
- **Vite**
  - `localStorage` and file APIs are client-only; keep them out of SSR-like contexts (Studio is client-only, but still avoid evaluating on import).
  - Feature flags should use `VITE_*` env vars if needed.
- **Web Workers**
  - Keep UI persistence on main thread; workers are not a good place for preset storage logic.
- **React best practices (Vercel)**
  - Avoid derived-state loops (single source of truth; derive the rest).
  - Avoid repeated synchronous `localStorage` reads during render; cache and update via state.
- **React composition patterns (Vercel)**
  - Avoid boolean prop proliferation; add explicit callbacks/variants rather than “modes”.
- **Decision logging**
  - Any ambiguity that affects behavior (ID semantics, overwrite rules, file format) must be explicitly decided (captured below).

Repo-specific constraints from the prompt:

- **Do not implement** beyond this plan doc (docs-only change in this PR).
- **Graphite-only** workflow; never use `git rebase`.
- **No `as any`** in anything touched (this doc contains no `as any`).
- **Studio agnostic**: no recipe-specific preset lists/labels inside Studio.

---

## Grounding Pass (current code pointers)

These are the concrete files/symbols this plan builds on:

### Studio recipe artifact boundary

- `apps/mapgen-studio/src/recipes/catalog.ts`
  - `RecipeArtifacts` shape today: `{ id, label, configSchema, defaultConfig, uiMeta }`.
  - `STUDIO_RECIPE_ARTIFACTS` is the compiled-in catalog for the Studio build.
  - **Plan impact:** add built-in preset catalog to recipe artifacts without making Studio recipe-specific.

### Studio preset UI placeholder + config ownership

- `apps/mapgen-studio/src/App.tsx`
  - `recipeSettings` includes `preset: "none"` today.
  - `presetOptions` is currently hardcoded to `[None]`.
  - `buildDefaultConfig(...)` uses `normalizeStrict` to validate defaults against `configSchema`.
  - **Plan impact:** wire preset selection → apply preset → set `pipelineConfig` once (no reset loops).
- `apps/mapgen-studio/src/ui/components/RecipePanel.tsx`
  - Preset select exists (`presetOptions` prop).
  - Save menu exists (“Save to Current”, “Save as New...”) but only calls `onSave()` today.
  - **Plan impact:** replace `onSave()` with explicit callbacks and add import/export entry points.

### Generator-side recipe validation + generated artifacts

- `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts`
  - Emits `dist/recipes/*-artifacts.{js,d.ts}` (schema/defaults/uiMeta embedded as JSON).
  - Validates `.config.json` presets under `src/maps/configs` today by scanning and running `normalizeStrict`.
  - **Plan impact:** add **built-in Studio presets** under `src/presets/<recipeId>/*.json`, validate them, and emit a presets catalog (embedded + JSON file).

### Strict normalization + schema metadata stripping

- `packages/mapgen-core/src/authoring/sanitize-config-root.ts`
  - `stripSchemaMetadataRoot(value)` strips root-only `$schema` / `$id` / `$comment`.
  - **Plan impact:** presets may include `$schema` for editor support; normalization is strict, so strip before validate/apply.

---

## Core Invariants (must hold)

- Studio remains **preset-source-agnostic** and **recipe-agnostic**:
  - The only recipe-specific preset data comes from recipe artifacts.
  - Studio does not hardcode recipe IDs, preset lists, or labels.
- Built-in presets are immutable:
  - Studio cannot overwrite built-ins; “Save to Current” applies only to locals.
- Apply is always strict:
  - Applying a preset always runs `normalizeStrict` with the recipe schema.
  - Invalid preset never mutates `pipelineConfig`.
- Generated artifacts stay generated:
  - Anything under `dist/` is script-owned; sources live under `src/`.
- Avoid reset loops:
  - Selecting a preset updates `pipelineConfig` once.
  - Editing config does not implicitly change preset selection.

---

## Data Model (built-in vs local)

### Preset keying in Studio settings

Decision: keep `RecipeSettings.preset: string`, but give it stable semantics:

- `"none"` — no preset selected.
- `"builtin:<presetId>"` — built-in preset (recipe-scoped).
- `"local:<presetId>"` — local preset (recipe-scoped).

Rationale: minimal wiring (Select values are strings), and preserves existing settings shape.

### Built-in preset descriptor (provided by recipe artifacts)

```ts
export type BuiltInPreset = Readonly<{
  id: string; // recipe-scoped presetId
  label: string;
  description?: string;
  config: unknown; // validated + sanitized at build time, still treated as unknown in Studio
}>;
```

### Local preset record (Studio persistence)

```ts
export type LocalPresetV1 = Readonly<{
  id: string; // local presetId (generated; do not accept external IDs to avoid collisions)
  label: string;
  description?: string;
  config: unknown; // store sanitized (strip schema metadata root)
  createdAtIso: string;
  updatedAtIso: string;
}>;
```

### Local storage schema + migration

Decision: a single versioned JSON blob under one stable key.

- `localStorage` key: `mapgen-studio.presets`

```ts
export type StudioPresetStoreV1 = Readonly<{
  version: 1;
  presetsByRecipeId: Readonly<Record<string /* StudioRecipeId */, ReadonlyArray<LocalPresetV1>>>;
}>;
```

Migration rules:

- Missing key → empty v1 store.
- Invalid JSON → empty v1 store + “presets reset” warning toast.
- Unknown `version` → empty v1 store + warning toast (do not crash Studio).

---

## Authoring + Build Pipeline (built-in presets)

### Source-of-truth location (authoring)

Decision (prompt requirement): built-in preset JSON files live under:

- `mods/mod-swooper-maps/src/presets/<recipeId>/*.json`

This directory does not exist yet (generator currently validates `src/maps/configs/*.config.json`); v1 moves/introduces presets here.

### Preset authoring file format (wrapper)

Decision: built-in preset files are *wrappers* so metadata doesn’t pollute strict recipe config.

```jsonc
{
  "$schema": "https://civ7.tools/schemas/mapgen-studio/recipe-preset.v1.schema.json",
  "id": "earthlike",         // optional; default = file basename
  "label": "Earthlike",      // optional; default = Title Case(id)
  "description": "…",        // optional
  "config": {
    "$schema": "…",          // optional editor hint; stripped before validation
    "...": "recipe config root"
  }
}
```

### Generator validation (definition + recipe schema)

Decision: generator validates in two layers, failing fast with aggregated errors:

1) Definition shape (wrapper schema)
   - ensure object, optional id/label/description are strings, config is object
2) Recipe config validity
   - `normalizeStrict(recipeSchema, stripSchemaMetadataRoot(def.config), "/preset/<file>")`

Validation output UX (developer-facing):

- Throw with a multi-line error message listing each file and each failure:
  - JSON parse errors
  - wrapper shape errors
  - `normalizeStrict` errors (paths + messages)

### Emitted artifacts (built-in presets catalog)

Decision: export built-in presets to Studio via the existing `*-artifacts` module (same boundary as schema/defaults).

Per recipe, emit:

- `dist/recipes/<recipeId>.presets.json` — debugging/handoff catalog
- Add to `dist/recipes/<recipeId>-artifacts.js` exports:
  - `export const studioBuiltInPresets = [...]` (embedded JSON)
- Add to `dist/recipes/<recipeId>-artifacts.d.ts`:
  - `export const studioBuiltInPresets: ReadonlyArray<BuiltInPreset>;`

Studio consumes presets only via the recipe artifacts import (no filesystem scanning).

---

## Studio Wiring (load/apply/save/import/export)

### State ownership and boundaries

Decision: keep state ownership in `apps/mapgen-studio/src/App.tsx`:

- `recipeSettings` (including `preset`) remains App-owned.
- `pipelineConfig` remains App-owned.
- Presets subsystem provides:
  - merged list of options,
  - resolver from preset key → preset definition,
  - actions: save current, save as new, import, export.

Suggested module boundary:

- `apps/mapgen-studio/src/features/presets/`
  - `types.ts` (PresetKey parsing, view models)
  - `storage.ts` (load/save/migrate local storage store)
  - `applyPreset.ts` (pure helper: merge skeleton + normalizeStrict)
  - `usePresets.ts` (hook: built-ins + locals → options + actions)
  - `importExport.ts` (file format parse/serialize)

### Loading preset options (built-in + local)

Decision: `usePresets({ recipeId, builtIns })` returns:

- `options: SelectOption[]` (flat list; RecipePanel currently expects this)
- `resolve(key) => presetDef | null`
- `actions` for save/import/export

Option labeling (v1):

- Always include `{ value: "none", label: "None" }`
- Built-ins: label prefix `Built-in / …`
- Locals: label prefix `Local / …`

Rationale: avoids grouped select complexity while making source visible.

### Applying a preset (uses `normalizeStrict`)

Decision: apply happens only on explicit preset selection change.

Flow:

1. Resolve selection key:
   - `"none"` → do nothing (selection indicates nothing applied)
   - `builtin:*` / `local:*` → resolve to `{ label, config }`
2. Build apply input:
   - Start from config skeleton derived from UI meta (existing `buildConfigSkeleton(uiMeta)` in `App.tsx`).
   - Merge in preset config: `mergeDeterministic(skeleton, stripSchemaMetadataRoot(presetConfig))`
3. Validate + produce typed output:
   - `normalizeStrict<PipelineConfig>(recipeArtifacts.configSchema, merged, "/preset/<id>")`
4. If errors:
   - toast “Preset invalid” + open details modal (paths + messages)
   - keep existing `pipelineConfig` unchanged
5. If valid:
   - `setPipelineConfig(value)` and keep selection as-is

Reset-loop guardrails:

- Do not “infer current preset” from config edits.
- Do not run “apply preset” from render; use event handler or a tightly guarded effect that only reacts to `recipeSettings.preset` changes.

### Save semantics (“Save to Current” vs “Save as New…”)

Decision: built-ins are immutable; “Save to Current” only overwrites locals.

- Save to Current:
  - If `recipeSettings.preset` is `local:<id>` → overwrite that local preset’s `config` with current `pipelineConfig` (sanitized), update timestamp.
  - If selection is `"none"` or `builtin:*` → show Save-as modal instead (or toast that “Save to Current” requires a local preset).
- Save as New:
  - Prompt for `label` (required) + `description` (optional).
  - Create a new local preset, select it, and keep `pipelineConfig` unchanged.

### LocalStorage read/write strategy

Decision: read once on mount; write through controlled setters.

- Read:
  - on App mount (or first use of `usePresets`), load and migrate store → React state.
- Write:
  - on save/import/delete actions, update React state and persist.
  - handle quota errors by showing toast and keeping in-memory state (or reverting; decision: keep in-memory but warn that persistence failed).

### Import/export UX and file format

#### Export file format

Decision: export is a single-preset exchange wrapper with `$schema`.

```jsonc
{
  "$schema": "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
  "version": 1,
  "recipeId": "mod-swooper-maps/standard",
  "preset": {
    "label": "My Preset",
    "description": "…",
    "config": { "...": "recipe config root" }
  }
}
```

Export sources:

- If selection is `builtin:*` or `local:*` → export that preset’s label/description/config.
- If selection is `"none"` → export “Current Config” (label defaults to `Current Config` unless user chooses otherwise in a dialog).

Filename:

- `<recipeId>__<labelSlug>__studio-preset.json`

#### Import behavior

Import flow:

1. Parse JSON, validate wrapper shape (`version`, `recipeId`, `preset.label`, `preset.config`).
2. If `recipeId` differs from current recipe:
   - Prompt: “Preset is for <recipeId>. Switch recipe and import?” (Switch+Import / Cancel)
3. Validate config with `normalizeStrict` for that recipe schema.
4. Store as a new **local** preset (generate local id; do not reuse external id).
5. Select it and apply it.

Unknown recipeId on import:

- Error modal: “This Studio build doesn’t include recipe <recipeId>.”
- Abort import (do not store).

### Error UX (applies to apply/import/save)

Decision: errors are non-destructive + actionable:

- Toast for short summary (“Invalid preset”, “Import failed”, “Couldn’t save to localStorage”).
- Details modal for:
  - JSON parse errors
  - schema mismatch / `normalizeStrict` failures (include paths and messages)
  - unknown recipeId on import
- Preserve last-good `pipelineConfig` on apply failures.

---

## Packaging Decisions (ownership boundaries)

### `@swooper/mapgen-core/authoring`

Decision: `mapgen-core/authoring` owns the schema/types for:

- `RecipePresetDefinitionV1` (authoring wrapper used in `src/presets/...`)
- `StudioPresetExportFileV1` (import/export file)

Constraints:

- Must be usable by both Node scripts (generator) and Studio (browser).
- No filesystem code in core; only types, schemas, and pure helpers.

Keep:

- `stripSchemaMetadataRoot` (already exists and is necessary for strict normalization).

### Recipe package (e.g. `mod-swooper-maps`)

Decision: recipe packages own:

- built-in preset sources under `src/presets/<recipeId>/*.json`
- generator script changes to validate and emit built-in presets catalog

### Studio (`apps/mapgen-studio`)

Decision: Studio owns:

- merging built-ins + locals into options
- apply behavior (normalizeStrict + state update)
- persistence (`localStorage`) and migration
- import/export UI and file IO

Studio explicitly does not own:

- any recipe-specific preset lists/labels
- walking recipe package directories for preset discovery

---

## React/DX Hardening Pass A (state + hooks)

Implementation checklist (must hold in code PRs):

- Single source of truth:
  - `pipelineConfig` is the canonical “current config”.
  - `recipeSettings.preset` is the canonical “selected preset key”.
  - Any “dirty” indicator is derived (e.g., compare against selected preset’s normalized config if desired).
- Avoid reset loops:
  - preset apply happens only when the user changes selection (event handler), or via an effect gated by a “did selection actually change” check.
  - recipe change invalidates preset selection:
    - if `recipeSettings.preset` is not valid for new recipe → set to `"none"` (or to recipe-provided default if we add one later).
- Derived state and memoization:
  - `presetOptions` derived via `useMemo` from `builtIns` + current recipe’s local presets.
  - localStorage read happens at most once; subsequent updates use React state.
- Component API evolution:
  - Prefer explicit callbacks in `RecipePanel` over boolean flags:
    - `onSaveToCurrent`, `onSaveAsNew`, `onImportPreset`, `onExportPreset`

---

## Tooling/Invariants Hardening Pass B (build graph + tests + gates)

Build/task invariants:

- Turborepo ordering already ensures Studio sees generated recipe artifacts:
  - `turbo.json` has `mapgen-studio#dev` and `mapgen-studio#build` depending on `mod-swooper-maps#build:studio-recipes`.
- Ensure built-in presets artifacts live under `dist/**` so they’re included in:
  - `mod-swooper-maps#build:studio-recipes` outputs (`dist/**`)

Type boundary invariants:

- In Studio, treat `config` as `unknown` until `normalizeStrict` returns typed `PipelineConfig`.
- No `as any`; use guards + normalization outputs to obtain typed values.

Suggested tests (minimum viable; align with existing gates):

- `packages/mapgen-core`:
  - unit tests for parsing/validating preset wrapper schemas (shape-level).
- `mods/mod-swooper-maps`:
  - generator tests that invalid preset wrappers/configs fail generation with actionable error messages.
- `apps/mapgen-studio` (Vitest):
  - import rejects unknown recipeId
  - import rejects invalid config (normalizeStrict errors surfaced)
  - localStorage migration: invalid JSON → empty store + warning path

CI gates (must be green):

- `bun run build`
- `bun run check`
- `bun run lint`
- `bun run test:ci`

---

## Rollout Plan

Decision: ship v1 enabled by default once built-in presets exist for at least one recipe (standard).

Safeguards:

- If a recipe has 0 built-in presets, Preset select shows “None” + locals.
- If `localStorage` is blocked/unavailable:
  - built-ins still work
  - local save/import actions show a clear error and do not crash Studio

Optional gradual rollout (only if needed):

- `VITE_MAPGEN_STUDIO_PRESETS_V1` (default `"true"`)
  - if false: hide save/import/export and only show “None” preset

---

## Implementation Plan (stacked PR sequence)

This is the recommended sequence of implementation PRs after this plan:

1) **Core schemas + types**
   - Add preset wrapper schemas/types to `@swooper/mapgen-core/authoring`.
   - Add helpers (label derivation, key parsing) if they’re shared.
2) **Recipe authoring + generator**
   - Add `mods/mod-swooper-maps/src/presets/<recipeId>/*.json` source(s).
   - Update `generate-studio-recipe-types.ts` to validate + emit `studioBuiltInPresets` + `*.presets.json`.
3) **Studio presets subsystem**
   - Implement local store (`localStorage`) + migration.
   - Wire `App.tsx` preset selection to apply via `normalizeStrict`.
   - Wire save/import/export UX in `RecipePanel`.
4) **Tests + polish**
   - Add unit tests and ensure CI gates pass.
   - Improve error UX (modal details) and edge-case handling.

---

## Decision-Complete Summary (v1)

### Decisions locked for v1

- Preset selection key format: `"none" | "builtin:<id>" | "local:<id>"`.
- Built-in preset authoring location: `mods/mod-swooper-maps/src/presets/<recipeId>/*.json`.
- Built-in preset authoring format: wrapper object with `config` field; root `$schema` for editor support.
- Built-in preset validation: generator validates wrapper shape + validates `config` via `normalizeStrict` (after `stripSchemaMetadataRoot`).
- Built-in preset distribution: recipe artifacts export `studioBuiltInPresets` (embedded JSON) + emit `dist/recipes/<recipeId>.presets.json` for debugging.
- Local presets persistence: `localStorage` key `mapgen-studio.presets`, versioned store with migration behavior (invalid/unknown → empty + warning).
- Save behavior:
  - “Save to Current” overwrites only local presets; built-ins and none require “Save as New”.
  - “Save as New” always creates a new local preset.
- Import/export file: single preset exchange file with `$schema`, `version: 1`, `recipeId`, `preset`.
  - Import switches recipes only with explicit user confirmation.
  - Unknown recipeId aborts import.
- Error UX: toast + details modal; never mutate config on invalid apply/import.
- React invariants: single-source-of-truth for config + selection; no derived-state loops.
- Tooling invariants: build ordering via turbo; outputs under `dist/**`; gates are `build/check/lint/test:ci`.

### Open questions (v1)

- None. (Any further UX improvements or “pack” formats are explicitly deferred to v2.)

