## Why

Latest Swooper map rolls show a resource distribution regression: only a
minority of placeable resources appear, with rubies visible and lotus also
visible in some rolls. The current placement planner produces deterministic
resource intents, but Wave 1 evidence shows it does not model official
per-resource terrain, biome, feature, water, age, class, and distribution
constraints before asking the Civ7 adapter to materialize each intent. The
adapter can then reject most planned exact type/tile pairs as engine-ineligible.

Lotus is also not a resource in the official data. It is `FEATURE_LOTUS`, an
aquatic feature, so resource closure must keep resource distribution and
feature-family visibility distinct even when both are visible map content.

This planning change defines the investigation, team structure, evidence
policy, resource stage architecture question, and Graphite/OpenSpec slice map
before implementation branches tune or rewrite placement behavior.

## Target Authority Refs

- Direct user decision: use a team of agents, run one wave per workstream
  phase, frame every agent prompt with `framing-design`, identify all official
  resources, design a dedicated strategy for each resource, match earthlike
  expected ranges with stats, then verify through game restart and scripting
  logs.
- Direct user decision: resources may become their own stage; resource steps may
  be resource groups when they have related input/output artifacts. Do not
  preserve `plan-resources` as a single step unless there is a specific,
  insurmountable reason.
- Root `AGENTS.md`: use Graphite stacked PRs, leave repo state clean, update
  adjacent docs/tests with behavior changes, and treat generated artifacts and
  lockfiles as read-only.
- `mods/mod-swooper-maps/AGENTS.md`: placement follows the op-per-concern
  pattern; placement step orchestrates ops. This is a starting constraint, not
  an immutable refusal of a resource stage after the direct user decision.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  MapGen normalization target shape and owner boundaries.
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml` and
  `resources-v2.xml`: official resource evidence.

## What Changes

- Open a planning-only resource distribution workstream.
- Define the multi-agent team, interfaces, accountability, and wave plan.
- Define an investigation brief for root-cause diagnosis and per-resource
  corpus/strategy work.
- Record early root-cause evidence from the current placement code.
- Reopen the architecture unit: evaluate a dedicated resource stage with
  resource-group steps and explicit artifacts rather than assuming
  `placement/plan-resources` remains the boundary.
- Split downstream implementation into reviewable OpenSpec/Graphite slices.
- Define verification gates spanning local stats, generated mod proof, and
  in-game restart/log proof.

## Requires

- `codex/resource-distribution-planning` remains stacked above
  `codex/morphology-public-config-surface`.
- Official resources submodule is initialized in the worktree.
- Local dependencies are available before running OpenSpec, type, test, and
  build gates.

## Enables Parallel Work

- `resource-distribution-root-cause`
- `resource-corpus-contract`
- `resource-stage-architecture`
- `resource-strategy-batches`
- `resource-distribution-stats-gates`
- `resource-distribution-runtime-proof`

## Forbidden Non-Goals

- No quota-only resource placement.
- No unreported exclusions when an official resource lacks a modeled strategy.
- No aggregate "resources placed" success claim without per-resource counts.
- No generated-output hand edits.
- No claim that lotus proves resource placement, because lotus is a feature.
- No implementation tuning before the relevant downstream OpenSpec slice exists.
- No refusal of a resource stage merely because current code has a
  `plan-resources` step.

## Verification Gates

- `bun run openspec -- validate resource-distribution-planning --strict`
- `bun run openspec:validate`
- `git diff --check`
- Planning branch cleanly committed as a Graphite child of the current stack
  top.

## Wave 1 Findings Integrated

- Official corpus: 55 base-standard resources are present in static official
  file/load order. Runtime `GameInfo.Resources` id order is not yet verified;
  rubies appear as `RESOURCE_RUBIES` in the static file-order slot currently
  treated as id `44`.
- Lotus correction: `FEATURE_LOTUS` is an aquatic feature, not a resource.
- Root-cause lead: commit `c2e9735aa` moved current resource placement from the
  official aggregate generator path to deterministic typed intents; the generic
  planner chooses exact resource ids before Civ7 feasibility checks and records
  `cannot-have-resource` rejections without alternate-type selection.
- Test gap: existing mock-adapter tests do not model Civ7 habitat rejection by
  default, and world-balance stats do not yet report per-resource diversity.
- Architecture correction after user input: Wave 1 was too conservative about
  stage boundaries. The next architecture slice must actively design a resource
  stage and reject it only if a specific blocker is proven.
