# D3 Testing Ledger

Status: draft
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Failure ADT | constructor/tag tests | every expected tag is constructible with typed fields and no HTTP status as source truth |
| Failure vocabulary | table-driven vocabulary tests | every declared expected tag has an owner, namespace mapping, TypeBox data schema, and sealed recovery-action set |
| Reason codes | schema-first reason-code tests | every reason-code literal in the matrix is TypeBox-declared before engine/application projections can emit it, and unledgered strings are rejected |
| Defect containment | router-edge defect tests | unknown exceptions map to sanitized `UnexpectedDefectData` but are excluded from workflow `Effect.fail` unions and expected mapper totality |
| Namespace mapper | totality tests | Autoplay, Run in Game, and Save/Deploy map every allowed tag to declared code/status/data |
| Lifecycle matrix | procedure-family table tests | expired operation, daemon identity mismatch, runtime disposed, and unsupported operation type map to the exact matrix entries for Run in Game start/status, Save/Deploy start/status, and Autoplay |
| TypeBox error data | `Value.Check` / `Value.Parse` samples | each declared error data family accepts representative payloads and rejects raw unknown/tunnel fields |
| Handler/client | oRPC defined-error tests | client sees defined errors for blocked, invalid, unavailable, not found, failed, and unknown defect containment |
| Status identity | Run in Game and Save/Deploy 404 tests | both include `serverInstanceId`, `serverStartedAt`, and typed missing request data |
| Scenario failures | app/package tests over operation paths | validation, mutex, dependency unavailable, materialization/deploy/proof failure, rollback, and status miss paths are represented |
| Autoplay failed outcomes | Autoplay scenario and mapper tests | active conflict, direct-control unavailable, start/stop failed, and verification failed all have typed outcomes and no generic catch-all |
| Operation-state projections | Run in Game and Save/Deploy projection tests | failure status/current-operation data uses typed failure data, sealed recovery actions, redacted diagnostics, and daemon identity where applicable |
| Negative searches | bridge/residue scans | no retired bridge, permissive expected details, status-code truth, raw ORPC ownership leak, unclassified `effect-orpc` import, production status-code bridge residue, or stale closure comments remain |
| Control package gates | package checks or untouched dispositions | `@civ7/control-orpc` and `@civ7/direct-control` checks run when touched; if untouched, negative scans prove no D3 implementation edits changed their contracts or direct-control atom semantics |
| Live proof boundary | written disposition or live proof | fresh live proof required only if successful Play/Save&Deploy execution, daemon watch mounts, or deploy graph isolation changes |

## Packet Acceptance Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
git status --short --branch
gt status
gt log --no-interactive
bun run openspec -- validate mapgen-studio-error-spine --strict
bun run openspec:validate
git diff --check
```

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/mapConfigSave/operationState.test.ts test/runInGame/operationState.test.ts
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
bun run --cwd packages/civ7-control-orpc test
bun run --cwd packages/civ7-control-orpc check
bun run --cwd packages/civ7-control-orpc build
bun run --cwd packages/civ7-direct-control test
bun run --cwd packages/civ7-direct-control check
bun run --cwd packages/civ7-direct-control build
```

Implementation negative-search gates:

```bash
rg -n "RunInGameHttpError|details\\?: unknown|Type\\.Unknown\\(\\)|new StudioEngineError|statusCode|new ORPCError|closed; merged|remain Zod|PERMISSIVE" apps/mapgen-studio/src packages/studio-server/src openspec/changes/mapgen-studio-error-spine -g "*.{ts,tsx,md}"
rg -n "from ['\\\"]effect-orpc['\\\"]|effect-orpc" packages/studio-server/src -g "*.ts"
rg -n "StudioEngineError" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
git diff --name-only -- packages/civ7-control-orpc packages/civ7-direct-control
```

Hits are not automatically failures. They must be classified as forbidden public expected-failure truth, router/runtime ownership, D2.5 recipe-DAG residue, deleted production bridge residue, untouched control package proof, or historical packet evidence.

On the accepted migrated Nx/Habitat implementation base, add classified repo-local Nx/Habitat gates before code edits. Missing migrated tooling is a stop/reroute condition, not a reason to substitute stale Turbo-era implementation proof.
