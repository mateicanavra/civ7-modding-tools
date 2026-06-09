# Placement Realignment S2 — Policy Table Chain Repair

## Why

The committed `packages/civ7-map-policy/src/civ7-tables.gen.ts` (11 data
tables driving mock-adapter `canHaveResource` emulation and placement
diagnostics) claimed generation by
`scripts/mapgen-studio/generate-civ7-browser-tables.ts`, but that script only
ever emitted a 74-line terrain/biome/feature subset to
`apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts` — the real generator was
never committed (diagnosis RC4; audit-register policy-grounding lane, broken
middle hop confirmed). The tables could not be refreshed, and the official
data the placement realignment needs next (resource Weight,
MinimumPerHemisphere, required-for-age, MapResourceMinimumAmountModifier,
StartBias\*, 6/12 start buffers) had no in-repo extraction path at all. S2
restores the generator, proves byte-stable reproduction, and extends the
tables additively so S3 (resources cutover) and S4 (StartBias scoring) plan
within policy instead of fighting the live oracle.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S2 slice scope, D4,
  D6)
- `docs/projects/placement-realignment/diagnosis.md` (RC4)
- `docs/projects/placement-realignment/evidence/audit-register.md`
  (policy-grounding lane: broken-chain finding + confirmed verdict)

## What Changes

- **Generator restored.** New `scripts/civ7-map-policy/generate-tables.ts`
  parses the official submodule (`.civ7/outputs/resources`, READ-ONLY) and
  regenerates `packages/civ7-map-policy/src/civ7-tables.gen.ts`. The V0
  export block (`CIV7_BROWSER_TABLES_V0`, all 11 data tables) is reproduced
  **byte-identical** to the committed file; only the header changed
  (generator path, submodule commit `44faecabde123ba9e25f6340014c9c1d1b4e1a8e`,
  snapshot-date note per D4). `--check` mode verifies the committed output is
  current; regeneration is idempotent.
- **V1 extension (additive, versioned).** New `CIV7_POLICY_TABLES_V1` export
  (separate from V0, so V0 stays byte-stable) with: per-resource catalog rows
  (type, classType, weight, minimumPerHemisphere, hemisphereUnique, staple,
  tradeable, unlocksCiv; 55 resources), `resourceValidAges` (53 resources),
  `resourceRequiredLeaders` (11 resources, incl. DLC ashoka-himiko-alt rows),
  derived `isResourceRequiredForAge` (11 resources),
  `mapResourceMinimumAmountModifier` (40 rows), the 8 `startBias` tables
  (92 rows total), and `startGlobals` (6/12 buffers + start-sector globals).
  All typed; exported from the package index.
- **D6 executed — twin retired.** `scripts/mapgen-studio/generate-civ7-browser-tables.ts`
  and the divergent `apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts`
  deleted; the studio worker imports `CIV7_BROWSER_TABLES_V0` from
  `@civ7/map-policy` directly.
- **Scripts.** Root `civ7-map-policy:gen-tables` +
  `verify:civ7-map-policy-tables` added; `mapgen-studio:gen-civ7-tables` and
  the app-local `gen:civ7-tables` removed. New package test
  (`packages/civ7-map-policy/test/policy-tables-v1.test.ts`) asserts V0↔V1
  consistency and known official values.

## Decision Log (spec left these open; recorded here, not decided silently)

- **Byte-stable vs semantic-equal: byte-stable.** The regenerated
  `CIV7_BROWSER_TABLES_V0` export block is byte-identical to the committed
  one (empty diff over the full export, all 11 tables) — no drift found in
  the committed tables. The only file-level changes are the header (scope
  item 7) and the appended V1 section. No semantic-equality fallback script
  was needed.
- **Feature index order (reconstruction).** The committed V0 feature order is
  NOT the header's source-list order: `racetowonders-terrain.xml` and
  `marvelous-mountains-terrain.xml` features load BEFORE `terrain.xml`, then
  the two DLC wonder modules append (BERMUDA_TRIANGLE=0, MOUNT_EVEREST=1,
  base features +2, MACHAPUCHARE..MAPU_A_VAEA at 40..45). The generator
  hardcodes this load order with a comment; byte-stable reproduction confirms
  it matches the live GameInfo order the committed tables were verified
  against.
