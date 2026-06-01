# Proof Ledger

## Automated Proof

- `bun run --cwd apps/mapgen-studio test -- runInGame`: passed, 5 files / 18
  tests. Covers request validation/raw command rejection, operation phase
  tracking, active-operation de-dupe, failure classes, TTL pruning,
  current/stale/unknown client relation, and footer stale rendering.
- `bun run --cwd apps/mapgen-studio check`: passed.
- `bun run --cwd apps/mapgen-studio test`: passed, 15 files / 70 tests.
- `bun run openspec -- validate studio-operation-state-completion --strict`:
  passed.
- `bun run openspec:validate`: passed, 40 items.
- `bun run verify:studio-run-in-game`: passed. The aggregate command covered
  Turbo build/check/test paths for the direct-control, SDK, Swooper Maps mod,
  and Mapgen Studio packages, plus strict OpenSpec validation for the related
  direct-control and Studio Run in Game changes.

## Live Proof

- Studio dev server started through `bun run dev:mapgen-studio` on strict port
  `5173`. `/api/studio/server-info` returned server instance
  `studio-server-mpur4rab-22a3`, start time `2026-06-01T05:12:05.410Z`, and
  `runInGameApiVersion: 2`.
- Missing status probe
  `/api/civ7/run-in-game/status?requestId=missing-test-id` returned structured
  HTTP `404` with server instance and server start time. This proves missing
  operation status is explicit instead of becoming an untyped browser failure.
- Civ live status probe before browser launch returned `ok: true` and playable
  game state for Turn 1 / Seed 123. This was treated as environment context,
  not proof that a new Run in Game operation had succeeded.
- Browser proof used Chrome/Computer Use at `http://localhost:5173/` because the
  in-app Browser plugin did not expose its JS automation tool in this session.
- Clicking the visible `Run in Game` button created request
  `studio-run-in-game-mpur5vwz-22a3`. The Studio showed `Materializing`
  immediately, kept the tab on the Studio route, and exposed copy diagnostics
  and refresh-status controls while the operation ran.
- Final status for `studio-run-in-game-mpur5vwz-22a3` was `complete` with
  request metadata:
  `recipeId: mod-swooper-maps/standard`, `seed: 123`,
  `mapSize: MAPSIZE_STANDARD`, `playerCount: 6`, `resources: balanced`, and
  `materializationMode: disposable`. Materialization recorded
  `{swooper-maps}/maps/studio-current.js`, config hash
  `4f015d12e781620b5b93e3078f124d6fee78dab13569d726e2e7f400bb9c787d`, and
  envelope hash
  `dae311babcf52085ef919488b64cf23320921dafaac9b6b21bc7a4266d71ba79`.
- After completion, the footer rendered `Complete Current` for the matching
  authored Studio seed/config state.
- Changing the Studio seed to `124` without launching again changed the footer
  to `Complete Stale`, proving the UI no longer implies that a past Civ launch
  still matches the current authored state.
- Reloading the browser tab restored the operation from same-server status and
  local client snapshot. The Studio rendered `Complete Current` for the
  recovered seed `123`, proving the completed operation status survives a tab
  reload while the Vite server remains alive.

## Bounded Evidence

- Operation records are intentionally in-memory for this dev server slice. A
  Vite process restart loses server-side request history, and the UI classifies
  that as missing status instead of pretending recovery succeeded.
- This pass did not live-inject LSQ/listener failure or launch a durable
  repo-backed config. Those remain bounded in the original robustness ledger;
  the operation-state slice covers their status/failure contracts with helper
  and UI tests.
