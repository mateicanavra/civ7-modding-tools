# D8 Testing Ledger - Studio Event Hub

Status: draft pending review
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Contract/schema | TypeBox event union through Standard Schema `eventIterator(...)` | `hello`, `operation`, and `live-game` are public TypeBox-origin schemas; no Zod or catch-all event blob owns public shape |
| Router bridge | package handler test | `studio.events.watch` resolves through `.effect()` and returns an async iterator over the one `/rpc` handler |
| Hello delivery | package handler test | first yielded event is `hello` with daemon identity and server-side `observedAt` |
| Hub event delivery | package service/handler test | an event published after subscribe is yielded after `hello` without changing procedure shape |
| Iterator close cleanup | service/handler test | `return()` closes the Effect subscription scope and subscriber count returns to baseline |
| Abort/disconnect cleanup | handler or transport test | aborting the client read releases subscription resources and returns counts to baseline |
| Runtime interruption cleanup | Effect runtime/fiber test | interrupting the watch fiber closes subscription scope and returns counts to baseline |
| Hub shutdown cleanup | service/runtime test | hub shutdown terminates pending subscriber waits and leaves no active subscriber count |
| Repeated subscribe/close | leak test | repeated watch cycles leave no subscriber/dequeue growth |
| One-route proof | package/app route test plus negative search | watch is served through existing `/rpc`; no SSE, second RPC mount, or app-local event route exists |
| Client helper | app hook test | watch uses `experimental_liveOptions`, not accumulating stream helpers |
| Retry owner | app hook/client test | actual `studio.events.watch` subscription carries nonzero retry context or link policy |
| Hello adoption | app hook/adoption test | receiving `hello` calls `studio.operations.current` and applies D6 adoption without page reload/request-id recovery |

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test -- test/handler.test.ts
bun run --cwd packages/studio-server check
bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/server/oneMount.test.ts
bun run --cwd apps/mapgen-studio check
```

If the current Nx/Habitat migration stack changes package-local command names,
D8 implementation must replace these with the repo-local Nx/Habitat equivalents
and record the replacement in this ledger. Legacy package-runner substitutes are
not accepted as D8 closure evidence.

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
