# Execution Plan: M3 Ecology Physics-First Feature Scoring + Planning

Read first: `README.md` and `VISION.md`.

This is the decision-complete execution plan that will be used to generate the milestone + issue docs.

## High-level Workstreams

1. Packet finalization (contracts + topology + gates)
2. Milestone authoring (M3 framed as remediation of M2)
3. Issue breakout (local issue docs)
4. Prework sweep (zero remaining prompts)

## Gating Philosophy

- No-fudging is enforced by static scans + runtime invariants.
- Determinism is enforced by fixed-seed diag dumps/diffs.
- Projection stamping must not hide truth planner errors.

## Tooling (already in repo)

Diagnostics scripts in `mods/mod-swooper-maps`:
- `bun --cwd mods/mod-swooper-maps run diag:dump -- <w> <h> <seed> --label <label>`
- `bun --cwd mods/mod-swooper-maps run diag:diff -- <baselineRunDir> <candidateRunDir>`
- `bun --cwd mods/mod-swooper-maps run diag:list`

Code discovery posture:
- Prefer `$narsil-mcp` when semantic search helps. Do not use `hybrid_search` (server instability).
- Prefer native tools (`rg`, `git`, direct file reads) for bulk scanning and high-signal verification.
- Keep the primary checkout on latest commits to keep MCP index fresh:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools` can be detached HEAD.

## Slice Map (for later implementation via dev-loop-parallel)

M3 is a behavior-changing milestone. We will still keep slices reviewable and shippable.

### Slice 0: Phase 0-3 docs only (this branch)

- Packet is complete and decision complete.
- Milestone doc exists.
- Issue docs exist.
- Prework prompts are executed/removed.

### Slice 1: Stage split topology + recipe wiring (truth stages)

- Introduce new truth ecology stages (pedology, biomes, score, ice, reefs, wetlands, vegetation).
- Keep `map-ecology` as one projection stage.
- Gates: recipe compile, determinism smoke.

### Slice 2: ScoreLayers op + artifact contract

- Implement `ecology-features-score` stage to publish `artifact:ecology.scoreLayers`.
- Compute all per-feature score layers independently.

### Slice 3-6: Per-family deterministic planning

- `ecology-ice` planner (deterministic)
- `ecology-reefs` planner
- `ecology-wetlands` planner
- `ecology-vegetation` planner

Each consumes scoreLayers + occupancy state.

### Slice 7: Projection stamping strictness

- `map-ecology/features-apply` becomes pure stamping and must not probabilistically gate.
- Add gate: stamping drops are failures.

### Slice 8: Delete legacy chance/multiplier paths

- Delete chance knobs, multipliers, rollPercent gating from ecology planning.
- Update tests and viz inventories.

## Commands (baseline checks)

- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd packages/mapgen-core build`
- `bun --cwd mods/mod-swooper-maps test test/ecology`

## Agent Team Execution (later)

Agents will work in isolated worktrees with Graphite stacks.
- Each agent owns a slice or a clearly partitioned set of issues.
- Each agent keeps a scratchpad under `docs/projects/pipeline-realism/scratch/` and clears it at slice boundaries.
