# Verification Evidence

Change: `studio-run-public-status-diagnostics`

Status: Packet 1 declared gates complete. The whole packet train still has
later live Civ7/generated-content gates in `target-vocabulary.md`.

## Behavior And Package Gates

- `nx run mapgen-studio:test` - pass, 67 files, 378 tests.
- `nx run-many -t check --projects=studio-contract,control-studio-server,mapgen-studio-ui,mapgen-studio` - pass.
- `nx run-many -t test --projects=control-studio-server,mapgen-studio-ui` - pass: `control-studio-server` 87 tests, `mapgen-studio-ui` 168 tests.
- `nx run control-studio-server:test -- operationRuntime.test.ts` - pass, 37 tests.
- `nx run mapgen-studio:test -- runInGame/clientState.test.ts runInGame/status.test.ts studioEvents/operationAdoption.test.ts` - pass, 25 tests.
- `nx run mapgen-studio:test -- controllers/useStudioOperations.test.tsx` - pass, 3 tests.
- `bun run lint` - pass, 9 lint targets.
- `git diff --check` - pass.

## OpenSpec And Habitat

- `bun run openspec -- validate studio-run-public-status-diagnostics --strict` - pass.
- `bun tools/habitat/bin/dev.ts check --rule grit-studio-run-public-contract-closed --json` - pass.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --runner grit --json` - pass, 4 Grit rules including SA-01.
- `nx run mapgen-studio:habitat:check` - pass, 8 Studio-owned Habitat rules including SA-01.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --json` - pass, 8 Studio-owned rules.

## Live Endpoint Evidence

Server start:

- Command: `STUDIO_DAEMON_PORT=5199 nx run mapgen-studio:serve-daemon --outputStyle=static`
- URL: `http://127.0.0.1:5199`
- Public oRPC mount: `http://127.0.0.1:5199/rpc`

Endpoint probes against the running daemon:

- `studio.serverInfo({})` returned `ok: true`, `runInGameApiVersion: 2`, and daemon command `viteCommand: "daemon"`.
- `runInGame.start({ seed: "", mapSize: "MAPSIZE_STANDARD", setupConfig: {}, config: {} })` returned declared error `RUN_IN_GAME_INVALID`, HTTP status `400`, safe category `request-validation`, and public recovery actions only.
- `runInGame.diagnostics({ diagnosticsId: "run-diagnostics-live-probe-unknown" })` returned `{ ok: false, reason: "not-found" }`.
- A real admitted `runInGame.start` for `mod-swooper-maps/standard`, source id `latest-juicy`, seed `1538316415`, map size `MAPSIZE_STANDARD`, player count `6`, resources `balanced`, disposable materialization returned public running status only.
- `runInGame.status({ requestId })` showed public phases `deploying` and `preparing-civ7`, then terminal `failed` with phase `failed`, safe category `artifact-generation`, public recovery actions, `terminalAt`, and diagnostics id `run-diagnostics-54ccfe0e-66b9-4689-883e-d9fdcd000634`.
- `runInGame.diagnostics({ diagnosticsId })` returned `{ ok: true }` with matching request id `studio-run-in-game-mr9xl41i-sng-3`, operation revision `7`, and private section key `operation`.
- Filesystem proof for that live diagnostics id: repo-root path `.mapgen-studio/run-in-game/studio-run-in-game-mr9xl41i-sng-3/diagnostics/diagnostics.json` exists; app-cwd path does not.
- After daemon restart, `studio.serverInfo({})` returned new server id `studio-server-mr9xvomm-1rsp-1`; the same `runInGame.diagnostics({ diagnosticsId })` still resolved to the persisted private record.

## Review Lanes

- TypeScript refactoring lane: clear after discriminated public status union, cancelled terminal shape, public DTO test helpers, and configured diagnostics workspace regression.
- Code quality / structure lane: clear after removing public diagnostics serialization fallback, storing diagnostics under the request workspace, verifying lookup ownership, and registering SA-01 under Habitat.
- oRPC + Effect/library lane: clear after diagnostics lookup totalized read/parse failures into the declared result union and live endpoint probes used the actual `/rpc` mount.
