## 1. Generator Restoration (byte-stable milestone)

- [x] 1.1 Write `scripts/civ7-map-policy/generate-tables.ts` parsing the
  submodule sources (terrain.xml, racetowonders/marvelous-mountains terrain,
  2 DLC terrain files, resources.xml, resources-v2.xml, map-globals.js).
- [x] 1.2 Reproduce the committed `CIV7_BROWSER_TABLES_V0` export block
  byte-identical (diff of the export block vs HEAD: empty; all 11 data
  tables). Record the reconstructed feature load order in a generator
  comment.
- [x] 1.3 Update the generated header: new generator path, submodule commit
  `44faecabde12`, 2026-01-24 snapshot note (D4: refresh is a flagged user
  follow-up).

## 2. V1 Extension (additive, versioned)

- [x] 2.1 Emit `CIV7_POLICY_TABLES_V1`: resourceRows (weight,
  minimumPerHemisphere, classType, hemisphereUnique, staple, tradeable,
  unlocksCiv), resourceValidAges, resourceRequiredLeaders (base + DLC
  ashoka-himiko-alt), derived isResourceRequiredForAge.
- [x] 2.2 Emit mapResourceMinimumAmountModifier rows from
  `Base/modules/base-standard/data/maps.xml:120-171`.
- [x] 2.3 Emit the 8 StartBias tables from the 18 base/DLC civilization and
  leader data files (file list in the generated V1 `source` array).
- [x] 2.4 Emit startGlobals (g_RequiredBufferBetweenMajorStarts=6,
  g_DesiredBufferBetweenMajorStarts=12, + start-sector/discovery globals).
- [x] 2.5 Type everything; export V1 const + row types from the package
  index.
- [x] 2.6 Guard: fail loudly if a DLC resources.xml introduces NEW
  `<Resources>` rows.

## 3. D6 — Single Generator, Twin Retired

- [x] 3.1 Delete `scripts/mapgen-studio/generate-civ7-browser-tables.ts`.
- [x] 3.2 Delete `apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts`;
  repoint `pipeline.worker.ts:8` to `@civ7/map-policy`; add the workspace
  dep; remove the app's `gen:civ7-tables` script.
- [x] 3.3 Replace root `mapgen-studio:gen-civ7-tables` with
  `civ7-map-policy:gen-tables` + `verify:civ7-map-policy-tables`.
- [x] 3.4 Record the D6 choice + index-skew rationale in the proposal
  decision log; update the stale seam-doc reference.

## 4. Verification

- [x] 4.1 `bun run civ7-map-policy:gen-tables` twice → no diff;
  `bun run verify:civ7-map-policy-tables` green.
- [x] 4.2 `bun test packages/civ7-map-policy packages/civ7-adapter` → 29
  pass (incl. new `policy-tables-v1.test.ts`).
- [x] 4.3 `bun run --cwd packages/civ7-map-policy check` +
  `bun run --cwd packages/civ7-adapter check` clean.
- [x] 4.4 `bun run verify:placement-catalogs` green.
- [x] 4.5 `bun run verify:placement-metrics -- --seed 1337 --seeds 2 --size standard`
  → per-run records deep-equal to the S1 run (behavior unchanged).
- [x] 4.6 `bun run --cwd apps/mapgen-studio check` → 0 errors;
  `bun --cwd mods/mod-swooper-maps test test/placement` → 53 pass.
- [x] 4.7 `bun run openspec -- validate placement-realignment-s2-policy-tables --strict`.
