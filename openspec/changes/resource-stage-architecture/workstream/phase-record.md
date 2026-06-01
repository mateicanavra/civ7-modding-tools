# Phase Record

## Phase

- Project: resource distribution recovery
- Phase: resource stage architecture
- Owner: Codex workstream owner
- Branch/Graphite stack: `codex/resource-stage-architecture` above
  `codex/resource-distribution-root-cause`
- Started: 2026-05-31
- Status: committed

## Objective

Accept and specify the target dedicated `resources` stage without changing
runtime behavior. This slice creates the architecture contract future
implementation branches must follow.

## Scope

- Write set: `openspec/changes/resource-stage-architecture/**`
- Protected files: production stage topology, resource strategies, generated
  output, `.civ7/outputs/resources/**`, lockfiles, shipped tuning configs.
- Consumer impact: none in this slice.

## Evidence

- Current placement stage already exposes resources as a product step, but the
  stage still bundles resource concerns with natural wonders, starts,
  discoveries, advanced starts, surface preparation, and final summary.
- Root-cause diagnostics now expose per-resource outcome telemetry, enabling a
  resource-owned summary artifact later.
- User correction establishes that resources should not be kept in one planning
  step by default; resource groups can become steps when they have real
  artifacts and consumers.

## Review

- Product/verification review: Wegener recommended adding
  `resourceEarthlikeExpectations`, `resourceIntentPlan`, and
  `resourceDistributionSummary` as proof-producing artifacts, plus explicit
  local stats and runtime proof boundaries. Integrated into design/spec.
- Architecture review: Plato recommended accepting `resources` as its own
  recipe stage, making `placement-preparation` explicit, preserving natural
  wonders before resource materialization during migration, and adding a
  `merge-resource-intents` step. Integrated into design/spec.
- Implementation-safety review: Euler recommended artifact boundary before
  topology moves, explicit future write sets, pass-through equivalence tests,
  and hazards around stage ids, duplicate providers, resource-owned effects, and
  mock legality. Integrated into design/spec.
- Final review:
  - Plato: no P1/P2 blockers; prior stage/preparation/merge recommendations
    integrated.
  - Wegener: no P1/P2 blockers; expectation, stats, and runtime proof boundary
    are strong enough.
  - Euler: no P1/P2 blockers; P3 transitional artifact naming ambiguity
    repaired by labeling `artifact:resources.resourcePlan` as a pass-through
    migration artifact before final `artifact:resources.intentPlan`.

## Verification

- Passed:
  - `bun run openspec -- validate resource-stage-architecture --strict`
  - `bun run openspec:validate`
  - `git diff --check`

## Next Action

Proceed to the corpus contract and resource expectation slices.
