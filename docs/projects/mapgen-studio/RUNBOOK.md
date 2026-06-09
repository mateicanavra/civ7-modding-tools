# RUNBOOK: Mapgen Studio (Local Dev + Build Smoke)

## Local Dev
Recommended (root):
```bash
bun run dev:mapgen-studio
```

Notes:
- The dev server is persistent. If port `5173` is busy, Vite will pick another port (e.g. `5174`) and print the Local URL.
- Studio relies on workspace package builds and `mod-swooper-maps` studio recipe artifacts. The root Turbo entrypoint builds those prerequisites before Vite starts.

Direct package-local execution is a leaf command, not the blessed freshness path:
```bash
bun run --cwd apps/mapgen-studio dev
```
Use it only after the root Turbo graph has prepared dependencies.

## Build Smoke
Via Turbo:
```bash
bunx turbo run build --filter=mapgen-studio
```

Whole repo:
```bash
bun run build
```

## Common Failure Modes
- `Rollup failed to resolve import "mod-swooper-maps/recipes/standard-artifacts"`:
  - The `mod-swooper-maps` studio recipe artifacts were not built.
  - Fix: rerun the root Turbo build for Studio:
    - `bunx turbo run build --filter=mapgen-studio`
  - For direct package-local debugging only, build the recipe artifacts explicitly first:
    - `bunx turbo run build:studio-recipes --filter=mod-swooper-maps`

## Save/Deploy And Run In Game
Studio deploy operations use the root Turbo graph:
```bash
bunx turbo run deploy:studio --filter=mod-swooper-maps
```

The `mod-swooper-maps` package-local `deploy` and `deploy:studio` scripts are
leaf deploy commands. They assume Turbo has already built the mod package and
the Civ7 CLI.
