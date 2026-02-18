# Agent RS2 — Fix `dev:mapgen-studio` crash (`artifact.id` undefined)

## Mission
Fix the crash in `bun run dev:mapgen-studio` where `defineStep` throws:
- `TypeError: undefined is not an object (evaluating 'artifact.id')`
- Source runtime path: `packages/mapgen-core/dist/authoring/index.js` (`def.artifacts?.requires?.map((artifact) => artifact.id)`)

## Scope
- Investigate in this worktree only:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack`
- Root cause likely in a step `artifacts.requires` list containing `undefined` artifact refs (or equivalent malformed values) during standard recipe import.

## Required process
1. Reproduce with:
   - `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
2. Find offending step/contract artifact reference(s).
3. Implement the minimal architecture-correct fix in source (not dist).
4. Re-run reproduction command and confirm pass.
5. Run targeted guard tests if touched areas warrant.

## Constraints
- Absolute paths in notes.
- No rebase/reset.
- Keep fix local and minimal.
- Update this scratch file append-only with:
  - root cause
  - files changed
  - commands run + outcomes

## Deliverable
- Crash fixed and verified.
- Concise change summary and residual risks.

## Proposed target
`bun run dev:mapgen-studio` no longer fails in `build:studio-recipes` due to undefined artifact refs.

## Changes landed
- Pending.

## Open risks
- Pending.

## Decision asks
- none

## 2026-02-15 RS2 startup checkpoint
- Worker: RS2 crash-fix
- Worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack
- Repo root: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack
- Branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
- Initial status (`git status --short`):
  - ?? docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RS2-mapgen-studio-dev-crash-fix.md

## 2026-02-15 RS2 investigation + fix
- Reproduced crash with:
  - `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps build:studio-recipes`
- Observed failure:
  - `TypeError: undefined is not an object (evaluating 'artifact.id')`
  - callsite in built recipe points to placement step contract requiring `hydrologyHydrographyArtifacts.lakePlan`.
- Root cause:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts` referenced removed/nonexistent artifact key `hydrologyHydrographyArtifacts.lakePlan`.
  - Current hydrology artifact registry exposes `engineProjectionLakes` (not `lakePlan`) in `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`.
  - This produced an `undefined` entry inside `artifacts.requires`, causing `defineStep` to crash while mapping `artifact.id`.
- Fix applied:
  - Updated contract requires entry to `hydrologyHydrographyArtifacts.engineProjectionLakes`.
  - Updated runtime dependency access in step impl from `deps.artifacts.lakePlan.read(context)` to `deps.artifacts.engineProjectionLakes.read(context)`.
- Verification rerun (`build:studio-recipes`):
  - no longer fails with `artifact.id` TypeError.
  - now fails later with unrelated preset validation errors (unknown keys in earthlike preset), indicating the original crash path is fixed.

## 2026-02-15 RS2 follow-up: preset-schema blocker
- Context: after fixing `artifact.id` crash, `build:studio-recipes` failed with preset-schema unknown keys in `src/presets/standard/earthlike.json`.
- Root mismatch identified:
  - `foundation.version` and `foundation.profiles` are no longer part of stage surface schema (`foundation` accepts `knobs` + step configs).
  - Ecology plan step op strategies (`planIce`, `planReefs`, `planWetlands`, `planVegetation`) now use empty strategy config schemas, so `minScore01` is invalid.
  - `map-ecology` surface uses step ids (`plot-biomes`, `features-apply`, `plot-effects`), not legacy `biomes` / `featuresApply` / `plotEffects` keys.
- Source fix applied in:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps/src/presets/standard/earthlike.json`
- Changes:
  - Removed `foundation.version` + `foundation.profiles`.
  - Replaced `minScore01` configs with `{}` for `planIce`, `planReefs`, `planWetlands`, `planVegetation`.
  - Renamed `map-ecology` config keys to `plot-biomes`, `features-apply`, `plot-effects`.
- Verification:
  - `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/mods/mod-swooper-maps build:studio-recipes` => PASS.
  - `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack dev:mapgen-studio` => startup PASS; reaches Vite ready (`http://localhost:5173/`); manually interrupted with Ctrl+C afterward.
