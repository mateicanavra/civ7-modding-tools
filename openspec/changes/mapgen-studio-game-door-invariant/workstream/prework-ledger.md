# D12 Prework Ledger - Game Door Invariant

Status: accepted packet prework
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D12 is the final packet in the runtime Effect refactor train.
- Classified the existing D12 change as historical S4.1 implementation closeout
  evidence requiring packet repair.
- Inspected D9, D10, and D11 downstream ledgers to pull final status/live/dev
  residue obligations into D12.
- Launched fresh direct-control/prework, hardening/orphan, and testing/schema
  review lanes.
- Completed status endpoint corpus extraction in
  `workstream/status-endpoint-corpus.md`.
- Completed control-oRPC procedure-key/risk corpus extraction in
  `workstream/control-orpc-surface-corpus.md`.

## Implementation-Shaping Decisions

| Surface | Decision |
| --- | --- |
| Game-wire owner | daemon `Civ7TunerSession` or sanctioned direct-control scoped wrapper only |
| Session constructor proof | production source guard with exact allowlist |
| `RunInGameHttpError` | deleted or dispositioned so no live transport bridge remains |
| Studio contracts | TypeBox/Standard Schema, no Zod imports in contract surface |
| Public/manual status | diagnostic request/response only or deleted |
| Control-oRPC runtime surfaces | classified ledger, no unclassified mutation/effect surface |
| Tuner-session residue | close each promise by name |
| Restart Civ7 | implement, reject with product authority, or durable deferral |
| Runtime residue | final negative searches and classifications |
| Graphite state | stack submit/merge/sync/drain proof owned by D12 |

## Negative Search Set

```bash
rg -n "RunInGameHttpError|StudioEngineError|useOperationStatusPolls|useDaemonInstanceWatchdog|nextLiveRuntimePollDelayMs|devLive\\.ts|sourceSnapshotStorage|liveStatusFailureCountRef|setTimeout\\(poll|civ7\\.live\\.status\\(\\{\\}|liveControlPort\\.readiness\\.current\\(|civ7ControlOrpcClient|studioServerClient|nodeWebBridge|rpcPath" apps/mapgen-studio/src packages/studio-server/src packages/studio-server/test apps/mapgen-studio/test -g '*.{ts,tsx}'
rg -n 'devLive\\.ts|"dev": "bun src/server/daemon/devLive\\.ts"|turbo run dev --filter=mapgen-studio|bunx turbo|bun x turbo|bun --watch src/server/daemon/daemon\\.ts' package.json apps/mapgen-studio docs openspec -S
rg -n "from ['\\\"]zod['\\\"]|\\bz\\." packages/studio-server/src/contract packages/studio-server/src -g '*.{ts,tsx}'
rg -n "new\\s+Civ7DirectControlSession\\s*\\(" apps packages -g '*.{ts,tsx}'
rg -n 'bunx nx|bun x nx|\\["x",\\s*"nx"\\]|\\['"'"'x'"'"',\\s*'"'"'nx'"'"'\\]|node_modules/.bin/nx|global-only Nx|on-the-fly Nx|shimmed Nx|direct binary Nx' package.json apps packages docs openspec -S
rg -n -i "operationType\\s*\\+\\s*args|Record<string, number>|runtime-port|run[- ]in[- ]game.*(convergence|session|out of scope|deferred)|(convergence|session|out of scope|deferred).*run[- ]in[- ]game" packages apps docs openspec -S
rg -n -i "RunInGameHttpError|StudioEngineError|operation polling|daemon watchdog|browser live-status|devLive\\.ts|run[- ]in[- ]game.*(convergence|session|out of scope|deferred)|(convergence|session|out of scope|deferred).*run[- ]in[- ]game" docs openspec -S
```

## Implementation Prework Required Before Code Edits

1. Re-run the negative search set on the selected implementation base.
2. Reconcile the implementation status endpoint ledger against
   `workstream/status-endpoint-corpus.md`.
3. Reconcile the implementation control-oRPC game-action/effect surface ledger
   against `workstream/control-orpc-surface-corpus.md`.
4. Inspect `mapgen-studio-tuner-session` tasks and decide each remaining item by
   evidence.
5. Plan Graphite stack submit/merge/sync/drain steps and worktree branch
   checkout constraints before final closure.

## Resolved Black-Ice Decisions

- D12 is not allowed to leave "Run in Game convergence deferred" as plain text.
  It must be converged, assigned to a sanctioned wrapper, or durably
  dispositioned.
- Retained public/manual status endpoints are not background freshness.
- Historical S4.1 merge/green records are evidence only, not current packet
  closure.
- D12 owns final stack drain; earlier packet branches remain stacked until this
  closeout is ready.
- Generic mutation residue is split by boundary: public Studio DTOs are
  blockers; control-oRPC/direct-control internals are valid only when tied to a
  typed `procedureKey` and risk classification.

## Remaining Human Decisions

None for packet acceptance. Product authority is needed during implementation
only if Restart Civ7 recovery is rejected instead of implemented or deferred.
