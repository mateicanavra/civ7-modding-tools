# D3 Testing Ledger

Status: implementation evidence recorded
Date: 2026-06-15

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
bun run --cwd packages/civ7-control-orpc test
bun run --cwd packages/civ7-control-orpc check
bun run --cwd packages/civ7-control-orpc build
bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/mapConfigSave/operationState.test.ts test/runInGame/operationState.test.ts
bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/runInGame/operationState.test.ts test/server/engineEffectCorpus.test.ts test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
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
rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'
rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx' -g '!apps/mapgen-studio/src/server/**'
```

Hits are not automatically failures. They must be classified as forbidden public expected-failure truth, router/runtime ownership, D2.5 recipe-DAG residue, deleted production bridge residue, untouched control package proof, or historical packet evidence.

On the accepted migrated Nx/Habitat implementation base, add classified repo-local Nx/Habitat gates before code edits. Missing migrated tooling is a stop/reroute condition, not a reason to substitute stale Turbo-era implementation proof.

## Implementation Evidence - 2026-06-15

Commands run on `codex/runtime-effect-error-spine`:

```bash
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server build
bun run --cwd packages/studio-server test -- test/handler.test.ts test/errorSpine.test.ts test/contractTypeboxSpine.test.ts
bun run --cwd packages/civ7-control-orpc check
bun run --cwd packages/civ7-control-orpc build
bun run --cwd packages/civ7-control-orpc build
bun run --cwd packages/civ7-control-orpc test -- test/attention-current-procedure.test.ts test/strategy-front-summary-procedure.test.ts
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/operationState.test.ts test/server/engineErrorSpine.test.ts
bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/runInGame/operationState.test.ts test/server/engineEffectCorpus.test.ts test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts
rg "StudioEngineError|STUDIO_ENGINE_ERROR_MAPPINGS|toStudioEngineOrpcError|RunInGameHttpError|data\\.details|details\\?: unknown|details: Type\\.Optional\\(Type\\.Unknown|recoveryActions: Type\\.Optional\\(Type\\.Array\\(Type\\.String\\(\\)\\)" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -g '*.ts'
rg --pcre2 -n "^import\\s+(?!type).*@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'
rg --pcre2 -n "^import\\s+(?!type).*@civ7/studio-server" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'
rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'
rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx' -g '!apps/mapgen-studio/src/server/**'
```

Results:

- Package check, build, focused `errorSpine.test.ts`, contract TypeBox-spine tests, and handler declared-error/defect-containment tests passed.
- App check, app build, and focused engine/Run-in-Game/Save-Deploy operation-state/corpus tests passed, including the supervisor-requested `test/mapConfigSave/operationState.test.ts test/server/engineErrorSpine.test.ts` proof.
- Active app/package bridge scan returned no matches for old bridge names, old `data.details` payloads, permissive expected-error details, or public operation-state string-array recovery-action schema residue.
- Browser-boundary root cause and proof: `apps/mapgen-studio build` failed when browser feature modules value-imported `MAP_CONFIG_SAVE_DEPLOY_PHASES` / `RUN_IN_GAME_PHASES` from the root `@civ7/studio-server` server/runtime entrypoint, which pulled direct-control Node built-ins into Vite. The repair moved those browser DTO/constant imports to `@civ7/studio-server/contract`.
- Control-contract boundary repair: because `@civ7/studio-server/contract` value-imports the Civ7 control contract, D3 now owns a browser-safe `@civ7/control-orpc/contract` subpath. `packages/civ7-control-orpc/package.json` exports that subpath, `tsup.config.ts` builds `src/contract.ts`, and `scripts/build.mjs` makes declaration output repeatable by clearing stale `tsconfig.tsbuildinfo` between `tsup` clean output and `tsc` declaration emit. `bun run --cwd packages/civ7-control-orpc build` passed twice in sequence and emitted `dist/contract.d.ts`.
- Control package gates passed: `bun run --cwd packages/civ7-control-orpc check`, repeated `bun run --cwd packages/civ7-control-orpc build`, and `bun run --cwd packages/civ7-control-orpc test -- test/attention-current-procedure.test.ts test/strategy-front-summary-procedure.test.ts`.
- Studio package/app boundary gates passed after the control subpath repair: `bun run --cwd packages/studio-server check`, `bun run --cwd packages/studio-server build`, focused package tests, `bun run --cwd apps/mapgen-studio check`, `bun run --cwd apps/mapgen-studio build`, and focused app operation-state/error-spine/corpus tests.
- Multiline-safe exact-root value-import scan `@civ7/studio-server["']` now hits only server modules (`src/server/daemon/daemon.ts`, `src/server/runInGame/operationState.ts`, `src/server/studio/engines.ts`, `src/server/studio/context.ts`); the same scan excluding `apps/mapgen-studio/src/server/**` returns zero browser/non-server hits. The broader prefix scan still sees the intended browser-safe `/contract` imports in browser feature modules; those are accepted.
- `packages/civ7-direct-control` remains untouched by the D3 diff. `packages/civ7-control-orpc` is intentionally touched by D3 for the browser-safe contract subpath and is covered by the gates above.
- No live Civ7 proof is claimed for D3; this slice changes failure typing/mapping, not successful Play/Save&Deploy execution.
