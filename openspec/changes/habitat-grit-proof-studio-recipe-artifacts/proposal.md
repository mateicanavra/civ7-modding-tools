## Why

`grit-studio-recipe-artifacts` is an enforced Grit check for ADR-004: Studio UI
code imports recipe artifacts, while worker/server runtime code may import
runtime recipe modules. This is a UI/compute boundary that Nx project tags
cannot express because the forbidden and allowed files live inside the same
Studio project.

The rule is registered and has a native sample, but the row still needs
row-level proof before future agents can treat it as executable structural
truth. This checkpoint opens the row packet and proves the current predicate's
native fixture/parser behavior and current Studio import inventory only. It
does not claim Habitat wrapper selector truth, raw acquisition, injected
cleanup, baseline behavior, Effect adapter behavior, apply safety, or product
proof because those surfaces are outside this row's current stack/base.

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
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No Studio source imports are changed.
- No pattern predicate repair is claimed.
- No generated recipe artifacts are edited.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-studio-recipe-artifacts`.

This workstream does not own recipe artifact generation, worker runtime module
loading, server-side recipe DAG code, generated output repair, or command
selector/baseline/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.

## Stop Conditions

- The row cannot distinguish UI imports from `browser-runner` or `server`
  exceptions.
- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live UI runtime imports and no owner accepts
  remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter studio_recipe_artifacts --json`
- `bun run openspec -- validate habitat-grit-proof-studio-recipe-artifacts --strict`
- `bun run openspec:validate`
- `git diff --check`
