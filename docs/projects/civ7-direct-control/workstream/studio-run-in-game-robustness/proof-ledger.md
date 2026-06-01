# Proof Ledger

## Scope

Track build, test, browser, and live Civ evidence for the Run in Game
robustness phase. Runtime claims must be bounded by fresh observations and must
not reuse stale log or browser state as proof.

## Entries

### 2026-06-01 Static And Package Verification

- `bun run --cwd packages/civ7-direct-control test`: passed, 28 tests.
- `bun run --cwd packages/civ7-direct-control check`: passed.
- `bun run --cwd packages/civ7-direct-control build`: passed.
- `bun run --cwd apps/mapgen-studio check`: passed.
- `bun run --cwd apps/mapgen-studio test`: passed, 12 files / 57 tests.
- `bun run --cwd mods/mod-swooper-maps test:studio-run-in-game`: passed, 45
  tests after correcting the shipped-map identity test to assert compiled
  recipe envelopes rather than public authoring payloads.
- `bun run --cwd mods/mod-swooper-maps check`: passed.
- `bun run openspec -- validate studio-run-in-game-robustness --strict`:
  passed.
- `bun run openspec:validate`: passed, 39 items.
- `bun run verify:studio-run-in-game`: passed after the shipped-map identity
  test fix. The command exercised Turbo `build`, `check`, package tests,
  `mod-swooper-maps#test:studio-run-in-game`, and strict validation for
  `direct-control-new-game-setup`, `studio-run-current-map-config`,
  `studio-live-civ7-map-sync`, `studio-disposable-setup-reload`,
  `workspace-build-pipeline`, and this robustness change.

### 2026-06-01 Shell/Menu Read-Only Proof

Context: Civ7 was on the main menu/shell and exposed only the `App UI` state.

- `GET /api/studio/server-info`: returned `ok: true`, `runInGameApiVersion:
  2`, and server instance `studio-server-mpuoe8mg-ix3`.
- `GET /api/civ7/live/status`: returned `ok: true`, `playable: false`,
  `readiness: "shell"`, `inShell: true`, and no top-level error. Gameplay
  reads that are not available in shell were preserved as nested probe errors,
  not health failures.
- `bun run verify:studio-run-in-game:live -- --timeout-ms 5000 --map-script
  '{swooper-maps}/maps/swooper-earthlike.js'`: passed read-only. It proved
  direct-control health, setup snapshot phase `shell`, and two visible setup
  rows for `{swooper-maps}/maps/swooper-earthlike.js`.

### 2026-06-01 Browser Click And Resume Proof

Tooling note: Playwright was not installed in this workspace, so the browser
click proof used Chrome through Computer Use plus direct status endpoint reads.

- Started `apps/mapgen-studio` through the app-local dev script on strict port
  `5173`.
- Clicked the visible `Run in Game` button in Chrome at
  `http://127.0.0.1:5173/`.
- Studio immediately showed phase `Materializing`, request id
  `studio-run-in-game-mpuoew2b-ix3`, refresh-status and copy-diagnostics
  controls, and did not navigate away from the Studio URL.
- Status endpoint moved through `materializing`, `deploying`, `checking-civ7`,
  `preparing-setup`, `starting-game`, `waiting-for-proof`, and `complete`.
- Final status:
  - materialization mode: `disposable`
  - map script: `{swooper-maps}/maps/studio-current.js`
  - config hash:
    `4f015d12e781620b5b93e3078f124d6fee78dab13569d726e2e7f400bb9c787d`
  - envelope hash:
    `dae311babcf52085ef919488b64cf23320921dafaac9b6b21bc7a4266d71ba79`
  - row proof count: 2
  - setup row refresh: `false`
  - start verified: `true`
  - begin attempted: `true`
  - final App UI loading state: `GameStarted`
  - Tuner state present: `{ id: "1", name: "Tuner" }`
  - runtime map seed: `123`
  - runtime dimensions: `84x54`
  - turn: `1`
  - fresh Swooper log markers matched: `[mapgen-proof]`, request id, config
    hash, and envelope hash.
- After an explicit browser reload, Studio resumed the same request id and
  rendered `Complete`, `Turn 1 · Seed 123`, and the `Run in Game` button
  tooltip with the completed request id/map script.

### Bounded Evidence

- The live proof covered shell/menu disposable launch and browser reload
  resume. The follow-up operation-state completion proof additionally covered
  `Complete Current`, `Complete Stale`, missing-status `404`, active-operation
  de-dupe tests, and structured request/failure helper tests.
- It did not intentionally reproduce a stale listener/LSQ failure, connection
  loss during the live start mutation, or a durable built-in config launch in
  this pass.
- Stale-listener and ambiguous socket failure handling remain covered by
  direct-control error/uncertainty paths and no-replay unit coverage, not by
  fresh live failure injection.
