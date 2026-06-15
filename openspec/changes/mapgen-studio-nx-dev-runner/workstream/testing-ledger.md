# D11 Testing Ledger - Studio Nx Dev Runner

Status: D11 implementation evidence committed at current branch tip; live Civ7
Play/SaveDeploy proof is not run or claimed.
Date: 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Packet/spec | OpenSpec strict + full validation | proposal/design/spec/tasks agree and no stale app-supervisor target remains |
| Baseline | install/build/check plus Nx/Habitat commands | implementation base is accepted Nx/Habitat, not pre-Nx |
| Target graph | Nx metadata/graph proof | user-facing frontend dev target depends on continuous backend serve and generated/build prerequisites are modeled on the daemon dependency chain |
| Script deletion | source diff + negative search | root/app scripts no longer route through Turbo/devLive/Bun watcher |
| Process tree | `ps` while dev is active | one Nx-owned backend, one Nx-owned frontend, no `devLive.ts`, no daemon `bun --watch` |
| Vite proxy | config/test proof | `/rpc` proxy targets backend without owning backend lifecycle |
| Play under dev | live API samples | accepted/deploy-entered/deploy-exited/terminal samples keep stable `serverInstanceId` for the same operation |
| Save&Deploy under dev | live API samples | accepted/deploy-entered/deploy-exited/terminal samples keep stable `serverInstanceId` through deploy/build and terminal state |
| D1 regression | import/write isolation proof | deploy writes still do not touch daemon import graph |

## Implementation Commands Run

```bash
git status --short --branch
gt log --stack
gt branch info codex/runtime-effect-live-game-watch
gt branch info codex/runtime-effect-nx-dev-runner
gt branch info codex/runtime-effect-game-door-invariant
bun install --frozen-lockfile
bun run nx --version
bun run nx show project mapgen-studio --json
bun run habitat classify /tmp/d11-nx-dev-runner.diff
bun run --cwd apps/mapgen-studio test -- test/server/nxDevRunner.test.ts
bun run --cwd apps/mapgen-studio check
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:build --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run openspec -- validate mapgen-studio-nx-dev-runner --strict
bun run openspec:validate
bunx biome ci apps/mapgen-studio/package.json apps/mapgen-studio/vite.config.ts apps/mapgen-studio/test/server/nxDevRunner.test.ts .gitignore --colors=off
bun run habitat check --owner mapgen-studio
bun run nx run mapgen-studio:dev --outputStyle=stream
ps -axo pid,ppid,command | rg 'nx run mapgen-studio:dev|run-executor|src/server/daemon/daemon\.ts|node .*vite|devLive|bun --watch'
curl -sS http://127.0.0.1:5174/healthz
curl -sSI http://localhost:5173/
bun run lint
git diff --check
git status --short --branch
gt status
gt log --no-interactive
```

## Implementation Results

- `bun install --frozen-lockfile`: passed with no install changes.
- Repo-local Nx baseline: `bun run nx --version` reported local Nx `v22.7.5`.
- Pre-fix `bun run nx show project mapgen-studio --json`: proved
  `mapgen-studio:dev` still delegated to package `dev` with script content
  `bun src/server/daemon/devLive.ts`.
- Post-fix `bun run nx show project mapgen-studio --json`: proved
  `mapgen-studio:dev` is continuous, runs `dev:frontend`, depends on
  `serve-daemon`, and has no `dev-frontend` orphan target; `serve-daemon` is
  continuous, runs `dev:server`, and depends on `mod-swooper-maps`
  `build:studio-recipes`.
- Focused topology test `test/server/nxDevRunner.test.ts`: passed.
- `bun run --cwd apps/mapgen-studio check`: passed.
- `bun run nx run mapgen-studio:check --outputStyle=static`: passed.
- `bun run nx run mapgen-studio:build --outputStyle=static`: passed.
- `bun run nx run mapgen-studio:test --outputStyle=static`: passed.
- `bun run openspec -- validate mapgen-studio-nx-dev-runner --strict`: passed.
- `bun run openspec:validate`: passed, 186 passed / 0 failed.
- D11 write-set Biome check: passed.
- `bun run habitat check --owner mapgen-studio`: passed.
- Running `bun run nx run mapgen-studio:dev --outputStyle=stream`: started
  `mapgen-studio:serve-daemon` and `mapgen-studio:dev` through Nx.
