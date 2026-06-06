## Why

MapGen Studio writes `studio-current.config.json` as a live-run config for ad
hoc launches. That file is not a shipped map preset. During a Studio restart,
the standard recipe artifact generator still scanned every `*.config.json`
under `src/maps/configs`, so a stale live-run config with retired authoring keys
caused `dev:mapgen-studio` to fail before Vite could start.

## Target Authority Refs

- Root `AGENTS.md`: leave the repo clean, keep generated/runtime artifacts out
  of source control, and regenerate generated outputs through scripts.
- `mods/mod-swooper-maps/AGENTS.md`: shipped map configs are canonical source;
  generated `mod/` outputs are regenerated, not hand-edited.
- `openspec/changes/swooper-world-balance-recovery/`: current recovery stack
  makes `studio-current` transient and keeps the shipped Swooper configs as the
  preset/build input.

## What Changes

- Treat `studio-current.config.json` as transient in the Studio recipe artifact
  validator, matching the map artifact generator behavior.
- Ignore the live-run config in Git so ordinary Studio launches do not leave the
  repo dirty.
- Preserve shipped config validation for the four canonical Swooper map
  configs.

## Forbidden Non-Goals

- Do not migrate, preserve, or ship stale `studio-current` contents.
- Do not add a legacy config fallback or hand-edit generated artifacts.
- Do not weaken validation for shipped map configs.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps gen:studio-recipes-types`
- `bun run --cwd mods/mod-swooper-maps gen:maps`
- `bun test apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`
- Studio dev server starts at `http://127.0.0.1:5174/` with the transient file
  present.
