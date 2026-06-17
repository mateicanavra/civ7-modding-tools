## Why

`grit-studio-recipe-artifacts` is an enforced Grit check for ADR-004: Studio UI
code imports recipe artifacts, while worker/server runtime code may import
runtime recipe modules. This is a UI/compute boundary that Nx project tags
cannot express because the forbidden and allowed files live inside the same
Studio project.

The rule is registered and has native/parser proof. This closure checkpoint
proves the current predicate's native fixture behavior, current Studio import
inventory, Habitat wrapper selector behavior, explicit empty baseline behavior,
and row-specific injected violation/path-control behavior. It does not claim
raw direct Grit acquisition, generated artifact proof, Effect adapter closure,
apply safety, retired parity, or product/runtime proof.

## Target Authority Refs

- `docs/system/ADR.md` ADR-004
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/lib/grit.ts`
- `.grit/patterns/habitat/checks/studio_recipe_artifacts.md`
- `apps/mapgen-studio/src/recipes/catalog.ts`
- `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-studio-recipe-artifacts`.
- Expand the native fixture for current-predicate behavior:
  - UI `.ts` and `.tsx` imports from runtime recipe module ids report;
  - `browser-runner` and `server` runtime imports remain allowed by the current
    predicate;
  - artifact imports, map-config artifact imports, non-Studio paths, and source
    lookalikes remain controls.
- Record a parser inventory over the current Studio scan root with exact scan
  roots, exclusions, counts, row id, and proof-class labels in durable records.
- Record current Habitat wrapper, aggregate `grit-check`, explicit empty
  baseline, and row-specific injected violation/path-control proof.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No Studio source imports are changed.
- No pattern predicate repair is claimed.
- No generated recipe artifacts are edited.
- No raw Grit acquisition, generated artifact proof, Effect adapter closure,
  apply safety, retired parity, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-studio-recipe-artifacts`.

This workstream does not own recipe artifact generation, worker runtime module
loading, server-side recipe DAG code, generated output repair, raw acquisition,
or adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- No live Studio UI runtime recipe import candidates in the current parser
  inventory.
- Clean wrapper, baseline, and injected proof from the current HG stack.

## Stop Conditions

- The row cannot distinguish UI imports from `browser-runner` or `server`
  exceptions.
- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live UI runtime imports and no owner accepts
  remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, generated artifact proof, Effect adapter
  closure, apply safety, retired parity, or product/runtime proof from native
  fixture, wrapper, baseline, or injected evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter studio_recipe_artifacts --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-studio-recipe-artifacts`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-studio-recipe-artifacts --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