- Process proof while dev target was active: one Nx runner, two Nx
  `run-executor` children, one Vite process, and one
  `bun src/server/daemon/daemon.ts` process. No process command contained
  `devLive.ts` or `bun --watch`.
- Backend proof: `curl http://127.0.0.1:5174/healthz` returned `ok: true`,
  `runtimeMode: "studio-daemon-effect-orpc"`, and server identity
  `studio-server-mqfnojkq-1gwf-1`.
- Frontend proof: `curl -I http://localhost:5173/` returned HTTP 200.
- Transient proof-run artifacts: `studio-current.config.json` and
  `studio-current.ts` are classified as transient Studio live-run/generated
  output and ignored; saved authoring configs remain tracked.
- `bun run lint`: non-green. D11 write-set Biome and `mapgen-studio`
  Habitat checks passed, but graph-owned lint failed on non-D11 lower-stack
  hygiene:
  - `mod-swooper-maps:habitat:check` failed `normalization-guardrails`;
  - `@internal/habitat-harness:habitat:check` failed `biome-ci` on existing
    runtime-stack formatting/import-order residue outside the D11 write set.
  This is stack-owned hygiene debt that must be repaired before final stack
  closure; D11 does not claim root lint green.
- `git diff --check`: passed.
- `git status --short --branch`: showed only the bounded D11 implementation
  diff before commit.
- `gt status`: in this local CLI printed "Passing command through to git..."
  and returned the same bounded dirty state as `git status`.
- `gt log --no-interactive`: rendered Graphite branch state; `gt log --stack`
  and `gt branch info codex/runtime-effect-nx-dev-runner` prove the D11 branch
  is parented to `codex/runtime-effect-live-game-watch`.

## Negative Search Results

Active app/runtime source no longer contains the removed supervisor surface:

```bash
rg -n 'makeDevLivePlan|parseDevLiveArgs|runDevLive|waitForDaemonReadiness|devLive' apps/mapgen-studio/src apps/mapgen-studio/test -S
```

Result: only `nxDevRunner.test.ts` negative-guard literals remain.

`rg -n 'dev-frontend' apps/mapgen-studio openspec/changes/mapgen-studio-nx-dev-runner docs/projects/studio-runtime-simplification -S`
now returns only historical/review disposition text after the D11 repair; the
active target graph has no orphan `dev-frontend` target.

## Not-Green Live Proof

Live Civ7 Play and Save&Deploy identity proof was not run. D11 records this in
`workstream/next-packet.md`; D11 must not be claimed live product-green.

## Reference Commands For Re-Entry

```bash
bun install --frozen-lockfile
bun run build
bun run check
bun run nx --version
bun run nx show project mapgen-studio --json
bun run habitat classify <path-or-diff>
bun run openspec -- validate mapgen-studio-nx-dev-runner --strict
bun run openspec:validate
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:build --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:dev --outputStyle=stream
ps -axo pid,ppid,command | rg 'nx|mapgen-studio|daemon|vite|devLive|bun --watch'
rg -n 'devLive\\.ts|"dev": "bun src/server/daemon/devLive\\.ts"|bun --watch|turbo run dev --filter=mapgen-studio|bunx turbo|bun x turbo' package.json apps/mapgen-studio docs openspec -S
git diff --check
git status --short --branch
gt status
gt log --no-interactive
```

The implementation may use a more exact Nx graph command if available on the
accepted baseline. Record the exact command and output summary in the phase
record before closure.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Nx metadata proves task graph semantics.
- Process proof proves active dev topology.
- Negative searches prove deleted command paths.
- Live operation proof proves the dev topology preserves runtime identity.
- Deployment-only command residue must be classified separately; it is not
  evidence for or against local dev process topology unless it appears in active
  dev scripts/specs.
- If live Civ7 proof is unavailable, D11 implementation writes
  `workstream/next-packet.md` and remains not-green for live operation behavior.
