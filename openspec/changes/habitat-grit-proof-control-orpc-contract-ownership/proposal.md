## Why

`grit-control-orpc-contract-ownership` is an enforced Grit check for keeping
control-oRPC contracts transport-pure and keeping module-local schemas private.
Runtime access belongs in procedures, services, context, and direct-control
dependencies; public contract surfaces should not import `@civ7/direct-control`
or leak private module schema constants through the package root.

This checkpoint closes the active-check proof gap for the row. It repairs the
root-index schema re-export predicate, proves the repaired native fixture,
records current control-oRPC inventory, and aligns the Habitat wrapper,
baseline, injected-probe, packet, and aggregate proof records for the current
stack.

## Target Authority Refs

- `packages/civ7-control-orpc/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-control-orpc-contract-ownership`.
- Repair and expand the native fixture for current-predicate behavior:
  - direct-control imports in module `contract.ts` files;
  - exported contract-local `Civ7*InputSchema`, `Civ7*ResultSchema`,
    `Civ7*OutputSchema`, and `Civ7*StandardSchema` consts;
  - root `index.ts` schema re-exports from `./modules/<module>/contract`,
    including direct and aliased named specifiers;
  - controls for private contract-local schemas, exported non-input/result
    schema lookalikes, procedure/context direct-control imports outside
    contracts, non-module-contract root schema exports, `.tsx`, source
    lookalikes, and dynamic import shapes.
- Record a parser inventory over current control-oRPC source with exact scan
  roots, exclusions, counts, row id, proof-class labels, direct-control import
  counts, schema export counts, root index export counts, and live candidate
  counts in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current closure checkpoint after evidence is gathered.

## What Does Not Change

- No package source is changed.
- No package source remediation is claimed or required.
- No source remediation or apply behavior is claimed.
- No apply behavior is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, broader control-oRPC architecture closure, neighboring row, or
  product proof is claimed.

## Owner Boundary

This workstream owns the `grit-control-orpc-contract-ownership` predicate
repair, fixture proof, wrapper proof records, and row-owned aggregate proof
alignment.

This workstream does not own control-oRPC source remediation, oRPC service
architecture changes, schema export policy changes, baseline mutation, Habitat
wrapper/adapter implementation, or product/runtime proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Supervisor/source-owner disposition if parser inventory finds live
  current-row contract ownership candidates.

## Stop Conditions

- Native fixture behavior fails to prove the repaired root-index schema
  re-export class without overmatching controls.
- Current inventory finds live current-row contract ownership candidates and no
  owner accepts remediation, migration, or baseline disposition.
- Closure would rely on stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply,
  generator/migration, neighboring row, retired parity, broader control-oRPC
  architecture closure, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_orpc_contract_ownership --json`
- Parser inventory over `packages/civ7-control-orpc/src`
- `bun run habitat:check -- --json --rule grit-control-orpc-contract-ownership`
- `bun run habitat:check -- --json --tool grit-check`
- Row-specific injected-probe proof from a clean start
- `bun run openspec -- validate habitat-grit-proof-control-orpc-contract-ownership --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
