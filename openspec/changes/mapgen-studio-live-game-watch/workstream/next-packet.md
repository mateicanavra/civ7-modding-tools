# D10 Next Packet - Live Civ7 Proof Handoff

Status: D10 implementation is not green for live Civ7 product behavior until this proof is run.
Owner: D12 game-door invariant lane unless a live-Civ7 D10 proof lane is opened first.
Date: 2026-06-15

## Missing Proof Class

D10 unit, source, OpenSpec, and Nx gates prove the daemon/runtime watcher shape,
browser live-status cadence deletion, event-hub replay, and client stale-result
guards. They do not prove live FireTuner/game behavior.

The missing proof is live Civ7 runtime evidence that:

- daemon startup activates `StudioLiveGameWatcher` through the package
  `ManagedRuntime`;
- watcher reads flow through `Civ7TunerClient` and the shared
  `Civ7TunerSession` path;
- the first observed live-game state is delivered to `studio.events.watch`;
- a subscriber that connects after the first observation receives `hello`
  followed by the latest retained `live-game` state;
- unchanged stable live-game keys stay quiet;
- changed turn/hash/seed/readiness state publishes a new `live-game` event;
- browser UI updates from the event stream without calling background
  `civ7.live.status` or `liveControlPort.readiness.current`.

## Environment Prerequisites

- Civ7 is installed and launchable on the local machine.
- FireTuner/direct-control is enabled and reachable by the repo's
  `@civ7/direct-control` defaults.
- MapGen Studio daemon can run from the D10-or-later stack tip.
- Browser can open the Studio app and subscribe to `/rpc` `studio.events.watch`.

## Re-entry Commands

Record exact branch and commit first:

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse --short=9 HEAD
git status --short --branch
```

Run the static gates again before live proof:

```bash
bun run --cwd packages/studio-server test -- test/liveGameWatcher.test.ts test/handler.test.ts
bun run --cwd apps/mapgen-studio test -- test/liveRuntime/model.test.ts test/studioEvents/operationAdoption.test.ts
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
```

Then start the Studio daemon through the repo-native dev entrypoint for the
current stack. If D11 has landed, use the D11 Nx-owned dev runner. If D11 has
not landed yet, use the current accepted Studio daemon command and record the
command explicitly.

Observe `/rpc` `studio.events.watch` with a client that records raw streamed
events. Capture:

- first `hello`;
- first `live-game`;
- a reconnect after first live-game that receives `hello` then retained
  `live-game`;
- no duplicate event for an unchanged stable key over at least one watcher
  interval;
- a changed live-game state event after a real turn/hash/readiness change, if
  practical in the local game session.

## Log Paths To Inspect

Record the actual paths used by the dev runner. Expected places to inspect:

- Studio daemon stdout/stderr from the dev runner terminal;
- any repo-managed daemon log under `apps/mapgen-studio` if D11 introduces one;
- Civ7/FireTuner/direct-control logs used by the local environment;
- browser console/network capture for `/rpc` `studio.events.watch`.

## Closure Rule

Do not edit D10 retroactively to claim green live behavior without appending the
live proof evidence to the D10/D12 workstream records. If the environment is
unavailable again, keep this handoff open and preserve the D10 claim as:

> implementation/static gates green; live Civ7 product proof not run or claimed.
