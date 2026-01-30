# agent-recipes-artifacts — recipes/artifacts seam (MapGen Studio)

Mission scope: investigate how `packages/browser-recipes/` and `@mapgen/browser-recipes/*` are structured today, how Studio uses them, and propose a scalable “infinite recipes” strategy that avoids UI/worker protocol unions exploding (docs only; no implementation).

---

## 1) Files reviewed

### Artifacts package
- `packages/browser-recipes/package.json`
- `packages/browser-recipes/tsconfig.json`
- `packages/browser-recipes/tsup.config.ts`
- `packages/browser-recipes/src/index.ts`
- `packages/browser-recipes/src/browser-test.ts`
- `packages/browser-recipes/scripts/generate-types.ts`

### Recipe source (current exported recipe)
- `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`

### Domain aliasing (relevant to bundling + browser-safety)
- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/domain/foundation/index.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`

### Studio usage + protocol seam
- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
- `apps/mapgen-studio/src/browser-runner/foundation.worker.ts`
- `apps/mapgen-studio/package.json`
- `apps/mapgen-studio/vite.config.ts`
- `apps/mapgen-studio/scripts/check-worker-bundle.mjs`

### Docs/specs referencing recipes
- `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
- `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
- `docs/projects/mapgen-studio/ROADMAP.md`
- `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md`
- `docs/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md`
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md`
- `docs/projects/mapgen-studio/resources/SPIKE-mapgen-studio-arch.md`

---

## 2) Current artifacts surface

### What a “recipe” is (code terms)

**Recipe module**
- In `@swooper/mapgen-core/authoring`, `createRecipe(...)` returns a `RecipeModule<TContext, TConfigInput, TConfigCompiled>` with:
  - `id` (string recipe id, e.g. `"browser-test"`)
  - `compile(env, config?) -> ExecutionPlan`
  - `run(context, env, config?, { traceSink? ... }) -> void`
  - plus helpers (`compileConfig`, `runRequest`, `instantiate`) used by the engine.

**Stages**
- Recipes are authored as an ordered list of *stage modules* (`const stages = [foundation, ...] as const;`).
- Each stage contributes steps and (typically) a “surface schema” for config input. For `browser-test`, the “surface schema” is `foundation.surfaceSchema` and is wrapped into a recipe-level schema.

**Config schema (runtime validator / default applier)**
- The current recipe exports a TypeBox schema:
  - `BROWSER_TEST_RECIPE_CONFIG_SCHEMA = Type.Object({ foundation: Type.Optional(foundation.surfaceSchema) }, { additionalProperties: false, default: {} })`
- Studio and the worker both use `@swooper/mapgen-core/compiler/normalize.normalizeStrict(schema, raw, path)` to apply defaults/clean + report validation errors.
  - This validator expects a TypeBox `TSchema` (not arbitrary JSON Schema).

**Defaults**
- The current recipe exports a canonical base config:
  - `BROWSER_TEST_RECIPE_CONFIG` (a stage-shaped object; currently only `foundation: ...`)
- Worker behavior today: `mergedRaw = mergeDeterministic(BROWSER_TEST_RECIPE_CONFIG, configOverrides)` then `normalizeStrict(...)` to narrow/clean.

**IDs**
- Recipe id is the `createRecipe({ id: "browser-test", ... })` id.
- Step IDs emitted in traces/viz are *fully qualified* (namespace + recipe id + stage id + step id), built in `createRecipe` (`computeFullStepId`).

### What `packages/browser-recipes/` currently is

**Today’s structure is a thin re-export layer over mod sources.**
- Package name: `@mapgen/browser-recipes` (workspace-private).
- Exports (package.json):
  - `"."` → `dist/index.js`
  - `"./browser-test"` → `dist/browser-test.js`
- Source entrypoints:
  - `src/index.ts` re-exports `./browser-test`.
  - `src/browser-test.ts` re-exports from the mod recipe module: `mods/mod-swooper-maps/src/recipes/browser-test/recipe`.

