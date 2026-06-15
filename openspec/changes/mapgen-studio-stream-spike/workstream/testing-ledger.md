# D7 Testing Ledger - Stream Transport Decision

Status: implementation evidence committed at current branch tip; live Civ7 proof is not run or claimed
Date: 2026-06-14; accounting update 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Contract/schema | TypeBox event union through Standard Schema `eventIterator(...)` | public event schema has recoverable TypeBox origin and no Zod/event details blob |
| Router bridge | package handler tests | `studio.events.watch` resolves through `.effect()` and returns an async iterator |
| Event delivery | package handler test | subscriber receives `hello` before stream close |
| Iterator close cleanup | EventHub service/handler test | `return()` closes scope and subscriber count returns to baseline |
| Abort/disconnect cleanup | handler or transport test | aborting the client read releases the subscription finalizer and returns counts to baseline |
| Interruption cleanup | Effect runtime/fiber test | interrupting the watch fiber closes the subscription scope and returns counts to baseline |
| Repeated subscribe/close | leak test | repeated watch cycles leave no subscriber/dequeue growth |
| Vite `/rpc` passthrough | app dev-proxy test | at least two ordered chunks arrive before upstream close |
| Client helper | app hook test | watch uses `experimental_liveOptions`, not stale/accumulating helper names |
| Retry owner | app hook/client test | actual watch path carries nonzero retry policy |

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test -- test/handler.test.ts
bun run --cwd packages/studio-server check
bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts test/studioEvents/operationAdoption.test.ts
bun run --cwd apps/mapgen-studio check
```

## Implementation Evidence - 2026-06-15

Commands run:

```bash
bun run --cwd packages/studio-server test -- test/handler.test.ts test/contractTypeboxSpine.test.ts
bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts test/studioEvents/operationAdoption.test.ts
bun run --cwd packages/studio-server check
bun run --cwd apps/mapgen-studio check
```

Results:

- Package tests passed: `test/handler.test.ts` and `test/contractTypeboxSpine.test.ts` passed 13 tests.
- App tests passed: `test/devServer/viteProxyStream.test.ts` and `test/studioEvents/operationAdoption.test.ts` passed 12 tests.
- Package and app TypeScript checks passed.

Proof disposition:

- `test/contractTypeboxSpine.test.ts` proves the public event iterator is TypeBox-origin through the owned Standard Schema adapter.
- `test/handler.test.ts` proves `studio.events.watch` delivery over the native effect-oRPC handler, iterator `return()` cleanup, response-body cancel/disconnect cleanup, pending-read interruption on EventHub shutdown, and repeated subscribe/close returning subscriber count to baseline.
- `test/devServer/viteProxyStream.test.ts` proves Vite `/rpc` forwards at least two ordered event-stream chunks before upstream close without assuming one read equals one chunk.
- `test/studioEvents/operationAdoption.test.ts` proves the actual watch hook uses `experimental_liveOptions` and that the generated live query function invokes `studio.events.watch` with nonzero retry context.
- No live Civ7 Play/SaveDeploy proof was run or claimed; D7 is transport/lifecycle proof only.

## Negative Search Gates

```bash
rg -n "studio\\.events\\.watch.*\\.handler|\\.handler\\(.*events\\.watch|EventSource|/events|/sse" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "streamedOptions|experimental_streamedOptions" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
rg -n "retry: 0|default retry|ClientRetryPlugin\\(\\).*reconnect" apps/mapgen-studio/src packages/studio-server/src openspec/changes/mapgen-studio-stream-spike -g "*.{ts,tsx,md}"
rg -n "streamSpike|spike-only|proof-only" packages/studio-server/test apps/mapgen-studio/test openspec/changes/mapgen-studio-event-hub openspec/changes/mapgen-studio-operations-push -g "*.{ts,tsx,md}"
```

Negative scan disposition from implementation pass:

- Alternate transport/stale streamed helper scans produced no production source hits.
- Retry scan hit `apps/mapgen-studio/src/lib/query.ts:30` (`retry: 0`) for the generic QueryClient default, plus D7 docs that intentionally forbid default-only retry claims. The actual watch path proof remains `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` / `test/studioEvents/operationAdoption.test.ts`, where watch context supplies nonzero retry.
- Spike scan hit downstream D8/D9 packet text that explicitly records promotion/deletion obligations. No D7 production code or D7 test fixture introduces a hidden spike-only runtime path.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Package handler tests prove event delivery and server cleanup.
- App dev-proxy tests prove Vite passthrough.
- App hook tests prove client API/retry wiring.
- Negative searches prove no alternate transport or stale helper surface remains.
- Live Civ7 proof is not required for D7 because this packet selects transport mechanics, not game behavior.
