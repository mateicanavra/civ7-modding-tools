# Source Synthesis - Studio Recipe Artifacts Proof

## Authority Order

Policy authority:

1. `docs/system/ADR.md` ADR-004
2. `docs/projects/habitat-harness/invariant-corpus.md`
3. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
4. `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`

Behavior/proof authority:

1. `tools/habitat-harness/src/rules/rules.json`
2. `.grit/patterns/habitat/checks/studio_recipe_artifacts.md`
3. `tools/habitat-harness/src/lib/grit.ts`
4. current Studio source under `apps/mapgen-studio/src`
5. fresh native Grit and parser inventory commands

## Product Source

Habitat's product target is executable structural control for agents. For this
row, the structural control is the UI/worker recipe boundary: agents editing
Studio UI should be stopped before importing runtime recipe modules into the
main UI bundle.

## Architecture Source

ADR-004 says the UI imports artifacts and the worker imports runtime recipe
modules. The invariant corpus records the retired ESLint rule and assigns this
subpath distinction to `grit-check`, not Nx, because both sides are inside the
Studio project.

## Current Pattern Source

The current Grit pattern has two arms:

- `import $imports from "mod-swooper-maps/recipes/standard"`
- `import $imports from "mod-swooper-maps/recipes/browser-test"`

Both arms filter filenames with `.*apps/mapgen-studio/src/.*\.tsx?$` and
exclude filenames containing `apps/mapgen-studio/src/browser-runner/` or
`apps/mapgen-studio/src/server/`.

## Current Source Exemplars

`apps/mapgen-studio/src/recipes/catalog.ts` is the intended UI surface. It
imports recipe artifacts and map configs:

- `mod-swooper-maps/recipes/browser-test-artifacts`
- `mod-swooper-maps/recipes/standard-artifacts`
- `mod-swooper-maps/recipes/standard-map-configs`

`apps/mapgen-studio/src/browser-runner/recipeRuntime.ts` is the intended worker
exception. It imports runtime recipe modules and artifact modules.

## Checkpoint Consequences

Current native fixture proof now records
`SRA-NATIVE-FIXTURES-2026-06-15`:

- 8 current-predicate positive classes: default import, named import,
  namespace import, type-only import, side-effect import, standard runtime
  source, browser-test runtime source, and `browser-runnerish`/`serverish`
  path-lookalike UI paths;
- 0 ignore-sample matches for artifact imports, map-config artifacts, source
  lookalikes, re-exports, worker/server exception paths, `.js`/`.jsx`,
  non-Studio app paths, and package paths.

Current parser inventory now records `SRA-STUDIO-INVENTORY-2026-06-15`:

- scan root: `apps/mapgen-studio/src`;
- exclusions: `node_modules`, `dist`, `mod`;
- parser: TypeScript compiler API over `.ts`/`.tsx` imports and re-exports;
- counts: 145 scanned TS/TSX files, 487 import/export references, 2 runtime
  recipe references, 5 artifact recipe references, 0 current-predicate runtime
  matches, 2 browser-runner runtime references, 0 server runtime references,
  0 UI runtime references, 3 UI artifact references, 0 runtime re-exports,
  0 runtime side-effect imports, 2 runtime default imports, and 0 source
  lookalikes.

Current wrapper proof now records:

- `SRA-PER-RULE-SELECTOR-2026-06-16`: per-rule Habitat wrapper proof selects
  exactly SRA plus `baseline-integrity`, both passing with zero diagnostics.
- `SRA-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` selects 30 Grit
  rules plus `baseline-integrity`, all passing, with SRA included.
- `SRA-BASELINE-FILES-2026-06-16`: the SRA baseline file is explicit `[]` and
  is checked through wrapper `baseline-integrity`.
- `SRA-INJECTED-PROBE-2026-06-16`: row-specific injected proof reports one
  diagnostic for a Studio UI runtime recipe import and keeps the
  `browser-runner` control clean; aggregate injected-corpus closure remains
  unclaimed while unrelated DDIT is blocked.

This row does not claim raw direct Grit acquisition, generated artifact proof,
Effect adapter closure, apply safety, retired parity, aggregate injected-corpus
closure, or product/runtime proof.
