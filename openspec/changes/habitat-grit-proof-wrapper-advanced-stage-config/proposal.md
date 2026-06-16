## Why

`grit-wrapper-advanced-stage-config` is an enforced Grit check for keeping the
retired wrapper-only `advanced` stage config surface out of standard recipe and
map config source. Current config ownership belongs to supported step/domain
config paths instead of SDK-native nested `advanced` wrappers.

This checkpoint closes the row as an active Habitat Grit check for the current
predicate: native fixture behavior, current parser inventory, Habitat
per-rule wrapper selection, aggregate `grit-check` health, explicit empty
baseline ownership, and row-specific injected violation/path-control proof.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `openspec/changes/archive/2026-05-30-normalize-config-surface/implementation.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/wrapper_advanced_stage_config.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-wrapper-advanced-stage-config`.
- Expand the native fixture for current-predicate behavior:
  - object-literal `advanced` property positives;
  - string-literal `"advanced"` property positives;
  - in-scope `.test.ts` positives as current-predicate facts;
  - standard recipe and map config source positives;
  - controls for supported step-id config, ordinary advanced words, packages,
    domain source, non-standard recipes, `.tsx` / `.test.tsx` extension
    exclusions, other mods, and generated-output-shaped paths.
- Record a parser inventory over current Swooper standard recipe and map roots
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  so current proof records name this row's active-check closure evidence rather
  than the earlier native/parser-only checkpoint.

## What Does Not Change

- No Swooper recipe or map source is changed.
- No pattern predicate repair is claimed; the existing exact-key/path predicate
  remains the row boundary.
- No broader config-surface or retired parity closure is claimed.
- No raw Grit acquisition, Effect adapter, apply safety, generator/migration,
  neighboring row, broader config-surface, retired parity, or product proof is
  claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-wrapper-advanced-stage-config`.

This workstream does not own Swooper recipe/map source remediation, config
normalization migration, baseline mutation, Habitat wrapper/adapter
implementation, or broader config-surface policy.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate wrapper `advanced` config candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate wrapper `advanced` config
  candidates and no owner accepts remediation, migration, or baseline
  disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply,
  generator/migration, neighboring row, retired parity, broader config-surface,
  or product proof from native fixture/parser inventory, wrapper, baseline, or
  injected evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter wrapper_advanced_stage_config --json`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- Parser inventory over `mods/mod-swooper-maps/src/recipes/standard` and
  `mods/mod-swooper-maps/src/maps`
- `bun run habitat:check -- --json --rule grit-wrapper-advanced-stage-config`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-wrapper-advanced-stage-config --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
