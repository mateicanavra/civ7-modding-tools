# D11 Phase Record - Studio Nx Dev Runner

## Phase

- Project: Studio runtime Effect refactor
- Domino: D11
- OpenSpec change: `mapgen-studio-nx-dev-runner`
- Owner: Codex DRA packet-authoring lane
- Branch/Graphite stack: `codex/runtime-effect-nx-dev-runner`
- Status: draft pending review and validation

## Objective

- Target movement: replace app-local nested dev supervision with Nx continuous
  task orchestration and workspace-watch/dependency rebuild ownership.
- Non-goals: general Nx migration, D1 import-graph isolation, D10 live-game
  runtime ownership, D12 final invariant closeout, runtime operation workflow
  changes.
- Done condition: packet can be handed to a D11 implementer with explicit Nx
  target topology, process deletion targets, proof gates, live operation
  stability oracles, baseline stop conditions, and downstream handoff.

## Gate 1 - Frame

- Hard core: accepted Nx/Habitat baseline, continuous backend serve target,
  frontend dev depends on backend serve, generated/build dependencies modeled by
  Nx, app-local child supervisor deleted, no daemon-internal Bun watcher, Play
  and Save&Deploy stable under Nx dev.
- Exterior: broad Nx/Habitat migration, D1 watch-graph isolation, D10 runtime
  watcher implementation, D12 game-door invariant, non-Studio dev scripts.
- Falsifier: implementation preserves `devLive.ts` as supervisor, keeps
  `bun --watch` daemon launch, uses Turbo or dual command paths, cannot prove
  Nx target dependency graph, or restarts daemon during Play/Save&Deploy.
- Proof labels: baseline install/build/check, Nx metadata, Habitat classify,
  process tree proof, negative searches, live operation proof, OpenSpec
  validation, Graphite/worktree cleanliness.
- Review lanes: prework/corpus scout, hardening/black-ice, testing/Nx-native
  alignment.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`
- Branch: `codex/runtime-effect-nx-dev-runner`
- Entrance status: clean after D10 commit `a357ae914`.
- Dirty-file quarantine: none at entrance; D11 packet edits are restricted to
  `openspec/changes/mapgen-studio-nx-dev-runner/**` and
  `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`.
- Baseline note: this packet branch is pre-Nx authoring context. D11
  implementation execution requires the accepted migrated Nx/Habitat baseline;
  absence of that baseline is a stop condition, not a supported command path.

## Gate 3 - Diagnosis

The current pre-Nx app dev path puts process orchestration inside
`apps/mapgen-studio/src/server/daemon/devLive.ts`: it spawns the daemon, waits
for `/healthz`, starts Vite, and launches the daemon with `bun --watch`. This
made sense during the Bun-server bootstrap, but after D1 and D10 the remaining
nested process shape is the problem. The app is carrying task-runner work, and
the daemon appears to be watched by a daemon-adjacent supervisor.

D11 moves that concern into Nx, which is the accepted workspace task owner.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| root `dev:mapgen-studio` script | root package scripts | developer CLI | script diff, negative search |
| app `dev` script | app package / Nx executor | Nx target | script diff, target proof |
| backend serve target | Nx project metadata | Nx continuous orchestration | `nx show project`, graph proof |
| frontend dev target | Nx project metadata | developer browser | `nx show project`, Vite smoke |
| generated/build prerequisites | Nx target dependencies/watch | Studio dev | graph proof |
| `devLive.ts` | deleted or non-supervising app entrypoint | none or serve path | negative search/source review |
| daemon entrypoint | Studio app | backend serve target | process proof |
| Vite proxy | app Vite config | frontend dev | config/test proof |
| process tree | OS process list | proof ledger | `ps` proof |
| Play/Save&Deploy under dev | Studio runtime | product proof | stable `serverInstanceId` samples |

## Gate 5 - Grouping

- Baseline group: dependency install, Nx version, mapgen-studio project
  metadata, Habitat classification.
- Target topology group: backend continuous serve, frontend dev dependency,
  generated/build prerequisites.
- Deletion group: `devLive.ts` supervisor, app dev script route, `bun --watch`,
  Turbo dev route.
- Runtime proof group: process tree and Play/Save&Deploy identity stability.

## Gate 6 - Expected Behavior

- `bun run dev:mapgen-studio` reaches `bun run nx run mapgen-studio:dev`.
- Nx metadata makes backend/frontend dependency visible.
- Backend serve is continuous.
- The process tree has Nx-owned backend/frontend processes, no app-local
  supervisor, and no daemon `bun --watch`.
- Play and Save&Deploy keep the same `serverInstanceId` under Nx dev.
- Missing Nx/Habitat baseline blocks implementation closure.

## Gate 7 - Architecture Translation

- Owning system: Nx/Habitat task graph.
- Owning package/app: `apps/mapgen-studio` provides entrypoints and Vite config.
- Forbidden owners: `devLive.ts` child supervisor, shell/tmux wrapper, Effect or
  Arc as process manager, Turbo dev route, daemon-internal Bun watcher, browser
  recovery.
- Public command: `bun run dev:mapgen-studio`.

## Gate 8 - Slice Plan

D11 is one OpenSpec change and one future implementation Graphite branch. It
removes the dev process topology residue after D1 and D10. D12 consumes D11 to
prove no process/runtime bridge remains unowned.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet shape only.
- Nx metadata/graph proof proves target topology.
- Process tree proof proves active local process ownership.
- Negative searches prove deletion of stale active command paths.
- Live Play/Save&Deploy proof proves dev topology preserves daemon identity.

## Gate 11 - Review

- Prework/corpus scout: launched.
- Hardening/black-ice reviewer: launched.
- Testing/Nx-native reviewer: launched.
- Review ledger must capture all P1/P2 findings before packet acceptance.

## Gate 12 - Closure

Closure is blocked until:

- D11 proposal/design/spec/tasks/ledgers agree.
- `review-disposition-ledger.md` has no unresolved P1/P2 finding.
- strict and full OpenSpec validation pass.
- shortcut scan has no active fallback/dual-path/Turbo/app-supervisor target.
- `OPENSPEC-PACKET-TRAIN.md` marks D11 accepted.
- Graphite/worktree state is clean after commit.

## Next Action

Finish D11 review loop, repair accepted findings, validate, update the packet
train ledger, and commit D11 through Graphite. Then open D12
`mapgen-studio-game-door-invariant`.
