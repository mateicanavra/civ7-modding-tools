# Phase Record: Studio Browser Scenario Proof

Status: rendered browser proof recorded for the corrected Run in Game fast path;
fallback restart proof remains unit-level because the live setup row was visible
after prior process-load proof.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-06---browser-scenario-proof`.

Priority rows: READ rendered browser portions, UI-01 through UI-06, STUDIO-02 through STUDIO-03, DEV-01 browser URL portion.

## Result

SMR-06 verified the rendered shell against the current stack on
`http://localhost:5288/` with daemon `5287`.

The initial page loaded from an existing live Civ7 game:

- `Ready. Live Civ7 turn 1 seed 859250892`
- Run in Game enabled.

Clicking Run in Game produced request `studio-run-in-game-mqhng9hg-1pku-2`.
The rendered status moved to `Starting Game` with
`{swooper-maps}/maps/studio-current.js` and then to `Complete` / `Current`.
No `Restarting Civ` phase appeared in this fast-path browser run.

The browser proof therefore confirms the corrected policy: map restart normally
uses setup visibility and `exit-to-shell`; process restart is not the default
for disposable `studio-current`.

The fallback process restart path is covered by `@civ7/studio-server` runtime
tests: a typed `setup-row-unavailable` failure with
`reloadBoundary: "process-restart-required"` emits `reload-needed`,
`restarting-civ`, `checking-civ7`, retries setup, and completes.

## Validation Commands

- `bun run nx run @civ7/studio-server:test --outputStyle=static`
- `bun run nx run @civ7/studio-server:build --outputStyle=static`
- `bun run nx run mapgen-studio:check --outputStyle=static`
- `bun run --cwd apps/mapgen-studio test test/server/engineEffectCorpus.test.ts test/runInGame/macosProcessRestart.test.ts test/runInGame/GameConsole.test.tsx test/studioEvents/operationAdoption.test.ts`
- `bun run openspec -- validate studio-live-civ7-proof-gates --strict`
- `bun run openspec -- validate studio-browser-scenario-proof --strict`
