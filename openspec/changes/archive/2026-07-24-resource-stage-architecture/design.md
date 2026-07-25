# Resource Stage Architecture Design

## Decision

`resources` is the accepted target stage for resource distribution recovery.
Keeping all resource behavior inside the existing `placement` stage is no
longer the target architecture; it is only the current implementation state.

This decision is based on the stage promotion rule: resources need an
independent recipe-level trace identity, stage-scoped corpus/helper ownership,
per-resource and resource-group planning artifacts, materialization/readback
evidence, local stats gates, and runtime proof hooks. Those are distinct enough
from starts, discoveries, natural wonders, and final placement summary to be a
real stage boundary.

## Target Stage Order

The target standard recipe order is:

```text
...
map-rivers
map-ecology
placement-preparation
resources
placement
```

`placement-preparation` is the required support split. The current placement
surface preparation work is a shared precondition for resources, starts,
discoveries, and final placement. It cannot remain hidden inside `resources`,
because that would make starts and discoveries depend on resource planning for a
surface they also need.

Target `placement-preparation` scope:

```text
placement-preparation
  derive-gameplay-inputs
  plot-landmass-regions
  place-natural-wonders
  prepare-placement-surface
```

Natural wonders stay before resources during the migration because current
behavior already stamps natural wonders before resource materialization. A later
natural-wonders stage may be designed separately, but this resource architecture
slice does not require that split.

The future `placement` stage remains the gameplay/product stage for starts,
discoveries, advanced starts, and final placement summary after resource
materialization has published its outcome artifacts.

## Target Resources Stage

```text
resources
  derive-resource-corpus
  derive-resource-expectations
  derive-resource-inputs
  score-resource-groups
  plan-resource-groups
  merge-resource-intents
  place-resources
  summarize-resource-distribution
```

### `derive-resource-corpus`

- Consumes: static official resource corpus module, runtime id verification
  status from the corpus slice.
- Publishes: `artifact:resources.corpus`.
- Invariant: every official resource row has placeability, valid ages, class
  overrides, official placement constraints, and strategy-required disposition.
- Consumer: `derive-resource-inputs`, `plan-resource-groups`, stats/runtime
  proof.
- Verification: corpus tests prove static rows and runtime id status are
  recorded separately.

### `derive-resource-expectations`

- Consumes: `artifact:resources.corpus`, map identity/size/age context, and
  resource research notes or documented inference rules.
- Publishes: `artifact:resources.earthlikeExpectations`.
- Invariant: each strategy-required resource has an expected range record for
  the supported map context before that range can become a gate.
- Consumer: `plan-resource-groups`, `summarize-resource-distribution`, local
  stats, runtime proof.
- Verification: expectation tests assert min/target/max, evidence source or
  inference rule, sample/condition scope, and gate status for every required
  resource.

### `derive-resource-inputs`

- Consumes: `artifact:resources.corpus`, ecology pedology/biome fields,
  hydrology fields, morphology/topography fields, map projection fields, and
  `artifact:placement.surfacePreparation`.
- Publishes: `artifact:resources.inputs`.
- Invariant: strategy inputs are resource-owned and do not depend on the broad
  placement input blob.
- Consumer: scoring and planning steps.
- Verification: input tests assert dimensions, typed arrays, corpus coverage,
  and no symbolic resource names without verified runtime ids.

### `score-resource-groups`

- Consumes: `artifact:resources.inputs`.
- Publishes: `artifact:resources.groupScores`.
- Invariant: each provisional group shares official constraints and earthlike
  evidence axes.
- Consumer: `plan-resource-groups`.
- Verification: score tests show each required resource has at least one owning
  group or an explicit blocked/not-map-placed disposition.

### `plan-resource-groups`

- Consumes: `artifact:resources.groupScores`,
  `artifact:resources.earthlikeExpectations`, and corpus disposition.
- Publishes: `artifact:resources.groupPlans`.
- Invariant: group plans are deterministic, per-resource visible, and explicit
  about eligible, selected, blocked, and suppressed resources.
- Consumer: `merge-resource-intents`.
- Verification: strategy tests assert every required resource has planned
  coverage or a named blocker.

### `merge-resource-intents`

- Consumes: `artifact:resources.groupPlans`.
- Publishes: `artifact:resources.intentPlan`.
- Invariant: cross-group conflicts, spacing, and duplicate tile/resource claims
  are resolved once before adapter materialization.
- Consumer: `place-resources`.
- Verification: merge tests prove all selected group intents either enter the
  final plan or receive a named suppression/blocking reason.

### `place-resources`

- Consumes: `artifact:resources.intentPlan` and
  `artifact:placement.surfacePreparation`.
- Publishes: `artifact:resources.placementOutcomes`.
- Invariant: adapter materialization remains typed; rejected exact intents are
  auditable by adapter numeric id and reason; readback mismatches fail hard.
- Consumer: `summarize-resource-distribution`, final placement summary, runtime
  proof.
- Verification: existing typed outcome tests move with the step.

### `summarize-resource-distribution`

- Consumes: `artifact:resources.intentPlan`,
  `artifact:resources.placementOutcomes`,
  `artifact:resources.earthlikeExpectations`, and corpus.
- Publishes: `artifact:resources.distributionSummary`.
- Invariant: aggregate resource counts cannot satisfy closure without
  per-resource status against expected ranges.
- Consumer: world-balance stats, runtime proof, final placement summary.
- Verification: stats tests assert per-resource planned/placed/rejected/mismatch
  coverage and expected-range statuses.

The stage also provides `effect:resources.placed` after typed materialization
and outcome publication. Remaining placement products consume this effect when
they require resource-aware fertility, start, discovery, or final placement
evidence.

