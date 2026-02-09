# PACKET: M3 Ecology Physics-First Feature Scoring + Planning

This packet is the **execution authority** for Pipeline-Realism **M3**.

M3 is explicitly framed as **"M3 that remediates M2"**:
- **M2** (`docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`) is behavior-preserving architecture alignment (atomic ops + compute substrate + compiler-owned binding seam).
- **M3** is a behavior-changing realism cutover:
  - score *every* feature independently first (per-tile score layers)
  - plan afterwards (deterministic; ordered; conflict-aware)
  - project/stamp in `map-ecology` as a minimal deterministic materialization step

## Reading Order (mandatory)

1. `VISION.md` (human intent; non-negotiables; optimization targets)
2. `ARCHITECTURE.md` (stage/step/op/rule semantics applied to ecology)
3. `TOPOLOGY.md` (exact stage + step breakdown; truth vs projection)
4. `CONTRACTS.md` (artifacts + schemas; scoreLayers; planner IO)
5. `EXECUTION-PLAN.md` (slice map; gates; verification; agent team runbooks)
6. `DECISIONS.md` (decision log; must stay small)
7. `M2-REMEDIATION-MAP.md` (explicit relationship to M2; what is assumed/removed)

## Output Docs Produced From This Packet

- Milestone: `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
- Local issue docs: `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`

## Hard Constraints (non-negotiable)

- No output fudging: no chance percentages, multipliers, probabilistic gating.
  - Deterministic selection + seeded tie-breaks only.
- No legacy shims, no dual paths, no wrappers around bad ideas.
- Ops are atomic; steps orchestrate; ops do not call ops.
- Rules are op-local policy units; steps never import rules.
- Ordering is recipe-only (no stage manifest ordering).
