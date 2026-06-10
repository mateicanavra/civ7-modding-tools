# Tasks — Placement Realignment S7 (Viz + Knob Surface)

## 1. Per-step viz emission (E4.2/E4.3)

- [x] 1.1 Stage-local viz vocabulary module (`stages/placement/viz.ts`):
  shared group constant, tile space id, unit-score valueSpec, categorical
  palette, point-buffer + label helpers.
- [x] 1.2 derive-placement-inputs: planned wonder + discovery site points
  (priority-colored) from the published plans.
- [x] 1.3 plan-resources: per-type intent points (policy-table identity
  categories), per-family habitat intensity grids, aggregate
  eligible/legal types-per-tile grids.
- [x] 1.4 assign-starts: viability/tier/component/seat-rung viz emitted from
  the PLAN output before materialization (survives degraded selection);
  per-component grids from retained candidate vectors; seat rung points.
- [x] 1.5 adjust-resources: support adjustment points (origin/destination/
  addition × floor/equity) + per-start support radius zone grid.
- [x] 1.6 place-resources: typed reconcile outcome points
  (placed/rejected-with-reason).
- [x] 1.7 place-natural-wonders: outcome points
  (placed/placed-relocated/rejected) from coordinateRows.
- [x] 1.8 place-discoveries: typed outcome points.
- [x] 1.9 prepare-placement-surface: debug lake-drift +
  terrain-validation-drift evidence grids.
- [x] 1.10 terminal placement: debug engine-vs-physics waterDrift grid next
  to the kept engine landMask layer.
- [x] 1.11 assign-advanced-starts: no per-plot data exists — recorded
  exception (proposal decision log), not a fake layer.

## 2. Presentation defects (audit studio-viz P3)

- [x] 2.1 regionSlot "None" category transparent (alpha 210 → 0).
- [x] 2.2 viabilityScore + all new 0..1 score layers carry a unit-domain
  valueSpec (stable legend across runs).
- [x] 2.3 sectorId: verified zero dangling references (S4 removal clean);
  regression-tested in viz-coverage.

## 3. Overlay suggestions

- [x] 3.1 9 placement pairs added to studio overlaySuggestions (standard
  recipe), all same-step pairs per the dataTypeModel gating.
- [x] 3.2 Emitted-key existence for every suggestion pinned by the
  viz-coverage test (silent-failure drift mechanism closed).

## 4. Studio knob surface

- [x] 4.1 Verified the schema-driven path: placement (6 public groups, 11
  steps) present in generated `standard-artifacts`
  (build:studio-recipes); studio panel renders from schema + uiMeta.
- [x] 4.2 Deleted the dead hand-maintained
  `apps/mapgen-studio/src/ui/data/defaultConfig.ts` (the audit-cited drift
  surface; zero app importers).
- [x] 4.3 Updated stale studio guard tests to the current placement surface
  (support group; S5/D3 11-step order); removed the two legacy
  source-default test blocks with the file.

## 5. Hygiene + coverage guard

- [x] 5.1 "Gameplay / Placement" group label single-sourced from
  `stages/placement/viz.ts`.
- [x] 5.2 New `test/placement/viz-coverage.test.ts`: per-step expected
  dataTypeKeys, meta validity, transparent zero categories, overlay keys,
  sectorId absence.
- [x] 5.3 Registry stretch goal: OUT (decision-logged; S8 deferral
  candidate).

## 6. Verification + evidence

- [x] 6.1 mod check + 511 tests pass; studio check + 139 tests + build pass.
- [x] 6.2 Metrics bit-identical to S6 (`/tmp/pm-s7.json` vs `/tmp/pm-s6.json`,
  0 differing fields).
- [x] 6.3 Evidence doc
  `docs/projects/placement-realignment/evidence/s7-results-2026-06-10.md`.
