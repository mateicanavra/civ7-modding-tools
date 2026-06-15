# D12 Final Proof And Residue Ledger

Status: planned packet proof contract pending implementation evidence
Date: 2026-06-14

## Proof Classes

| Proof class | Required evidence | What it proves | What it does not prove |
| --- | --- | --- | --- |
| OpenSpec strict validation | `bun run openspec -- validate mapgen-studio-game-door-invariant --strict` | D12 change shape is valid. | Runtime behavior. |
| Full OpenSpec validation | `bun run openspec:validate` | D0-D12 packet records and repo OpenSpec tree remain coherent. | Package/app code health. |
| Guard tests | direct-control session constructor guard command | Production session constructors are allowlisted. | Live socket health. |
| TypeBox schema proof | Zod negative search plus package contract tests when touched | Studio public contracts do not retain Zod substrate. | Operation semantics. |
| Status corpus proof | `workstream/status-endpoint-corpus.md` plus negative searches for polling/watchdogs | Retained status reads are diagnostic/request-response only. | Live state freshness. |
| Control-oRPC corpus proof | `workstream/control-orpc-surface-corpus.md` plus procedure-key/risk search | Control game-action/effect surfaces are classified. | Studio operation workflow correctness. |
| Residue searches | final negative-search set | Deleted/guarded/historical/diagnostic/deferral classification is complete for named residue. | Absence of unrelated future debt. |
| Package/app gates | touched package/app check/test/build commands | Local code health for changed implementation. | Live Civ7 behavior unless explicitly live. |
| Live proof | consumed D1/D9/D10/D11 proof or new D12 live proof | Behavior-changing runtime claims hold against Civ7 when required. | Graphite stack state. |
| Graphite proof | `gt submit --ai`, merge/drain, `gt sync --no-restack --no-interactive --force`, status/log/worktree checks | Stack closure and branch hygiene. | Runtime correctness. |

## Final Negative Search Set

```bash
rg -n "RunInGameHttpError|StudioEngineError|useOperationStatusPolls|useDaemonInstanceWatchdog|nextLiveRuntimePollDelayMs|sourceSnapshotStorage|liveStatusFailureCountRef|setTimeout\\(poll|civ7\\.live\\.status\\(\\{\\}|liveControlPort\\.readiness\\.current\\(|civ7ControlOrpcClient|studioServerClient|nodeWebBridge|rpcPath" apps/mapgen-studio/src packages/studio-server/src packages/studio-server/test apps/mapgen-studio/test -g '*.{ts,tsx}'
rg -n 'devLive\\.ts|"dev": "bun src/server/daemon/devLive\\.ts"|turbo run dev --filter=mapgen-studio|bunx turbo|bun x turbo|bun --watch src/server/daemon/daemon\\.ts' package.json apps/mapgen-studio docs openspec -S
rg -n "from ['\\\"]zod['\\\"]|\\bz\\." packages/studio-server/src/contract packages/studio-server/src -g '*.{ts,tsx}'
rg -n "new\\s+Civ7DirectControlSession\\s*\\(" apps packages -g '*.{ts,tsx}'
rg -n "operationType\\s*\\+\\s*args|Record<string, number>|runtime-port|Run in Game convergence.*out of scope|run-in-game convergence.*out of scope" packages apps docs openspec -S
rg -n "RunInGameHttpError|StudioEngineError|operation polling|daemon watchdog|browser live-status|devLive\\.ts|Run in Game convergence.*out of scope|run-in-game convergence.*out of scope" docs openspec -S
```

## Residue Classification Rules

| Hit class | Allowed disposition | Blocker condition |
| --- | --- | --- |
| `RunInGameHttpError` | deleted or historical evidence only | any production bridge or active target doc that presents it as current |
| `StudioEngineError` | deleted, replaced by D3 typed errors, or explicitly classified as historical evidence | active production status-code/error bridge after D3/D5 implementation |
| Zod contract imports | deleted | any `packages/studio-server/src/contract/**` direct Zod import |
| browser recovery/polling/watchdog | deleted or historical evidence | any browser background freshness/recovery loop |
| live-status cadence | deleted or diagnostic manual call only | any timer/refetch/cadence using `civ7.live.status` as freshness source |
| dev supervision | deleted or deployment-only classified outside local dev | active app-local `devLive.ts`, `bun --watch` daemon, or Turbo local dev path |
| satellite clients/paths | deleted or historical evidence | active old mount/path/client route around the one `/rpc` mount |
| generic mutation protocol | internal control-oRPC/direct-control package protocol or tests only | public Studio mutation DTO bypassing semantic TypeBox unions |
| direct-control aliases | package-internal or guarded allowlist only | public root alias that lets Studio bypass the game door |
| stale convergence docs | updated to D12 disposition or historical evidence | active docs saying convergence remains out of scope without D12 disposition |

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
