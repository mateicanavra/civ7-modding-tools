## Why

The placement-realignment workstream (S1–S8) needs falsifiable "fixed" claims.
Today no acceptance metrics exist anywhere for placement (diagnosis RC7), so
defects like start doubling, identity-erasing resource reassignment, and
missing start support are unmeasurable. S0 builds the measurement instrument
and records the broken baseline BEFORE any behavior change, so every later
slice is judged against predeclared expectations instead of impressions.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S0 slice + slice rules)
- `docs/projects/placement-realignment/expectations.md` (E1/E2/E3 metric
  definitions, predeclared ranges; E2.9 RDP coverage clause)
- `docs/projects/placement-realignment/diagnosis.md` (defects the baseline must
  make measurable)
- `docs/projects/resource-distribution-policy/PROJECT-resource-distribution-policy.md`
  (accepted strategy step 1: metrics before tuning)
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` D3/D4
  (accepted single-stage placement posture; S0 changes no behavior inside it)

## What Changes

- Add a reusable placement metrics module at
  `mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts` that runs
  the standard recipe headlessly with the mock adapter (same compile+run shape
  as the studio browser worker) and computes the E1/E2/E3 expectation metrics
  plus the RDP step-1 metrics (E2.9) from placement artifacts, labeled by
  expectation ID.
- Add a bun runner at `scripts/placement/placement-metrics.ts`
  (`--seed`, `--seeds`, `--size`, `--players`, `--studio-mapinfo`, `--json`)
  and a root script `verify:placement-metrics`.
- Add a harness self-test
  (`mods/mod-swooper-maps/test/placement/placement-metrics-harness.test.ts`)
  asserting schema stability, finite computed values, explicit skip statuses,
  and determinism — NOT the expectation ranges (current behavior is
  known-broken; S0 reports, it does not gate).
- Record the instrumented baseline at
  `docs/projects/placement-realignment/evidence/baseline-2026-06-09.md`
  (5 seeds, standard size, plus a studio-mapinfo doubling probe) with
  confirmed defects, non-reproduced predictions, and reproduction commands.
- NO behavior change to recipe/domain/adapter code. Write set:
  `mods/mod-swooper-maps/src/dev/diagnostics/**` (new file),
  `mods/mod-swooper-maps/test/placement/**` (new test),
  `scripts/placement/**` (new runner), root `package.json` (one script),
  `docs/projects/placement-realignment/evidence/**`, this change.

## Decision Log (spec left these open; recorded here, not decided silently)

- **Metric statuses instead of omission:** metrics not computable in S0 are
  emitted with explicit statuses (`pending-s2|s3|s4`, `requires-live-engine`,
  `requires-studio-dump`) plus a reason note, so coverage gaps are visible in
  the JSON, not silent.
- **E2.1 Spearman:** official Weight rows are absent from `@civ7/map-policy`
  until the S2 generator restoration, so the harness reports per-type counts +
  a coefficient-of-variation uniformity index now and `spearmanVsWeight: null`
  marked pending-s2 (expectations.md authorizes this split).
- **E2.9 operationalization:** reassignment rate = share of `assignmentTrace`
  rows whose final type differs from `preferredResourceType`;
  preferred-legality rate = share of plan placements whose preferred type
  passes the mock adapter's static policy `canHaveResource` on the final
  surface; latitude bands = 15-degree bands with overrepresentation =
  resource-share/land-share (bands with >= 2% of land); sector entropy =
  normalized Shannon entropy over a 4x4 sector grid restricted to sectors
  containing land (matches the recipe's 4x4 StartSector default).
- **E1.3 freshwater:** river class > 0 or lake within <= 1 tile (hex
  neighborhood), per the expectation's "river/lake adjacency <= 1 tile".
- **E1.8 deciles:** top aridity decile plus both outer temperature deciles,
  computed over land tiles only, per the expectation text.
- **E3.1/E3.2 constants:** support radius 4, floor 2 — the expectation's
  defaults; knobs arrive in S5.
- **E2.6 floor source:** measured against the plan's single global
  `minSpacingTiles` because no per-type floor exists yet (per-type floors are
  an S3 deliverable; the metric structure is already per-type).
- **Studio doubling probe:** reproduced by passing
  `PlayersLandmass1 = PlayersLandmass2 = playerCount` into the harness's
  mapInfo (the studio worker's shape) rather than importing studio code,
  keeping the harness dependency-free of `apps/`.

## Requires

- Nothing beyond the accepted workstream docs; first slice of the train.

## Enables Parallel Work

- S1 correctness hotfixes (measured against this baseline).
- S2 policy-table restoration (flips E2.1 Spearman + E2.2 from pending).
- RDP steps 2–5 (their step-1 metrics obligation is satisfied here).

## Affected Owners

- `mods/mod-swooper-maps/**` dev-diagnostics and test owners.
- Root `scripts/placement/**` and root `package.json` script table.
- `docs/projects/placement-realignment/**` evidence.

## Forbidden Owners

- No edits to recipe/domain/stage behavior, adapter, mapgen-core, or studio.
- No edits to generated files (`civ7-tables.gen.ts`, `dist/**`,
  `.civ7/outputs/**`).
- No expectation-range gating in tests or CI in this slice.

## Consumer Impact

- Additive only: new module/script/test/doc + one root package script. No
  exported package surface changes; no runtime or build output changes.

## Stop Conditions

- Any required placement artifact lacks the counters/trace the metrics need
  (would force instrumentation, i.e. behavior-adjacent change — stop and
  re-scope to S1).
- Computing a metric would require changing recipe/domain code.

## Verification Gates

- `bun --cwd mods/mod-swooper-maps test test/placement/placement-metrics-harness.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard`
- `bun run openspec -- validate placement-realignment-s0-metrics --strict`
- `bun run openspec:validate`
