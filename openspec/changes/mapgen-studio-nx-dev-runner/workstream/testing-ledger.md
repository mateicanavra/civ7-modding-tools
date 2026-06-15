# D11 Testing Ledger - Studio Nx Dev Runner

Status: packet accepted; implementation pending
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Packet/spec | OpenSpec strict + full validation | proposal/design/spec/tasks agree and no stale app-supervisor target remains |
| Baseline | install/build/check plus Nx/Habitat commands | implementation base is accepted Nx/Habitat, not pre-Nx |
| Target graph | Nx metadata/graph proof | frontend dev depends on continuous backend serve and generated/build prerequisites are modeled |
| Script deletion | source diff + negative search | root/app scripts no longer route through Turbo/devLive/Bun watcher |
| Process tree | `ps` while dev is active | one Nx-owned backend, one Nx-owned frontend, no `devLive.ts`, no daemon `bun --watch` |
| Vite proxy | config/test proof | `/rpc` proxy targets backend without owning backend lifecycle |
| Play under dev | live API samples | accepted/deploy-entered/deploy-exited/terminal samples keep stable `serverInstanceId` for the same operation |
| Save&Deploy under dev | live API samples | accepted/deploy-entered/deploy-exited/terminal samples keep stable `serverInstanceId` through deploy/build and terminal state |
| D1 regression | import/write isolation proof | deploy writes still do not touch daemon import graph |

## Future Implementation Commands

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
