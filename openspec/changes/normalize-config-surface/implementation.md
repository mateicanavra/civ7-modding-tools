# normalize-config-surface Implementation Record

Date: 2026-05-30
Branch: `codex/normalize-config-surface-impl`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-normalize-authority-routing`

## Scope

This slice normalizes persisted standard-recipe stage config to the flat D1
shape:

```ts
{
  knobs?: StageKnobs;
  [stepId]?: StepConfig;
}
```

The change removes wrapper-only `public.advanced` surfaces, migrates first-party
configs and Studio defaults to top-level step ids, and tightens default stage
surface schemas so declared step ids use their step contracts.

## Disposition

- Removed wrapper-only `public.advanced` schemas and compile functions from the
  standard `morphology-coasts`, `morphology-routing`, `morphology-erosion`,
  `morphology-features`, and `map-hydrology` stages.
- Preserved `map-morphology` `public + compile` as a genuine public transform:
  public keys (`plotCoasts`, `plotContinents`, `mountains`, `plotVolcanoes`,
  `buildElevation`) compile to kebab-case step ids. This is the D1 exception
  because it is semantic public API translation, not wrapper compatibility.
- Updated `createStage` default surface derivation to expose `knobs` plus each
  declared step id with the step contract schema. No flat declared step key is
  intentionally left as `unknown`.
- Migrated first-party map configs, presets, Studio defaults, Studio UI typing,
  and Studio config parsing to read/write top-level step ids.
- Updated docs and tests to describe `knobs` plus flat step config instead of a
  persisted `advanced` wrapper.
- Did not add dual-shape compatibility, generated output edits, or lockfile
  edits.

## Active `advanced` Search

Remaining active-source hits were classified before closure:

- Old-shape negative guards in tests remain intentional and prove `advanced` is
  not accepted as a persisted config key.
- `advancedStart` and `assign-advanced-start-region` are Civ/gameplay terms, not
  MapGen config-surface vocabulary.
- Archive or historical prose is outside the active public contract.

No active standard stage now exposes a wrapper-only `public.advanced` surface.

## Review Lanes

- Architecture: flat stage config is enforced at the stage-authoring boundary,
  with step ids sourced from declared step contracts.
- Product/DX: author-facing examples, presets, and Studio defaults now use the
  same shape authors are expected to persist.
- Adversarial closure: watcher-reported stale `advanced` vocabulary and
  transitional-wrapper prose were corrected before task closure.

## Verification

Commands run from the worktree:

- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd packages/mapgen-core check`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd packages/mapgen-core test -- test/authoring/authoring.test.ts test/compiler/recipe-compile.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-knobs.test.ts test/m11-config-knobs-and-presets.test.ts test/morphology/shelf-width-knob.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts`
- `(cd apps/mapgen-studio && bun test ./test/config/defaultConfigSchema.test.ts)`
- `rg -n "advanced" packages/mapgen-core/src packages/mapgen-core/test mods/mod-swooper-maps/src mods/mod-swooper-maps/test apps/mapgen-studio/src apps/mapgen-studio/test docs/system/libs/mapgen docs/system/mods/swooper-maps -g '!**/_archive/**' -g '!**/*.gen.ts' -g '!**/dist/**' -g '!**/mod/**'`
- `bun run openspec -- validate normalize-config-surface --strict`
- `bun run openspec:validate`
- `git diff --check`
