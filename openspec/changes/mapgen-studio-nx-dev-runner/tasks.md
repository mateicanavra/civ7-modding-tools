## 1. Baseline And Target Discovery

- [x] 1.1 Enter a worktree based on the accepted Nx/Habitat implementation
      baseline and run `bun install --frozen-lockfile`.
- [x] 1.2 Prove repo-local Nx is available with `bun run nx --version`.
- [x] 1.3 Inspect `bun run nx show project mapgen-studio --json`.
- [x] 1.4 Run `bun run habitat classify <path-or-diff>` for the D11 write set
      and record reported Habitat/Nx/Biome/GritQL gates.
- [x] 1.5 Identify current root/app dev scripts, daemon entrypoints, Vite
      proxy, generated/build prerequisites, and process supervision code.

## 2. Nx Target Topology

- [x] 2.1 Define or repair a continuous backend daemon serve target.
- [x] 2.2 Define or repair a frontend Vite dev target.
- [x] 2.3 Define or repair the user-facing `mapgen-studio:dev` target so it
      depends on backend serve and runs frontend dev.
- [x] 2.4 Model Studio generated/build prerequisites through Nx target
      dependencies or workspace-watch ownership.
- [x] 2.5 Add target/graph proof that the dependency topology is visible in Nx
      metadata.

## 3. Delete App-Local Supervision

- [x] 3.1 Keep root `dev:mapgen-studio` as the user-facing entrypoint and
      route the package script through repo-local `nx run mapgen-studio:dev`.
- [x] 3.2 Remove app `dev` routing through `src/server/daemon/devLive.ts`.
- [x] 3.3 Delete `devLive.ts` and delete or rewrite `devLivePlan` tests around
      Nx target/process proof.
- [x] 3.4 Remove `bun --watch` from active app daemon dev scripts.
- [x] 3.5 Preserve Vite `/rpc` proxy behavior without making Vite the backend
      lifecycle owner.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-nx-dev-runner --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 Baseline build/check gates on the accepted Nx/Habitat worktree.
- [x] 4.4 Nx project/target graph proof for backend continuous serve and
      frontend dependency.
- [x] 4.5 Process proof while `bun run dev:mapgen-studio` / `nx run mapgen-studio:dev` is active:
      one backend, one frontend, no `devLive.ts`, no daemon `bun --watch`.
- [x] 4.6 Negative search for active Turbo dev routes, app-local supervisor
      routes, and daemon Bun watcher routes.
- [x] 4.7 Play live proof under Nx dev with accepted/deploy-entered/
      deploy-exited/terminal samples, stable `serverInstanceId`, operation id,
      branch, commit, command/API path, timestamps, and log pointers.
- [x] 4.8 Save&Deploy live proof under Nx dev with accepted/deploy-entered/
      deploy-exited/terminal samples, stable `serverInstanceId`, operation id,
      branch, commit, command/API path, timestamps, log pointers, and D1
      deploy/write isolation still true.
- [x] 4.9 If live Civ7 is unavailable, write `workstream/next-packet.md` and
      leave D11 not-green for live operation behavior.
- [x] 4.10 Package/app gates reported by Habitat classify.
- [x] 4.11 `git diff --check`, `git status --short --branch`, `gt status`, and
      `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Review findings dispositioned with no unresolved P1/P2.
- [x] 5.2 Downstream realignment recorded for D12 final game-door invariant and
      residue closeout.
- [x] 5.3 No pre-Nx, Turbo, app-supervisor, or daemon watcher path remains in
      active runtime dev docs/specs/scripts.
- [x] 5.4 Graphite branch is committed cleanly without unrelated staged files;
      closure records refer to the current branch tip so later message-only
      amends do not stale the packet evidence.

Live-proof reconciliation note, 2026-06-16:

- D12 later ran the live state-machine pass through the D11 Nx Studio runner.
  The D12 testing and final-proof ledgers record the Nx Studio frontend/daemon
  ports, stable daemon identity, invalid Run in Game rejection before
  operation admission, disposable Run in Game terminal `complete` through
  `studio.events.watch`, keyed status, and current projection, plus
  Save&Deploy terminal `complete` through the same event/status/current shape.
- D12 also recorded root graph gates selected by Habitat classify. This closes
  D11's live operation proof and Habitat-classify handoff as a downstream
  proof-consumption record, without claiming new D11 runtime behavior.
