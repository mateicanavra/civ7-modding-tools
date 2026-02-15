# ORCH-PLAN: M3 Ecology Execution

## Breadcrumbs
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-MAMBO-M3-ecology-physics-first`
- Branch: `codex/MAMBO-m3-003-scorelayers-artifact-and-score-ops` (parent: `codex/MAMBO-m3-002-stage-split-earth-system-first`; base: `main`)
- Packet: `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/`
  - Authority order: `VISION.md` -> `TOPOLOGY.md` -> `CONTRACTS.md` -> `DECISIONS.md`
- Current issue: `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-003-scorelayers-artifact-schema-and-independent-per-feature-score-ops.md`

## Slice Checklist (M3-001..009)
- [x] M3-001 Packet harden: topology/contracts/gates (verification-only unless drift)
- [x] M3-002 Stage split: earth-system-first truth stages + recipe wiring cutover
- [ ] M3-003 ScoreLayers: schema + independent per-feature score ops + base occupancy
- [ ] M3-004 Deterministic planning: ice (consume scoreLayers + occupancy; publish intents + snapshot)
- [ ] M3-005 Deterministic planning: reefs (consume scoreLayers + occupancy; add missing reef-family features)
- [ ] M3-006 Deterministic planning: wetlands (joint resolver; no disabled strategies)
- [ ] M3-007 Deterministic planning: vegetation (joint resolver over score layers)
- [ ] M3-008 Projection strictness: stamping must not drop placements or randomly gate (add gates)
- [ ] M3-009 Cleanup: delete chance/multiplier paths; update tests + viz inventories

Future slices (post M3-009):
- [ ] M3-010 Post-cutover cleanup (dedicated cleanup slice; after M3-009)
- [ ] M3-011 Canonical docs sweep (dedicated docs sweep; after M3-010)

Current pointer: **M3-003** (keep pointer on M3-003 until the PR is submitted)

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
- [ ] Projection stamping strict: `map-ecology/features-apply` must not drop placements or randomly gate
  - Rejections fail gates
- [ ] Preset invariant: keep default presets in sync with stage/step ids (prevent silently ignored config)
  - `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` is the default preset for standard recipe defaults
- [ ] Naming invariant: step-facing score op keys start with `score*`
  - Vegetation score step keys: `scoreForest|scoreRainforest|scoreTaiga|scoreSavannaWoodland|scoreSagebrushSteppe`
- [ ] Schema invariant: prefer `TypedArraySchemas.*` over `Type.Any()` for typed arrays (artifacts/config); only keep `Any` with written rationale
- [ ] Slice-end command gates (run and record each slice)
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
  - `bun run build`
  - `timeout 20s bun run dev:mapgen-studio` (exit code 124 OK if it started; fail only on early crash)
