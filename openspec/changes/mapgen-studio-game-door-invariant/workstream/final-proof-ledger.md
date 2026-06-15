# D12 Final Proof And Residue Ledger

Status: implementation evidence recorded and stack submitted; live Civ7 proof executed; final Graphite merge/sync/drain not closed
Date: 2026-06-14; implementation update 2026-06-15

## Proof Classes

| Proof class | Required evidence | What it proves | What it does not prove |
| --- | --- | --- | --- |
| OpenSpec strict validation | `bun run openspec -- validate mapgen-studio-game-door-invariant --strict` | D12 change shape is valid. | Runtime behavior. |
| Full OpenSpec validation | `bun run openspec:validate` | D0-D12 packet records and repo OpenSpec tree remain coherent. | Package/app code health. |
| Guard tests | direct-control session constructor guard command | Production session constructors are allowlisted. | Live socket health. |
| TypeBox schema proof | Zod negative search plus package contract tests when touched | Studio public contracts do not retain Zod substrate. | Operation semantics. |
| Status corpus proof | `workstream/status-endpoint-corpus.md` plus negative searches for polling/watchdogs | Retained status reads are classified as diagnostic reads, mutation-state reads/projections, or identity reads with no background freshness ownership. | Live state freshness. |
| Control-oRPC corpus proof | `workstream/control-orpc-surface-corpus.md` plus procedure-key/risk search | Control game-action/effect surfaces are classified. | Studio operation workflow correctness. |
| Residue searches | final negative-search set | Deleted/guarded/historical/diagnostic/deferral classification is complete for named residue. | Absence of unrelated future debt. |
| Package/app gates | repo-local Nx package/app check/test/build targets selected by Habitat/classification | Local code health and dependency ordering for changed implementation. | Live Civ7 behavior unless explicitly live. |
| Live proof | D12 live state-machine pass over Nx Studio, oRPC events, Run in Game, and Save&Deploy | Behavior-changing runtime claims held against Civ7 for the exercised flows. | Source/package tests alone do not prove live Civ7 behavior. |
| Graphite proof | `gt submit --ai`, merge/drain, `gt sync --no-restack --no-interactive --force`, status/log/worktree checks | Stack closure and branch hygiene. | Runtime correctness. |

## Final Negative Search Set

```bash
rg -n "RunInGameHttpError|StudioEngineError|useOperationStatusPolls|useDaemonInstanceWatchdog|nextLiveRuntimePollDelayMs|sourceSnapshotStorage|liveStatusFailureCountRef|setTimeout\\(poll|civ7\\.live\\.status\\(\\{\\}|liveControlPort\\.readiness\\.current\\(|civ7ControlOrpcClient|studioServerClient|nodeWebBridge|rpcPath" apps/mapgen-studio/src packages/studio-server/src packages/studio-server/test apps/mapgen-studio/test -g '*.{ts,tsx}'
rg -n 'devLive\\.ts|"dev": "bun src/server/daemon/devLive\\.ts"|turbo run dev --filter=mapgen-studio|bunx turbo|bun x turbo|bun --watch src/server/daemon/daemon\\.ts' package.json apps/mapgen-studio docs openspec -S
rg -n 'bunx nx|bun x nx|\\["x",\\s*"nx"\\]|\\['"'"'x'"'"',\\s*'"'"'nx'"'"'\\]|node_modules/.bin/nx|global-only Nx|on-the-fly Nx|shimmed Nx|direct binary Nx' package.json apps packages docs openspec -S
rg -n "from ['\\\"]zod['\\\"]|\\bz\\." packages/studio-server/src/contract packages/studio-server/src -g '*.{ts,tsx}'
rg -n "new\\s+Civ7DirectControlSession\\s*\\(" apps packages -g '*.{ts,tsx}'
rg -n -i "operationType\\s*\\+\\s*args|Record<string, number>|runtime-port|run[- ]in[- ]game.*(convergence|session|out of scope|deferred)|(convergence|session|out of scope|deferred).*run[- ]in[- ]game" packages apps docs openspec -S
rg -n -i "RunInGameHttpError|StudioEngineError|operation polling|daemon watchdog|browser live-status|devLive\\.ts|run[- ]in[- ]game.*(convergence|session|out of scope|deferred)|(convergence|session|out of scope|deferred).*run[- ]in[- ]game" docs openspec -S
```