## Stats And Runtime Proof Boundary

Local stats must consume `artifact:resources.distributionSummary`, not strategy
internals. They must report every strategy-required resource, including zero
planned or zero placed resources, so exclusions are visible. Stats compare
per-resource planned and placed counts against
`artifact:resources.earthlikeExpectations` and preserve adapter numeric ids
until runtime id mapping is verified.

Runtime proof must emit resource telemetry in the bounded Civ7 MapGeneration log
window. Recipe completion without `artifact:resources.distributionSummary`
telemetry remains pipeline proof only. Runtime logs must label local stats,
generated mod proof, deploy proof, and in-game proof separately.

## Resource Group Step Criteria

The provisional groups from planning are discovery groups until each group can
prove all of the following:

- consumed input artifacts;
- published output artifact;
- shared official constraint invariant;
- shared earthlike evidence axes;
- downstream consumer;
- verification boundary;
- owner for expected-range research notes.

Groups that cannot prove those fields remain strategy modules or research
sections under `score-resource-groups`/`plan-resource-groups`, not stage steps.

## Migration Sequence

1. `resource-corpus-contract`: create `artifact:resources.corpus` and separate
   static file order from runtime id verification.
2. `resource-earthlike-expectations`: create researched/inferred expectation
   ranges before any range becomes a gate.
3. `resource-artifact-boundary`: introduce resource-owned artifact ids while
   the implementation still runs inside the current placement stage. Move
   `artifact:placement.resourcePlan` and
   `artifact:placement.resourcePlacementOutcomes` toward transitional
   `artifact:resources.resourcePlan` and
   `artifact:resources.placementOutcomes`; update placement input/output
   consumers and resource tests. `artifact:resources.resourcePlan` is a
   pass-through migration name that preserves current behavior before
   group-plan merge exists. The final target after `resource-intent-merge` is
   `artifact:resources.intentPlan`. No stage move happens in this slice.
4. `placement-preparation-split`: promote placement input/surface preparation
   artifacts into a shared preparation stage consumed by resources and the
   remaining placement products. Move `derive-placement-inputs`,
   `plot-landmass-regions`, `place-natural-wonders`, and
   `prepare-placement-surface` together unless a separate natural-wonders stage
   is designed first.
5. `resources-stage-shell`: add `resources` stage with pass-through behavior
   equivalent to current resource plan/materialization. Move `place-resources`
   under the new stage, move the resources-placed effect to resource ownership,
   and update starts/final placement dependencies.
6. `resource-inputs-and-summary`: move resource-specific input building and
   distribution summary out of the broad placement input/output surfaces.
   Remove resource planning from `PlacementInputsV1`; move resource config from
   `placement.derive-placement-inputs.resources` to resource-owned step config.
7. `resource-intent-merge`: add group-plan merge and conflict/suppression
   evidence before strategy tuning.
8. `resource-strategy-batches`: add group/resource strategies in batches.
9. `resource-distribution-stats-gates`: enforce expected ranges.
10. `resource-distribution-runtime-proof`: deploy, restart, and prove resource
   telemetry in bounded scripting logs.

## Future Slice Write Sets And Tests

| Slice | Write Set | Required Tests |
|---|---|---|
| `resource-artifact-boundary` | `mods/mod-swooper-maps/src/recipes/standard/stages/resources/artifacts.ts`; placement artifact imports/consumers; `derive-placement-inputs`; `place-resources`; final placement summary/apply; resource tests | `placement-contracts.test.ts`, `placement-does-not-call-generate-snow.test.ts`, `resource-placement-diagnostics.test.ts` |
| `placement-preparation-split` | `mods/mod-swooper-maps/src/recipes/standard/stages/placement-preparation/**`; `recipe.ts`; config schema and shipped map config surfaces; topology tests | `resources-landmass-region-restamp.test.ts`, `lakes-area-recalc-resources.test.ts`, `standard-recipe.test.ts`, config/schema tests |
| `resources-stage-shell` | `mods/mod-swooper-maps/src/recipes/standard/stages/resources/**`; `tags.ts`; `assign-starts/contract.ts`; `recipe.ts`; configs; tests | pass-through equivalence test comparing same seed/config transitional `resourcePlan`, resource outcome summary, adapter `setResourceType` calls, and final `placementOutputs.resourcesCount`; no-official-generator tests |
| `resource-inputs-and-summary` | resource input, group planning, summary steps; `PlacementInputsV1`; resource-owned config; stats helper/tests | resource summary tests, world-balance stats diagnostics, config/schema tests |

## Migration Hazards

- Stage id changes alter full step ids, config lookup, traces, and Studio
  defaults. Do not introduce compatibility aliases in this architecture train.
- Artifact duplicate providers fail recipe creation; move artifact ownership in
  one branch before moving stage topology.
- Resource stage shell must not import placement-stage-local runtime helpers;
  create resource-local helpers or promote a helper only with an explicit shared
  invariant and consumers.
- Starts currently depends on resources being placed. Moving resource effects
  requires updating start dependencies and final placement summary consumers in
  the same implementation slice.
- Mock adapter acceptance still overstates live resource legality; migration
  tests preserve behavior, while later strategy slices must use corpus/runtime
  legality proof.

## Stop Conditions

- Runtime numeric id verification mismatches static assumptions and no
  disposition exists.
- `placement-preparation` cannot publish a stable shared surface artifact.
- Pass-through equivalence is missing before moving `place-resources`.
- Any official resource generator path returns.
- Typed rejection or mismatch behavior weakens.
- A proposed resource group lacks consumed inputs, published output, shared
  invariant, consumer, or verification boundary.
- A migration step changes resource placement behavior before the pass-through
  equivalence tests are in place.
