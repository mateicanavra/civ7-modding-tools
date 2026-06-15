# D2.5 Schema Spine Ledger

Status: accepted inventory
Date: 2026-06-14

| Surface | Current evidence | Classification | D2.5 target | Risk if omitted | Oracle |
| --- | --- | --- | --- | --- | --- |
| Studio success input/output contracts | `packages/studio-server/src/contract/{civ7,live,mapConfigs,runInGame,studio,shared}.ts` use TypeBox and `contractSchema(...)` | partially complete TypeBox spine | all public success I/O is TypeBox-owned and adapter-mediated | later runtime DTOs stabilize on unproven or duplicated schema origin | Value.Check/Parse matrices and no raw oRPC TypeBox usage |
| Declared error data | `packages/studio-server/src/contract/errors.ts` uses TypeBox data through `toStandardSchema(...)` | partially complete TypeBox spine | every expected error data schema is TypeBox-backed and sanitized | D3 failure variants can become undefined errors or invalid data | declared error data tests for all error maps |
| TypeBox-to-Standard Schema adapter | `packages/studio-server/src/typeboxStandardSchema.ts` wraps TypeBox with Standard Schema but does not store recoverable origin metadata | needs hardening | adapter exposes recoverable TypeBox origin, path fidelity, parse behavior, and issue behavior | tests cannot prove TypeBox ownership or adapter drift from control-oRPC | adapter origin and validation tests |
| Recipe DAG schemas | `packages/studio-server/src/recipeDag/**` uses TypeBox and same adapter | retained package precedent | stay aligned with Studio adapter behavior | recipe DAG becomes an inconsistent exception | adapter sharing/equivalence test |
| Control-oRPC schemas | `packages/civ7-control-orpc/src/**/contract.ts` and `packages/civ7-control-orpc/src/typebox-standard-schema.ts` store TypeBox origin metadata and expose recovery helpers | retained package authority and adapter precedent | no migration into Studio; use as alignment precedent or shared behavior target | Studio copies control contracts or drifts adapter semantics | D12 boundary and adapter equivalence notes |
| Package entrypoint docs | `packages/studio-server/src/index.ts` says legacy success I/O remains Zod | stale residue | delete/replace stale Zod commentary | future work follows obsolete schema-tech direction | negative search for stale Zod contract commentary |
| App/server contract comments | `apps/mapgen-studio/src/server/studio/context.ts` references a `zod-derived catalog` | stale residue | rewrite to TypeBox/contract-derived language or remove | future work treats TypeBox-owned contract data as Zod-derived | negative search for stale Zod-derived comments |
| Zod imports / `z.infer` | current search shows no `zod` imports in `packages/studio-server/src/contract/**` | closure proof needed | enforced negative search | Zod returns through a new contract file | negative search and package check |
| Run in Game public status DTOs | app-local `apps/mapgen-studio/src/features/runInGame/status.ts` contains phase/status/public proof shapes including `processRestart.command` status evidence; package comments say the schema reproduces/mirrors app status | public DTO mirror to migrate/reduce | package owns wire schemas; app module becomes UI-only helper or imports derived package types; status/proof fields stay non-executable | D4/D6 can diverge public DTO from runtime validation or accidentally turn status evidence into a command channel | type-derivation tests, status/proof-field classification, and app-local DTO/comment authority negative search |
| Save/Deploy public status DTOs | app-local `apps/mapgen-studio/src/features/mapConfigSave/status.ts` contains phase/status shapes; package comments say the schema reproduces app status | public DTO mirror to migrate/reduce | package owns wire schemas; app module becomes UI-only helper or imports derived package types | Save/Deploy status projection can diverge from package contract | type-derivation tests and app-local DTO/comment authority negative search |
| App response casts | `apps/mapgen-studio/src/features/runInGame/api.ts`, `apps/mapgen-studio/src/features/mapConfigSave/api.ts`, and `apps/mapgen-studio/src/app/operationAdoption.ts` cast oRPC responses/events to app-local operation types | public DTO derivation gap | app consumes contract-derived package types without casts into broader app-local wire types | app may type-check while runtime schema and UI assumptions diverge | `rg` cast scan plus app type-check/type tests |
| Operation-current/event operation schemas | `packages/studio-server/src/contract/studio.ts` redefines Run in Game and Save&Deploy operation DTOs with looser `Type.Unknown()` / open shapes | duplicate schema authority | compose canonical operation DTO schemas exported from `runInGame.ts` and `mapConfigs.ts` | current/event payloads can validate broader data than endpoint status schemas | schema identity/reuse tests and Value.Check matrices |
| Engine error details bridge | `packages/studio-server/src/contract/errors.ts` declares `details?: Type.Unknown()` for engine errors and D3 currently preserves permissive data | D3-bound permissive bridge unless narrowed | narrow to typed public failure data or update D3 in the same stack with deletion/narrowing target and guard test | expected failures can stay opaque and unowned after D3 | declared error data tests plus D3 bridge deletion/narrowing guard |
| `runInGame.start` open mutation input | `packages/studio-server/src/contract/runInGame.ts` keeps top-level `additionalProperties: Type.Unknown()` so host parsing can deep-scan raw-control keys | open-input hazard | close the public input schema or prove recovered-schema plus parser guard rejects raw-control keys before engine execution | literal negative searches can pass while arbitrary raw command fields remain schema-accepted | adversarial samples for top-level and nested `command`, `script`, `javascript`, `rawCommand`, `rawJs`, `session`, `stateName` |
| effect-orpc import ownership | `router/index.ts` comment says only router imports effect-orpc while `recipeDag/contract.ts` and `recipeDag/errors.ts` also import it | frame-conflicting import residue | router/runtime implementation is the only allowed effect-orpc owner; recipe-DAG builder imports move/delete or become router-owned builder helpers | future code follows an inaccurate import boundary or grows a second builder island | effect-orpc import scan, router comment repair, and no non-router import proof |
| Studio events | `packages/studio-server/src/contract/studio.ts` has TypeBox `hello | operation | live-game` event union through `eventIterator(toStandardSchema(...))` | partially complete TypeBox spine | event union has Value.Check/Parse and stream client proof | D8/D9 event payloads can bypass schema ownership | event schema and handler/client tests |
| Live-game state | `packages/studio-server/src/liveGame/model.ts` exports TypeBox state schema | partially complete TypeBox spine | live status/event schemas are contract-tested and consumed by D10 | live watcher payload drifts from public contract | live status and live event schema tests |