**Build notes (why this package exists at all)**
- `apps/mapgen-studio` runs `bun run --cwd ../../packages/browser-recipes build` in `predev`/`prebuild`, meaning Studio expects to import built artifacts.
- `packages/browser-recipes/scripts/generate-types.ts`:
  - imports the built `dist/browser-test.js`,
  - serializes the schema to `dist/browser-test.schema.json`,
  - generates `dist/browser-test.d.ts` with a config type (via `json-schema-to-typescript`) and value exports.
- `packages/browser-recipes/tsup.config.ts` includes an esbuild plugin that aliases `@mapgen/domain/*` imports into `mods/mod-swooper-maps/src/domain/*` to keep recipe/domain implementations browser-approved and consistent during bundling.

### How Studio currently imports/uses recipes

**UI (`apps/mapgen-studio/src/App.tsx`)**
- Imports from `@mapgen/browser-recipes/browser-test`:
  - `BROWSER_TEST_RECIPE_CONFIG` (for initializing UI state and reset-to-default)
  - `BROWSER_TEST_RECIPE_CONFIG_SCHEMA` (for RJSF form schema generation after some presentation normalization)
  - `type BrowserTestRecipeConfig` (local state type)
- The config overrides UI is effectively specialized to one recipe because:
  - state is `BrowserTestRecipeConfig`
  - schema is the single exported schema
  - default config is the single exported default config

**Protocol (`apps/mapgen-studio/src/browser-runner/protocol.ts`)**
- Imports `type BrowserTestRecipeConfig` and bakes it into:
  - `BrowserRunStartRequest.configOverrides?: BrowserTestRecipeConfig`
- This is the “union explosion” seam: adding recipe N implies adding recipe-specific config typing to the protocol surface (and then to every UI/worker consumer).

**Worker (`apps/mapgen-studio/src/browser-runner/foundation.worker.ts`)**
- Imports from `@mapgen/browser-recipes/browser-test`:
  - the default recipe module (`browserTestRecipe`) to `compile`/`run`
  - default config + schema to merge + validate overrides
- Worker hard-codes the recipe today (`browser-test`) and does deterministic deep-merge + validation + execution.

---

## 3) Scaling strategy for “infinite recipes” (without protocol union blow-up)

Goal: make “add a recipe” a *mechanical artifacts task* (new module + registry entry), while keeping the worker protocol recipe-agnostic (`{ recipeId, configOverrides: unknown }`) and still allowing strong typing *locally* in Studio and in recipe-specific code.

### 3.1 Proposed `RecipeId` type + registry shape

Two layers of “recipe id” are useful:

- **Protocol-level:** accept any string (forward-compatible, doesn’t require rebuild to *parse* old/new ids).
  - `type RecipeId = string;`
- **Local (Studio/worker) known set:** narrow to the curated registry’s keys for ergonomic typing and selection UI.
  - `type KnownRecipeId = keyof typeof recipeCatalog;`

Recommended registry shape (in `@mapgen/browser-recipes`), designed to:
- avoid importing all recipe modules eagerly, and
- avoid pulling worker/runtime code into the UI path unless needed.

```ts
// @mapgen/browser-recipes/catalog
export type RecipeId = string;

export type RecipeConfigArtifacts = {
  recipeId: RecipeId;
  title: string;
  description?: string;

  // Config artifacts.
  configSchema: TSchema;
  defaultConfig: Readonly<unknown>;
  stageOrder?: readonly string[]; // optional, but helps UI rendering deterministically

  // Viz artifacts (optional, but likely needed as “infinite recipes” grows).
  // Keep this small and UI-framework-agnostic: IDs + labels, not rendering rules.
  vizContract?: Readonly<{
    contractLayerIds?: readonly string[];
    contractLayerPrefixes?: readonly string[];
    layerLabels?: Readonly<Record<string, string>>;
  }>;
};

export type RecipeCatalogEntry = Readonly<{
  recipeId: RecipeId;
  title: string;
  description?: string;
  // UI path (schema + defaults only).
  loadConfig: () => Promise<RecipeConfigArtifacts>;
  // Worker path (execution module); separate so the UI can stay light.
  loadRecipeModule: () => Promise<RecipeModule<ExtendedMapContext, unknown, unknown>>;
}>;

export const recipeCatalog: Readonly<Record<string, RecipeCatalogEntry>> = {
  "browser-test": {
    recipeId: "browser-test",
    title: "Browser Test",
    loadConfig: () => import("./recipes/browser-test.config.js").then((m) => m.configArtifacts),
    loadRecipeModule: () => import("./recipes/browser-test.runtime.js").then((m) => m.recipeModule),
  },
  // "standard": { ... }, etc.
} as const;
```

