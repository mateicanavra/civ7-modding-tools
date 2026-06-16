# D11 Phase Record - Studio Nx Dev Runner

## Phase

- Project: Studio runtime Effect refactor
- Domino: D11
- OpenSpec change: `mapgen-studio-nx-dev-runner`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/runtime-effect-nx-dev-runner`
- Status: implementation committed at current branch tip; live Civ7
  Play/SaveDeploy proof consumed by D12 live state-machine pass

## Objective

- Target movement: replace app-local nested dev supervision with Nx continuous
  task orchestration and workspace-watch/dependency rebuild ownership.
- Non-goals: general Nx migration, D1 import-graph isolation, D10 live-game
  runtime ownership, D12 final invariant closeout, runtime operation workflow
  changes.
- Done condition: D11 implementation lands as its own Graphite slice with Nx
  target topology, process deletion targets, proof gates, live operation
  stability handoff or downstream proof consumption, baseline stop conditions,
  and downstream D12 residue realignment recorded truthfully.

## Gate 1 - Frame

- Hard core: accepted Nx/Habitat baseline, continuous backend serve target,
  user-facing frontend dev target depends on backend serve, generated/build
  dependencies modeled by Nx, app-local child supervisor deleted, no
  daemon-internal Bun watcher, Play and Save&Deploy stable under Nx dev.
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

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-S-studio-runtime-effect-refactor`
- Branch: `codex/runtime-effect-nx-dev-runner`
- Entrance status: clean after D10 commit
  `9a715e0e7 feat(studio): push live game state from runtime`.
- Dirty-file quarantine: none at entrance; D11 implementation edits are
  restricted to the Studio app dev target/write set, D11 OpenSpec workstream,
  and the `.gitignore` transient `studio-current` proof-output policy.
- Baseline note: this implementation branch is on the accepted migrated
  Nx/Habitat baseline. A checkout without that baseline remains a stop
  condition, not a supported command path.

## Gate 3 - Diagnosis

Pre-implementation diagnosis found process orchestration inside
`apps/mapgen-studio/src/server/daemon/devLive.ts`: it spawns the daemon, waits
for `/healthz`, starts Vite, and launches the daemon with `bun --watch`. This
made sense during the Bun-server bootstrap, but after D1 and D10 that nested
process shape became the problem. The app was carrying task-runner work, and
the daemon appeared to be watched by a daemon-adjacent supervisor.

D11 moves that concern into Nx, which is the accepted workspace task owner.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| root `dev:mapgen-studio` script | root package scripts | developer CLI | script diff, negative search |
| app `dev` script | app package / Nx executor | Nx target | script diff, target proof |
| backend serve target | Nx project metadata | Nx continuous orchestration | `nx show project`, graph proof |
| frontend dev target | Nx project metadata | developer browser | `nx show project`, Vite smoke |
| generated/build prerequisites | Nx target dependencies/watch | Studio dev | graph proof |
| `devLive.ts` | deleted app-local supervisor | none | negative search/source review |
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

D11 is one OpenSpec change and one implementation Graphite branch. It removes
the dev process topology residue after D1 and D10. D12 consumes D11's process
proof, live-proof gap, root-lint disposition, and residual runtime-bridge
classifications to prove no process/runtime bridge remains unowned.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet shape only.
- Nx metadata/graph proof proves target topology.
- Process tree proof proves active local process ownership.
- Negative searches prove deletion of stale active command paths.
- Live Play/Save&Deploy proof proves dev topology preserves daemon identity.

## Gate 11 - Review

- Packet-authoring prework/corpus, hardening/black-ice, and testing/Nx-native
  reviews completed before packet acceptance.
- Implementation-diff findings from the supervisor/read-only explorer sweep
  were accepted and repaired or carried forward:
  - static target proof was strengthened with running Nx process proof;
  - orphan `dev-frontend` target semantics were removed from the active
    contract;
  - `nx.json` analytics prompt residue was excluded from the D11 diff;
  - transient `studio-current` proof-run generated output was ignored while
    saved authoring configs remain tracked;
  - the EventHub lifecycle island candidate is deferred to D12.
- Review ledger has no unresolved P1/P2 findings for D11 closure.

## Gate 12 - Closure

D11 implementation closure requires:

- D11 proposal/design/spec/tasks/ledgers agree.
- `review-disposition-ledger.md` has no unresolved P1/P2 finding.
- strict and full OpenSpec validation pass on the implementation diff.
- shortcut scan has no active fallback/dual-path/Turbo/app-supervisor target.
- running process proof shows Nx-owned daemon/frontend, no `devLive.ts`, and
  no daemon `bun --watch`.
- live Play/SaveDeploy proof is either run or consumed by a downstream proof
  record; D12 consumed this with a live state-machine pass through the D11 Nx
  Studio runner.
- Graphite/worktree state is clean after commit.

## Next Action

D11's live operation proof handoff is closed by D12 proof consumption. Future
work should not reopen D11 unless Nx dev topology or Play/SaveDeploy behavior
changes.
