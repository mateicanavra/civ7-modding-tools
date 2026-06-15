# D11 Prework Ledger - Studio Nx Dev Runner

Status: draft pending review
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D11 is a new OpenSpec change in the packet train.
- Read the D11 runtime refactor frame and D0 Nx/Habitat scout report.
- Inspected current pre-Nx root/app scripts and `devLive.ts` process topology.
- Launched fresh prework, hardening/black-ice, and testing/Nx-native review
  lanes.

## Implementation-Shaping Decisions

| Surface | Decision |
| --- | --- |
| Baseline | accepted Nx/Habitat implementation base is required |
| Public command | root `dev:mapgen-studio` routes to repo-local Nx |
| Backend owner | continuous Nx backend daemon serve target |
| Frontend owner | Nx frontend Vite dev target depending on backend serve |
| Generated/build owner | Nx target dependencies or workspace-watch ownership |
| App supervisor | `devLive.ts` deleted; no child-process orchestration in app dev path |
| Daemon watcher | no daemon `bun --watch` launched from app/daemon dev scripts |
| Process proof | one Nx-owned backend and one Nx-owned frontend process |
| Runtime proof | Play and Save&Deploy stable `serverInstanceId` under Nx dev |
| Deployment Turbo residue | classify separately; not local dev proof |

## Negative Search Set

```bash
rg -n 'devLive\\.ts|"dev": "bun src/server/daemon/devLive\\.ts"|bun --watch|turbo run dev --filter=mapgen-studio|bunx turbo|bun x turbo' package.json apps/mapgen-studio docs openspec -S
rg -n 'node:child_process|spawn\\(|ChildProcess|waitForDaemonReadiness' apps/mapgen-studio/src/server/daemon apps/mapgen-studio/test -S
```

Hits block D11 implementation closure unless classified as archived/historical
evidence, a deleted-file test fixture that proves removal, or non-Studio
runtime text outside the D11 write set.

## Implementation Prework Required Before Code Edits

1. Select a worktree based on the accepted Nx/Habitat baseline.
2. Run `bun install --frozen-lockfile`, baseline build/check, `bun run nx
   --version`, and `bun run nx show project mapgen-studio --json`.
3. Identify the existing mapgen-studio target names and decide whether to keep
   them or normalize to `serve-daemon`, `dev-frontend`, and `dev`.
4. Identify generated/build target dependencies needed before Studio dev starts.
5. Plan the process proof command and the live Play/Save&Deploy proof while Nx
   dev is running.

## Resolved Black-Ice Decisions

- D11 is not a general Nx migration. It assumes the accepted migrated baseline.
- Pre-Nx checkout is a blocker, not a compatibility lane.
- Nx is the task runner; Effect/Arc are not used as dev process managers.
- `devLive.ts` is deleted. A future single-process helper, if truly needed, must
  use a new name outside the dev-supervisor surface and record its owner.
- Process simplicity is not enough; Play and Save&Deploy must keep daemon
  identity stable under Nx dev.
- Railway `bunx turbo` build text is deployment residue on this authoring
  branch. It is not local dev orchestration proof and must be classified or
  handed off rather than silently preserved as an active D11 dev target.

## Remaining Human Decisions

None for packet acceptance. Implementation may keep existing accepted Nx target
names if they are semantically equivalent and recorded in the proof ledger.
