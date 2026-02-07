# RUNBOOK: Mapgen Studio (Local Dev + Build Smoke)

## Local Dev
Recommended (root):
```bash
bun run dev:mapgen-studio
```

Notes:
- The dev server is persistent. If port `5173` is busy, Vite will pick another port (e.g. `5174`) and print the Local URL.
- Studio relies on `mod-swooper-maps` studio recipe artifacts. Preflight now ensures they exist when running Studio directly.

Direct (from app):
```bash
bun run --cwd apps/mapgen-studio dev
```

## Build Smoke
Standalone:
```bash
bun run --cwd apps/mapgen-studio build
```

Via Turbo (also ensures recipe artifacts build dependencies):
```bash
bun run build
```

## Common Failure Modes
- `Rollup failed to resolve import "mod-swooper-maps/recipes/standard-artifacts"`:
  - The `mod-swooper-maps` studio recipe artifacts were not built.
  - Fix: rerun `bun run --cwd apps/mapgen-studio build` (preflight should self-heal), or run:
    - `bun run --cwd mods/mod-swooper-maps build:studio-recipes`

