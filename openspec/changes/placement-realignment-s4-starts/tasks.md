# Tasks — Placement Realignment S4 (Starts Vertical Realignment)

## 1. Selection authority moves into the op

- [x] 1.1 `plan-starts` contract extended: seat/selection inputs (alive ids,
  seatBiases, mountain/volcano/wonder screens, resource plots), outputs
  (`seats: StartRecord[]`, `fairnessReport`, `inputCoverage`, settleable
  count, spacing contract), strategy knobs with declared min/max +
  descriptions.
- [x] 1.2 Op `policy/` modules per domain layout convention:
  `selection-ladder.ts`, `fairness.ts`, `seat-identity.ts`,
  `climate-comfort.ts`, `start-bias.ts`.
- [x] 1.3 Thin materializer: stamp seats, warn+trace degradations
  (fallback rungs, spacing-below-floor, region-reassigned), build artifact;
  hard-fail ONLY on zero settleable candidates; old selection corpus
  (sector filtering, tier ranking loops, openPool, desperation,
  assign-or-throw) deleted.
- [x] 1.4 Step wiring: artifact reads for mountains/volcanoes/wonder
  footprints/placed resources; `getAliveMajorIds()` passed through; viz
  emission preserved (viabilityScore/viabilityTier/startPosition).

## 2. Ladder, fairness, spacing

- [x] 2.1 Four-rung ladder, never-throw, every rung scored, relaxations
  recorded per step; unseated = degraded data.
- [x] 2.2 Spacing: 6 hard floor / 12 desired taper (op defaults; earthlike
  config 6/9); below-floor only in last resort, flagged + warned.
- [x] 2.3 Fairness balancing pass: regional upgrade → regional leveling of
  the strongest seat → cross-region last resort (rung degrades, recorded);
  worstPairGap + swaps + relaxations published.
- [x] 2.4 Zero-candidate region reassignment (recorded flag + relaxation +
  degraded status + warn).

## 3. Identity, bias, climate

- [x] 3.1 Adapter `getAliveMajorIds()` READ surface (live: Players global;
  mock: contiguous ids from configured counts); interface doc states the op
  owns the mapping (D3).
- [x] 3.2 `seat-identity.ts` single mapping point; `playerIdSource` recorded
  per seat.
- [x] 3.3 StartBias offline hook (river/lake/adjacentToCoast vs pipeline
  artifacts; /100 normalization, capped, `startBiasWeight`); neutral default
  without rows; live per-civ half decision-logged for Milestone A.
- [x] 3.4 Climate comfort + extreme-decile penalty in the E1.8 land-decile
  frame; land-only radius-2 fertility (E1.4 frame); resourceSupportWeight
  default 1→0.5; earthlike weight rebalance (log in evidence doc).

## 4. Sector machinery removal + knob schema

- [x] 4.1 Delete startSectors/startSectorRows/Cols from op contract, runtime,
  derive-placement-inputs, public-config force-override; sector grid viz
  gone (asserted absent in viz-emissions test).
- [x] 4.2 `placement.starts` public schema derived from the op default
  strategy config (foundation pattern); shipped earthlike config migrated;
  generated recipe/map artifacts regenerated.
- [x] 4.3 ADR-008 amended with the landmass-region-slots vs official
  chooseStartSectors divergence line.

## 5. Artifacts + validators

- [x] 5.1 `startAssignment` artifact re-keyed: StartRecord[] (schema reused
  from op output), fairnessReport, rungCounts, inputCoverage, status.
- [x] 5.2 Validate hook (`validate.ts`): seat/position alignment, rung/status
  consistency, duplicate plots, rung totals, fairness coherence,
  unseated-flag enforcement.
- [x] 5.3 placement apply/outputs summary updated (rungCounts + status
  replace the deleted desperation counter).

## 6. Verification

- [x] 6.1 Metrics harness: E1.6 pending-s4 → computed (fairnessReport); E1.7
  per-rung + regionReassigned + per-seat detail.
- [x] 6.2 Op-contract tests: ladder ordering, never-throw on exhausted maps,
  spacing floor + below-floor flagging, determinism (identical runs →
  identical seats/report), fairness verdict coherence, region reassignment,
  genuine open-pool, alive-majors mapping + slot-index flagging, StartBias
  hook, imputed-input surfacing; thin-materializer tests (stamp + validate,
  zero-candidate hard-fail, degraded-as-data).
- [x] 6.3 Old-selection tests rewritten without weakening invariants
  (plan-ops overrides test, placement-contracts artifact assertions,
  viz-emissions sector absence, maps-schema knob defaults).
- [x] 6.4 `bun --cwd mods/mod-swooper-maps test` — 498 pass / 0 fail;
  `bun run --cwd mods/mod-swooper-maps check` clean; adapter package check +
  tests clean.
- [x] 6.5 `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size
  standard --json /tmp/pm-s4.json` + 20-seed window + studio-mapinfo probe;
  results in `docs/projects/placement-realignment/evidence/s4-results-2026-06-10.md`.
- [x] 6.6 E1.4 amendment recorded in expectations.md with ceiling evidence;
  E1.7 measurement note (regionReassigned reported separately) recorded.
- [x] 6.7 `openspec validate placement-realignment-s4-starts` passes.

## 7. Docs

- [x] 7.1 Evidence doc `s4-results-2026-06-10.md` (gate table before/after,
  weight-change log, raw aggregates).
- [x] 7.2 Start-placement system card `corpus-ledger.md` rows closed
  as-built (target card untouched).
