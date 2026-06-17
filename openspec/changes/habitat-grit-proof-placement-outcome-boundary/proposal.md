## Why

`grit-placement-outcome-boundary` is an enforced Grit check for keeping the
terminal Swooper placement apply step from returning to direct official
resource/discovery generator calls. Placement apply consumes typed outcome
artifacts; official generator output is not accepted truth at that boundary.

This checkpoint closes the row with current-predicate native fixture proof,
parser inventory over current Swooper placement apply source, Habitat
wrapper/current-tree proof, explicit empty baseline proof, and row-specific
injected violation/path-control proof.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/placement_outcome_boundary.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-placement-outcome-boundary`.
- Expand the native fixture for current-predicate behavior:
  - direct `generateOfficialResources(...)` positives;
  - direct `generateOfficialDiscoveries(...)` positives;
  - controls for typed placement outcome consumption, same-name property/member
    lookalikes, non-placement apply paths, generated-output-shaped paths,
    package paths, `.tsx`, and other mods.
- Record a parser inventory over current Swooper terminal placement apply source
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No Swooper placement source is changed.
- No pattern predicate repair is claimed.
- No source remediation or apply behavior is claimed.
- No raw Grit acquisition, Effect adapter, generator/migration, retired parity,
  broader placement product closure, neighboring row, aggregate injected-corpus
  closure, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-placement-outcome-boundary`.

This workstream does not own Swooper placement source remediation, placement
contract migration, baseline mutation, Habitat wrapper/adapter implementation,
or product/runtime placement proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Supervisor/source-owner disposition if parser inventory finds live direct
  official-generator call candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate official-generator call
  candidates and no owner accepts remediation, migration, or baseline
  disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply,
  generator/migration, neighboring row, retired parity, broader placement
  product, aggregate injected-corpus closure, or product/runtime proof from
  native fixture/parser inventory, wrapper, baseline, or row-specific injected
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter placement_outcome_boundary --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- Parser inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement`
- `bun run habitat:check -- --json --rule grit-placement-outcome-boundary`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-placement-outcome-boundary --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
