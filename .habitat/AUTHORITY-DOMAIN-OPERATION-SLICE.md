# Domain Operation Kind Pocket Slice

Status: implementation-ready authority-slice spec

Built: 2026-06-29

Owner: DRA Habitat authority-tree workstream

Durability: standalone specification for the next bounded Habitat authority
slice after the Recipe Kind Pocket.

## Purpose

This document specifies the next bounded authority slice: the Domain Operation
Kind Pocket.

The goal is to move the rules that are truthfully about MapGen domain
operation modules, and only those rules, toward the correct constructible kind
owners. This slice should make the next physical reorganization easier without
turning current domain labels, recipe callsites, or migration cleanup defects
into ontology.

## Source Order

Use this source order when implementing or reviewing this slice:

1. Direct user decisions and current repo instructions.
2. `.habitat/DOMINO-FRAME.md`.
3. `.habitat/AUTHORITY-SLICE-FRAME.md`.
4. `.habitat/AUTHORITY-ONTOLOGY.md`.
5. `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
6. `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`.
7. Operation-adjacent ADRs:
   - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md`
   - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-031-strategy-config-encoding.md`
   - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md`
8. This document.
9. Current `.habitat/**/rule.json` manifests and source files as evidence.

Current rule packet placement is evidence, not ontology. The MapGen operation
module spec is stronger source evidence than current `.habitat` bucket labels
when deciding what is a constructible kind.

## Frame

In:

- `.habitat/civ7/mapgen/domain/**` rule manifests that are directly about
  domain operation modules, operation-internal strategy files, or operation-local
  boundaries.
- Narrow adjacent rows from `pipeline/_self` and `map-output/map-projection`
  only when the whole rule is truthfully about the operation kind.
- `mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/**` as source evidence.
- Recipe-step callsites only as evidence of how operations are consumed.

Foreground:

- `domain-operation` as a constructible kind.
- Strategy-file rules as operation-internal pressure, not as a separate
  accepted blueprint by default.
- Domain-specific buckets such as `foundation-domain`, `morphology-domain`,
  and `ecology-domain` as current contexts unless a rule proves a reusable kind
  owner.
- Physical movement that reduces future states while preserving rule identity
  and behavior.

Exterior:

- Whole-domain cleanup of foundation, morphology, ecology, hydrology,
  placement, resources, or narrative.
- Promoting `foundation-domain`, `morphology-domain`, or `ecology-domain` to
  blueprints merely because the current tree says so.
- Moving map projection rules that depend on exact standard-recipe step
  callsites.
- Splitting broad recipe+domain rules unless splitting is necessary for this
  slice and can preserve behavior cleanly.
- Creating capabilities or niche admission records.

Hard core:

1. A domain operation is a step-callable, schema-backed domain entrypoint under
   `src/domain/<domain>/ops/<op>/`.
2. An operation strategy is a swappable implementation of one operation under
   `src/domain/<domain>/ops/<op>/strategies/<strategy>.ts`.
3. Current domain names are contexts for operation instances; they are not
   accepted blueprints in this slice.
4. Rules move only when their whole rule meaning belongs to
   `domain-operation`; strategy-file rules default to operation-internal
   evidence or domain context unless existing source-order evidence proves an
   independent constructible kind.
5. Rule `id`, runner behavior, and artifact references remain stable across
   movement.

Falsifier:

Stop and report instead of forcing the migration if the candidate rule set
cannot be placed mostly under `domain-operation` or one coarse domain context
without creating a broader replacement taxonomy. Also stop if strategy-file
rules can only be justified by treating `strategies/<strategy>.ts` path grammar
or current foundation cleanup as ontology.

## Evidence Summary

The current source tree contains a stable operation-module grammar:

```text
mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/
  contract.ts
  types.ts
  rules/
  strategies/
  index.ts
```

Corpus facts observed before this spec:

- 104 operation-module directories exist under `mods/mod-swooper-maps/src/domain/**/ops/*`.
- 104 non-index strategy implementation files exist under operation
  `strategies/` directories.
- Multiple operation modules have more than one strategy implementation.
- Some current directories are support/shared surfaces, not operation
  instances: `ecology/score-shared`, `hydrology/shared`,
  `morphology/mountains-shared`.
- Some foundation operation modules lack `strategies/index.ts`; that is current
  topology evidence, not a reason to weaken the operation blueprint.

Current `.habitat/civ7/mapgen/domain` manifest counts by placement:

```text
domain-operation: 6
domain-public-surface: 6
domain-config-surface: 2
ecology-domain: 3
foundation-domain: 12
morphology-domain: 12
_self: 17
```