- **D6: studio twin replaced by `@civ7/map-policy` import (not regenerated).**
  Rationale: the worker already bundles the policy tables via
  `@civ7/adapter/mock` (the mock's default terrain/biome/feature tables are
  spread from `CIV7_BROWSER_TABLES_V0`), so bundle impact is ~zero — and the
  twin was actively harmful: its base-only `featureTypes` (SAGEBRUSH=0 …)
  diverged from the policy/GameInfo order (BERMUDA=0, base +2) used by the
  mock's legality tables, so passing it as a mock-adapter override skewed
  feature name→index lookups against `featureValidTerrain/BiomeTypeIndices`.
  Consumers touched: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts:8`
  (the only importer of the twin), `apps/mapgen-studio/package.json`
  (`gen:civ7-tables` removed; `@civ7/map-policy` workspace dep added), root
  `package.json` (script swap), and one doc reference
  (`docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`).
  Behavior note: browser-studio runs now resolve feature indices in GameInfo
  order, consistent with the mock's legality tables (fix, not regression);
  node-side placement metrics are byte-identical (proven below).
- **Where `MapResourceMinimumAmountModifier` lives:**
  `.civ7/outputs/resources/Base/modules/base-standard/data/maps.xml:120-171`
  (40 rows: DEFAULT + per-map-type, per `MapSizeType` Amount), read by
  `Base/modules/base-standard/maps/map-utilities.js`
  (`getMinimumResourcePlacementModifier`, GameInfo.MapResourceMinimumAmountModifier
  at lines 47/54).
- **Where StartBias lives:** 18 XML files — base:
  `Base/modules/age-{antiquity,exploration,modern}/data/civilizations.xml`,
  `Base/modules/base-standard/data/leaders.xml`; DLC: 14
  civilization/leader data files (assyria, bulgaria, carthage, dai-viet,
  edward-teach, friedrich-xerxes-alt, iceland, nepal, pirate-republic, qajar,
  sayyida-al-hurra, shawnee-tecumseh, silla, tonga). Eight tables:
  StartBias{Biomes,Terrains,FeatureClasses,Resources,Rivers,Lakes,
  AdjacentToCoasts,NaturalWonders}; rows keyed by exactly one of
  CivilizationType/LeaderType. The full file list is recorded in the
  generated V1 `source` array.
- **`isResourceRequiredForAge` is a static approximation.** No XML attribute
  backs the engine call `ResourceBuilder.isResourceRequiredForAge`
  (resource-generator.js:116). The table derives required = appears in
  `Resource_RequiredLeaders` (base `resources.xml:157-181` + DLC
  `DLC/ashoka-himiko-alt/modules/data/resources.xml`), for the ages where the
  resource is valid (`Resource_ValidAges`). The live engine additionally
  filters to leaders present in the running game — flagged for the
  Milestone A live probe (E4.4 family).
- **DLC new-resource guard.** Today's DLC resources.xml files add no new
  `<Resources>` rows (0 new resource types; 7 required-leader rows). The
  generator fails loudly if a future submodule refresh introduces DLC
  resource rows, so index assignment is decided explicitly rather than
  guessed.
- **V1 as a separate export.** Extending V0's object would have broken its
  byte-stability and forced churn on every consumer's `as const` shape;
  the new data ships as `CIV7_POLICY_TABLES_V1` with explicit TS types
  (wide, not literal) since policy rows are data, not discriminants.
- **`startGlobals` scope.** Beyond the required 6/12 buffers, the four other
  start-placement globals the official scripts read
  (requiredDistanceFromMajorForDiscoveries, avoidSeamOffset,
  ignoreStartSectorPctFromCtr, startSectorWeight) are included; other
  map-globals values stay out until an op needs them (package AGENTS.md
  smallness rule).
- **Mock adapter untouched.** The existing `canHaveResource` emulation reads
  the byte-identical V0 rows; adapter tests pass unchanged. V1 consumption
  starts in S3/S4 (not this slice).

## Requires

- `placement-realignment-s1-hotfixes` (stacked branch state).
- **User dependency (D4, unchanged):** refreshing the submodule snapshot
  (2026-01-24) needs the game install (`bun run refresh:data`); this slice
  grounds against the current snapshot and says so in the generated header.

## Enables Parallel Work

- S3 resources cutover (weights, hemisphere minimums, required-for-age,
  minimum-amount modifiers now tabled).
- S4 StartBias scoring + 6/12 buffer alignment.

## Affected Owners

- `packages/civ7-map-policy/**` (generated tables, index, test).
- `scripts/civ7-map-policy/**` (new generator), `scripts/mapgen-studio/**`
  (retired).
- `apps/mapgen-studio/**` (worker import, package.json).
- Root `package.json` scripts.

## Forbidden Owners

- `.civ7/outputs/resources/**` (READ-ONLY submodule).
- `packages/civ7-map-policy/src/civ7-tables.gen.ts` by hand — generator-only
  writes.
- No placement op/recipe behavior changes (S3–S5 own those).

## Consumer Impact

- `CIV7_BROWSER_TABLES_V0` values: unchanged (byte-stable) for every
  consumer (mock adapter, placement steps, diagnostics,
  verify-manual-catalogs).
- Studio worker: now consumes the package export; browser runs get
  GameInfo-order feature indices consistent with mock legality tables.
- New exports: `CIV7_POLICY_TABLES_V1` + row types from `@civ7/map-policy`
  (no consumers yet; S3/S4 wire them).

## Stop Conditions

- Byte-stable reproduction failing for any V0 table → switch to the
  documented semantic-equality proof path. (Not hit.)
- DLC resources introducing new resource types → halt and decide indices.
  (Not hit.)

## Verification Gates

- `bun run civ7-map-policy:gen-tables` twice → no diff (idempotent);
  `bun run verify:civ7-map-policy-tables` green.
- V0 export block diff vs committed HEAD: empty (byte-stable milestone).
- `bun test packages/civ7-map-policy packages/civ7-adapter` → 29 pass.
- `bun run --cwd packages/civ7-map-policy check`,
  `bun run --cwd packages/civ7-adapter check` → clean.
- `bun run verify:placement-catalogs` → "Placement catalogs verified."
- `bun run verify:placement-metrics -- --seed 1337 --seeds 2 --size standard`
  → per-run metric records deep-equal to the S1 run on the same seeds
  (behavior unchanged).
- `bun run --cwd apps/mapgen-studio check` → 0 errors (after building
  workspace deps + studio recipe artifacts).
- `bun --cwd mods/mod-swooper-maps test test/placement` → 53 pass.
- `bun run openspec -- validate placement-realignment-s2-policy-tables --strict`.
