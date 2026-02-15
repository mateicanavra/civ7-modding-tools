# Worker A Replan — Placement Runtime Constant/Core-Data Removal

Date: 2026-02-15
Branch: `codex/agent-A-placement-s1-runtime-hardening`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-A-placement-s1-runtime-hardening`

## Objective

Revise S1 so placement resource logic no longer discovers sentinel/candidate IDs from runtime engine globals/tables (`ResourceTypes`, `GameInfo.Resources`).

Target behavior:
1. `NO_RESOURCE` is adapter-owned static constant(s), not runtime lookup.
2. placeable resource ID catalog is adapter-owned static constant(s), not runtime lookup.
3. placement planning/application consumes adapter-provided static values.

## Current Runtime Discovery Callsites (to remove for this bug class)

1. `packages/civ7-adapter/src/civ7-adapter.ts:258`
   - `NO_RESOURCE` reads `globalThis.ResourceTypes.NO_RESOURCE`.
2. `packages/civ7-adapter/src/civ7-adapter.ts:305`
   - `getPlaceableResourceTypes()` scans `GameInfo.Resources` rows.

Supporting downstream plumbing introduced in S1:
1. `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts:63`
   - populates `noResourceSentinel` and `runtimeCandidateResourceTypes` from adapter.
2. `mods/mod-swooper-maps/src/domain/placement/ops/plan-resources/contract.ts:9`
   - op input includes `noResourceSentinel` + `runtimeCandidateResourceTypes`.
3. `mods/mod-swooper-maps/src/domain/placement/ops/plan-resources/strategies/default.ts:50`
   - strategy prefers runtime candidates over authored candidates.

## Static ID Source of Truth

### Sentinel
- Use `-1` as canonical `NO_RESOURCE` sentinel (already adapter fallback + mock default).

### Placeable resource IDs
Use official resources submodule row order in:
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources-v2.xml`
- load order from `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`:
  - `resources.xml` then `resources-v2.xml`
  - total 55 entries.

Canonical S1 placement catalog (0..54):
- 0 `RESOURCE_COTTON`
- 1 `RESOURCE_DATES`
- 2 `RESOURCE_DYES`
- 3 `RESOURCE_FISH`
- 4 `RESOURCE_GOLD`
- 5 `RESOURCE_GOLD_DISTANT_LANDS`
- 6 `RESOURCE_GYPSUM`
- 7 `RESOURCE_INCENSE`
- 8 `RESOURCE_IVORY`
- 9 `RESOURCE_JADE`
- 10 `RESOURCE_KAOLIN`
- 11 `RESOURCE_MARBLE`
- 12 `RESOURCE_PEARLS`
- 13 `RESOURCE_SILK`
- 14 `RESOURCE_SILVER`
- 15 `RESOURCE_SILVER_DISTANT_LANDS`
- 16 `RESOURCE_WINE`
- 17 `RESOURCE_CAMELS`
- 18 `RESOURCE_HIDES`
- 19 `RESOURCE_HORSES`
- 20 `RESOURCE_IRON`
- 21 `RESOURCE_SALT`
- 22 `RESOURCE_WOOL`
- 23 `RESOURCE_LAPIS_LAZULI`
- 24 `RESOURCE_COCOA`
- 25 `RESOURCE_FURS`
- 26 `RESOURCE_SPICES`
- 27 `RESOURCE_SUGAR`
- 28 `RESOURCE_TEA`
- 29 `RESOURCE_TRUFFLES`
- 30 `RESOURCE_NITER`
- 31 `RESOURCE_CLOVES`
- 32 `RESOURCE_WHALES`
- 33 `RESOURCE_COFFEE`
- 34 `RESOURCE_TOBACCO`
- 35 `RESOURCE_CITRUS`
- 36 `RESOURCE_COAL`
- 37 `RESOURCE_NICKEL`
- 38 `RESOURCE_OIL`
- 39 `RESOURCE_QUININE`
- 40 `RESOURCE_RUBBER`
- 41 `RESOURCE_MANGOS`
- 42 `RESOURCE_CLAY`
- 43 `RESOURCE_FLAX`
- 44 `RESOURCE_RUBIES`
- 45 `RESOURCE_RICE`
- 46 `RESOURCE_LIMESTONE`
- 47 `RESOURCE_TIN`
- 48 `RESOURCE_LLAMAS`
- 49 `RESOURCE_HARDWOOD`
- 50 `RESOURCE_WILD_GAME`
- 51 `RESOURCE_CRABS`
- 52 `RESOURCE_COWRIE`
- 53 `RESOURCE_TURTLES`
- 54 `RESOURCE_PITCH`

## Concrete Implementation Plan

### A branch (`codex/agent-A-placement-s1-runtime-hardening`) — code authority and behavior cutover

1. Add adapter-owned resource constants module.
   - New file: `packages/civ7-adapter/src/resource-constants.ts`
   - Exports:
     - `NO_RESOURCE = -1`
     - frozen placement catalog IDs (0..54) + optional name map comments from official resources.

2. Switch Civ7 adapter resource sentinel/catalog to static constants.
   - Edit `packages/civ7-adapter/src/civ7-adapter.ts`:
     - `get NO_RESOURCE()` returns static constant.
     - `getPlaceableResourceTypes()` returns static catalog clone.
     - Remove `ResourceTypes`/`GameInfo.Resources` usage for this behavior.

