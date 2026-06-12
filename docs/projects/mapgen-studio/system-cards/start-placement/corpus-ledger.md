# Start Placement System Card — Corpus Ledger

> Project state for the `assign-starts` system card. Not skill content.

## Active goal

Produce a reusable system card for **Start Placement** (`assign-starts`) — the
mapgen step that decides where each player begins the game. Chosen as the
"most important for gameplay" component because, in a 4X, nothing shapes the
match more than the location and relative fairness of starts. Scope: the truth
step + `plan-starts` op (candidate scoring/tiering), the projection
(`materialize.ts` → `adapter.setStartPosition`), its config/knobs, seeds, the
full upstream input fan-in, and the regression oracle. Out of scope: advanced
starts, discoveries, natural wonders, resource placement internals (treated only
as an input). Deliverable: `system-card.html` in this directory, plus the issues
list with adversarial verification preserved.

## Method

`civ7-pipeline-system-card` (over `civ7-systematic-workstream`): isolate →
4 blind read-only agent lanes → cited corpus → owner adversarial verification →
render card. Verification refuted 3 of 4 sub-agent P1s (see below).

## Footprint (isolated component)

| Part | Path | Notes |
| --- | --- | --- |
| Truth step | `recipes/standard/stages/placement/steps/assign-starts/index.ts` | reads 11 artifacts, calls `planStarts` |
| Domain op (algorithm) | `src/domain/placement/ops/plan-starts/strategies/default.ts` | 539 lines — scoring, tiering |
| Op contract / knobs | `src/domain/placement/ops/plan-starts/contract.ts:186-271` | 13 knobs + defaults |
| Projection step | `recipes/standard/stages/placement/steps/assign-starts/materialize.ts` | 612 lines — `setStartPosition`, fallbacks |
| Region slots | `recipes/standard/stages/placement/steps/plot-landmass-regions/index.ts:37-52` | west(1)/east(2) by bbox center |
| Preset overrides | `src/maps/configs/swooper-earthlike.config.json:757-771` | `config.placement.starts` |
| Seeds / RNG | (none) | fully deterministic from inputs — no RNG/Perlin |
| Oracle tests | `test/placement/start-viability.test.ts`, `test/placement/plan-ops.test.ts`, `test/placement/placement-contracts.test.ts` | tiers, spacing-over-isolation, resource tie-break |

## Corpus (verified)

| Row | Subject | Source (file:line) | Coverage | Notes |
| --- | --- | --- | --- | --- |
| 1 | 11 input artifacts + producers | `assign-starts/index.ts:19-61` + `contract.ts:17-30` | ✓ read | morphology/hydro/ecology/placement fan-in |
| 2 | Candidate gate + tiering | `plan-starts/.../default.ts:208-238` | ✓ read | single-tile reject; primary/islandCluster/marginal |
| 3 | Composite score formula | `default.ts:258-306` | ✓ read | land·landmassW + fertility·fertW + resource·resW + freshwater·fwW + climate; ÷(sum+1); ±tierBias − roughness |
| 4 | Knob defaults (13) | `contract.ts:186-271` | ✓ read | see card knob table |
| 5 | Earthlike overrides | `swooper-earthlike.config.json:757-771` | ✓ read | minExpansion 14→4, minIslandCluster 18→3, maxIslandCoastDist 1→8, largeLandmassW 1→4, resSupportRadius 4→1 |
| 6 | Three assignment paths + throw | `materialize.ts:135-218` | ✓ read | regional → open-pool → desperation → throw |
| 7 | Spacing relaxation to 0 | `materialize.ts:491-523` | ✓ read | decrements `spacing` until candidate or 0 |
| 8 | Desperation = spacing only | `materialize.ts:546-576` | ✓ read | no score/tier weighting |
| 9 | Resource-support bounds check | `default.ts:192-194` | ✓ read | REFUTES "no bounds check" P1 |
| 10 | Sector-filter fallback | `materialize.ts:131` | ✓ read | REFUTES "silent starvation" — falls back to region pool |
| 11 | Freshwater river>lake | `default.ts:153-161` | ✓ read | river 0.8 > lake 0.7; no comments — REFUTES "inverted comments" |
| 12 | Determinism (no RNG) | `default.ts` + `materialize.ts` (grep) | ✓ read | zero Math.random/seed/Rng; plotIndex tie-breaks |
| 13 | Engine write surface | `materialize.ts:157,182,207` | ✓ read | only `setStartPosition(plot, player)` survives |
| 14 | Region slot rule | `plot-landmass-regions/index.ts:37-38` | ✓ read | every landmass bucketed west/east by bbox center |

