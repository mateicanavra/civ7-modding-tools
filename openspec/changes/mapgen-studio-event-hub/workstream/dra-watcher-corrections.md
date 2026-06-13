# DRA Watcher Corrections

Entries are prepend-only. Material watcher findings stay active until repaired
or dispositioned with source evidence.

## Entries

### 2026-06-13 - Client retry plugin default leaves event watch reconnect inert

Status: accepted-repaired; scoped event-watch call context owns retry

Violation:

Initial evidence showed `apps/mapgen-studio/src/lib/orpc.ts` adding
`new ClientRetryPlugin()` without a nonzero retry policy. Later in the same
watcher pass, `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` added a
scoped `experimental_liveOptions(...)` call context with
`retry: Number.POSITIVE_INFINITY`.

Principle:

S3.1 owns `studio.events.watch` client subscription and reconnect adoption.
The accepted S3.0 findings say `ClientRetryPlugin` defaults retry to `0`, so
S3.1 must wire retry deliberately on the Studio client link or call context.

Rationale:

The default constructor installs the plugin but leaves reconnect disabled.
The newly added hook appears to choose call-context retry as the owner, which
is acceptable if it remains wired to the actual event watch subscription and is
covered by a focused app test.

Repair Demand:

Keep a deliberate nonzero retry policy for the event watch path. If the Studio
`RPCLink` default remains zero, the `orpc.studio.events.watch.experimental_liveOptions(...)`
subscription hook must keep passing nonzero retry context and record that as
the retry owner. Add or strengthen a focused app test so it fails when the
actual event watch subscription options lose the nonzero retry path.

Evidence:

- `apps/mapgen-studio/src/lib/orpc.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`
- `openspec/changes/mapgen-studio-stream-spike/workstream/findings.md`
- `node_modules/.bun/@orpc+client@1.14.5/node_modules/@orpc/client/dist/plugins/index.d.mts`

Closure Condition:

Met. The S3.1 diff contains an event watch retry policy with nonzero attempts,
a focused app test for that policy, strict OpenSpec validation, and no closure
claim that relies on the default `ClientRetryPlugin` constructor alone.
