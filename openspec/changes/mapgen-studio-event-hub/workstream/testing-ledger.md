# D8 Testing Ledger - Studio Event Hub

Status: implementation committed at current branch tip; live Civ7 proof is not run or claimed
Date: 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Contract/schema | TypeBox event union through Standard Schema `eventIterator(...)` | `hello`, `operation`, and `live-game` are public TypeBox-origin schemas; no Zod or catch-all event blob owns public shape |
| Router bridge | package handler test | `studio.events.watch` resolves through `.effect()` and returns an async iterator over the one `/rpc` handler |
| Hello delivery | package handler test | first yielded event is `hello` with daemon identity and server-side `observedAt` |
| Hub event delivery | package service/handler test | an event published after subscribe is yielded after `hello` without changing procedure shape |
| Iterator close cleanup | service/handler test | `return()` closes the Effect subscription scope and subscriber count returns to baseline |
| Abort/disconnect cleanup | handler or transport test | aborting the client read releases subscription resources and returns counts to baseline |
| Runtime/handle interruption cleanup | handler transport test | disposing the Studio RPC handle stops runtime-owned resources, shuts down the daemon hub, settles a pending watch response read, and returns subscriber count to baseline |
| Hub shutdown cleanup | service/runtime test | hub shutdown terminates pending subscriber waits and leaves no active subscriber count |
| Repeated subscribe/close | leak test | repeated watch cycles leave no subscriber/dequeue growth |
| One-route proof | package/app route test plus negative search | watch is served through existing `/rpc`; no SSE, second RPC mount, or app-local event route exists |
| Client helper | app hook test | watch uses `experimental_liveOptions`, not accumulating stream helpers |
| Retry owner | app hook/client test | actual `studio.events.watch` subscription carries nonzero retry context or link policy |
| Hello adoption | app hook/adoption test | receiving `hello` calls `studio.operations.current` and applies D6 adoption without page reload/request-id recovery |

## Implementation Commands

```bash
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
```

D8 implementation records the focused test files that exercise
`test/handler.test.ts`, `test/studioEvents/operationAdoption.test.ts`, and
`test/server/oneMount.test.ts`, but repo-local Nx targets remain the closure
commands. Direct package-local scripts are supporting evidence only.

Current implementation evidence includes:

- `bun run --cwd packages/studio-server test -- test/handler.test.ts test/contractTypeboxSpine.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/server/oneMount.test.ts test/devServer/daemonDeployIsolation.test.ts`
- `bun run nx run @civ7/studio-server:test --outputStyle=static`
- `bun run nx run mapgen-studio:test --outputStyle=static`
- `bun run nx run mapgen-studio:check --outputStyle=static`
- `bun run --cwd packages/studio-server check`
- `bun run --cwd packages/studio-server build`
- `bun run nx run @civ7/studio-server:check --outputStyle=static`
- `bun run openspec -- validate mapgen-studio-event-hub --strict`
- `bun run openspec:validate`
- `git diff --check`

The graph-owned Habitat/Grit dependency failure found during D8 closure was
repaired below D8 in `codex/runtime-effect-domain-contract-import-surface`.
That lower slice keeps recipe contracts on the Habitat-approved domain-root
surface while preserving D1's daemon import-graph invariant that the reachable
domain root is contract-only and does not evaluate broad authoring/runtime
barrels.

The recovery-storage scan still finds protected non-event storage owners:
Studio state persistence, preset storage, and comments documenting that
operation recovery is now `studio.operations.current` plus
`studio.events.watch`. These are classified D6/D8-compatible and are not
browser request-id replay paths.

## Negative Search Gates

```bash
rg -n "EventSource|text/event-stream|/events|/sse" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "studio\\.events\\.watch.*\\.handler|\\.handler\\(.*events\\.watch" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "streamedOptions|experimental_streamedOptions" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
rg -n "retry: 0|default retry|ClientRetryPlugin\\(\\).*reconnect" apps/mapgen-studio/src packages/studio-server/src openspec/changes/mapgen-studio-event-hub -g "*.{ts,tsx,md}"
rg -n "zod|fromZod|z\\." packages/studio-server/src/contract packages/studio-server/src/services apps/mapgen-studio/src/app/hooks -g "*.{ts,tsx}"
rg -n "localStorage|request-id replay|requestId replay" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -g "*.{ts,tsx}"
```

Hits are blockers unless they are protected non-event storage owners, historical
packet discussion, or explicitly documented selected behavior.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Package tests prove event delivery, one-route handler behavior, and server
  cleanup.
- Service/runtime tests prove Effect lifecycle cleanup.
- App hook tests prove client helper, retry, and adoption behavior.
- Negative searches prove rejected event routes/schemas/recovery paths are not
  present.
- Live Civ7 proof is not required for D8 because this packet does not claim
  game-state mutation or live gameplay behavior.
