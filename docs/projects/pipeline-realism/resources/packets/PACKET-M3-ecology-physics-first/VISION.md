# Vision: M3 Ecology Physics-First Feature Scoring + Planning

## TL;DR

We are refactoring Ecology to be **physics-first**, **architecturally legible**, and **deterministic**, with a clean causal spine:

1. **Truth produces independent per-tile score layers for every feature**.
2. **Truth planning consumes those layers** to produce a deterministic, conflict-aware plan.
3. **Projection stamps/materializes** that plan into engine fields/effects.

This is a forward-only cutover. We will break legacy surfaces, replace them, and delete the old paths.

## What We Are Optimizing For (in priority order)

1. Developer DX (clear mental model; easy extension; minimal "where does this belong" confusion)
2. Architectural clarity (stage/step/op/rule/strategy boundaries mean what they say)
3. Maximal physical realism (scores encode physics signals; planners encode constraints)
4. Determinism (repeatable outputs; seeded tie-breaks allowed)

## Earth-System-First Stage Boundaries

Stages exist because the domain reality exists:

- Pedology (soil/ground substrate)
- Biomes (classification + transitions as part of classification)
- Vegetation (land plants)
- Wetlands (marsh/bog/mangrove/oasis/watering-hole style features)
- Reefs (marine ecology)
- Ice (cryosphere feature layer)

The pipeline should feel like an earth system, not a grab bag of "stuff we happened to compute." If splitting into more stages simplifies config and boundaries, we do it.

## Architecture Semantics (non-negotiable)

- **Stage**: config compilation boundary. Stages do not execute; steps execute.
- **Step**: orchestration node. Reads artifacts/buffers; calls ops; publishes artifacts; emits viz.
- **Op**: atomic algorithmic unit with explicit strategy envelope. Ops do not orchestrate other ops.
- **Strategy**: variability inside an op, selected by `{ strategy, config }`.
- **Rule**: op-local policy unit (scoring inputs, filters, thresholds); steps never import rules.

## Non-Negotiables (behavioral posture)

- **No legacy shims / dual paths**: no compatibility wrappers around bad ideas.
- **No silent skips**: no `shouldRun`, no “disabled strategy,” no optional ops by omission.
- **No output fudging**:
  - no chance percentages
  - no multipliers/bonuses that gate output
  - no probabilistic edges/jitter that changes outcomes
  - seeded tie-breakers are allowed only to break ties, not to decide whether something exists
- **Score independence**: score layers are computed independently (no cross-feature heuristics baked into score ops).
- **Planning is codified**: combining and selecting between layers is a planning-op concern.
- **Projection is a modding layer later**: projection can apply deterministic adjustments for gameplay in later milestones, but M3 keeps projection minimal and deterministic.

## Success Definition

After M3:
- there is an explicit `artifact:ecology.scoreLayers` (or equivalent) containing per-tile scores for every feature.
- truth planning produces a single deterministic plan (ordered; conflict-aware; no random gating).
- projection stamping does not "fix" planner bugs; it simply materializes.

## Failure Modes We Refuse

- “Works on my machine” randomness.
- Plans that depend on chance knobs.
- Cross-feature circular dependencies resolved by smuggling other scores into score functions.
- A mega-step or mega-op that becomes an architectural sink.
