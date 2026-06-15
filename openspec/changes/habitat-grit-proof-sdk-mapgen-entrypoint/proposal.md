## Why

`grit-sdk-mapgen-entrypoint` is an enforced Grit check for keeping the SDK root
safe for Node/Bun build-tool consumers while exposing Civ7 map runtime helpers
only from the explicit SDK mapgen subpath.

This checkpoint opens the row packet before fixture or proof claims and limits
the row to the independent checkpoint class available in this stack:
current-predicate native fixture proof, parser inventory over SDK and
mapgen-core source, and record truth only.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `packages/sdk/AGENTS.md`
- `packages/mapgen-core/AGENTS.md`
- `docs/system/sdk/overview.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/sdk_mapgen_entrypoint.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-sdk-mapgen-entrypoint`.
- Expand the native fixture for current-predicate behavior:
  - SDK root `./mapgen` and `./mapgen/index.js` import/export probes;
  - `@civ7/adapter/civ7` import probes outside the SDK mapgen subpath and in
    mapgen-core source;
  - controls for SDK mapgen subpath imports, non-root SDK paths, `export type`
    named exports, single-line supported `export { type ... }` named exports,
    ordinary exports, package subpath imports, source lookalikes, dynamic
    imports, tests, and `.tsx` paths.
- Record a parser inventory over current `packages/sdk/src` and
  `packages/mapgen-core/src` source with exact scan roots, exclusions, counts,
  row id, proof-class labels, candidate counts, allowed SDK mapgen imports, and
  non-claims in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No package source is changed.
- No broader pattern predicate repair is claimed beyond the SDK-root named value
  re-export branch repaired for `SME-P2-NAMED-REEXPORT-PREDICATE-GAP-2026-06-15`
  and the single-line inline type-only control repair for
  `SME-P2-INLINE-TYPE-REEXPORT-CONTROL-GAP-2026-06-15`.
- No multiline or alternate-whitespace inline type-only re-export closure is
  claimed from this row.
- No source remediation, baseline, or apply behavior is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, broader SDK/mapgen architecture closure, neighboring row, or
  product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-sdk-mapgen-entrypoint`.

This workstream does not own SDK or mapgen-core source remediation, public SDK
contract changes, baseline mutation, Habitat wrapper/adapter implementation, or
product/runtime proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-row candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live candidates and no owner accepts remediation,
  migration, or baseline disposition.
- Closure would rely on stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity, broader
  architecture, or product proof from native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sdk_mapgen_entrypoint --json`
- Parser inventory over `packages/sdk/src` and `packages/mapgen-core/src`
- `bun run openspec -- validate habitat-grit-proof-sdk-mapgen-entrypoint --strict`
- `bun run openspec:validate`
- `git diff --check`
