# D0 Phase Record - Runtime One Mount Baseline Packet

Status: packet accepted
Date: 2026-06-14
Domino: D0
OpenSpec change: `mapgen-studio-runtime-one-mount`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D0 establishes the implementation base that all later Studio runtime Effect-refactor packets stand on. It does not reopen the one-mount implementation. It classifies the already completed one `/rpc` change, proves the local toolchain and build baseline, records active OpenSpec/Graphite/worktree state, and routes later dev-tooling assumptions to the correct owner.

Operational goal: make the packet train honest about its starting point so D1-D12 do not smuggle stale transport, stale dev orchestration, or unclassified branch state into their specifications. A pre-Nx checkout is not an implementation lane for the final runtime train; it is either an authoring convenience that must be restacked before acceptance or a blocker that routes the packet branch to the accepted migrated baseline.

## Authority

- Direct user instruction on 2026-06-14: create reviewed, accepted OpenSpec workstream packets D0-D12 from the runtime refactor frame.
- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`.
- `docs/projects/studio-runtime-simplification/PLAN.md`, especially S1.1 and S1.1a.
- `openspec/changes/mapgen-studio-runtime-one-mount/`.
- `openspec/config.yaml`.
- Root `AGENTS.md`. Its tooling-default line is Turbo-era on this authoring branch; it is historical baseline evidence and does not override the accepted Nx/Habitat implementation baseline required by this packet train.
- `civ7-open-spec-workstream`, `civ7-systematic-workstream`, `testing-design`, `system-design`, `solution-design`, `typescript`, `graphite`, and `git-worktrees` skills.

## Scope

In scope:

- Treat `mapgen-studio-runtime-one-mount` as the accepted transport baseline.
- Add a workstream packet around the completed OpenSpec change.
- Record current toolchain, dependency, build, OpenSpec, Git, Graphite, and worktree evidence.
- Classify the current dev-orchestrator baseline as pre-Nx unless the Nx scout proves the packet branch should restack.
- Record pre-Nx state as a stop/reroute condition when it affects packet gates.
- Make D11 assume the accepted Nx/Habitat baseline and own removal of remaining Studio app-local supervision.

Out of scope:

- Re-implementing one-mount transport.
- Changing runtime code.
- Accepting Turbo-era dev orchestration as a final target.
- Creating new worktrees.

## Owners And Forbidden Owners

Owners:

- `@civ7/studio-server` owns the unified `/rpc` runtime contract and handler baseline.
- `apps/mapgen-studio` owns the host daemon/frontend composition baseline.
- D11 `mapgen-studio-nx-dev-runner` owns final Studio dev-runner cleanup on top of the accepted Nx/Habitat baseline.
- Future implementation slices own their own code changes; D0 only classifies.

Forbidden owners:

- Browser code must not reintroduce satellite oRPC clients or mount constants.
- App-local dev scripts must not become the final owner of process supervision after D11.
- D0 must not encode a compatibility path for retired mounts.

## Baseline Evidence

Commands run on 2026-06-14 from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`:

| Command | Result | What it proves |
| --- | --- | --- |
| `git status --short --branch` | clean branch before edits, then clean after generated build churn was reverted | Packet branch starts with no foreign dirty files. |
| `bun install --frozen-lockfile` | passed | Repo-local dependencies are installed without lockfile mutation. |
| `bun run build` | passed | Current pre-Nx/Turbo baseline builds before packet authoring. |
| `bun run openspec -- list` | passed after dependency install | OpenSpec CLI is available from repo-local dependencies. |
| `bun run openspec -- validate mapgen-studio-runtime-one-mount --strict` | passed | Existing one-mount OpenSpec artifact shape is valid. |
| `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts` | passed: 2 files, 10 tests | One `/rpc` routing, retired-mount 404 behavior, namespace collision guard, session injection, and recipe-DAG typed error baseline are pinned by focused tests. |
| retired satellite module `find` negative search | no output | Deleted satellite client/path modules are absent from app source. |
| retired path/symbol `rg` search | only comments and retired-path 404 tests | Active code has no satellite clients/path constants; remaining retired mount strings are explanatory comments or tests that assert 404. |
| `git worktree list` | listed current packet worktree plus Habitat worktrees | Current branch is checked out only in the packet worktree. |
| `gt status` | this installed Graphite command falls through to `git status`; it reported the current packet doc edits and no unrelated dirty files | Graphite status command was run; local branch cleanliness is represented by Git status output in this CLI. |
| `gt log --no-interactive` | packet branch stacked above `codex/runtime-effect-refactor-frame` | Packet work is in the intended Graphite stack. |

Build side effect:

- `bun run build` rewrote `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`.
- That generated output is not part of this packet and was reverted to keep the repo clean.
- `git status --short --branch` after focused tests shows only D0 packet docs.

## Dev-Orchestrator Classification

Current packet branch baseline:

- No `nx.json` or `apps/mapgen-studio/project.json` is present on this branch at D0 packet draft time.
- Root `package.json` still uses Turbo-era scripts such as `turbo run build` and `turbo run dev --filter=mapgen-studio`.
- Therefore D0 classifies this branch as pre-Nx for packet-authoring purposes only. This is not an accepted implementation base for runtime packets whose gates depend on Nx/Habitat behavior.

Open scout lane:

- Scout evidence is recorded in `nx-habitat-scout-report.md`.
- The runtime packet branch should not restack onto the Habitat migration tail now because the H4+ Biome/Grit portion is stale relative to current runtime history.
- H1-H3 Nx facts and H4+ Biome/Grit facts are pulled forward as expected migrated-baseline facts. When those baseline changes are accepted/drained, D0/D11 packets use their native commands directly.
- If the packet branch remains on this base for packet authoring, D0 records execution of Nx/Habitat-dependent packets as blocked until the accepted migrated baseline is selected. Later packets may cite current Turbo commands only as historical baseline evidence, never as executable guidance for implementation.

## Stop Conditions

D0 cannot be accepted if:

- One-mount validation fails.
- The packet branch has unexplained dirty files.
- The Nx/Biome/GritQL scout identifies a better accepted implementation base and this packet has not been repaired to account for it.
- The selected implementation base is still pre-Nx for a packet that requires Nx/Habitat dev/process gates.
- Any review lane finds a P1/P2 classification gap that would mislead D1-D12.

## Downstream Effects

D1 depends on D0 for the stable `/rpc` proof and selected baseline toolchain.

D11 depends on D0 for the dev-orchestrator classification:

- D11 proves and tightens the existing accepted Nx shape instead of re-migrating it.
- If no accepted Nx/Habitat baseline is selected, D11 cannot close as implementation-ready.

All packets depend on D0 for worktree/dependency/build entrance discipline.

## Acceptance

D0 packet accepted on 2026-06-14 after:

- Architecture/baseline readiness and OpenSpec mechanics review accepted with no remaining P1/P2.
- Testing/adversarial review accepted with no remaining P1/P2.
- `bun run openspec -- validate mapgen-studio-runtime-one-mount --strict` passed.
- `bun run openspec:validate` passed, 147 items.
- `git diff --check` passed.

D1 may start. D1 must consume the D0 decision that this packet branch is an authoring base only for Nx-dependent gates, while implementation execution waits for the accepted migrated Nx/Habitat baseline.
