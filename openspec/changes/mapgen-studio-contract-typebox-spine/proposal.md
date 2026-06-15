# MapGen Studio contract TypeBox spine

## Why

D2 accepted the Studio runtime corpus and exposed the contract dependency: D3-D12 cannot stabilize failure data, operation state, current-operation projection, events, or live status while public DTO ownership is split between package contracts, app-local mirrors, stale comments, and implicit schema behavior.

The current baseline is already partway through the migration: `packages/studio-server/src/contract/*` uses TypeBox and `packages/studio-server/src/typeboxStandardSchema.ts`, while `packages/studio-server/src/index.ts` still claims legacy Studio success I/O schemas remain Zod. D2.5 turns that mixed state into a closed contract spine: TypeBox is the single public runtime schema origin, the Standard Schema adapter proves recoverable TypeBox origin, and app-local Run in Game / Save&Deploy modules are no longer allowed to define public wire authority.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` - D2.5 and TypeScript/schema strategy.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` - packet discipline and TypeBox-first contract rule.
- `openspec/changes/mapgen-studio-engine-effect-corpus/` - accepted D2 corpus and phase/projection ownership requirements.
- `packages/studio-server/src/contract/*` - current Studio public oRPC contract modules.
- `packages/studio-server/src/typeboxStandardSchema.ts` - current TypeBox-to-Standard Schema adapter.
- `packages/studio-server/src/recipeDag/{contract,errors,schema}.ts` - existing TypeBox/Standard Schema precedent plus current `effect-orpc` import residue to move behind router/runtime ownership.
- `packages/civ7-control-orpc/src/**/contract.ts` and `packages/civ7-control-orpc/src/typebox-standard-schema.ts` - retained control-oRPC TypeBox authority pattern.
- `apps/mapgen-studio/src/features/runInGame/status.ts` and `apps/mapgen-studio/src/features/mapConfigSave/status.ts` - current app-local public-status mirrors to reduce to UI-only or delete.

## What Changes

- Add the `mapgen-studio-contract-typebox-spine` OpenSpec packet and workstream ledgers.
- Require `@civ7/studio-server` success inputs, success outputs, stream events, and declared error `data` schemas to be TypeBox-owned.
- Require every oRPC input/output/error schema to pass through an owned TypeBox-to-Standard Schema adapter rather than passing raw TypeBox schemas directly.
- Require the adapter to expose recoverable TypeBox origin for tests and introspection.
- Require stale Zod commentary and any residual Zod imports/`z.infer` public-contract usage to be deleted.
- Require Run in Game and Save&Deploy public request/status DTO ownership to move into `@civ7/studio-server`; app-local modules may remain only as UI presentation helpers derived from package public types.
- Require `studio.operations.current` and `studio.events.watch` to compose canonical Run in Game and Save&Deploy DTO schemas instead of duplicating broader operation shapes.
- Require permissive expected-error `details?: unknown` data to be classified as D3-bound bridge residue or narrowed to sanitized TypeBox-backed data in D2.5.
- Require explicit parity decisions for TypeBox parsing behavior: closed-object stripping, optional/default/coercion behavior, status-code pins, and declared error data permissiveness.

## Non-Goals

- No D3 failure-union implementation; D2.5 only makes the schema substrate able to carry D3 failures.
- No D4 operation runtime migration.
- No D6 current-operation behavior migration beyond contract ownership and DTO derivation rules.
- No D8/D9 event transport implementation beyond TypeBox event schema ownership.
- No broad fallback, support-both schema origin, Zod compatibility bridge, or app-local public DTO escape hatch.

## Impact

- New OpenSpec change: `openspec/changes/mapgen-studio-contract-typebox-spine/`.
- Future implementation write set:
  - `packages/studio-server/src/contract/**`
  - `packages/studio-server/src/typeboxStandardSchema.ts`
  - `packages/studio-server/src/index.ts`
  - `packages/studio-server/test/**`
  - `apps/mapgen-studio/src/features/runInGame/**`
  - `apps/mapgen-studio/src/features/mapConfigSave/**`
  - `apps/mapgen-studio/src/features/*/api.ts` call sites deriving types from the Studio oRPC contract.
- D3-D12 consume D2.5 as the public DTO/error schema substrate.

## Verification Gates

### Packet Acceptance Gates

- `bun install --frozen-lockfile`.
- Baseline build/check appropriate to the selected packet-authoring base:
  - historical pre-settlement packet base: `bun run build`;
  - accepted migrated Nx/Habitat implementation base: repo-local Nx/Habitat target(s) selected by classification.
- `git status --short --branch`.
- `gt status`.
- `gt log --no-interactive`.
- `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
- Dirty-file quarantine and selected-baseline note recorded in the packet closure records. If the accepted migrated Nx/Habitat baseline is absent for implementation, the implementation workstream must stop and reroute before code edits.

### Implementation Closure Gates

These gates are not expected to pass on the current mixed baseline before this packet is implemented. They are the required closure proof for the D2.5 implementation slice:

- Package gates:
  - `bun run --cwd packages/studio-server test`.
  - `bun run --cwd packages/studio-server check`.
  - `bun run --cwd packages/studio-server build`.
- TypeBox contract tests using `Value.Check` / `Value.Parse` for Run in Game, Save&Deploy, live status, setup/config reads, operations-current, Studio events, and declared error data.
- Standard Schema adapter tests proving TypeBox origin remains recoverable and raw TypeBox schemas are not passed directly to oRPC.
- Contract parity tests for closed-object stripping, optional/default/coercion behavior, non-uniform status-code pins, and permissive expected-error data.
- Negative searches and residue classifications:
  - no `zod` imports or `z.infer` in `packages/studio-server/src/contract/**`;
  - no stale package commentary claiming Studio success I/O schemas remain Zod;
  - no stale app/server commentary claiming TypeBox-owned contract data is Zod-derived;
  - no package contract commentary claiming Run in Game or Save&Deploy DTO authority is reproduced or mirrored from app-local status modules;
  - no app-local Run in Game / Save&Deploy public wire DTO authority;
  - no direct `/api` Run in Game / Save&Deploy client calls or route handlers; historical endpoint comments may remain only as audit provenance if they do not prescribe a supported route;
  - no public raw operation input/tunnel fields: `operationType`, `rawCommand`, `script`, `javascript`, `session`, `stateName`, or generic `command` fields used as executable caller input. Status/proof fields such as `processRestart.command` must be classified rather than silently deleted.
  - no open public mutation input without either a closed TypeBox schema or recovered-schema adversarial raw-control rejection proof.
  - no `effect-orpc` imports outside router/runtime implementation ownership; existing recipe-DAG contract/error builder imports are residue to move/delete or encapsulate behind router-owned builders.
