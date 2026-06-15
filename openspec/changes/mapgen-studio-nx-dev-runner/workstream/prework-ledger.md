# D11 Prework Ledger - Studio Nx Dev Runner

Status: implementation prework consumed; D11 dev-process implementation
complete before Graphite commit
Date: 2026-06-15

## Packet-Authoring Prework Completed

- Confirmed D11 is a new OpenSpec change in the packet train.
- Read the D11 runtime refactor frame and D0 Nx/Habitat scout report.
- Inspected current pre-Nx root/app scripts and `devLive.ts` process topology.
- Launched fresh prework, hardening/black-ice, and testing/Nx-native review
  lanes.

## Restack Adoption Update

Date: 2026-06-15

- The selected implementation worktree is now on the accepted Nx/Habitat
  baseline. `bun run nx --version` reports local Nx `v22.7.5`, and
  `bun run nx show project mapgen-studio --json` succeeds.
- Root `dev:mapgen-studio` enters Nx, but the current inferred
  `mapgen-studio:dev` target still resolves to package `dev`, which runs
  `bun src/server/daemon/devLive.ts`.
- `devLive.ts` is still the app-local process supervisor and still launches the
  daemon with `bun --watch`. This is the current D11 implementation gap, not a
  baseline blocker.

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

1. Use the adopted worktree based on the accepted Nx/Habitat baseline.
2. Run `bun install --frozen-lockfile`, baseline build/check, `bun run nx
   --version`, and `bun run nx show project mapgen-studio --json`.
3. Existing target names were inspected through
   `bun run nx show project mapgen-studio --json`.
4. D11 normalized to two active targets: `serve-daemon` and user-facing `dev`.
   The frontend is the `dev` target itself; the tentative `dev-frontend` target
   was removed so no orphan frontend authority remains.
5. Generated/build prerequisites are modeled on `serve-daemon` through
   `mod-swooper-maps:build:studio-recipes` plus `^build`.
6. Process proof was run with `bun run nx run mapgen-studio:dev
   --outputStyle=stream` and `ps`; live Play/SaveDeploy proof remains
   not-green in `next-packet.md`.

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
- `studio-current.config.json` and `studio-current.ts` are Studio live-run
  transient outputs, not shipped built-in map presets. The config remains
  ignored, the generated output is now ignored, and saved authoring configs
  remain tracked.

## Remaining Human Decisions

None for packet acceptance. Implementation may keep existing accepted Nx target
names if they are semantically equivalent and recorded in the proof ledger.
