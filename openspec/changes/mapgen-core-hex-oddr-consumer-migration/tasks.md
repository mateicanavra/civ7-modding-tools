# Tasks — odd-R consumer migration + dead-code removal

## 1. Migrate live hex consumers to the canonical odd-R primitive
- [x] `lib/plates/topology.ts` → `getHexNeighborIndicesOddQ` (delete inlined odd-Q offsets)
- [x] hydrology `compute-precipitation/strategies/vector.ts` (delete inlined tables + row-0 delta; use dir-vectors + iterator)
- [x] hydrology `compute-atmospheric-circulation/rules` (smoother → indices; ∇p wind → dir-vectors)
- [x] hydrology `transport-moisture/strategies/vector-advection.ts` (upwind → `bestHexNeighborDirectionIndexOddQ` + iterator; preserve 2-donor blend)
- [x] hydrology `compute-ocean-surface-currents/rules` (smoother + Helmholtz projection)
- [x] hydrology `compute-ocean-thermal-state/rules` (upcurrent 2-donor + diffusion)
- [x] morphology `compute-landmask/strategies/default.ts` coarse-bin axial → odd-R axial
- [x] diagnostics `surface-delta-context.ts` neighbor tables → odd-R
- [x] `@civ7/adapter` `mock-adapter.ts` neighbor table → odd-R in place (boundary-blocked from shared import)

## 2. Remove dead code
- [x] delete `lib/heightfield/{base,sea-level,index}.ts` (no live importer)
- [x] remove `tsup.config.ts` heightfield entry + `package.json` `./lib/heightfield` export

## 3. Verify (proof classes separate)
- [x] BUILD: `@swooper/mapgen-core`, `@civ7/adapter`, `mod-swooper-maps` green (tsup compile gate)
- [x] BIOME: changed files clean (10/10)
- [x] TEST `@swooper/mapgen-core`: 103 pass / 0 fail
- [x] TEST mod: 566 pass; failures triaged → 6 pre-existing/environmental, 5 adjacency-driven (ledger)
- [x] DUMP before/after: wind col/row sawtooth windV 2.5 → 0.52 on fully-migrated build
- [ ] No-straggler scan: zero inlined `x&1` hex adjacency / offset tables remain in the live pipeline (verified by grep; comments excepted)

## 4. Downstream realignment (see ledger)
- [ ] ocean-thermal `shelfMask mixing` test fixture: stop depending on odd-Q neighbor asymmetry (corrected odd-R neighborhood is vertically symmetric)
- [ ] `surface-delta-context` diagnostic test: update expected neighbor classification to odd-R
- [ ] ecology baseline fingerprint fixture: regenerate against corrected climate→biome output
- [ ] **DECISION (user):** earthlike guards `river minor-share` (0.61 vs ≤0.55) and `rough-upland component` (60 vs ≤40) — recalibrate to corrected model, or keep and re-tune config

## 5. Closure
- [ ] OpenSpec strict validation
- [ ] Graphite branch stacked on `agent-A-mapgen-core-hex-oddr-adjacency`
- [ ] Live in-game render proof (user-driven closure gate)
- [ ] Resolve deferred `natural-wonder-footprints` parity via live per-direction probe (separate)
