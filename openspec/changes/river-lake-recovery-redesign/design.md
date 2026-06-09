# Design: River And Lake Recovery Redesign

## Objective Frame

Future state:

- Swooper Maps produces physically plausible minor and major rivers plus lakes
  from upstream Hydrology truth.
- Civ-visible river/lake materialization is driven by that truth through clean
  projection/materialization boundaries.
- Studio and live Civ evidence are captured from the same run and can prove
  authored truth, projected surfaces, rendered visibility, and remaining
  deltas separately.
- The authoring surface exposes semantic knobs that decouple real decisions
  instead of leaking internal selectors or legacy coupled thresholds.

In scope:

- Hydrology ownership of flow routing and hydrography truth.
- Morphology ownership of terrain/basin precursor inputs.
- `@civ7/map-policy` parity where Civ catalog/runtime semantics matter.
- Projection/materialization of rivers and lakes into Civ.
- Same-run Studio/Civ proof and visible-river acceptance.
- Workstream structure, closure criteria, and execution sequencing.

Exterior:

- Resource, wonder, or start recovery except where a proven dependency on river
  or lake truth must be recorded.
- Generic hydrology cleanup that does not move river/lake product reality.
- Compatibility preservation for stale selectors that do not match the model or
  Civ semantics.

Falsifier:

- The redesign is wrong if its execution slices still allow closure without
  same-run rendered river acceptance, or if the chosen owners still require
  projection/readback surfaces to define upstream hydrology truth.

## Problem Layers

1. Upstream hydrology truth may still underproduce coherent routed trunks or
   basin behavior in ways that downstream projection cannot honestly repair.
2. Civ river/lake semantic surfaces may differ from local mocks/catalogs, which
   can hide no-river vs minor-river vs major-river edge cases.
3. Projection/materialization may consume the right truth but fail to stamp or
   visualize it in the actual Civ surfaces users inspect.
4. Studio/Civ parity and product acceptance are not yet strong enough to prove
   visible in-game success or to classify residual failures cleanly.
5. Some public config surfaces still reflect legacy selectors rather than
   semantic control surfaces tied to the physical/product model.

## Ownership Model

- Morphology owns terrain matter, relief, sinks/basins, and any precursor data
  Hydrology needs for flow routing.
- Hydrology owns runoff, drainage routing, discharge, river class/trunks, lake
  truth, and physically grounded hydrology diagnostics/benchmarks.
- `@civ7/map-policy` owns pure Civ facts and generated catalog semantics such as
  river/lake enumerations, compatibility tables, and runtime-value alignment.
- `map-hydrology` and `map-rivers` own only projection/materialization and
  evidence artifacts derived from upstream truth.
- Studio/live-proof tooling owns observation and classification, not truth.

## Physical Expectations

The execution slices must predeclare at least these expectations before tuning:

- Drainage routing produces connected downslope networks except where closed
  basins are intentionally retained as lake outcomes.
- Major rivers are coherent routed trunks, not isolated discharge-threshold
  outlet tiles.
- Minor rivers appear as visible tributary structure where climate and basin
  area justify them; "minor" is not equivalent to "invisible."
- Lake truth is sink/basin justified and remains coherent with routed inflow and
  outflow behavior.
- End-user visibility is judged in rendered Civ and Studio surfaces, not only in
  internal artifacts or terrain identities.

## Proof Classes

- Local algorithm proof: unit/integration tests, stable-seed stats, physical
  benchmark suites.
- Semantic parity proof: exact alignment between repo-owned Civ semantic values
  and runtime/catalog truth.
- Projection/materialization proof: deterministic projection artifacts and live
  readback for the same authored run.
- Product proof: same-run Studio-visible and Civ-rendered evidence showing the
  rivers/lakes users are meant to see.

No lower proof class closes a higher one.

## Planned Change Train

This redesign does not start from a blank slate. It reconciles the installed
river/lake change inventory into the execution order below. Existing changes are
either the intended slice ids or the review inputs a later slice must supersede
explicitly.

1. `upstream-drainage-routing-repair`
   - Re-diagnose and repair upstream routing/lake truth as needed.
   - Keep the fix in Hydrology, with Morphology as precursor owner only.

2. `hydrology-river-network-metrics`
   - Predeclare physical benchmark expectations and stable seed matrix.
   - Publish generated-map diagnostics strong enough to judge trunk coherence and
     basin/lake behavior before projection.

3. `river-catalog-adapter-contract-hardening` +
   `civ7-map-policy-final-surface-parity`
   - Move and verify Civ semantic river/lake value alignment in the real catalog
     or map-policy owner.
   - Eliminate mock/runtime semantic drift.

4. `map-rivers-navigable-coherence`
   - Consume Hydrology truth cleanly from `map-hydrology` / `map-rivers`.
   - Remove wrong-owner selectors and define semantic projection knobs.

5. `river-lake-proof-class-ledger`
   - Separate hydrology truth, projection, readback, Studio visibility, Civ
     rendered visibility, and product acceptance claims.

6. `river-runtime-visible-proof`
   - Capture authored truth, projection output, live readback, camera state, and
     Civ-rendered evidence for the same run.

7. `lake-floodplain-product-proof-gates`
   - Add exact lake/floodplain closure rows and keep active non-zero floodplain
     proof seeds.

8. `studio-river-lake-inspector-dx`
   - Surface planned vs projected vs runtime river/lake states so reviewers and
     users can inspect the proof ladder directly.

9. `earthlike-visible-river-acceptance` +
   `swooper-earthlike-product-acceptance-proof`
   - Close the visible-river and lake/floodplain rows with explicit reviewer
     disposition.

10. `swooper-recovery-stack-product-closure`
   - Promote durable learnings to canonical docs, guards, and closure records
     only after the product rows are closed.

## Knob Posture

Knobs exist to decouple meaningful decisions. The redesign should prefer:

- hydrologic density/branching controls over map-river length heuristics;
- basin/lake propensity controls over buried strategy selectors;
- visibility/materialization controls only where they are truly projection
  policy, not hidden substitutes for upstream truth.

Any retained public control must map to a real owner and a named physical or
product effect.
