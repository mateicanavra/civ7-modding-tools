# D10 Live-Game Watcher Proof Plan

Status: proof-slice design repaired after fresh review; proof executed for D10
task 5.8 on 2026-06-16.
Date: 2026-06-16.
Branch: `codex/runtime-effect-d10-live-proof`.

## Objective

Close D10 task 5.8 only if a real Civ7/FireTuner session proves the remaining
watcher-specific live behavior that D12 did not independently prove:

- the daemon's package `ManagedRuntime` activates `StudioLiveGameWatcher` before
  serving `/rpc` requests that depend on runtime identity or event streaming;
- live event output is paired with source-composition proof that the watcher
  reads through `Civ7TunerClient` and the shared `Civ7TunerSession` path;
- the first observed live-game state is delivered to `studio.events.watch`;
- reconnect after first observation receives `hello` followed by the latest
  retained `live-game` state;
- unchanged stable live-game keys stay quiet across at least one watcher
  interval;
- a real changed turn/hash/seed/readiness state publishes a new `live-game`
  event;
- the browser UI consumes the event stream in the same run without background
  `civ7.live.status` or `liveControlPort.readiness.current` freshness calls.

## Exterior

- Runtime source changes, including adding success-only watcher diagnostics just
  to make proof easier.
- Public contract changes.
- Generated output edits.
- Graphite submit, PR creation, merge, or stack drain.
- Claiming live proof from static tests, OpenSpec validation, or D12 operation
  state-machine proof.
- Closing the changed-state subclaim if the local live session cannot produce a
  changed turn/hash/seed/readiness observation.

## Owners And Protected Paths

| Surface | Owner | Write status |
| --- | --- | --- |
| D10 proof records | `openspec/changes/mapgen-studio-live-game-watch/workstream/*` | writable for plan/evidence/closure updates |
| D10 task 5.8 | `openspec/changes/mapgen-studio-live-game-watch/tasks.md` | writable only after proof evidence exists |
| D10 spec/proposal/design | `openspec/changes/mapgen-studio-live-game-watch/{proposal,design,specs/**}` | protected unless review finds stale authority |
| Runtime/app source | `packages/studio-server/**`, `apps/mapgen-studio/**` | read-only unless live proof exposes a current defect and a new repair slice is designed |
| Generated outputs/lockfiles | `dist/**`, generated resources, lockfiles | read-only |

## Pre-Proof Static Gates

Run and record:

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse --short=9 HEAD
git status --short --branch
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run --cwd packages/studio-server test -- test/liveGameWatcher.test.ts test/handler.test.ts -t 'live-game|studio\.events\.watch|event hub|subscription|watch response|subscriber'
bun run nx run mapgen-studio:check --outputStyle=static
bun run --cwd apps/mapgen-studio test -- test/liveRuntime/model.test.ts test/studioEvents/operationAdoption.test.ts
bun run openspec -- validate mapgen-studio-live-game-watch --strict
bun run openspec:validate
```

Static gate caveat: the package-local test commands require workspace package
exports to exist. Run the Nx check/build-backed gates before package-local
focused tests. The wider `@civ7/studio-server:test` target currently has
Run-in-Game config-validation failures outside the live-game watcher assertions;
do not cite it as D10 proof unless those failures are repaired separately.

## Environment Preflight

Before starting Studio, prove the local game/tuner state and record JSON output:

```bash
civ7 game status --json
civ7 game health --tuner --json
```

If no live game/tuner session is reachable, stop. Do not close task 5.8.

The preferred deterministic changed-state trigger is one autoplay turn:

```bash
civ7 game autoplay --action start --turns 1 --json
civ7 game autoplay --action stop --json
```

If autoplay is unavailable or unsafe in the current session, record the
alternative manual/game action used to change turn/hash/seed/readiness. If no
changed stable key can be produced, leave L5 and task 5.8 open.

## Live Proof Harness

Start the repo-native full Studio dev target when browser/UI proof is in scope:

```bash
bun run nx run mapgen-studio:dev --outputStyle=static
```

If the default Studio ports are occupied, isolate this proof worktree with
explicit environment ports:

```bash
STUDIO_DAEMON_PORT=5274 \
STUDIO_DEV_PORT=5273 \
STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 \
bun run nx run mapgen-studio:dev --outputStyle=static
```

Expected local surfaces:

- frontend: `http://127.0.0.1:5173` or the port printed by Vite;
- daemon: `http://127.0.0.1:5174`;
- daemon log line:
  `mapgen-studio daemon listening on http://127.0.0.1:5174`.