## D12 Implementation Evidence Recorded

### EventHub Runtime Ownership

The D12 implementation consumes the D11/D12 EventHub lifecycle finding by
removing the host-created Promise-owned hub seam:

- `StudioEventHubLive` owns the Effect-scoped PubSub service.
- `makeStudioRuntime(...)` provides `StudioEventHubLive` inside the package
  runtime graph instead of injecting `Layer.succeed(..., context.eventHub)`.
- `StudioOperationRuntime` and `StudioLiveGameWatcher` consume the
  `StudioEventHub` service.
- `createStudioContext(...)` and the daemon no longer create, pass, or manually
  shut down an EventHub.
- `createStudioRpcHandler(...).dispose()` disposes the managed runtime; runtime
  scope closes the watcher and EventHub subscriptions.
- `Effect.runPromise` remains only in `studioEventSubscriptionIterator(...)`,
  the oRPC `AsyncIterator` edge.
- `publish(event)` updates live-game replay state only after
  `PubSub.publish(...)` succeeds, so failed publication does not advance replay
  ahead of delivered events.
- Publish/replay update and subscribe/replay-read setup are serialized by a
  package-owned replay gate, so a concurrent live-game publish cannot be
  delivered both as queued data and as replay during subscription setup.
- Finalizer shutdown is serialized through the same gate. It marks the hub
  closed before closing active subscriptions, clears the active-release
  registry, and prevents late publish/subscribe registration after runtime
  disposal starts.
- Subscription acquisition is uninterruptible across queue creation, replay
  read, and active-release registration.

Focused proof already run:

```bash
bun run --cwd packages/studio-server test -- test/handler.test.ts test/operationRuntime.test.ts test/liveGameWatcher.test.ts
bun run --cwd packages/studio-server test -- test/handler.test.ts test/gameDoorInvariant.test.ts test/liveGameWatcher.test.ts
bun run --cwd packages/studio-server test -- test/gameDoorInvariant.test.ts
bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/engineEffectCorpus.test.ts
```

These tests cover scoped hub lifecycle, close/abort/interruption behavior,
runtime disposal, repeated-close cleanup, route-level iterator-return cleanup
with an observable subscriber-count oracle, operation and live-game publish
failure policy, publish/subscribe replay interleaving, runtime-disposal
acquisition races, replay-gate source shape, and production-source absence of
the old host EventHub seam.

### Promise Boundary Classification

Allowed D12 Promise boundary:

- `studioEventSubscriptionIterator(...)` adapts Effect subscription reads and
  close to oRPC's `AsyncIterator` transport edge.

Known bounded adapter debt, not claimed fixed by D12:

- Long operation workflow leaf ports still wrap some deploy/log/filesystem/game
  work as Promises. Runtime disposal projects operation state through Effect
  registries and interrupts scoped fibers, but the underlying host Promise work
  may not be cancellable. This is classified as bounded leaf-adapter lifecycle
  debt unless a future workflow-port slice adds abort-signal ownership to those
  leaves.

### Live Proof

D10 left live Civ7 watch proof not-green and D11 left Play/Save&Deploy
identity proof under Nx dev not-green. D12 closed that live-product gap with a
fresh state-machine pass after the EventHub repair and canonical Run in Game
request repair:

- Nx Studio runner started Vite on `localhost:5173` and daemon RPC on
  `127.0.0.1:5174`.
- Fresh daemon identity remained stable across the live pass:
  `studio-server-mqftopnk-1d3t-1`,
  `2026-06-15T23:06:45.345Z`.
- Invalid Run in Game setup with a newline `setupConfig.mapScript` failed
  before operation admission as `RUN_IN_GAME_INVALID` / `InvalidRequest`, and
  `studio.operations.current({})` showed no active or recent pollution.
