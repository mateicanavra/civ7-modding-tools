# Runbook: Phase 2 (Architecture, Topology, Contracts)

## Goal

Lock a decision-complete M3 design that implementers can execute without making decisions:
- stage/step topology (truth vs projection)
- artifact contracts (`scoreLayers`, `occupancy`, `featureIntents`)
- ordering + conflict model (explicit occupancy snapshot chain)
- deterministic + no-fudging posture (explicit bans + gates)

## Inputs / Sources of Truth

- Packet spine:
  - `../VISION.md`
  - `../ARCHITECTURE.md`
- Canon MapGen semantics and policy vocabulary:
  - `docs/system/libs/mapgen/MAPGEN.md`
  - `docs/system/libs/mapgen/llms/LLMS.md`
  - `docs/system/libs/mapgen/reference/REFERENCE.md`
  - `docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`
  - `docs/system/libs/mapgen/reference/ARTIFACTS.md`
  - `docs/system/libs/mapgen/reference/TAGS.md`
  - `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
  - `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`

## Outputs

- `../TOPOLOGY.md` is internally consistent and recipe-owned.
- `../CONTRACTS.md` declares exact artifact schemas and planner IO.
- `../DECISIONS.md` has no TBD and stays small.

## Agent Assignments (Phase 2)

- ARCH: topology consistency (stage ids, recipe wiring, truth vs projection invariants).
- SCORE: `scoreLayers` schema + per-feature layer inventory.
- PLAN: occupancy/conflict model + planning order + deterministic tie-break policy.
- VIZ: confirm no viz-only steps; ensure each step's viz output is attributable to the work.
- GATES: define the minimal static scan + deterministic dump/diff gates.

Scratch discipline:
- each agent keeps an untracked scratchpad under `docs/projects/pipeline-realism/scratch/`
- orchestrator migrates durable decisions into `../DECISIONS.md` and contracts into `../CONTRACTS.md`

## Gates

- `../TOPOLOGY.md` and `../CONTRACTS.md` agree on:
  - stage order
  - step names
  - artifact ids
  - planner ordering (ice -> reefs -> wetlands -> vegetation)
- `../DECISIONS.md` contains:
  - occupancy posture choice
  - no viz-only steps decision
  - biome-edge-refine integration decision
- `rg -n "TBD" ../` is empty except references to `LOCAL-TBD` issue ids.

## Do Not Do

- Do not leave any "disabled strategy" or silent skip concept in the target.
- Do not move planning logic into steps "because it's easier".
- Do not preserve legacy stage/step ids if they violate the new topology (M3 is a cutover).

