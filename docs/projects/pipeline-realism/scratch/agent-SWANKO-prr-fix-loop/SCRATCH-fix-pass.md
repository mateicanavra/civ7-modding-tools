# Scratchpad (Fix Pass) — agent-SWANKO PRR Consolidated Loop

Date: 2026-02-14

Purpose:
- Working notes for fix slice implementation.
- Track per-slice commands run and any unexpected side effects.

Conventions:
- Record the fix branch name at the top of each entry.
- Record test commands run and whether they passed.

## Log

## PRR-s10-c01
- Branch: `agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max`
- Change: cap deriveResetThreshold floor against era maxByte so reset thresholds cannot exceed a channel's emitted maxima.
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)
  - `bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts` (fails here: missing expected polarity=-1 + originEra reset; re-run after upcoming PRR foundation fixes)

## PRR-s11-c01
- Branch: `agent-SWANKO-PRR-s11-c01-fix-belt-influence-distance-contract`
- Change: clarify contract wording for `beltInfluenceDistance` (base distance; per-channel multipliers may expand effective radius).
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## PRR-s93-c01
- Branch: `agent-SWANKO-PRR-s93-c01-fix-round-clampint-knobs`
- Change: round `histogramBins` / `smoothingSteps` before `clampInt` to avoid silent truncation of authored fractional values.
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## PRR-s94-c01
- Branch: `agent-SWANKO-PRR-s94-c01-fix-sea-level-constraints-first`
- Change: within the bounded targetPct window, prefer minimizing constraintError first, then minimize deviation from the hypsometry target.
- Files:
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)
  - Note: some morphology tests currently fail earlier due to missing `plateMotion` inputs; tracked as `PRR-s119-c01`.

## PRR-s97-c01
- Branch: `agent-SWANKO-PRR-s97-c01-fix-polarity-bootstrap-oceanic-only`
- Change: restrict polarity bootstrapping to oceanic-oceanic convergence; keep continental-continent convergence neutral.
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## PRR-s98-c01
- Branch: `agent-SWANKO-PRR-s98-c01-fix-era-fields-dijkstra`
- Change: switch era-field diffusion traversal to Dijkstra-style relaxation (variable edge weights), avoiding FIFO+visitMark correctness issues.
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## PRR-s101-c01
- Branch: `agent-SWANKO-PRR-s101-c01-fix-crust-thickness-evolution`
- Change: evolve crust thickness as a maturity-driven thickening term (maturity already integrates uplift/volcanism and disruption).
- Files:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## PRR-s108-c01
- Branch: `agent-SWANKO-PRR-s108-c01-fix-plateau-seeding`
- Change: allow a small deterministic number of extra seeds on flat maxima plateaus (prevents single-seed belts on constant-intensity fields).
- Files:
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts`
- Checks:
  - `bun run --cwd mods/mod-swooper-maps check` (pass)

## 2026-02-14 PRR-s112-c01
- Branch: `agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional`
- Change: restore proportional `driverStrength` scaling for mountain score output gate.
- Checks: `bun run --cwd mods/mod-swooper-maps check` (pass)
- PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1251 (draft)