This is not a target taxonomy. It is an evidence map showing which rows need
pressure.

## Prescribed Blueprint And Strategy Pressure

### `domain-operation`

Constructible kind for operation modules:

```text
src/domain/<domain>/ops/<op>/
```

The operation blueprint owns rules that apply to operation modules as valid
operation modules, independent of which domain currently contains the instance.

It may own:

- required operation root presence;
- operation runtime purity;
- operation public boundary from runtime adapters, recipe orchestration, and
  map-output artifact keys;
- operation-local config and validation boundaries;
- operation contract shape when the rule applies to operation contracts as a
  kind.

It must not own:

- one domain's retired legacy tokens;
- one domain's cleanup shims;
- public domain surface rules for consumers;
- recipe-step orchestration rules;
- map projection callsite rules tied to exact standard recipe steps.

### Strategy-file pressure

The source model treats strategies as implementations selected by an operation
contract, with strategy config schema owned by the operation contract. This
slice therefore does not prescribe `operation-strategy` as a blueprint.

Strategy implementation files remain important operation-internal evidence:

```text
src/domain/<domain>/ops/<op>/strategies/<strategy>.ts
```

Strategy-file rules may be moved under `domain-operation` only when they are
truthfully operation blueprint governance over strategy subcomponents, not
foundation cleanup wearing a strategy path. A separate `operation-strategy`
blueprint requires source-order proof of independent anchor, admission, and
construction semantics; that proof is not established by this document.

Strategy pressure may cover:

- strategy import locality;
- strategy access to only its operation contract and local rules;
- strategy avoidance of shared implementation shims where the rule is general
  enough to represent operation-internal strategy governance.

It must not promote:

- domain-specific legacy cleanup that only happens to be in a strategy file;
- strategy config schema decisions that belong to the operation contract unless
  the rule directly governs strategy implementations;
- duplicate helper cleanup that spans non-strategy files.

## Current Contexts To Preserve

### `civ7/mapgen/domain`

Use the domain niche as the coarse context for cross-domain or domain-wide
rules that cannot truthfully be owned by one blueprint yet.

### Domain-specific contexts

Foundation, morphology, ecology, hydrology, placement, resources, and
narrative are current domain contexts. They may later become instances, niche
facts, or child ownership contexts. This slice does not decide that final
shape.

Rules with names like `foundation-domain` or `morphology-domain` stay
contextual unless the whole rule is reusable operation governance.

### `civ7/mapgen/pipeline`

The pipeline `_self` bucket still owns mixed recipe+domain runtime hygiene
rules until a later split. Do not move a whole rule into `domain-operation`
when it still governs recipe steps with equal force.

### `civ7/mapgen/map-output`

The map-output niche keeps map projection rules that govern exact projection
steps, shipped map entrypoints, placement outcomes, and map catalogs. Only
rules whose whole meaning is "domain operations must not depend on map-output
projection/effect artifacts" are candidates for the operation pocket.

## Candidate Rule Decisions

### Move Or Keep Under `domain-operation`

These are already in the operation pocket and should remain there unless the
implementation discovers a direct contradiction:

- `block_adapter_context_imports_from_domain_ops`
- `block_engine_runtime_imports_from_domain_ops`
- `prohibit_cross_op_runtime_calls`
- `prohibit_root_config_facade_imports_in_domain_ops`
- `prohibit_runtime_orchestration_helpers_in_domain_ops`
- `require_domain_ops_root_presence`

Candidate additional move:

- `prohibit_domain_ops_projection_effect_dependencies`

Rationale: despite current `map-projection` placement, the whole rule forbids
domain ops from depending on map projection/effect artifact keys. That is a
domain-operation boundary rule.

### Strategy-file Rules

Review these as operation-internal pressure, not as a prescribed
`operation-strategy` blueprint move:

- `prohibit_foundation_strategy_nonlocal_imports`
- `prohibit_foundation_strategy_shared_tectonics_lib_imports`

Default disposition: leave contextual unless the existing source-order evidence
shows the whole rule is `domain-operation` governance over strategy
subcomponents. Do not move them to a separate `operation-strategy` blueprint in
this slice unless the implementation first proves independent strategy
constructibility without relying on path grammar or foundation cleanup.

Review before moving:

- `prohibit_foundation_tectonics_strategy_nonlocal_imports`
- `prohibit_foundation_tectonics_strategy_shim_imports`

Rationale: these may duplicate or narrow the broader strategy-locality rules.
Default disposition: leave contextual and mark consolidation pressure unless
the implementation proves a distinct `domain-operation` rule meaning. Do not
leave both broad and narrow strategy-locality rules as duplicate semantic
authority under different owners.

Do not move as a whole without splitting:

- `prohibit_foundation_duplicate_math_helper_redefinitions`

Rationale: it scans strategies and non-strategy operation files. It is likely a
foundation context cleanup or a future split, not clean operation blueprint
governance as written. If a split appears necessary, stop and report the
proposed split instead of doing it inside this movement slice.

### Keep Contextual In This Slice

Keep these out of the operation blueprint unless implementation finds stronger
evidence than this spec records:

- `require_ecology_canonical_op_module_topology`
  - Current ecology-only topology evidence. It may become a generalized
    `domain-operation` structure rule later, but today all operation modules do
    not uniformly satisfy that shape.
- `preserve_decomposed_foundation_contract_surfaces`
  - Mixed foundation currentness, artifact tags, strategy imports, and
    projection facts.
- foundation, morphology, and ecology legacy-token cleanup rows:
  - `prohibit_foundation_advanced_cast_merge_fragments`
  - `prohibit_foundation_contract_config_bags`
  - `prohibit_foundation_legacy_aggregate_tectonics`
  - `prohibit_foundation_legacy_plate_kinematics`
  - `prohibit_foundation_projection_legacy_motion_source`
  - `prohibit_legacy_compute_tectonics_token`
  - `prohibit_removed_foundation_profile_config_tokens`
  - `prohibit_removed_foundation_wrap_polar_maturity_tokens`
  - `prohibit_legacy_morphology_config_keys`
  - `prohibit_legacy_morphology_effect_gating_tokens`
  - `prohibit_legacy_morphology_module_imports`
  - `prohibit_legacy_plate_driver_and_plot_mountains_dependencies`
  - `prohibit_morphology_dual_read_tokens`
  - `prohibit_runtime_continent_contract_tokens`
  - `prohibit_runtime_continent_step_tokens`
  - These may mention operation files but primarily govern domain-specific
    migration cleanup.
- `prohibit_bare_value_export_all_from_contract_surfaces`
- `prohibit_empty_object_defaults_in_contract_schemas`
- `prohibit_runtime_calls_to_runvalidated`
- `prohibit_runtime_local_config_default_merging`
- `prohibit_runtime_validation_and_compiler_imports`
  - These currently span recipe steps and domain operations. They should be
    split only if a later slice intentionally separates recipe-step and
    operation-runtime policy.
- map-output rows other than the single named candidate
  `prohibit_domain_ops_projection_effect_dependencies`:
  - `block_studio_config_leakage_into_shipped_catalog`
  - `preserve_physics_to_map_projection_contracts`
  - `prohibit_misplaced_projection_adapter_calls`
  - `protect_generated_map_entrypoints_from_hand_edits`
  - `require_projection_calls_in_projection_steps`
  - `require_typed_placement_outcomes_before_apply`
  - `validate_generated_map_entrypoint_contracts`

## Implementation Contract

Create a new Graphite child branch from the current stack.

Use absolute paths for every patch.

For moved rules:

- physically move the entire packet directory;
- preserve the rule `id`;
- update `rule.json` `placement`;
- update `runner.files` paths;
- update `artifacts.baseline` paths;
- update any docs or tests that reference the old active path;
- keep behavior unchanged.

For retained contextual rules:

- do not rename or move them for neatness;
- optionally add a small doc note only if the implementation proves a general
  rule future slices need;
- do not create capability or niche records.

For duplicate or overlapping strategy rules:

- prefer movement over cleanup only when the rule has a truthful
  `domain-operation` meaning;
- mark consolidation candidates in the slice spec or domino ledger rather than
  silently deleting enforcement;
- do not split rule IDs casually. If a split is needed, stop and plan the split
  as its own implementation decision.

## Validation

Minimum proof:

- `git diff --check`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/tools/habitat check`
- focused `bun habitat -- check --rule <id> --json` proof for every moved
  rule
- manifest path proof for every moved rule: each `runner.files` path and
  `artifacts.baseline` path exists, and no manifest value contains the old
  packet directory
- static scan showing moved manifests have no stale old `runner.files` or
  `artifacts.baseline` references
- static scan showing no active docs/tests point to old moved paths; generated
  inventories, archived files, and explicitly historical prose are exempt

Review gate:

- ontology reviewer checks that no domain context became a blueprint by label
  inheritance;
- implementation reviewer checks moved file references, stale paths, duplicate
  authority, and behavior proof;
- prompt/review pass checks that the next handoff does not re-open the old
  flat-corpus frame.

Broad `bun habitat -- check --json` may be run as observation, but it is not
required proof for this slice unless the runner rebuild domino has landed.

## Done Means

- `domain-operation` remains the accepted blueprint owner for operation-module
  rules.
- Strategy-file rules are either moved as `domain-operation` subcomponent
  governance or left contextual with consolidation pressure named.
- At least one misplaced adjacent rule is moved or explicitly rejected with
  source-backed rationale.
- Foundation/morphology/ecology labels are not preserved as blueprints by
  default.
- Contextual remainders are smaller or more honest than before.
- The next slice pressure is clearer than it is now.

## Next Implementation Prompt

Use this prompt on the first implementation turn:

```text
Implement the Domain Operation Kind Pocket slice.

