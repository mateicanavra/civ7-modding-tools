# Phase Record: Resource Corpus Contract

## Objective

Create the resource-owned official corpus contract required by the resource
stage architecture while preserving the runtime numeric id proof boundary.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-corpus-contract`
- Parent slice: `codex/resource-stage-architecture`
- Write set: resource domain corpus, `artifact:resources.corpus`, focused tests,
  OpenSpec records.

## Agent Wave

- Volta: official corpus authority review. Outcome: use base-standard
  `Resources` row order from modinfo load order; lock 55 rows; guard against
  `<Types>` order; lotus is feature, not resource.
- Fermat: runtime boundary review. Outcome: runtime symbolic id mapping remains
  unverified; do not label adapter numeric diagnostics symbolically.
- Lagrange: architecture/spec readiness review. Outcome: add a new
  `resources` domain and artifact declaration, but no stage shell.

## Implementation Notes

- `staticResourceRowSlot` records official source row order only.
- Every `runtimeId` is `unverified` with `value: null`.
- Five no-biome-row caveats are visible as blocked strategy-required
  dispositions.
- The artifact id is `artifact:resources.corpus`.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-corpus-contract.test.ts test/resources/resource-corpus-artifact.test.ts`
  - Passed: 8 tests, 1072 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-corpus-contract --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 20 items.
- `git diff --check`
  - Passed.

## Closure State

- Post-implementation and repair reviews completed with no open P1/P2
  findings.
- Slice is ready to remain clean after Graphite commit finalization.