## Implementation Progress - 2026-06-15

| Surface | Current implementation evidence | Closure status |
| --- | --- | --- |
| TypeBox-to-Standard Schema adapter | `packages/studio-server/src/typeboxStandardSchema.ts` now stores recoverable TypeBox origin metadata and exports schema recovery helpers for Standard Schema wrappers and oRPC procedure input/output schemas. `packages/studio-server/test/contractTypeboxSpine.test.ts` proves identity recovery, closed-object stripping, and nested issue paths. | closed for D2.5 adapter-origin proof |
| Operation-current/event operation schemas | `packages/studio-server/src/contract/studio.ts` reuses `operationStatusTypeSchema` and `saveDeployStatusTypeSchema`; the contract-spine test asserts object identity for `studio.operations.current` active/recent schemas. | closed for canonical current-schema reuse; event schema sample coverage still needs broad package test coverage before full closure |
| Recipe DAG `effect-orpc` residue | `packages/studio-server/src/recipeDag/{contract,errors}.ts` now use native `@orpc/contract` builders and TypeBox-backed native error maps; active package scan leaves `effect-orpc` import ownership in `packages/studio-server/src/router/index.ts`. | closed for import ownership |
| Save&Deploy app DTO authority | `apps/mapgen-studio/src/features/mapConfigSave/status.ts` imports package-owned status/phase/kind types and phase constants from `@civ7/studio-server` for helper signatures but does not re-export public DTO types; app/server/test use sites import `MapConfigSaveDeploy*` public DTO types directly from `@civ7/studio-server`; `api.ts` and `operationAdoption.ts` no longer cast Save&Deploy responses/events into app-local public DTOs. | closed for Save&Deploy type derivation |
| Run in Game app DTO authority | `apps/mapgen-studio/src/features/runInGame/status.ts` imports package-owned status/phase/kind types and phase constants from `@civ7/studio-server` for helper signatures but does not re-export public DTO types; app/test use sites import `RunInGame*` public DTO types directly from `@civ7/studio-server`; package entrypoints export public Run-in-Game proof subtypes; server-only rich log proof state is named `RunInGameDetailed*` under `apps/mapgen-studio/src/server/runInGame/proofTypes.ts`; `api.ts`, `operationAdoption.ts`, `context.ts`, and operation-event publication no longer cast Run-in-Game responses/events across app-local public DTO seams. | closed for Run-in-Game type derivation; detailed proof-only state remains server-internal until later runtime packets contract it or delete it |
| `runInGame.start` open input | Public TypeBox input remains open. `apps/mapgen-studio/test/runInGame/requestValidation.test.ts` recovers the TypeBox input schema and proves host parser rejection for top-level and nested `command`, `script`, `javascript`, `rawCommand`, `rawJs`, `session`, and `stateName`. | closed for open-input raw-control proof |
| Expected error `details?: unknown` | `packages/studio-server/src/contract/errors.ts` still keeps permissive `details?: Type.Unknown()`. D3 `mapgen-studio-error-spine` already contains the same-stack deletion/narrowing target and closure blockers for expected-failure unknown details. | closed for D2.5 classification only; D3 cannot close while this bridge remains |

