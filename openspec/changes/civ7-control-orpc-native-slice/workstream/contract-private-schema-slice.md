# Contract Private Schema Slice

Status: implemented local package/public-surface proof.
Date: 2026-06-06.

## Purpose

Keep control-oRPC contract schemas owned by their contract modules without
making per-procedure input/result schemas a public import surface.

This preserves the contract-first shape: callers use the aggregated
`Civ7ControlOrpcContract`, typed DTOs, native procedures/routers, server-side
clients, and closed controller bridge envelopes. They should not import
standalone `*InputSchema`, `*ResultSchema`, or duplicate `*StandardSchema`
procedure artifacts.

## Write Set

- `packages/civ7-control-orpc/src/modules/*/contract.ts`
- `scripts/lint/lint-control-orpc-contract-ownership.mjs`
- this OpenSpec record
- `tasks.md`

## Behavior Boundary

- Procedure input/result TypeBox schemas and their Standard Schema wrappers
  remain colocated with the module contract that consumes them.
- Entity/DTO schemas such as primitive component/map-location schemas,
  correlation schemas, error-data schemas, and closed controller bridge
  request/response envelopes remain exported where they are real public data
  contracts.
- Controller bridge ingress continues deriving concrete bridge request and
  response schemas from `Civ7ControlOrpcContract` instead of importing a
  separate procedure schema bag.
- The contract ownership lint guard rejects future exported procedure
  input/result/output schemas and Standard Schema wrappers from module contract
  files.
- No procedure behavior, router hierarchy, transport, runtime dependency, or
  game-controller bundle behavior changes in this slice.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-control-orpc lint:contract-ownership`
- private procedure-schema export scan over
  `packages/civ7-control-orpc/src/modules`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `git diff --check`

## Residual Risk

This is a surface hygiene slice only. It does not decide any future external
schema-export product, transport/OpenAPI shape, deployed Civ7 runtime proof, or
parent Task 5.x/6.x/7.x acceptance.
