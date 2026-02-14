# SCRATCH Worker C — Placement Resources/Wonders/Discoveries

## Ownership
- Slices: S4, S5
- Branches: `codex/prr-epp-s4-resources-deterministic`, `codex/prr-epp-s5-placement-randomness-zero`
- Focus: Deterministic planning + stamping for resources, then wonders/discoveries.

## Working Checklist
- [ ] Add `plan-resources` op and placement resource plan artifact.
- [ ] Break adapter interface for resource IO (`get/set/canHaveResource`).
- [ ] Remove `generateResources` usage from placement apply path.
- [ ] Add deterministic natural wonder and discovery planners.
- [ ] Break adapter interface for deterministic wonder/discovery placement.
- [ ] Remove random engine generation calls from placement step.

## Decision Log
- None yet.
