# Live Proof Ledger

## Scope

Track fresh runtime evidence for Studio Run in Game and live sync claims. Use
this ledger for observations that depend on a running Civ7 instance.

## Entries

### 2026-05-31 Repeat Probe Across Local And Parallels Host IPs

- Proof ids:
  - `studio-run-in-game-live-proof-mpud4pk1-21ay`
  - `studio-run-in-game-live-proof-mpud5o7e-6ka`
  - `studio-run-in-game-live-proof-mpud5o7e-6jo`
- Status: failed / blocker for live mutation proof.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Commands:
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 10.211.55.2 --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --host 127.0.0.1 --timeout-ms 10000`
- Mode: read-only.
- Mutation attempted: false.
- Evidence:
  - Computer Use inspection showed Civ alive in a running game window.
  - `lsof -nP -iTCP:4318` showed the Civ process listening on `*:4318`, with
    accumulated closed/CLOSE_WAIT accepted socket descriptors.
  - Health failed for `127.0.0.1` and `10.211.55.2` with
    `Timed out waiting for Civ7 tuner response to LSQ:`.
  - A 10 second local timeout did not recover a response.
- Mutation replay count: 0.
- Verdict: same blocker across local and Parallels host bindings. The listener
  is accepting/holding TCP state, but the Civ tuner protocol path is not
  answering `LSQ:`.

### 2026-05-31 Successful Live Proof After Civ Process Restart

- Proof ids:
  - `studio-run-in-game-live-proof-mpuduy1d-14fr`
  - `studio-run-in-game-live-proof-mpudv6o8-163w`
- Studio request id: `studio-run-in-game-mpudxem8-1jz5`
- Status: passed for existing repo-backed Swooper map row.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Commands:
  - `bun run verify:studio-run-in-game:live -- --timeout-ms 5000`
  - `bun run verify:studio-run-in-game:live -- --mutate --map-script '{swooper-maps}/maps/swooper-earthlike.js' --map-size MAPSIZE_STANDARD --seed 753190005 --game-seed 753190000 --from-running-game exit-to-shell --timeout-ms 10000 --wait-timeout-ms 180000 --poll-interval-ms 2000`
  - Studio endpoint probe: `POST /api/civ7/run-in-game` on the durable
    `swooper-earthlike` config with seed `753190006`.
- Mode: read-only, then approved mutating setup/start, then Studio endpoint.
- Mutation attempted: true.
- Evidence:
  - Read-only health saw App UI `65535` and Tuner `1` on `127.0.0.1:4318`;
    setup phase was `running-game`.
  - Mutating proof exited from a running game to shell/setup, verified two
    setup map rows for `{swooper-maps}/maps/swooper-earthlike.js`, prepared
    setup, hosted the game, and waited for Tuner readiness.
  - Post-start Tuner map summary showed width `84`, height `54`, plot count
    `4536`, turn `1`, and `GameplayMap.getRandomSeed()` value `753190005`.
  - Studio live sync endpoints returned:
    `/api/civ7/live/status` with seed `753190005`, dimensions `84x54`, turn
    `1`; bounded `/api/civ7/live/snapshot` with `120` plots; live entities
    with `8` players, `7` units, and `0` cities; and GameInfo table reads.
  - Studio Run in Game endpoint returned `ok: true`, row count `2`,
    `startVerified: true`, and fresh Swooper `[mapgen-proof]` markers for
    request id `studio-run-in-game-mpudxem8-1jz5`.
  - Studio endpoint live status after the launch read back seed `753190006`,
    dimensions `84x54`, turn `1`, and `playable: true`.
- Exact-config proof:
  - `configHash`:
    `dc2352604837b0c70e04e08b4d4a721e3274c36eb1dc138fe92b99364c57234d`
  - `envelopeHash`:
    `6aef7b8f29de725bf9415c1e86772a99e401b979ed50b694b33ea47ba375c792`
  - Fresh log matched `[mapgen-proof]`, the Studio request id, `configHash`,
    and `envelopeHash`.
- Mutation replay count: 0.
- Verdict: direct-control setup/start and Studio durable Run in Game are
  live-proven for an existing setup-visible Swooper map row after Civ process
  restart.

### 2026-05-31 Reload Boundary And Setup Surface Findings

- Proof ids:
  - `studio-run-in-game-live-proof-mpudgpem-v1i`
  - Studio disposable request with seed `753190002`
  - `studio-run-in-game-mpuegkpw-1x6o`
- Status: partial failure followed by direct-control repair and disposable
  Studio success.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Evidence:
  - `Configuration`-only setup writes changed `Configuration.getMap()` to the
    requested Swooper map/seed, but setup readback still showed the default
    Continents map row through `GameSetup`.
  - Direct-control was updated to write core setup values through both
    `Configuration` and `GameSetup.setGameParameterValue`; the next live
    mutating proof passed.
  - A disposable `studio-current` Studio run deployed source output, but Civ
    setup could not see `{swooper-maps}/maps/studio-current.js` before leaving
    the running game.
  - `UI.reloadUI()` alone did not make the row visible.
  - Returning to shell/main menu with `engine.call("exitToMainMenu")`, then
    running `UI.reloadUI()`, made the deployed `studio-current` row visible
    with setup-domain and config-db rows.
  - Studio disposable Run in Game then passed with request id
    `studio-run-in-game-mpuegkpw-1x6o`, row count `2`,
    `startVerified: true`, and fresh Swooper `[mapgen-proof]` markers for
    `configHash`
    `dc2352604837b0c70e04e08b4d4a721e3274c36eb1dc138fe92b99364c57234d`
    and `envelopeHash`
    `f34598e5f320a9e7d00f2ee0fdc2a056c11b760eb31d8fec22073eae24a54c16`.
  - Post-start Swooper log proof recorded map id `studio-current`, seed
    `753190008`, dimensions `84x54`, and the Studio request id.
- Verdict: setup writes require both exposed setup surfaces. Existing
  repo-backed rows are hot-launchable after deploy. Disposable `studio-current`
  is launchable after a package-owned shell/App UI reload, without Windows,
  FireTuner, or macOS process restart in the proven path.

### 2026-05-31 Repeatable Live Gate Still Blocked At LSQ

- Proof id: `studio-run-in-game-live-proof-mpud0vii-1jhd`
- Status: failed / blocker for live mutation proof.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Command:
  `bun run verify:studio-run-in-game:live -- --timeout-ms 3000`.
- Mode: read-only.
- Mutation attempted: false.
- Evidence:
  - `lsof -nP -iTCP:4318 -sTCP:LISTEN` still shows `Civilizat` listening on
    `*:4318`.
  - The live proof command reached the health stage and returned
    `all-hosts-unavailable`.
  - The nested socket error was `Timed out waiting for Civ7 tuner response to
    LSQ:` for `127.0.0.1`.
  - Because health failed, the command did not attempt setup snapshot, map row,
    prepare, start, or return-to-shell mutations.
- Mutation replay count: 0.
- Verdict: the live proof process is now repeatable, but the setup/start parity
  claim remains unproven until Civ responds to `LSQ:` and the same command can
  advance through setup snapshot, map row proof, prepare/start, Tuner health,
  map summary, and Swooper log/hash proof.

### 2026-05-31 LSQ Timeout After Return-To-Shell Probe

- Proof id: `studio-run-in-game-lsq-timeout-2026-05-31`
- Status: failed / blocker for live mutation proof.
- Operator: Codex.
- Branch: `codex/studio-run-in-game-workstream`.
- Context: a narrow live mutation probe sent `engine.call("exitToMainMenu")`
  from App UI while trying to prove the setup/start sequence from a running
  game. The command path then timed out while waiting for the next LSQ
  response.
- Evidence:
  - `lsof -nP -iTCP:4318 -sTCP:LISTEN` still shows Civ listening on port 4318.
  - `checkCiv7DirectControlHealth({ timeoutMs: 3000 })` returns
    `all-hosts-unavailable` with `Timed out waiting for Civ7 tuner response to
    LSQ:`.
  - `getCiv7AppUiSnapshot({ timeoutMs: 3000 })` fails with
    `response-timeout` on LSQ.
  - Computer Use showed Civ still in a running game window, so the process is
    alive but the tuner socket is not responding to state queries.
- Mutation replay count: 0 after the failed probe.
- Verdict: no setup/start parity claim can be marked live-proven until a fresh
  Civ tuner socket responds to LSQ again. Source and mock tests may proceed, but
  Studio dependence remains gated by a later passing live proof entry.

## Required Proofs

- App UI setup snapshot from shell/main menu.
- Return-to-shell behavior from a running game.
- Map row existence in `GameInfo.Maps` after generation/deploy.
- Setup map script/size/map seed/game seed applied before host/start.
- Host/start single-player game from prepared setup.
- Post-start `GameplayMap.getRandomSeed()` matches Studio seed.
- Post-start map dimensions match selected map size/options.
- Swooper `Scripting.log` markers and config hash prove exact config loaded.
- Reload semantics: hot deploy, shell reload, or process restart requirement.
- Live sync: map/player/unit/city/resource/visibility snapshots refresh by turn
  without writing authored `pipelineConfig`.
