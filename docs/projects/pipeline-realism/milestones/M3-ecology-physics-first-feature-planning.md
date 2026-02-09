# M3-ecology-physics-first-feature-planning: Score Layers + Deterministic Planning (Remediates M2)

**Goal:** Cut Ecology over to a physics-first, no-fudging, score-then-plan model with earth-system-first stage boundaries. This is explicitly **M3 that remediates M2**.
**Status:** Planned
**Owner:** pipeline-realism

<!-- Path roots -->
$MOD = mods/mod-swooper-maps
$CORE = packages/mapgen-core
$PACKET = docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first

## Summary

- **M2** (behavior-preserving) aligns architecture: atomic ops + compute substrate + compiler-owned binding.
- **M3** (behavior-changing) upgrades realism:
  - score every feature independently first (per-tile score layers)
  - plan afterwards (deterministic; ordered; conflict-aware)
  - stamp in projection as minimal deterministic materialization

Canonical spec spine: `$PACKET/README.md` (this milestone is derived from the packet; the packet is the authority).

## Locked Directives (Non-Negotiable)

- No output fudging:
  - no chance percentages
  - no multipliers/bonuses used to gate output
  - no probabilistic gating in merge/stamp
  - seeded tie-breakers only
- No legacy shims / dual paths.
- Ops atomic; steps orchestrate; ops do not call ops.
- Rules are op-local policy units; steps never import rules.
- Ordering is recipe-only.

## Scope

### In Scope

- Stage topology change: split truth ecology into earth-system-first stages.
- Introduce `artifact:ecology.scoreLayers` as a first-class truth product.
- Redesign feature planning to be deterministic and conflict-aware.
- Redesign projection stamping to be minimal and deterministic; stamping drops are planner bugs.
- Replace chance/multiplier gating in ecology planners and plot effects.

### Out of Scope

- Gameplay "modding layer" adjustments beyond minimal deterministic stamping.
- Performance optimization beyond keeping runs reasonable.

## Acceptance Criteria

### Tier 1 (Must Pass)

- [ ] Build + tests green:
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- [ ] Deterministic run equivalence for fixed seed (M3 baseline vs rerun):
  - `bun --cwd $MOD run diag:dump -- 106 66 1337 --label m3-probe`
  - rerun with same args yields identical outputs per `diag:diff`.
- [ ] No-fudging gates pass:
  - static scan gates show no chance/multiplier gating in truth planning.
- [ ] `artifact:ecology.scoreLayers` exists, is schema-validated, and contains all per-feature score layers.
- [ ] Truth planning is ordered and conflict-aware; projection stamping does not probabilistically gate.

## Issues / Deliverables

This milestone is an index. Full detail lives in `$PACKET/EXECUTION-PLAN.md` and the local issue docs generated from it.

- [ ] `LOCAL-TBD-PR-M3-001`: Packet hardening: finalize topology + contracts + decision log
- [ ] `LOCAL-TBD-PR-M3-002`: Stage split: add truth ecology stages (earth-system-first) + recipe wiring
- [ ] `LOCAL-TBD-PR-M3-003`: ScoreLayers: schema + compute ops + viz
- [ ] `LOCAL-TBD-PR-M3-004`: Deterministic planning: ice
- [ ] `LOCAL-TBD-PR-M3-005`: Deterministic planning: reefs
- [ ] `LOCAL-TBD-PR-M3-006`: Deterministic planning: wetlands + wet features
- [ ] `LOCAL-TBD-PR-M3-007`: Deterministic planning: vegetation
- [ ] `LOCAL-TBD-PR-M3-008`: Projection stamping strictness + gates
- [ ] `LOCAL-TBD-PR-M3-009`: Delete legacy chance/multiplier paths + update tests/viz inventories

## Sequencing & Parallelization Plan

**Stacks Overview**
- Stack A (sequential unblockers): `M3-001` -> `M3-002` -> `M3-003`
- Stack B (parallel planners after substrate+scoreLayers): `M3-004..007`
- Stack C (sequential integration): `M3-008` -> `M3-009`

## Notes

- M2 must land first; M3 assumes atomic ops + compute substrate surfaces exist.