## Verification / closure

- Branch confirmed: `06-05-fix_studio_validate_civ7_setup_seeds` (top of Studio-fix stack).
- Adversarial re-read outcome: **3 of 4 sub-agent P1s refuted** (bounds check exists;
  sector-filter has graceful fallback; freshwater "inverted comments" false). One
  P1 (assign-all-or-throw) **downgraded to P2** (fail-loud guard, needs land<players).
  Surviving: 2×P2 + 4×P3 (hardcoded-constant findings consolidated into one card). No P1 survived scrutiny.
- Live sample: not run. Component is fully deterministic and pinned by
  `start-viability.test.ts`; sampling would not change understanding.
- Card rendered at: `system-card.html` in this directory.
- Target-state twin (the "should" side): `system-card-target.html` — prescriptive
  companion showing a top-tier outcome (per-start record published, fairness
  measured, never throws). Grounded in: immutable engine boundary
  (`civ7-adapter/src/types.ts:658`), aggregate-only current artifact
  (`artifacts.ts:77-119`), and the `ecology/resources/score-balance` precedent.
  Section D flips from issues → acceptance criteria + gap-from-current.

## As-built closure (placement-realignment S4, 2026-06-10)

The S4 starts vertical (`openspec/changes/placement-realignment-s4-starts/`,
evidence `docs/projects/placement-realignment/evidence/s4-results-2026-06-10.md`)
implements the target card's acceptance criteria; the target card itself is
left untouched as the prescriptive reference. Per-row disposition:

| Row | Was (current card) | Now (as-built) |
| --- | --- | --- |
| 3 | composite score ÷(sum+1), no climate-extreme term | fixed 0..1 weight normalization; components retained per seat; climate comfort + extreme-decile penalty (E1.8 frame); land-only r2 fertility (E1.4 frame); coastal/river preference + StartBias hook |
| 4 | 13 knobs incl. inert sector fields | knob set derived from op config (foundation pattern): spacing floor/desired, fairnessTolerance, roughnessDivisor, tierBias, rankingBlend, climate weights, bias weights, per-hemisphere overrides — all with min/max; sector knobs deleted |
| 6 | regional → open-pool → desperation → THROW (`materialize.ts:135-218`) | op-owned four-rung ladder (regional → open-pool → quality-relaxed → spacing-relaxed), never-throw; unseated = degraded data; hard-fail only on zero settleable land |
| 7 | spacing relaxation decrements to 0 | hard 6-tile floor for all rungs above last resort; 12 desired is a score taper; below-floor only in last resort, flagged + warned |
| 8 | desperation = spacing only (unscored) | last resort still ranks by the blended quality function; no unscored path exists |
| 13 | `setStartPosition(plot, i)` positional slot index | `setStartPosition(plot, playerId)` with playerId from the adapter alive-majors READ surface, mapped at the single `seat-identity.ts` policy point, `playerIdSource` recorded per seat (D3; live semantics probe at Milestone A) |
| — | aggregate-only artifact | per-player `StartRecord[]` + `fairnessReport` (worstPairGap, swaps, relaxations) + `inputCoverage`; validate hook registered |
| — | always-on sector grid viz (inert machinery) | sector machinery + viz deleted; landmass-region slots are the regional mechanism (ADR-008 amendment) |