Key property: `recipeCatalog` can stay small and stable even as the number of recipes grows; `loadConfig()` / `loadRecipeModule()` are the scaling valves.

### 3.2 Artifacts interface (schema/defaults/metadata)

Minimum artifacts needed to keep both UI and worker “recipe-agnostic”:

- `recipeId`: stable string id used in protocol and UI selection.
- `title` (+ optional `description`): for UI.
- `configSchema: TSchema`: shared runtime schema for `normalizeStrict` on both UI and worker.
- `defaultConfig: unknown`: canonical base config to merge overrides onto (deterministic).
- `recipeModule`: only needed by the worker to `compile` and `run` (recommended to lazy-load separately from config artifacts).

Optional but high-leverage:
- `stageOrder: string[]`: lets UI render predictable stage cards even if schema property ordering changes.
- `tags`/`capabilities`: e.g. `{ supportsAdapter: "browser-v0" }` to avoid exposing recipes that can’t run in-browser yet.
- `configPresentationHints`: *only if* they are UI-framework-agnostic (avoid leaking RJSF-specific knobs into shared artifacts).
- `vizContract`: a small, recipe-scoped contract of “UI-first” layer IDs + optional labels so Studio can prioritize/hide internal/debug layers by default without hard-coding string prefixes in `App.tsx` (see also `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` for the initial project-level catalog).

### 3.3 Dynamic import vs static registry (bundle size, Vite)

**Static imports everywhere**
- ✅ simplest mental model
- ❌ bundle size grows with recipe count (UI *and* worker end up pulling everything if any “index barrel” imports all recipes)
- ❌ slow dev server + slower worker startup as recipes grow

**Dynamic import behind a catalog registry (recommended)**
- ✅ enables code-splitting per recipe (UI can load the selected recipe’s schema/config only when needed)
- ✅ worker can import only the chosen recipe module (or prefetch on run)
- ✅ keeps `@mapgen/browser-recipes` as the single “approved recipes list”
- ⚠️ requires discipline: do not re-export all recipes from the package root in a way that forces eager bundling
- ⚠️ requires “static dynamic imports”: each entry’s `loadConfig()` / `loadRecipeModule()` must be a fixed `import("./recipes/<id>....js")` (avoid `import(someString)`, which bundlers can’t pre-resolve safely)

**Vite considerations**
- Vite will happily code-split dynamic `import()` boundaries in app and worker bundles.
- Because Studio prebuilds `@mapgen/browser-recipes`, the catalog should live in built `dist/` and use relative imports to other built recipe modules to keep resolution simple.

### 3.4 Keep protocol recipe-agnostic, but strongly typed locally

**Protocol (shared boundary):**

```ts
// protocol.ts
export type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  recipeId: string;              // RecipeId (protocol-level)
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: unknown;     // recipe-agnostic
};
```

**Worker behavior (recipe-agnostic runner):**
- Resolve artifacts by `recipeId` via the registry.
- Merge + validate using the artifacts’ `defaultConfig` and `configSchema`.
- Pass validated config to `recipeModule.compile/run`.
  - The runtime safety comes from schema validation; the worker can cast to `unknown` → “validated unknown” safely.

