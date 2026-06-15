# Nx/Habitat Scout Report For D0

Date: 2026-06-14
Status: accepted as D0 baseline evidence; not an implementation base by itself

## Recommendation

Do not restack the runtime packet branch onto the Habitat migration tail now.

Use this packet branch for OpenSpec packet authoring, but write D0-D12 so implementation gates are forward-only against the accepted migrated Nx/Habitat baseline. If an implementation packet depends on Nx/Habitat behavior and that baseline is not selected or drained, the packet waits or restacks after the Habitat stack is accepted.

## Stack Evidence

Runtime packet branch:

- `main` at `04c724d04`
- `codex/runtime-effect-refactor-frame` at `b7e2121e`
- `codex/runtime-effect-openspec-packets` stacked above the frame branch

Habitat migrated stack evidence:

- Current-main restacked portion:
  - `agent-F-habitat-harness-workstream` at `259241d1e`
  - `agent-F-habitat-nx-adoption` at `a0703cb1e`
  - `agent-F-habitat-harness-scaffold` at `5c2ee7c9c`
  - `agent-F-habitat-boundary-tags` at `2b849d67d`
- Older/stale tail with additional Biome/Grit/generator work:
  - `agent-F-habitat-biome-hygiene` top `d646640d0`, marked needs restack
  - `agent-F-habitat-grit-catalog` at `8b2a4d0b8`
  - `agent-F-habitat-enforcement-consolidation` at `fe03dcbb0`
  - `agent-F-habitat-git-hooks` at `9c20ffd99`
  - `agent-F-habitat-generators-migrations` at `208bb4086`

Important ancestry finding:

- `agent-F-habitat-generators-migrations` is not based on current `main`; its merge-base is `331534895`, the earlier runtime-one-mount frame line.
- Restacking from the stale H4+ tail would risk replaying old runtime history over current `main`.

## Migrated Baseline Facts To Pull Forward

Root scripts on the migrated baseline use Nx/Habitat:

- `build`: `nx run-many -t build`
- `check-types`: `nx run-many -t check`
- `test`: `nx run-many -t test`
- `dev:mapgen-studio`: `nx run mapgen-studio:dev`
- `openspec`: `openspec`
- `openspec:validate`: `openspec validate --all --strict`
- Biome scripts exist for format/check/CI.

`mapgen-studio` facts:

- Nx-inferred `dev`, `build`, `check`, and `test` targets exist on the migrated baseline.
- `mapgen-studio:dev` is continuous and depends on `mod-swooper-maps:build:studio-recipes`.
- D11 remains real work because the app still has `dev`, `dev:frontend`, and `dev:server` package scripts and the `devLive.ts` supervisor shape.

Biome/Grit facts:

- Biome baseline adds `biome.json`, exact `@biomejs/biome` `2.4.16`, a Habitat `biome-ci` rule, inferred `biome:*` targets, and CI `bun run biome:ci`.
- Grit baseline adds `.grit/patterns/habitat/**`, `@getgrit/cli`, `habitat check --tool grit-check`, and Nx `@internal/habitat-harness:grit:check`.
- Runtime packets consume these gates when `habitat classify` or Nx affected analysis says they apply. Runtime packets do not author Habitat enforcement rules or expand Biome/Grit baselines.

Turbo evidence:

- Turbo is retired as an active command path in the migrated H1/H8 evidence.
- Residual Turbo text should be treated as historical comments, old docs, or type-test fixture names unless a packet intentionally preserves it as historical evidence.

## Command Policy For Migrated Baseline

Entrance gate for any new or restacked official worktree:

```bash
git status --short --branch
gt status
bun install --frozen-lockfile
bun run build
bun run check
```

D0 migrated-baseline proof:

```bash
bun run openspec -- list
bun run openspec -- validate mapgen-studio-runtime-one-mount --strict
bun run nx show project mapgen-studio --json
bun run nx run mapgen-studio:check --outputStyle=static
gt log --no-interactive --stack
```

D11 migrated-baseline proof:

```bash
bun run openspec -- validate mapgen-studio-nx-dev-runner --strict
bun run nx show project mapgen-studio --json
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:build --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:dev --outputStyle=stream
```

D11 process proof while dev is running:

```bash
ps -axo pid,ppid,command | rg 'nx|mapgen-studio|daemon|vite|devLive|bun --watch'
```

D11 negative search:

```bash
rg -n 'devLive\.ts|"dev": "bun src/server/daemon/devLive\.ts"|bun --watch|turbo run dev|bunx turbo|bun x turbo' apps/mapgen-studio package.json docs openspec
```

## Worktree Policy

- New worktrees use `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-<id>-...`.
- New writable worktree entrance includes dependency install before validation results are trusted.
- `scripts/graphite-import-worktree.sh` is relevant after a clean branch is already checked out; it is not a substitute for official worktree creation.
