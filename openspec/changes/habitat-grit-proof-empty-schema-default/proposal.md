## Why

`grit-empty-schema-default` is an enforced Grit check for contract schema
definitions: schema objects should not hide absent configuration behind
object-level empty defaults. Property defaults should own explicit default
behavior.

This checkpoint closes the earlier ordinary-`contract.ts` gap for
`grit-empty-schema-default`: the two live Swooper empty object defaults are
removed, the native predicate now includes ordinary contract files, and Habitat
wrapper/baseline/injected proof is recorded for the active check.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `tools/habitat-harness/src/lib/grit.ts`
- `.grit/patterns/habitat/checks/empty_schema_default.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-empty-schema-default`.
- Repair the native predicate and fixture for current contract-schema behavior:
  - object-literal `default: {}` in domain op `*.contract.ts` and ordinary
    `contract.ts` paths;
  - nested schema and TypeBox options shapes as current-predicate facts;
  - recipe step `*.contract.ts` and ordinary `contract.ts` classes;
  - other-mod raw predicate classes;
  - property defaults, non-empty object defaults, array/null/string defaults,
    non-contract files, map/package paths, `.tsx`, and lookalike property names
    as controls.
- Remove the two live Swooper ordinary-`contract.ts` empty object defaults while
  preserving materialized default behavior through property defaults.
- Record a parser inventory over current Swooper recipe/domain contract-schema
  roots with exact scan roots, exclusions, counts, row id, and proof-class
  labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No raw Grit acquisition, Effect adapter behavior, apply safety, retired
  parity, neighboring schema row, or product/runtime proof is claimed.
- No generated output is edited.

## Owner Boundary

This workstream owns fixture, predicate, source-remediation, wrapper/baseline,
injected path-control, and proof-record truth for `grit-empty-schema-default`.

This workstream does not own generalized apply/codemod safety or Habitat raw
adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Accepted Habitat wrapper, baseline, and injected-probe surfaces from the
  current stack.

## Stop Conditions

- Current inventory finds live current-predicate empty schema defaults after
  remediation.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply safety, neighboring
  row, or product/runtime proof from native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter empty_schema_default --json`
- `bun run habitat:check -- --json --rule grit-empty-schema-default`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-empty-schema-default --strict`
- `bun run openspec:validate`
- `git diff --check`
