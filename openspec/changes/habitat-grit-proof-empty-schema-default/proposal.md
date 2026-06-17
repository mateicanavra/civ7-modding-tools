## Why

`grit-empty-schema-default` is an enforced Grit check for contract schema
definitions: schema objects should not hide absent configuration behind
object-level empty defaults. Property defaults should own explicit default
behavior.

This checkpoint opens the row packet and limits the row to the independent
checkpoint class available in this stack: current-predicate native fixture
proof, parser inventory over current contract-schema roots, and record truth
only.

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
- Expand the native fixture for current-predicate behavior:
  - object-literal `default: {}` in domain op `*.contract.ts` paths;
  - nested schema and TypeBox options shapes as current-predicate facts;
  - recipe step `*.contract.ts` and other-mod raw predicate classes;
  - property defaults, non-empty object defaults, array/null/string defaults,
    ordinary `contract.ts`, non-contract files, map/package paths, `.tsx`, and
    lookalike property names as controls.
- Record a parser inventory over current Swooper recipe/domain contract-schema
  roots with exact scan roots, exclusions, counts, row id, and proof-class
  labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No contract schema source is changed.
- No pattern predicate repair is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, neighboring schema row, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-empty-schema-default`.

This workstream does not own contract schema remediation, baseline mutation, or
Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate empty schema defaults and no
  owner accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, neighboring row, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter empty_schema_default --json`
- `bun run openspec -- validate habitat-grit-proof-empty-schema-default --strict`
- `bun run openspec:validate`
- `git diff --check`
