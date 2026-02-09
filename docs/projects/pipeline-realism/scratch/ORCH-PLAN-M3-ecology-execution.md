# ORCH-PLAN: M3 Ecology Execution

## Breadcrumbs
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-MAMBO-M3-ecology-physics-first`
- Branch: `codex/MAMBO-m3-002-stage-split-earth-system-first` (base: `main`)
- Packet: `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/`
  - Authority order: `VISION.md` -> `TOPOLOGY.md` -> `CONTRACTS.md` -> `DECISIONS.md`
- Current issue: `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-001-packet-harden-m3-ecology-physics-first-topology-contracts-gates.md`

## Slice Checklist (M3-001..009)
- [x] M3-001 Packet harden: topology/contracts/gates (verification-only unless drift)
- [ ] M3-002 Stage split: earth-system-first truth stages + recipe wiring cutover
- [ ] M3-003 ScoreLayers: schema + independent per-feature score ops + base occupancy
- [ ] M3-004 Deterministic planning: ice (consume scoreLayers + occupancy; publish intents + snapshot)
- [ ] M3-005 Deterministic planning: reefs (consume scoreLayers + occupancy; add missing reef-family features)
- [ ] M3-006 Deterministic planning: wetlands (joint resolver; no disabled strategies)
- [ ] M3-007 Deterministic planning: vegetation (joint resolver over score layers)
- [ ] M3-008 Projection strictness: stamping must not drop placements or randomly gate (add gates)
- [ ] M3-009 Cleanup: delete chance/multiplier paths; update tests + viz inventories

Current pointer: **M3-002**

## Gates Checklist (Hard, Forward-Only)
- [ ] No legacy shims/dual paths/wrappers
- [ ] No shouldRun / disabled strategy / silent skips
- [ ] No output fudging: no chance %, no multipliers gating existence, no probabilistic edges/jitter
  - Seeded RNG allowed only for tie-breaking equal scores
- [ ] Ops are atomic and never call ops; steps orchestrate
- [ ] Uniform model: scoreLayers first, then ordered planners with explicit occupancy snapshots (ice -> reefs -> wetlands -> vegetation)
- [ ] Projection stamping strict: `map-ecology/features-apply` must not drop placements or randomly gate
  - Rejections fail gates
