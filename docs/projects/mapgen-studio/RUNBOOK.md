# RUNBOOK: Mapgen Studio (Local Dev + Build Smoke)

## Local Dev
Recommended (root):
```bash
nx run mapgen-studio:dev
```

Notes:
- The dev server is persistent. If port `5173` is busy, Vite will pick another port (e.g. `5174`) and print the Local URL.
- Studio relies on workspace package builds and `mod-swooper-maps` studio recipe artifacts. The root Nx target builds those prerequisites before Vite starts.

Direct package-local execution is a leaf command, not the blessed freshness path:
```bash
bun run --cwd apps/mapgen-studio dev
```
Use it only after the root Nx graph has prepared dependencies.

## Build Smoke
Via Nx:
```bash
bun run nx run mapgen-studio:build:vite
```

Whole repo:
```bash
bun run build
```

## Common Failure Modes
- `Rollup failed to resolve import "mod-swooper-maps/recipes/standard-artifacts"`:
  - The `mod-swooper-maps` studio recipe artifacts were not built.
  - Fix: rerun the root Nx build for Studio:
    - `bun run nx run mapgen-studio:build:vite`
  - For direct package-local debugging only, build the recipe artifacts explicitly first:
    - `bun run nx run mod-swooper-maps:build:studio-recipes`

## Save/Deploy And Run In Game
Studio Save/Deploy and Run In Game first rebuild the Swooper Maps package through
the root Nx graph:
```bash
bun run nx run mod-swooper-maps:build
```

After the build completes, the Studio server installs the built mod with
`@civ7/plugin-mods.deployMod(...)`. The `mod-swooper-maps` package-local
`deploy` script remains a manual leaf command and is not the Studio lifecycle
path.