- Disposable Run in Game from a clean tracked catalog reached terminal
  `complete` through `studio.events.watch`. Request id:
  `studio-run-in-game-mqftp8p8-1d3t-2`; terminal event, keyed status, and
  current projection all agreed on `{swooper-maps}/maps/studio-current.js`.
- Save&Deploy reached terminal `complete` through `studio.events.watch`.
  Request id: `live-save-mqftqfp9`; terminal event, keyed status, and current
  projection agreed.

CLI restart/control paths, where used, remain setup/control only and are not the
product proof. The product proof is Studio/RPC/event/status/current agreement.

### Root Graph Hygiene

Habitat classify on the D12 diff reported graph-owned gates:

```bash
nx run mapgen-studio:check
nx run mapgen-studio:test
nx run @civ7/studio-server:check
nx run @civ7/studio-server:test
nx run @internal/habitat-harness:check
nx run @internal/habitat-harness:test
bun run lint
```

Package-local focused commands are supporting evidence only. D12 reran the
graph-owned gates and added build proof:

```bash
bun run lint
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:build --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:build:vite --outputStyle=static
bun run nx run @internal/habitat-harness:check --outputStyle=static
bun run nx run @internal/habitat-harness:test --outputStyle=static
```

Root lint passed after D12 repaired the Habitat normalization guard's Standard
recipe docs parser for D1's manifest-backed `orderStandardStages(...)` shape
and included the resulting Biome root hygiene in the same final closeout slice.
The final lint output reported advisory `doc-ambiguity` only, not an enforced
failure.

## Residue Classification Rules

| Hit class | Allowed disposition | Blocker condition |
| --- | --- | --- |
| `RunInGameHttpError` | deleted or historical evidence only | any production bridge or active target doc that presents it as current |
| `StudioEngineError` | deleted, replaced by D3 typed errors, or explicitly classified as historical evidence | active production status-code/error bridge after D3/D5 implementation |
| Zod contract imports | deleted | any `packages/studio-server/src/contract/**` direct Zod import |
| browser recovery/polling/watchdog | deleted or historical evidence | any browser background freshness/recovery loop |
| live-status cadence | deleted or diagnostic manual call only | any timer/refetch/cadence using `civ7.live.status` as freshness source |
| dev supervision | deleted or deployment-only classified outside local dev | active app-local `devLive.ts`, `bun --watch` daemon, or Turbo local dev path |
| Nx command residue | removed or explicitly classified as historical docs evidence | active deploy/dev code using `bunx nx`, `bun x nx`, `["x", "nx"]`, global/on-the-fly Nx, direct binary Nx, or shimmed Nx |
| satellite clients/paths | deleted or historical evidence | active old mount/path/client route around the one `/rpc` mount |
| generic mutation protocol | internal control-oRPC/direct-control package protocol or tests only | public Studio mutation DTO bypassing semantic TypeBox unions |
| direct-control aliases | package-internal or guarded allowlist only | public root alias that lets Studio bypass the game door |
| stale convergence docs | updated to D12 disposition or historical evidence | active docs saying convergence remains out of scope without D12 disposition |

## Active Residue Hit Appendix

The final docs/OpenSpec residue scans intentionally return many historical and
proof-text hits. These are the active, non-archive families and their D12
disposition:

