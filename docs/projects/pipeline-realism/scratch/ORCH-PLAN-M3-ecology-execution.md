# ORCH-PLAN: M3 Ecology Execution

## Breadcrumbs
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-MAMBO-M3-ecology-physics-first`
- Stack tip branch: `codex/M3-015-hydrology-effectiveMoisture-soils` (parent: `codex/MAMBO-m3-013-bio-lat-cutoff`; base: `main`)
- Draft PRs: M3-002 `#1223`, M3-003 `#1224`, M3-004 `#1225`, M3-005 `#1226`, M3-006 `#1227`, M3-007 `#1228`, M3-008 `#1229`, M3-009 `#1230`, M3-010 `#1231`, M3-011 `#1232`, M3-012 `#1233`, M3-014 `#1234`, M3-013 `#1235`, M3-015 `#1236`
- Packet: `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/`
  - Authority order: `VISION.md` -> `TOPOLOGY.md` -> `CONTRACTS.md` -> `DECISIONS.md`
- Current issue: `docs/projects/pipeline-realism/issues/M3-015-hydrology-effectiveMoisture-soils.scratch.md`

## Slice Checklist (M3-001..012)
- [x] M3-001 Packet harden: topology/contracts/gates (verification-only unless drift)
- [x] M3-002 Stage split: earth-system-first truth stages + recipe wiring cutover
- [x] M3-003 ScoreLayers: schema + independent per-feature score ops + base occupancy
- [x] M3-004 Deterministic planning: ice (consume scoreLayers + occupancy; publish intents + snapshot)
- [x] M3-005 Deterministic planning: reefs (consume scoreLayers + occupancy; add missing reef-family features)
- [x] M3-006 Deterministic planning: wetlands (joint resolver; no disabled strategies)
- [x] M3-007 Deterministic planning: vegetation (joint resolver over score layers)
- [x] M3-008 Projection strictness: stamping must not drop placements or randomly gate (add gates)
- [x] M3-009 Cleanup: delete chance/multiplier paths; update tests + viz inventories (and enforce explicit viz palettes)
- [x] M3-010 Post-cutover cleanup: plot-effects score ops split + stable viz categories + preset sync
- [x] M3-011 Canonical docs sweep: ecology config reference + directional intent
- [x] M3-012 Bugfix: biomes horizontal stripe banding (and ensure biomes inputs are correctly wired)

### Longtail slices
- [x] M3-013 Biomes lat cutoff: reduce hard latitude striping while preserving cold biomes
- [x] M3-014 Lakes not filled: fix freshwater fill regressions without reintroducing noise/chance
- [x] M3-015 Hydrology moisture ownership: publish `effectiveMoisture` + thread soils/fertility into biomes

Current pointer: **M3-015**

## Gates Checklist (Hard, Forward-Only)
- [ ] No legacy shims/dual paths/wrappers
- [ ] No shouldRun / disabled strategy / silent skips
- [ ] No output fudging: no chance %, no multipliers gating existence, no probabilistic edges/jitter
  - Seeded RNG allowed only for tie-breaking equal scores
- [ ] Ops are atomic and never call ops; steps orchestrate
- [ ] Stage authoring invariant: stage config surface is 1:1 with internal step ids
  - Do **not** define stage `public` + `compile` unless intentionally defining a dedicated public config schema (rare)
  - Stage `public`/`compile` aliasing was removed from M3 ecology stages
  - Avoid `additionalProperties: false` (compiler already enforces closed objects)
  - Avoid manual type annotations in step/stage `run` handler params when inference already provides it
- [ ] Uniform model: scoreLayers first, then ordered planners with explicit occupancy snapshots (ice -> reefs -> wetlands -> vegetation)
- [ ] Visualization palette invariant: every visualized layer/label/property must have a stable, explicitly specified color
  - No implicit/random palettes; adding a new layer must include a color decision
- [ ] Projection stamping strict: `map-ecology/features-apply` must not drop placements or randomly gate
  - Rejections fail gates
- [ ] Preset invariant: keep default presets in sync with stage/step ids (prevent silently ignored config)
  - `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` is the default preset for standard recipe defaults
- [ ] Naming invariant: step-facing score op keys start with `score*`
  - Vegetation score step keys: `scoreForest|scoreRainforest|scoreTaiga|scoreSavannaWoodland|scoreSagebrushSteppe`
- [ ] Schema invariant: prefer `TypedArraySchemas.*` over `Type.Any()` for typed arrays (artifacts/config); only keep `Any` with written rationale
- [ ] Slice-end command gates (run and record each slice)
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label <label>`
  - Rerun `diag:dump` with a second label and verify `diag:diff` is empty
    - `bun --cwd mods/mod-swooper-maps run diag:diff -- dist/visualization/<label>/<runId> dist/visualization/<label2>/<runId>`
  - `rg -n "rollPercent|chance\\b|multiplier\\b" mods/mod-swooper-maps/src/domain/ecology/ops | cat`
  - `bun run build`
  - `timeout 20s bun run dev:mapgen-studio` (exit code 124 OK if it started; fail only on early crash)
  - (Stamping slice only) `rg -n "createLabelRng" mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply -S | cat`
  - (Worker init check) first action each slice: write a "CHECK-IN" line to `docs/projects/pipeline-realism/issues/MAMBO.scratch.md`

## Closure Notes

### M3-005 (Reefs) DONE
- Draft PR: `#1226`
- Notes: Stage-id config posture migration was required for TS map configs to align with `plan-reefs`/`plan-ice` minScore01-only planner contracts.

