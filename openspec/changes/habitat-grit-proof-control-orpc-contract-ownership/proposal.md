## Why

`grit-control-orpc-contract-ownership` is an enforced Grit check for keeping
control-oRPC contracts transport-pure and keeping module-local schemas private.
Runtime access belongs in procedures, services, context, and direct-control
dependencies; public contract surfaces should not import `@civ7/direct-control`
or leak private module schema constants through the package root.

This checkpoint opens the row packet before fixture or proof claims and limits
the row to the independent checkpoint class available in this stack:
current-predicate native fixture proof, parser inventory over control-oRPC
source, and record truth only.

## Target Authority Refs

- `packages/civ7-control-orpc/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-control-orpc-contract-ownership`.
- Expand the native fixture for current-predicate behavior:
  - direct-control imports in module `contract.ts` files;
  - exported contract-local `Civ7*InputSchema`, `Civ7*ResultSchema`,
    `Civ7*OutputSchema`, and `Civ7*StandardSchema` consts;
  - root `index.ts` re-export probe for schema names from
    `./modules/<module>/contract`, recorded as a current predicate-gap blocker
    if the native pattern does not report it;
  - controls for private contract-local schemas, exported non-input/result
    schema lookalikes, procedure/context direct-control imports outside
    contracts, non-module-contract root schema exports, `.tsx`, source
    lookalikes, and dynamic import shapes.
- Record a parser inventory over current control-oRPC source with exact scan
  roots, exclusions, counts, row id, proof-class labels, direct-control import
  counts, schema export counts, root index export counts, and live candidate
  counts in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No package source is changed.
- No pattern predicate repair is claimed.
- No clean rule closure is claimed while the root-index module-contract schema
  re-export branch remains a current native predicate-gap blocker.
- No source remediation, baseline, or apply behavior is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, broader control-oRPC architecture closure, neighboring row, or
  product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-control-orpc-contract-ownership`.

This workstream does not own control-oRPC source remediation, oRPC service
architecture changes, schema export policy changes, baseline mutation, Habitat
wrapper/adapter implementation, or product/runtime proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-row contract ownership candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-row contract ownership candidates and no
  owner accepts remediation, migration, or baseline disposition.
- Closure would rely on stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity, broader
  control-oRPC architecture closure, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_orpc_contract_ownership --json`
- Parser inventory over `packages/civ7-control-orpc/src`
- `bun run openspec -- validate habitat-grit-proof-control-orpc-contract-ownership --strict`
- `bun run openspec:validate`
- `git diff --check`