3. Unify mock adapter defaults with same constants.
   - Edit `packages/civ7-adapter/src/mock-adapter.ts`:
     - import shared constants, remove local duplicate `DEFAULT_NO_RESOURCE` + `DEFAULT_RESOURCE_TYPE_CATALOG` literals.

4. Update adapter public typing/docs to reflect static (adapter-owned) semantics.
   - Edit `packages/civ7-adapter/src/types.ts` docstrings:
     - replace “runtime-discovered” wording with adapter-owned static catalog wording.

5. Export constants for downstream consumers.
   - Edit `packages/civ7-adapter/src/index.ts` (and package exports only if a new subpath is needed).

6. Keep S1 placement fail-hard behavior intact.
   - No rollback of fail-hard placement apply semantics in `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`.

### B branch (`codex/agent-B-placement-s2-verification-docs`) — verification/docs alignment

B currently has tests/docs asserting “runtime-discovered candidates” semantics. Reword/re-target these after A cutover:

1. Tests:
   - `mods/mod-swooper-maps/test/placement/plan-ops.test.ts`
     - replace runtime wording and fixtures with adapter-static catalog terminology.
     - keep coverage for candidate sanitization and fallback behavior if still part of contract.
   - `mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts`
     - keep fail-hard assertions (still valid).

2. Docs:
   - `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
     - remove “runtime-discovered resource candidates” language.
     - document adapter-owned static resource catalog + fail-hard stamping posture.
   - `docs/system/mods/swooper-maps/architecture.md`
     - same terminology update.

3. Scratch handoff notes:
   - keep `SCRATCH-worker-B.md` aligned with post-cutover semantics (if reintroduced for handoff).

## Categorical Grep/Audit Matrix (must pass post-cutover)

Run from repo root (exclude generated outputs):

1. Runtime constant lookup audit (resource sentinel):

```bash
rg -n "ResourceTypes\\.NO_RESOURCE|globalThis\\.ResourceTypes|\\bResourceTypes\\b" \
  packages/civ7-adapter mods/mod-swooper-maps \
  --glob '!**/mod/**' --glob '!**/dist/**'
```

Expected for this bug class:
- no matches in adapter/placement source paths except allowed official-game snapshots under `.civ7/**` (out of scope).

2. Runtime core-data lookup audit (resource table discovery):

```bash
rg -n "GameInfo\\.Resources|getPlaceableResourceTypes\\(" \
  packages/civ7-adapter mods/mod-swooper-maps \
  --glob '!**/mod/**' --glob '!**/dist/**'
```

Expected:
- `GameInfo.Resources` no longer used for placement resource sentinel/catalog behavior.
- `getPlaceableResourceTypes` (if retained) resolves static constants only.

3. Contract-language drift audit (runtime phrasing):

```bash
rg -n "runtime-discovered|runtime candidate|runtimeCandidateResourceTypes" \
  docs/system mods/mod-swooper-maps/test mods/mod-swooper-maps/src \
  --glob '*.md' --glob '*.ts'
```

Expected:
- no stale docs/tests asserting runtime discovery for resource IDs in active placement contract.

## Test Plan (post-implementation)

### A branch required

1. `bun run --cwd mods/mod-swooper-maps test -- test/placement/plan-ops.test.ts`
2. `bun run --cwd mods/mod-swooper-maps test -- test/placement/placement-does-not-call-generate-snow.test.ts`
3. `bun run --cwd mods/mod-swooper-maps test -- test/placement/resources-landmass-region-restamp.test.ts`
4. `bun run --cwd mods/mod-swooper-maps test -- test/map-hydrology/lakes-area-recalc-resources.test.ts`
5. `bun run --cwd packages/civ7-adapter check`

### B branch required (after rebase onto A)

1. Re-run all placement tests above.
2. Re-run docs assertions via existing CI docs/lint lane (at minimum `bun run lint:mapgen-docs` from root).

## Planned File List

### A branch planned edits

1. `packages/civ7-adapter/src/resource-constants.ts` (new)
2. `packages/civ7-adapter/src/civ7-adapter.ts`
3. `packages/civ7-adapter/src/mock-adapter.ts`
4. `packages/civ7-adapter/src/types.ts`
5. `packages/civ7-adapter/src/index.ts`
6. `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts` (naming/docs cleanup only if needed to remove runtime wording)
7. `docs/projects/pipeline-realism/scratch/placement-remediation-2026-02-15/SCRATCH-worker-A-replan.md`

### B branch planned edits

1. `mods/mod-swooper-maps/test/placement/plan-ops.test.ts`
2. `mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts` (if wording/fixtures need sync)
3. `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
4. `docs/system/mods/swooper-maps/architecture.md`
5. `docs/projects/pipeline-realism/scratch/placement-remediation-2026-02-15/SCRATCH-worker-B.md` (if maintained)

## Risk Notes

1. Index drift risk across game updates.
   - If official resources reorder `<Resources>` rows or add pre-antiquity inserts, static numeric IDs can drift.
   - Mitigation: add lightweight verification test/script against `.civ7/outputs/resources/.../resources.xml` row order.

2. Branch B semantic conflict risk.
   - B currently codifies runtime-candidate language/tests; A static cutover will require B rebase + assertion updates.

3. Hidden dependency risk in generated mod JS.
   - Source-only audits can pass while generated `mod/**` retains old wording/logic.
   - Mitigation: treat `mod/**` as generated; rebuild after source updates and run placement tests only against source paths.

4. Scope creep risk.
   - This remediation should not broaden to unrelated GameInfo lookups (biomes/features/plot effects). Keep the audit scoped to placement resource sentinel/catalog bug class.