## Residue Classification - 2026-06-15

- Direct `/api` operation path hits are comments in `packages/studio-server/src/router/index.ts` and `packages/studio-server/src/contract/runInGame.ts` that label historical endpoint parity. They are not app callers, route handlers, or alternate runtime surfaces.
- Raw-field hits are either public request/client description fields, non-executable status/proof evidence (`RunInGameProcessRestartStatus.command`), raw-control rejection policy text/tests, or existing server runtime implementation internals outside the public contract surface. The open public mutation input is paired with the recovered-schema rejection proof.
- oRPC response/event casts into app-local operation DTOs are absent after the Run-in-Game and Save&Deploy API/adoption updates.
- `features/runInGame/status.ts` and `features/mapConfigSave/status.ts` are helper modules only for public operation DTO authority: both import package DTO types internally for helper signatures and constants, but public `RunInGame*` and `MapConfigSaveDeploy*` DTO type use sites import from `@civ7/studio-server`.
- `effect-orpc` import ownership is router/runtime-only in `packages/studio-server/src/router/index.ts`; comments elsewhere are documentation of that package/runtime ownership.

## Residue Searches

```bash
rg -n "from ['\"]zod['\"]|\\bz\\.|z\\.infer|Zod" packages/studio-server/src/contract packages/studio-server/src
```

```bash
rg -n "legacy Studio success I/O schemas.*Zod|remain Zod|schema-tech decision|zod-derived|reproduces .*features/|mirrored from features|mirrored here|from apps/mapgen-studio/src/features" packages/studio-server/src apps/mapgen-studio/src/server
```

```bash
rg -n "operationType|rawCommand|command|script|javascript|session|stateName" packages/studio-server/src/contract apps/mapgen-studio/src/features/runInGame apps/mapgen-studio/src/features/mapConfigSave -g "*.{ts,tsx}"
```

Hits are not automatically failures. D2.5 must classify each hit as either forbidden raw operation input/tunnel authority or allowed historical/status/proof evidence. `processRestart.command` is allowed only as non-executable status evidence.

```bash
rg -n "as RunInGameOperationStatus|as MapConfigSaveDeployStatus|RunInGameOperationStatus|MapConfigSaveDeployStatus" apps/mapgen-studio/src -g "*.{ts,tsx}"
```

Hits must be reduced to UI helper usage or package-derived type usage. Casts from oRPC responses/events into app-local public wire DTOs are D2.5 blockers.

```bash
rg -n "const runInGameOperationSchema|const saveDeployOperationSchema|Type\\.Unknown\\(\\)|additionalProperties: Type\\.Unknown\\(\\)" packages/studio-server/src/contract/studio.ts packages/studio-server/src/contract/runInGame.ts packages/studio-server/src/contract/mapConfigs.ts
```

Operation-current and event payloads must reuse canonical operation DTO schemas. Broad `Type.Unknown()` fields are allowed only in the canonical DTO schema where the wire surface intentionally owns an opaque subtree.

```bash
rg -n "additionalProperties: Type\\.Unknown\\(\\)" packages/studio-server/src/contract -g "*.ts"
```

Open public mutation inputs must be closed or paired with raw-control guard tests. Open output/proof subtrees must be classified as intentional public evidence.

```bash
rg -n "from ['\"]effect-orpc['\"]|effect-orpc" packages/studio-server/src -g "*.ts"
```

Hits must be classified as router/runtime implementation, migration residue to move/delete, or stale comment residue. Recipe-DAG contract/error-builder imports are not a durable exception.

```bash
rg -n "/api/.+(run-in-game|save-deploy|map-config|mapConfigs)|run-in-game/status|save-deploy/status" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
```
