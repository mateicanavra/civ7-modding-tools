# MapGen Studio Nx dev runner

## Why

D1 made deploy writes safe for the daemon import graph. D10 moves live-game
freshness into daemon runtime ownership. The remaining dev-process shape is now
the outlier: Studio development reached a package script that started an
app-local supervisor, which starts a Bun watcher for the daemon, waits for
readiness, and starts Vite. That nests process management inside the app and
makes the Studio dev topology look like tmux plus shell plus package script plus
supervisor plus Bun watcher plus daemon plus Vite.

D11 makes the dev topology boring and native: Nx owns continuous task
orchestration, dependency ordering, and watch/build coordination; the Studio
daemon is a backend serve target; Vite is the frontend dev target; generated
recipe/build prerequisites are represented as Nx target dependencies or
workspace-watch ownership. The daemon process no longer launches another Bun
watcher and the app no longer carries a child-process supervisor.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
  D11: replace app-local nested dev supervision with Nx continuous task
  orchestration, prove accepted Nx/Habitat baseline, and delete daemon-internal
  Bun watcher ownership.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` D11:
  new packet/change required; assumes accepted Nx/Habitat baseline.
- `openspec/changes/mapgen-studio-runtime-one-mount/workstream/nx-habitat-scout-report.md`:
  migrated-baseline facts and D11 command policy.
- `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/`: D1 owns
  daemon import graph/write-set isolation and leaves final app-local dev
  supervision cleanup to D11.
- `openspec/changes/mapgen-studio-live-game-watch/`: D10 gives live-game
  watcher ownership to daemon runtime, removing the need for browser or
  supervisor-owned live-state recovery.
- Nx project configuration docs: continuous task dependencies let long-lived
  serve targets unblock dependents instead of making Nx wait forever.
- Nx workspace watching docs: workspace watch commands replace ad hoc watcher
  scripts for dependent rebuilds.

## What Changes

- Require the implementation base to be the accepted Nx/Habitat baseline. If
  `bun run nx --version`, `bun run nx show project mapgen-studio --json`, or
  Habitat/classification gates are unavailable, D11 stops rather than adding a
  pre-Nx command path.
- Define `mapgen-studio` Nx targets so backend serve is a continuous task and
  the user-facing frontend dev target depends on it.
- Model generated/build prerequisites, including Studio recipe/build inputs, as
  Nx target dependencies or workspace-watch ownership rather than app-local
  child process behavior.
- Delete `apps/mapgen-studio/src/server/daemon/devLive.ts` and its
  `devLivePlan` tests. If implementation discovers a real production-serving
  need for a single-process helper, it must create a newly named entrypoint
  outside the dev-supervisor surface and record that owner; `devLive.ts` cannot
  remain as an active file.
- Make `nx run mapgen-studio:dev` the single user-facing and implementation
  entrypoint.
- Preserve D1 watcher/import-graph isolation and D10 daemon runtime ownership:
  dev orchestration cannot rely on daemon restarts, browser watchdogs, or
  hidden supervisor recovery.

## Non-Goals

- No general Nx migration. D11 assumes the accepted Nx/Habitat baseline exists.
- No fallback to Turbo, `bunx turbo`, `bun x turbo`, `bunx nx`, global-only Nx,
  direct `node_modules` binaries, or shimmed Nx command paths.
- No replacement of Nx continuous task orchestration with Effect, Arc, tmux, a
  shell script supervisor, or an app-local Node/Bun process manager.
- No changes to runtime operation state machines, event hub, live-game watcher,
  or direct-control protocol behavior.
- No watch-ignore-only compensation for process ownership. D1 owns import graph
  isolation; D11 owns dev task topology.

## Impact

- `package.json`
- `nx.json`, `project.json`, or inferred Nx target configuration for
  `mapgen-studio`
- `apps/mapgen-studio/package.json`
- `apps/mapgen-studio/src/server/daemon/devLive.ts`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/vite.config.ts`
- focused dev-process/Nx target/process proof tests or scripts
- D11 workstream ledgers and D12 downstream closeout notes

## Verification Gates

- `bun install --frozen-lockfile` on the selected implementation worktree.
- Baseline build/check before D11-specific proof is trusted.
- `bun run openspec -- validate mapgen-studio-nx-dev-runner --strict`.
- `bun run openspec:validate`.
- Accepted Nx/Habitat baseline proof:
  - `bun run nx --version`;
  - `bun run nx show project mapgen-studio --json`;
  - `bun run habitat classify <path-or-diff>` for the D11 write set, followed
    by reported Habitat/Nx/Biome/GritQL gates.
- Nx graph/task proof that `mapgen-studio:dev` depends on backend serve and the
  backend serve target is continuous.
- Dev process proof while Studio is running: one Nx-owned backend process and
  one Nx-owned frontend process, with no daemon-launched Bun watcher and no
  app-local supervisor process.
- Negative searches for `apps/mapgen-studio/src/server/daemon/devLive.ts`,
  `"dev": "bun src/server/daemon/devLive.ts"`, app dev-script `bun --watch`,
  root `turbo run dev --filter=mapgen-studio`, `bunx turbo`, and `bun x turbo`
  in active runtime dev specs.
- Deployment-only Turbo residue, such as Railway build commands, must be
  classified separately from local runtime dev orchestration and handed to D12
  or a deployment-owner follow-up; it must not remain ambiguous inside active
  dev proof.
- Play and Save&Deploy keep daemon `serverInstanceId` stable during dev under
  Nx orchestration.
- If live Civ7 proof is unavailable, D11 implementation cannot close green. It
  must write `workstream/next-packet.md` with exact missing live proof,
  environment prerequisite, commands, log paths, and blocked closure claim.
