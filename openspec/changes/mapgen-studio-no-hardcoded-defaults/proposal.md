# Remove hard-coded pipeline-config duplicates (no hard-coded overrides law)

## Why

User law (2026-06-11): no hard-coded config overrides anywhere — app or tests;
any literal duplicate of pipeline default values is a defect to remove on
sight. Sweep findings:

1. **`src/ui/data/defaultConfig.ts`** — a 330-line hand-maintained copy of the
   standard recipe's default pipeline config (plateCount, climate constants,
   etc.). The app never imports it: real defaults flow from
   `STANDARD_RECIPE_CONFIG` (generated recipe artifact) through
   `buildDefaultConfig(...)`. Its only consumers are two blocks in
   `test/config/defaultConfigSchema.test.ts` that pin the *legacy file's* key
   shape — guarding a dead duplicate instead of the real artifact. Every
   future pipeline-default change must be mirrored by hand or the file drifts
   (it already presents `plateActivity: 0.5` et al. as authoritative-looking
   values).
2. Remaining literal config fixtures in tests (persistence/clientState/
   presetStore/importFlow migration and round-trip fixtures) test *user-data
   shapes* (legacy persisted formats, imported preset payloads) — they are
   inputs being round-tripped, not duplicated defaults, and stay. The law is
   recorded so new work cannot add default-mirroring literals.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md` (hard core:
  no hard-coded config overrides; issue 9)

## What Changes

- **Delete `apps/mapgen-studio/src/ui/data/defaultConfig.ts`** (including its
  unused `getStageOrder`/`getStageDefaults` helpers).
- **Retarget the two legacy-shape test blocks** in
  `test/config/defaultConfigSchema.test.ts` to assert stage-config key shapes
  against `STANDARD_RECIPE_CONFIG` (the generated artifact the app actually
  uses), preserving their intent (semantic surfaces only, no raw op
  envelopes, no legacy stage keys).
- No app behavior changes (the file was dead code in the app path).

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/data/defaultConfig.ts` (deleted),
  `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