For daemon-only debugging, `bun run nx run mapgen-studio:serve-daemon
--outputStyle=static` is allowed, but daemon-only proof cannot satisfy L7.

Use the oRPC event stream directly so raw payloads are captured without relying
on browser rendering:

```bash
timeout 12s curl -sN \
  -H 'content-type: application/json' \
  -X POST \
  --data '{"json":{}}' \
  http://127.0.0.1:5174/rpc/studio/events/watch \
  | tee /tmp/d10-live-watch-1.sse
```

When isolated ports are used, replace `5174` with the recorded
`STUDIO_DAEMON_PORT`.

Use the same command for reconnect replay with a new output file after the first
`live-game` event has been captured.

Required capture set:

| ID | Observation | Passing evidence |
| --- | --- | --- |
| L1 | Initial subscribe | Raw stream contains first `hello` with `serverInstanceId`, `serverStartedAt`, and `observedAt`. |
| L2 | First live-game | Same stream later contains `live-game` with parsed `state.status`, `snapshotId` or error state, and `observedAt`. |
| L3 | Reconnect replay | A second stream opened after L2 receives `hello` followed by retained `live-game` without waiting for a new game change. |
| L4 | Quiet unchanged key | Parsed events show no second `live-game` with the same `liveGameStateKey` for at least two watcher intervals (`2 * 3_000ms`) plus margin. Record quiet-window start/end timestamps. |
| L5 | Changed state | After the recorded trigger, parsed before/after events show prior key, new key, changed field(s), raw payload excerpts, and the trigger timestamp in the same live run. A present `snapshotId` alone is not enough. |
| L6 | Runtime/source path | Live stream output proves the runtime produced watcher events; source pointers prove those events can only come from `StudioLiveGameWatcher` inside `createStudioRpcHandler` / `makeStudioRuntime` using `Civ7TunerClient` and `StudioEventHub`. This is not a live shared-socket instrumentation claim. |
| L7 | Browser no-background-cadence | Same-run browser/network capture shows the UI opens `/rpc/studio/events/watch`, receives/applies `live-game`, and makes no repeated background `civ7.live.status` or `liveControlPort.readiness.current` freshness calls during the capture window. Bounded snapshot/setup request-response follow-ups are allowed if triggered by the pushed state. |

Parse the event captures into normalized rows before claiming L2-L5:

```text
eventIndex, receivedAt, type, stableKey, status, turn, gameHash, seed,
readiness, snapshotId, observedAt
```

For OK states the stable key is `ok:${snapshotId}`. For error states, compute
the key from status, error, readiness, snapshotId, snapshotHash, and
bindingStatus, matching `liveGameStateKey`.

## Evidence Record Requirements

Append proof only if the record names:

- branch and short commit;
- daemon command, host, port, and process log path or captured terminal output;
- local timestamp range;
- Civ7/FireTuner availability state;
- raw event-stream captures or bounded excerpts;
- parsed event payload shape for every accepted observation;
- changed-state trigger used for L5, or explicit failure state if L5 is not
  achieved;
- browser/network capture path and a summary of observed RPC calls for L7;
- static gates and their results;
- proof-class labels separating static tests, live stream proof, browser/source
  proof, Graphite state, and product proof.

## Review Lanes

Run fresh read-only review before proof execution:

- proof-design reviewer: verifies L1-L7 cover D10 task 5.8 without overclaiming;
- runtime-surface reviewer: verifies the plan uses current daemon/event paths
  and avoids forbidden runtime/source owners;
