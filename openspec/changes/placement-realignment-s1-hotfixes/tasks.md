## 1. E1.1 Impassability Screen (S1a)

- [x] 1.1 Extend `placement/plan-starts` op input schema with `mountainMask`,
  `volcanoMask`, `naturalWonderPlotIndices`; add typed rejection reasons
  `mountain|volcano|natural-wonder` to op output + artifact schema.
- [x] 1.2 Reject those tiles in the default strategy's admission gate (no
  scoring redesign).
- [x] 1.3 Require `morphology.mountains`, `morphology.volcanoes`,
  `placement.naturalWonderPlacement` in the assign-starts step contract and
  wire them into the op input (wonder plots = placed anchor + observed +
  expected footprint).
- [x] 1.4 Screen the desperation fallback with the same exclusion mask
  (`unsettleableMask`) so the invariant holds beyond planned candidates.

## 2. E1.2 Studio Hemisphere Split (S1b)

- [x] 2.1 `pipeline.worker.ts`: map `playerCount` to
  `PlayersLandmass1 = ceil(n/2)`, `PlayersLandmass2 = floor(n/2)` (default
  total 8 preserved when absent).
- [x] 2.2 Align the `--studio-mapinfo` probe in
  `scripts/placement/placement-metrics.ts` with the fixed worker mapping.

## 3. E1.7 Loud Fallbacks (S1c)

- [x] 3.1 Emit `console.warn` + warn-tagged trace event
  (`placement.starts.fallback`) when openPool/desperation seats players.
- [x] 3.2 Record per-seat `seatPaths` in the `startAssignment` artifact
  (schema + materializer), aligned with `positions`.

## 4. Spacing-Preserving Resource Fallback (S1d)

- [x] 4.1 Remove the relaxed-spacing phase (decay to 0) from
  `place-resources/materialize.ts`; never assign below the authored
  `minSpacingTiles`.
- [x] 4.2 Record `spacingShortfallCount` in the assignment summary (artifact
  schema), runtime telemetry (only when > 0), and a warn trace event
  (`placement.resources.spacingShortfall`).
- [x] 4.3 Remove the `relaxed-spacing` literal from the assignment-phase
  schema/type (no longer producible).

## 5. Dead Code (S1e)

- [x] 5.1 Verify `chooseLeastUsedLegalResource` has zero callers (repo grep);
  delete it.
- [x] 5.2 Delete `findLegalPlotWithRelaxedSpacing` (dead with 4.1).

## 6. Verification + Evidence

- [x] 6.1 `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard --json /tmp/pm-s1.json`
  → E1.1 = 0% all seeds.
- [x] 6.2 Studio probe → 8 seated for 8 intended (was 16).
- [x] 6.3 `bun --cwd mods/mod-swooper-maps test test/placement test/resources`
  (108 pass) + full suite (only pre-existing environmental build-artifact
  failures, identical on clean S0 commit).
- [x] 6.4 `bun run --cwd mods/mod-swooper-maps check` and
  `bun run --cwd apps/mapgen-studio check` (no new errors).
- [x] 6.5 Record
  `docs/projects/placement-realignment/evidence/s1-results-2026-06-09.md`
  with before/after numbers per expectation ID.
- [x] 6.6 `bun run openspec -- validate placement-realignment-s1-hotfixes --strict`
  and `bun run openspec:validate`.