**Studio behavior (locally type-safe):**
- Studio reads the selected recipe’s artifacts and drives the config UI using `configSchema` + `defaultConfig`.
- Studio can keep stronger typing *internally* without forcing it into the protocol:
  - typed helpers like `startRun<K extends KnownRecipeId>(recipeId: K, overrides: Partial<RecipeConfigOf<K>>)` are fine, as long as they serialize to `{ recipeId, configOverrides: unknown }` at the boundary.

Practical rule of thumb:
- **Protocol types should be stable and minimal**.
- **Strong typing belongs at the edges of recipe modules and in UI feature code**, derived from a curated registry.

---

## 4) Constraints / invariants to preserve

### Worker bundling remains browser-safe
- Worker must not pull Node builtins or Civ engine globals; `apps/mapgen-studio/scripts/check-worker-bundle.mjs` enforces this for built output.
- `@mapgen/browser-recipes` should remain a curated list of “browser-approved” recipes only.
  - If a recipe pulls in Node-only code (directly or transitively), it should not be included in this package/registry.

### Avoid import cycles (worker/protocol vs UI)
- The registry + artifacts must not import from `apps/mapgen-studio/*`.
- Protocol types should not depend on recipe-specific config types.
- Recommended: keep protocol types in a shared “runner/protocol” module (eventually a package), but **do not** place them in `@mapgen/browser-recipes` (that package is about recipes, not transport).

### Determinism preserved
- Merging semantics must remain deterministic:
  - plain-object deep merge, arrays/scalars replace, forbidden keys blocked (`__proto__`, `constructor`, `prototype`).
- Schema validation/normalization should happen in the worker for the final, authoritative config used for both `compile` and `run`.
- Any UI-side validation should be treated as best-effort UX; worker remains the source of truth.

---

## 5) Suggested boundaries (Studio vs `packages/browser-recipes`)

### Belongs in `packages/browser-recipes` (shared artifacts)
- Curated recipe list + ids (`recipeCatalog`).
- Per-recipe artifacts modules:
  - `defaultConfig`
  - `configSchema`
  - `recipeModule` for execution
  - metadata (`title`, description, stage order)
- Build-time tooling to generate/verify artifacts (e.g., schema JSON snapshots, type generation) so Studio doesn’t need to reach into `mods/` directly.

### Remains in Studio (UI/framework-specific + orchestration)
- UI state, selection/pinning, run lifecycle, and presentation logic (RJSF templates, schema flattening rules, styling).
- Choosing how to render recipe metadata (e.g., grouping recipes, hiding “non-browser-capable” ones).
- Worker spawning + message plumbing (but protocol should be recipe-agnostic).

---

## 6) Risks + validation

### Risks
- **Accidental eager bundling:** a “barrel export” that re-exports all recipes will drag all recipe code into both UI and worker bundles, defeating the scaling plan.
- **Recipe browser-unsafety drift:** adding a recipe that transitively imports Node-only modules (or Civ engine glue) can break the worker bundle; needs a clear “browser-approved” contract for inclusion.
- **Type drift between schema/defaults:** if `defaultConfig` is not validated against `configSchema` (or vice versa), the worker can “normalize” into surprising shapes.
- **Protocol versioning:** adding `recipeId`/`configOverrides: unknown` is a breaking protocol change unless versioned or made optional during transition.
- **Import-cycle hazards:** placing protocol types or worker code in the same package as UI types tends to create subtle cycles once more features appear.

### Validation ideas (cheap, high-signal)
- Add a “catalog sanity” check script (or test) that:
  - iterates `recipeCatalog`,
  - `await entry.load()`,
  - validates `defaultConfig` against `configSchema` using `normalizeStrict` and asserts zero errors.
- Keep `apps/mapgen-studio` build check as the ultimate gate:
  - `bun run --cwd apps/mapgen-studio build` (includes `check:worker-bundle`).
- Enforce a “no eager import” rule in code review:
  - UI should import `@mapgen/browser-recipes/catalog` (metadata + loaders), not `@mapgen/browser-recipes` root barrel.