### M3-006 (Wetlands) DONE
- Draft PR: `#1227`
- Key behavior: Wet-family placement is deterministic (seeded tie-break for exact equal scores only), joint-resolved inside `ops.planWetlands`, with all chance/multiplier/disabled-strategy wet placement ops deleted.
- Gates (local):
  - `bun --cwd mods/mod-swooper-maps test test/ecology` PASS
  - `diag:dump` rerun + `diag:diff` mismatches `0`
  - static scan: no `rollPercent|chance|multiplier` hits in wetlands/reefs/ice planning ops
  - `bun run build` PASS
  - `timeout 20s bun run dev:mapgen-studio` reached Vite READY (exit `124` OK)

### M3-007 (Vegetation) DONE
- Draft PR: `#1228`
- Key behavior: Vegetation planning is deterministic (seeded tie-break for exact equal scores only) and joint-resolved inside `ops.planVegetation`, consuming `artifact:ecology.scoreLayers` + explicit occupancy.
- Gates (local):
  - `bun --cwd mods/mod-swooper-maps test test/ecology` PASS
  - `diag:dump` rerun + `diag:diff` mismatches `0` (runId `b391a4d0...`)
  - static scan: remaining `rollPercent|chance|multiplier` hits only in `plan-plot-effects` + a `noise.schema.ts` docstring
  - `bun run build` PASS
  - `timeout 20s bun run dev:mapgen-studio` reached Vite READY (exit `124` OK)

### M3-008 (Stamping Strictness) DONE
- Draft PR: `#1229`
- Key behavior: `map-ecology/features-apply` is strict stamping (no RNG, no chance/weight gating, no silent drops). Unknown features and any rejected placements fail loudly with a rejection report.
- Gates (local):
  - `bun --cwd mods/mod-swooper-maps test test/ecology` PASS
  - `diag:dump` rerun + `diag:diff` mismatches `0` (runId `b391a4d0...`, label `m3-stamp`)
  - static scan: no `rollPercent|chance|createLabelRng(` in `ops/features-apply`
  - `bun run build` PASS
  - `timeout 20s bun run dev:mapgen-studio` reached Vite READY (exit `124` OK)

### M3-009 (No-Fudging Cleanup) DONE
- Draft PR: `#1230`
- Key behavior:
  - `plot-effects` is deterministic top-coverage selection (seeded tie-break only).
  - Ecology baseline fixtures track viz keys and M3 truth artifacts.
- Gates (local):
  - `bun --cwd mods/mod-swooper-maps test test/ecology` PASS
  - `diag:dump` rerun + `diag:diff` mismatches `0` (runId `cc5296195...`, labels `m3-stamp-a`/`m3-stamp-b`)
  - static scan: `0` hits in `mods/mod-swooper-maps/src/domain/ecology` for `rollPercent|coverageChance|chance|multiplier` (also gated by `no-fudging-static-scan` test)
  - `bun run --cwd packages/civ7-adapter build` PASS
  - `bun run --cwd packages/mapgen-viz build` PASS
  - `bun run --cwd packages/mapgen-core build` PASS
  - `bun run build` PASS
  - `timeout 20s bun run dev:mapgen-studio` reached Vite READY (exit `124` OK)

### M3-010 (Post-Cutover Cleanup) DONE
- Draft PR: `#1231`
- Notes:
  - Split plot-effects scoring into separate ops (snow/sand/burned) and planner consumes score arrays + eligibility masks.
  - Added stable categories/colors for plot-effects viz and meaningful tests around viz metadata.
  - Fixed default preset JSON validity so `bun run build` + Studio startup stay green.

### M3-011 (Canonical Docs Sweep) DONE
- Notes:
  - Updated canonical mapgen docs for stage order, ecology stage split, and schema posture (no `additionalProperties: false`; avoid manual stage `public`/`compile` unless truly needed).
  - Added per-property descriptions + JSDoc for new/changed ecology config surfaces.

### M3-012 (Biomes Stripe Banding Fix) DONE
- Draft PR: `#1233`
- Notes:
  - Biomes consumes Hydrology `climateIndices` (surfaceTemperatureC/aridityIndex/freezeIndex) instead of re-deriving from latitude/elevation.
  - Added truth viz layer `ecology.biome.biomeIndex` with stable explicit categories/colors.
  - Added regression test ensuring within-row biome variety for fixed seed (prevents horizontal banding domination).
  - Removed remaining `additionalProperties: false` annotations in the classify-biomes schema surface per compiler-closed-object posture.

### M3-015 (Hydrology effectiveMoisture + Soils/Fertility Biomes) DONE
- Draft PR: `#1236`
- Notes:
  - Hydrology publishes deterministic `artifact:hydrology.climateIndices.effectiveMoisture` (rainfall + `0.35*humidity` + riparian bonus; radius=1; minor=4; major=8).
  - Ecology biomes consumes `effectiveMoisture` from Hydrology + `artifact:ecology.soils` (`soilType`, `fertility`) with no local re-derivation and no probabilistic noise.
  - Presets + test configs were aligned to remove now-unknown `moisture.bias`, `humidityWeight`, and legacy `noise`/`riparian` blocks.
  - Gates: `bun run build` PASS; `bun run dev:mapgen-studio` started successfully.
