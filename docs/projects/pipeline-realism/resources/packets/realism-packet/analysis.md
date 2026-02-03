# Foundation refactor planning packet: analysis

Date: 2026-02-03

This analysis compares the two recent plan-scale docs that appear to be the intended Foundation realism “full plan” set.

## Doc A: `spike-foundation-realism-gaps.md` (gap-driven remediation)

What it is:
- Evidence-backed gap inventory + remediation direction for Foundation realism.
- Ends in plan-ready synthesis (candidate slices) rather than staying purely exploratory.

Planning posture:
- Start from observed failures (“still Voronoi sketch”, weak coupling between crust/partition/kinematics) and drive toward stronger upstream drivers.
- Explicitly pushes against “noise as primary driver”; allows deterministic noise only as bounded micro-structure.

Key proposals that matter for a mantle/lid refactor:
- Plate partition realism as a first-class op (`foundation/compute-plate-partition`) with a non-Voronoi default strategy.
- An explicit mantle-scale driver option (“basin-weighted”): a low-frequency mantle/basin driver field used to seed/grow plates and induce curved boundaries + microplate belts.
- Crust as load-bearing prior: make continents/basins emerge from buoyancy/thickness/age rather than being a weak mask.
- Segment-based tectonics + belts: compute regimes/intensities on boundary segments, then project belt-scale deformation drivers so Morphology produces non-wall orogeny.

Why it’s useful:
- It reads like an implementable slice roadmap with concrete landing zones.

Risk:
- Because it’s a remediation spike, some “what exact artifact/contract changes are required” details are implied rather than fully enumerated.

## Doc B: `spike-foundation-realism-open-questions-alternatives.md` (decision-matrix planning)

What it is:
- A structured set of open questions with 2–3 alternatives each, plus recommendations.

Planning posture:
- Treats the work as an architectural decision set: crust ownership model, era/history semantics, polar policy, validation invariants.
- Pairs each alternative with implementation landing zones (contracts, step wiring, tests).

Key proposals that matter for a mantle/lid refactor:
- Explicitly frames which things must be truth artifacts vs projections and how to validate them without rendering.
- Provides crisp “Recommendation” choices that can be locked as refactor decisions.

Why it’s useful:
- It is the missing bridge from “spike observations” to “refactor decisions” that a Phase 4 implementation plan needs.

Risk:
- It doesn’t, by itself, provide the narrative “end-to-end slice plan”; it expects the gaps doc to provide the spine.

## Synthesis: how to use these two docs to finish planning

- Use Doc A (`gaps`) to lock the *sequence* (slice spine): partition realism → crust load-bearing → segment tectonics → polar plates → projection + validation.
- Use Doc B (`open questions`) to lock the *choices* for each slice before implementation begins.

If we want to start “with mantle and lid” explicitly:
- Treat “lid” as the existing mesh/crust/plate/tectonics truth spine (Foundation contract already supports this).
- Introduce “mantle drivers” as an explicit upstream field (or a driver op) that conditions partition + volcanism:
  - The realism spike already suggests a mantle-scale driver field for partitioning (basin-weighted strategy).
  - Prior art exists for a lightweight mantle proxy (“mantle pressure bumps”) in the legacy Earth-forces doc; we can use that as a sanity check for “cheap mantle drivers” without simulating full convection.

Next decision to surface (planning checkpoint):
- Does mantle-driver computation happen before plate partition (to bias plate topology), or after partition (as a derived field used primarily for melt/volcanism)?

## Note on deprecated earlier sources

An earlier version of this packet used non-primary docs (notably the older Phase-2 Foundation modeling spike and a Morphology addendum about overlays/hotspots). Those are now treated as background context only (see `sources.md`) and are not the plan spine for the current “Foundation realism” refactor planning.