| Hit family | Active locations | D12 disposition |
| --- | --- | --- |
| Deleted browser recovery/polling/watchdog symbols | D6-D10 OpenSpec packets, D12 negative-search commands, guard-test literals | Historical packet evidence or proof oracle text; no production app background freshness path. |
| Retired REST `/api/*` labels | `packages/studio-server/src/contract/**`, `packages/studio-server/src/router/index.ts`, audit docs | Active source comments now label `/api/*` as retired audit/parity identifiers; current runtime transport is TypeBox/effect-oRPC under `/rpc`. |
| `RunInGameHttpError` / `StudioEngineError` | D12 ledgers, historical robustness docs, negative-search commands | Production residue deleted; active docs are historical-status or D12 proof/disposition text. |
| `devLive.ts`, Turbo local dev, daemon `bun --watch` | D11/D12 OpenSpec proof records, active runbook history, deployment handoff docs | Local dev authority is Nx-native; remaining hits are historical packet evidence or deployment-owned residue, not current Studio dev orchestration. |
| Browser-runner/preview paths | `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md` and related historical project docs | Classified outside D4-D12 runtime truth; not claimed deleted by D12 unless a current runtime authority path points at it. |
| Control-oRPC procedure keys and `Record<string, number>` | `workstream/control-orpc-surface-corpus.md`, control-orpc/direct-control source/tests | Internal control protocol/test surfaces with owner/risk/consumer classification; not public Studio mutation DTO authority. |
| Tuner/session/convergence wording | `mapgen-studio-tuner-session` OpenSpec records, D12 tasks/ledgers, evergreen game-door doc | Closed or durably deferred through D12 status/next-packet records; stale `out of scope` text is allowed only when it points to accepted D12 disposition or owner. |
| Live Civ7 proof | D12 testing/final-proof ledgers | Live Run in Game and Save&Deploy state-machine proof executed; source/package tests remain separate supporting evidence. |

## Stack Drain Proof Requirements

D12 implementation closure owns the final stack proof after review/merge policy
allows closure:

1. Submit every runtime refactor branch with Graphite and `--ai`.
2. Merge bottom-to-top through Graphite.
3. Ensure no merged branch is checked out in any worktree.
4. Run `gt sync --no-restack --no-interactive --force`.
5. Record `git status --short --branch`, `gt status`, `gt log --no-interactive`,
   and `git worktree list`.

If review or live Civ7 access blocks final drain, D12 writes
`workstream/next-packet.md` with the exact external blocker and does not claim
runtime refactor closure.

### Graphite Submit Evidence

`gt submit --stack --publish --ai --branch
codex/runtime-effect-game-door-invariant --no-interactive` created the runtime
refactor stack PRs on 2026-06-15:

| Branch | PR |
| --- | --- |
| `agent-I-runtime-effect-accepted-packet-base` | #1729 |
| `codex/runtime-effect-docs-mintlify-cli` | #1730 |
| `codex/runtime-effect-cli-build-deps` | #1731 |
| `codex/runtime-effect-control-orpc-build` | #1732 |
| `codex/runtime-effect-nx-doc-alignment` | #1733 |
| `codex/runtime-effect-dev-watch-deploy-isolation` | #1734 |
| `codex/runtime-effect-engine-effect-corpus` | #1735 |
| `codex/runtime-effect-contract-typebox-spine` | #1736 |
| `codex/runtime-effect-error-spine` | #1737 |
| `codex/runtime-effect-engine-runtime-services` | #1738 |
| `codex/runtime-effect-pipeline-effect-services` | #1739 |
| `codex/runtime-effect-operations-current` | #1740 |
| `codex/runtime-effect-stream-spike` | #1741 |
| `codex/runtime-effect-domain-contract-import-surface` | #1742 |
| `codex/runtime-effect-event-hub` | #1743 |
| `codex/runtime-effect-operations-push` | #1744 |
| `codex/runtime-effect-live-game-watch` | #1745 |
| `codex/runtime-effect-nx-dev-runner` | #1746 |
| `codex/runtime-effect-game-door-invariant` | #1747 |

Pre-submit repair: empty Graphite metadata branches
`codex/runtime-effect-refactor-frame` and
`codex/runtime-effect-openspec-packets` pointed at the same commit as
`agent-I-runtime-effect-accepted-packet-base`; Graphite submit dry-run refused
to submit dependent branches through empty PRs. They were deleted with
Graphite-native branch deletion, which reparented descendants without restack
because no Git commits changed.

Still open: review policy, bottom-to-top merge, post-merge
`gt sync --no-restack --no-interactive --force`, and final worktree/branch drain
proof.