Worktree:

/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame

Start by regrounding in:

- .habitat/DOMINO-FRAME.md
- .habitat/dominoes.md
- .habitat/AUTHORITY-SLICE-FRAME.md
- .habitat/AUTHORITY-DOMAIN-OPERATION-SLICE.md
- .habitat/AUTHORITY-ONTOLOGY.md
- .habitat/AUTHORITY.md
- docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md
- docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md
- docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md
- docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-031-strategy-config-encoding.md
- docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md

Use the source order in .habitat/AUTHORITY-DOMAIN-OPERATION-SLICE.md.

Frame:

- Current rule packets are evidence, not ontology.
- `domain-operation` is the constructible kind for `src/domain/<domain>/ops/<op>/`.
- Strategy-file rules are operation-internal pressure by default, not a
  separate accepted blueprint.
- `foundation-domain`, `morphology-domain`, and `ecology-domain` are current contexts, not accepted blueprints by label inheritance.
- Do not promote current packet labels, domain labels, runner labels, or defect labels into ontology.

Objective:

Physically reorganize the bounded Domain Operation Kind Pocket according to .habitat/AUTHORITY-DOMAIN-OPERATION-SLICE.md.

Primary candidates:

- Keep the existing `domain-operation` rules unless regrounding finds a direct contradiction:
  - block_adapter_context_imports_from_domain_ops
  - block_engine_runtime_imports_from_domain_ops
  - prohibit_cross_op_runtime_calls
  - prohibit_root_config_facade_imports_in_domain_ops
  - prohibit_runtime_orchestration_helpers_in_domain_ops
  - require_domain_ops_root_presence
- Move `prohibit_domain_ops_projection_effect_dependencies` to `domain-operation` if the evidence still supports that the whole rule is a domain-operation boundary rule.
- Review `prohibit_foundation_strategy_nonlocal_imports` and `prohibit_foundation_strategy_shared_tectonics_lib_imports`; move only if the existing source-order evidence proves `domain-operation` governance over strategy subcomponents. Otherwise leave them contextual and mark consolidation pressure.
- Review `prohibit_foundation_tectonics_strategy_nonlocal_imports` and `prohibit_foundation_tectonics_strategy_shim_imports`; default to contextual retention unless they have a distinct `domain-operation` meaning. Do not leave duplicate semantic authority under different owners.

Do not move as a whole:

- mixed recipe+domain runtime hygiene rules from pipeline `_self`;
- exact standard-recipe map-projection callsite rules;
- foundation/morphology/ecology legacy-token cleanup rows;
- `require_ecology_canonical_op_module_topology` unless already-existing evidence in the source order proves it valid for the operation kind without new taxonomy work;
- `prohibit_foundation_duplicate_math_helper_redefinitions`; if a split appears necessary, stop and report the proposed split.

Implementation contract:

- Create a new Graphite child branch from the current stack.
- Use absolute paths for every patch.
- Preserve every moved rule `id`.
- Update moved `rule.json` `placement`, `runner.files`, and `artifacts.baseline` references.
- Update active docs/tests only where they reference moved paths.
- Keep behavior unchanged.
- Do not create capabilities or niche admission records.
- Do not run broad cleanup or consolidation first.

Falsifier:

Stop and report instead of forcing the migration if the candidate rule set cannot be placed mostly under `domain-operation` or one coarse domain context without inventing a broader replacement taxonomy.
Also stop if strategy-file rules can only be justified by treating `strategies/<strategy>.ts` path grammar or current foundation cleanup as ontology.

Validation:

- git diff --check
- bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/tools/habitat check
- focused `bun habitat -- check --rule <id> --json` proof for every moved rule
- manifest path proof showing every moved `runner.files` and `artifacts.baseline` path exists
- static scans showing moved manifests do not contain stale old file references
- review-agent pass after implementation, with P1/P2 findings fixed or explicitly dispositioned

Close cleanly:

- update .habitat/dominoes.md if this completes or changes the next domino;
- commit through Graphite;
- leave the worktree clean;
- final response should name what moved, what stayed contextual, what was proved, and what the next slice pressure appears to be.
```
