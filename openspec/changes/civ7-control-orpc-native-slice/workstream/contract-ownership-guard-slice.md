# Contract Ownership Guard Slice

Status: implemented package verification guard.
Date: 2026-06-05.

## Purpose

Lock in the completed service-contract ownership burn-down for
`packages/civ7-control-orpc`.

The control-oRPC module contract files now own caller-facing procedure schemas
instead of importing direct-control value schemas. This slice turns that stable
boundary into a package lint guard rather than adding brittle fixture tests.

## Write Set

- `scripts/lint/lint-control-orpc-contract-ownership.mjs`
- `packages/civ7-control-orpc/package.json`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Guard Boundary

The guard scans:

- `packages/civ7-control-orpc/src/modules/**/contract.ts`

It fails when a module contract imports `@civ7/direct-control`.

The guard intentionally does not scan procedure, dependency, middleware,
runtime, or focused equivalence-test files. Direct-control remains the
runtime/proof port for validators, command serialization, postcondition
classifiers, proof/no-repeat policy, relationship authority, and runtime
evidence.

## Non-Goals

- no procedure behavior change;
- no direct-control runtime/proof helper change;
- no controller, CLI, Studio, transport, telemetry, or persistence change;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc lint:contract-ownership`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/static and OpenSpec proofs only.

## Residual Risk

This guard only protects module service contracts. It does not decide whether
future procedure behavior is too facade-like, whether a direct-control function
is truly low-level runtime evidence, or whether controller packaging is ready
for live runtime proof.
