# NOTE TO DRA: Client retry plugin is inert by default

Status: accepted-repaired watcher correction for S3.1
`mapgen-studio-event-hub`; implementation repairs this via scoped call
context and the disposition is recorded as `S3.1-W1`.

Evidence:

- Initial evidence: `apps/mapgen-studio/src/lib/orpc.ts` adds `new ClientRetryPlugin()` with no options.
- `openspec/changes/mapgen-studio-stream-spike/workstream/findings.md` records that `ClientRetryPlugin` defaults retry to `0` and S3.1 must configure a nonzero retry count on the link or call context.
- `node_modules/.bun/@orpc+client@1.14.5/node_modules/@orpc/client/dist/plugins/index.d.mts` declares `retry` default `0`.
- Later evidence during the same pass: `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` now passes `context: studioEventsWatchClientContext()` into `orpc.studio.events.watch.experimental_liveOptions(...)`, and that context returns `retry: Number.POSITIVE_INFINITY`.

Violated principle:

S3.1 owns client subscription/reconnect adoption. Adding the retry plugin with its default policy does not provide reconnect behavior, so it can falsely satisfy the task shape while leaving the event stream inert after disconnect.

Necessary-and-sufficient repair demand:

Before S3.1 claims task or closure, keep the deliberate nonzero retry policy on the event watch path and make the focused app test bind that policy to the actual subscription options, not only to a standalone helper. If the link default remains zero, record that the `experimental_liveOptions(...)` call context is the deliberate retry owner.

Validation after repair:

- Focused app test proving retry configuration for the event watch path.
- `bun run openspec -- validate mapgen-studio-event-hub --strict`.
- `git diff --check`.

DRA disposition:

- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` keeps the event watch
  retry owner on the actual `experimental_liveOptions(...)` call context.
- `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` asserts the
  retry policy helper and actual watch live-options shape.
