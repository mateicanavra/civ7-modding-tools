# Recipe schema/defaults/preset remediation (PR #1055)

## Goal

Ensure Studio’s boot-time recipe config defaults match the designed authored preset (`swooper-earthlike`) while keeping Studio fully recipe-agnostic.

## Hard constraints (from orchestrator)

- Graphite-only workflow (NO `git rebase`).
- Must run `gt sync` before any changes.
- Avoid `as any`; preserve type inference / DX.
- Studio must remain agnostic (no recipe-specific overrides in app code for labels/schema).

## Skills consulted (mandatory list)

- graphite: `/Users/mateicanavra/.codex-rawr/skills/graphite/SKILL.md`
- git-worktrees: `/Users/mateicanavra/.codex-rawr/skills/git-worktrees/SKILL.md`
- bun: `/Users/mateicanavra/.codex-rawr/skills/bun/SKILL.md`
- turborepo: `/Users/mateicanavra/.codex-rawr/skills/turborepo/SKILL.md`
- vercel-react-best-practices: `/Users/mateicanavra/.codex-rawr/skills/vercel-react-best-practices/SKILL.md`
- vercel-composition-patterns: `/Users/mateicanavra/.codex-rawr/skills/vercel-composition-patterns/SKILL.md`
- vite (only if touching Studio build tooling): `/Users/mateicanavra/.codex-rawr/skills/vite/SKILL.md`
- web-workers (only if touching worker): `/Users/mateicanavra/.codex-rawr/skills/web-workers/SKILL.md`
- decision-logging (only if non-obvious packaging moves): `/Users/mateicanavra/.codex-rawr/skills/decision-logging/SKILL.md`

## Skill constraints I’m following

- Graphite-first branch/stack operations (use `gt`; no ad-hoc rebases/merges/force-pushes).
- If I change a mid-stack branch in a way that affects upstack diffs, restack/submit the stack via Graphite.
- Worktree safety: treat `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-recipe-json-schema-defaults-presets` as the source of truth for all edits.

## Breadcrumbs

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-recipe-json-schema-defaults-presets`
- Branch: `codex/recipe-json-schema-defaults-presets` (Graphite PR #1055)
- `gt log --stack --steps 2 --no-interactive` (2026-02-04):
  - Downstack: `codex/config-sync-presets` (PR #1050) → `codex/config-sync-maps` (PR #1049)
  - Upstack: none shown

## Decisions

### Keep remediation inside PR #1055 (no new stacked branch)
- **Context:** All fixes are direct follow-ups to the “schema/defaults + JSON preset” work; `gt log --stack` shows no upstack branches.
- **Options:** `gt modify` in-place vs create a new branch stacked above #1055.
- **Choice:** `gt modify --commit` on `codex/recipe-json-schema-defaults-presets`.
- **Rationale:** Minimizes review churn and keeps the “defaults/preset” story in one PR. No upstack → no reviewer benefit from splitting.
- **Risk:** Slightly larger diff in #1055, but still tightly scoped.

### Centralize `$schema` stripping in mapgen-core authoring
- **Context:** Same root-only helper was duplicated in Studio, mod runtime, tests, and build scripts.
- **Options:** keep local helpers, move to Studio, move to mod, or move to core/authoring.
- **Choice:** add `stripSchemaMetadataRoot` to `@swooper/mapgen-core/authoring`.
- **Rationale:** “Authoring boundary” is the shared contract; keeps Studio recipe-agnostic while preventing drift.
- **Risk:** Requires core build before scripts that import it (handled by `bun run build` / package build order).

## Diffs found (greenfield vs current)

### 1) Where should `$schema` stripping live?

Greenfield: in the authoring/SDK boundary so every consumer (Studio, map presets, tests, scripts) shares one implementation.

Current duplicates:
- Studio: `apps/mapgen-studio/src/recipes/sanitizeConfigRoot.ts`
- Map preset: `mods/mod-swooper-maps/src/maps/swooper-earthlike.ts`
- Dev viz runner: `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
- Map config validation test: `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`
- Artifacts generator: `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` (`stripSchemaMetadata`)

Expected target home:
- `packages/mapgen-core/src/authoring/*` and exported from `packages/mapgen-core/src/authoring/index.ts` (consumed as `@swooper/mapgen-core/authoring`).

### 2) Are there recipe-specific overrides in Studio?

No recipe-specific schema/label overrides found in app code:
- Schema/default config come from recipe artifacts: `apps/mapgen-studio/src/recipes/catalog.ts`
- Stage/step labels come from build-time `uiMeta` on artifacts, not hardcoded in Studio: `apps/mapgen-studio/src/recipes/catalog.ts`

Potential stale artifact:
- `apps/mapgen-studio/src/ui/data/defaultConfig.ts` is a hard-coded “default pipeline config” but appears unused (no imports found via ripgrep). Treat as legacy/dead code unless proven otherwise.

### 3) Does Studio boot default config equal the designed map config (`swooper-earthlike`)?

No.

- Authored config: `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` (e.g. `plateCount: 28`, etc.)
- Studio default config is sourced from generated artifacts: `mod-swooper-maps/recipes/standard-artifacts` → `mods/mod-swooper-maps/dist/recipes/standard-artifacts.js`
- Those defaults are currently derived from a skeleton, not from `swooper-earthlike`:
  - Generator uses `buildDefaultsSkeleton(standardUiMeta)` then `normalizeStrict(...)`: `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts`
  - Resulting defaults show small “toy-ish” values (e.g. `plateCount: 8`): `mods/mod-swooper-maps/dist/recipes/standard-artifacts.js`

### 4) Which helpers should be consolidated behind SDK imports?

At minimum:
- Root-only schema metadata stripping helper (strip `$schema` / `$id` / `$comment`).

Optionally (if useful without widening surface too much):
- A shared `isPlainObject` helper (currently duplicated in Studio + scripts), but this is secondary.

## Changes made

### Core
- Added `stripSchemaMetadataRoot` export: `packages/mapgen-core/src/authoring/sanitize-config-root.ts`
- Re-exported from `packages/mapgen-core/src/authoring/index.ts`

### Studio
- Removed local strip helper (now uses SDK export):
  - deleted `apps/mapgen-studio/src/recipes/sanitizeConfigRoot.ts`
  - updated imports in `apps/mapgen-studio/src/App.tsx` and `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Added a regression test to pin defaults to earthlike posture:
  - `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`

### Swooper maps mod
- Generator now derives `STANDARD_RECIPE_CONFIG` from authored preset config instead of skeleton:
  - `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts`
- Replaced duplicate strip helpers with SDK import:
  - `mods/mod-swooper-maps/src/maps/swooper-earthlike.ts`
  - `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
  - `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`

## Commands run

- `gt sync`
- `gt log --stack --steps 2 --no-interactive`
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run build`
- `bun run check`
- `bun run lint`
- `bun run test:ci`

## Remaining questions / follow-ups

- None.