- environment reviewer: verifies command sequence, logs, event capture, and
  stop conditions are executable from the current repo state.

Accepted P1/P2 findings block proof execution or D10 closure until repaired,
rejected with source evidence, or explicitly moved outside the closure claim.

## Stop Conditions

- Civ7/FireTuner is unavailable or unreachable.
- Static D10 gates fail for reasons caused by this branch.
- Event stream never produces a `live-game` payload.
- Reconnect replay fails.
- Duplicate unchanged-key `live-game` events appear within the quiet window.
- Browser UI/network capture cannot be run for L7.
- L5 cannot be produced and the closure wording would require changed-state
  proof.
- The proof requires source edits; stop and design a repair slice before
  changing runtime code.

## Fresh Review Disposition

| ID | Severity | Source | Finding | Disposition |
| --- | --- | --- | --- | --- |
| D10-LIVE-REV-01 | P1 | environment reviewer | Plan used daemon-only `serve-daemon` while L7 required browser/UI proof. | accepted-repaired: full `mapgen-studio:dev` target and expected frontend/daemon surfaces are now required for L7. |
| D10-LIVE-REV-02 | P2 | proof/runtime reviewers | Plan overclaimed daemon startup activation even though watcher acquisition is lazy before RPC/identity handling. | accepted-repaired: objective now claims runtime-request/identity/event-stream activation, not listener startup. |
| D10-LIVE-REV-03 | P2 | proof/runtime/environment reviewers | L6 overclaimed daemon logs and live shared-session proof. | accepted-repaired: L6 now separates live stream proof from source-composition proof and forbids success-log edits for proof convenience. |
| D10-LIVE-REV-04 | P2 | proof/environment reviewers | L5 changed-state proof lacked trigger, prior/new stable keys, and raw payload comparison. | accepted-repaired: L5 now requires preflight, changed-state trigger, before/after keys, changed fields, and same-run payloads. |
| D10-LIVE-REV-05 | P2 | proof/environment reviewers | L4 quiet proof was underbounded and the `curl` stream was indefinite/unparsed. | accepted-repaired: capture is bounded, two watcher intervals plus margin are required, and parsed event rows must record stable keys and timestamps. |
| D10-LIVE-REV-06 | P2 | proof/environment reviewers | L7 allowed static negative search to replace live browser consumption. | accepted-repaired: same-run browser/network capture is required; source proof may only support absence/classification. |
| D10-LIVE-REV-07 | P3 | environment reviewer | Environment prerequisites were not executable. | accepted-repaired: `civ7 game status --json` and `civ7 game health --tuner --json` preflights are now required. |

## Execution Append - 2026-06-16

Executed on branch `codex/studio-dev-port-env` at `aa8325a83` with isolated
ports:

```bash
STUDIO_DAEMON_PORT=5274 \
STUDIO_DEV_PORT=5273 \
STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 \
bun run nx run mapgen-studio:dev --outputStyle=static
```

Accepted raw artifacts:

- `/tmp/d10-live-watch-1.sse`;
- `/tmp/d10-live-watch-2.sse`;
- `/tmp/d10-live-watch-changed.sse`;
- `/tmp/d10-live-proof-summary.json`;
- `/tmp/d10-live-watch-current.sse`;
- `/tmp/d10-live-watch-turn-change.sse`;
- `/tmp/d10-live-turn-change-summary.json`;
- `/tmp/d10-game-status.json`;
- `/tmp/d10-game-health.json`;
- `/tmp/d10-daemon-health.json`;
- `/tmp/d10-vite-listener.txt`;
- `/tmp/d10-daemon-listener.txt`;
- `/tmp/d10-browser-network-proof.json`;
- `/tmp/d10-browser-network-proof.png`.

The detailed evidence ledger is `workstream/testing-ledger.md`. No runtime
source edits were made for proof convenience; the only implementation slice
needed before proof was isolated Studio dev ports.
