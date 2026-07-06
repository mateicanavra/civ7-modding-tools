# Slice 001 Cleanup Execution

Status: closed execution record; implementation, review, and verification complete

Purpose:
close the small source and record residue left after the Foundation Lib and
Domain Model Config Law prework resolved the old open decision slices. This
packet is a cleanup execution container under Slice 001. It does not replace
the original Slice 001 topology record; it reconciles that record with current
source and turns the remaining cleanup into bounded, verifiable rows.

## Objective

By closure:

- active Slice 001 and Slice 002 records agree with current source, accepted
  prework decisions, and Habitat rule output;
- every `domain/<domain>/ops.ts` is binding-only;
- morphology elevation-scale policy has a real owner outside `/ops`;
- resource expected-count range has one reusable schema/data-contract owner;
- resource operation contracts no longer clone the expected-count range schema;
- enforcement rails exist for the cleanup claims that must stay true.

## Non-Objectives

- Do not reopen Foundation Lib, Domain Model Config Law, Placement Status,
  Resources Initial Map Authoring, or Domain Public / Import Surface as
  standalone decision packets unless current source evidence produces a new
  unresolved owner question.
- Do not merge `domain/<domain>/ops.ts` into `domain/<domain>/index.ts`.
  `index.ts` is the declarative domain contract/public domain surface; `ops.ts`
  is the executable implementation binding surface.
- Do not preserve public schema mirrors, helper barrels, or broad re-export
  surfaces to avoid import updates.
- Do not weaken artifact validation to reuse a generic primitive.
- Do not preserve or add tests that enforce topology, import boundaries, file
  shape, or structural law. Move those assertions to Habitat patterns/rules;
  tests in this slice are behavior or contract-semantics proof only.
- Do not create one-off Habitat rules for a single resource, symbol, artifact,
  or cleanup row. Blueprint rules express reusable classes of destination shape;
  row-specific facts are execution evidence, not law.
- Do not treat topology green as enforced topology law unless the governing
  topology rule is in the enforced lane.

## Authority And Current Evidence

Authority sources:

- `frame.md`, `inventory.md`, and `execution.md` in this Slice 001 packet;
- Slice 002 prework inventory and the completed Foundation Lib and Domain Model
  Config Law decision packets;
- `.habitat/scopes/domain/files/ops-ts.md`;
- `.habitat/scopes/domain/scopes/ops/files/index-ts.md`;
- accepted Habitat rules for domain source topology, public domain surfaces,
  operation contract shape, artifact file shape, artifact index aggregate
  shape, and domain model schema/policy owner shape.

Current evidence to refresh before implementation:

```bash
git status --short --branch
bun habitat check --rule require_domain_source_topology --json
bun habitat check --rule require_public_domain_surfaces_in_recipes_and_maps --json
bun habitat check --rule require_public_domain_surfaces_in_tests --json
bun habitat check --rule require_domain_model_schema_policy_owner_shape --json
bun habitat check --rule require_domain_operation_contract_file_shape --json
bun habitat check --rule require_artifact_file_shape --json
bun habitat check --rule require_artifact_index_aggregate_shape --json
```

Narsil MCP preflight:

- `get_index_status(repo: "civ7-modding-tools")` must show a complete index with
  git integration, call graph analysis, persistence, and watch mode enabled.
- If Narsil is unavailable, stop before source edits unless the executor records
  the outage and gets explicit approval to use `rg`/Git-only fallback evidence.

## Allowed Write Sets

Record files:

- this file;
- `slices/001-domain-root-immediate-ops-topology/inventory.md`;
- `slices/001-domain-root-immediate-ops-topology/execution.md` only if it needs
  a pointer to this cleanup packet;
- `slices/002-prework-decision-qualification/inventory.md`;
- `slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/resource-policy-data-contract.domino.md`;
- `slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/execution-status-register.md` only if current status language becomes stale after cleanup.

Habitat rule files:

- `.habitat/blueprints/domain/require_domain_ops_binding_surface/**`;
- `.habitat/blueprints/domain-operation/require_domain_ops_registry_surface/**`;
- `.habitat/blueprints/domain/require_domain_source_topology/**` only for an
  explicit lane promotion decision after green proof;
- `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/**`
  only if the resource data public allowance must be narrowed after the
  expected-count primitive move;
- `.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/**`
  only to add general reusable-primitive owner fixtures or positive assertions,
  never a resource-specific expected-count rule.

Source files:

- `mods/mod-swooper-maps/src/domain/morphology/ops.ts`;
- `mods/mod-swooper-maps/src/domain/morphology/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/ecology/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/hydrology/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/placement/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/resources/ops/index.ts`;
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts`;
- `mods/mod-swooper-maps/src/domain/morphology/model/policy/elevation-scale.ts`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`;
- `mods/mod-swooper-maps/src/domain/resources/model/schemas/expected-count-range.schema.ts`;
- `mods/mod-swooper-maps/src/domain/resources/model/schemas/index.ts`;
- `mods/mod-swooper-maps/src/domain/resources/model/data/earthlike-expectations/types.ts`;
- `mods/mod-swooper-maps/src/domain/resources/artifacts/earthlike-expectations.artifact.ts`;
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/contract.ts`;
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/contract.ts`;
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/contract.ts`;
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/contract.ts`;
- `mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts`
  for artifact validation behavior only;
- `mods/mod-swooper-maps/test/resources/resource-aquatic-op-contract.test.ts`
  for operation contract behavior only;
- `mods/mod-swooper-maps/test/resources/resource-cultivated-op-contract.test.ts`
  for operation contract behavior only;
- `mods/mod-swooper-maps/test/resources/resource-geological-op-contract.test.ts`
  for operation contract behavior only;
- `mods/mod-swooper-maps/test/resources/resource-terrestrial-op-contract.test.ts`
  for operation contract behavior only;
- `mods/mod-swooper-maps/test/morphology/ops.test.ts` only to remove topology,
  public-surface, or file-shape assertions, or to preserve behavior assertions;
- `mods/mod-swooper-maps/test/morphology/ops-shelf-mask.test.ts` only to remove
  topology, public-surface, or file-shape assertions, or to preserve behavior
  assertions;
- `mods/mod-swooper-maps/test/morphology/extracted-ops.test.ts` only to remove
  topology, public-surface, or file-shape assertions, or to preserve behavior
  assertions.

Everything else is protected unless the executor records the exact path,
reason, and row ID before editing.

## Stage 0: Current-State Row Ledger

Objective:
make the implementation row set explicit before edits.

Actions:

- create a temporary or in-document ledger with one row per stale inventory or
  domino claim that this cleanup touches;
- for each row record: old location, old state, current source evidence,
  accepted authority, final status, exact action, source-edit authorization,
  and proof class;
- classify each row as `closed-record-only`, `source-cleanup`, `rule-cleanup`,
  `domino-closed`, or `tracked-out-exact`.

Required rows:

| Row | Subject | Minimum final state |
| --- | --- | --- |
| `R-PLACEMENT` | Placement Status prework item | `closed-record-only`; placement is a legal domain, `placement/config.ts` is deleted, topology is green. |
| `R-RES-INITIAL-MAP` | Resources Initial Map Authoring prework item | `closed-record-only`; initial-map authoring policy is resolved to resources model policy plus `@civ7/map-policy` inputs. |
| `R-RES-DATA-CONTRACT` | `resource-policy-data-contract.domino.md` | either `domino-closed` by Stage 3 or `tracked-out-exact` with exact remaining symbols. |
| `R-DOMAIN-PUBLIC` | Domain Public / Import Surface item | `closed-record-only`; public-surface rules are green except rows named in this cleanup. |
| `R-MORPH-OPS` | Morphology `ops.ts` non-binding exports | `source-cleanup`; exact rows `M-001` through `M-006`. |
| `R-SLICE001-PENDING` | stale Slice 001 `Owner-law pending` rows resolved by completed prework | `closed-record-only` or exact source row in this packet. |

Gate:
no source edit may start while a row in this cleanup still has a broad
destination such as `model/*`, `policy`, `config`, `shared`, `later`, or
`owner-law pending`.

Acceptance:

- the ledger has no `Unresolved loss` and no broad destination labels;
- each executable row has an exact path and exact proof class;
- record-truth reviewer accepts the ledger before Stage 1.

## Stage 1: Enforcement Rail Admission

Objective:
make the cleanup enforceable before source burn-down.

Actions:

- create and register `require_domain_ops_binding_surface` as a positive
  file-shape rail for `mods/mod-swooper-maps/src/domain/*/ops.ts`;
- the rule must positively admit only:
  - import `createDomain` from `@swooper/mapgen-core/authoring`;
  - import the domain contract from `./index.js`;
  - import implementations from `./ops/index.js`;
  - `export default createDomain(domain, implementations)`;
- the rule must reject all non-default export forms in root `ops.ts`:
  `export {}`, `export *`, `export const`, `export function`, `export type`,
  and exported local declarations;
- create or extend a registry rail so `domain/<domain>/ops/index.ts` may contain
  only type imports for registry typing, default imports from direct ops-child
  `index.js` files, shorthand registry assembly, and the default registry
  export. Operation symbols are consumed through the domain ops object, not as
  named registry exports;
- run an injected bad/clean probe or equivalent fixture proof for both rails;
- confirm `require_domain_source_topology` is enforced green after promotion.

Gate:
the rails exist, are registered, have current-tree output, and have a bad-case
proof that would catch the exact residue being removed.

Acceptance:

- `bun habitat check --rule require_domain_ops_binding_surface --json` is a
  real command and reports diagnostics before source cleanup or a clean
  current-tree proof after source cleanup;
- the registry rail catches named exports, helper exports, named imports,
  namespace imports, type-only imports, side-effect imports, keyed/inline
  registry entries, spread forwarding, and method/accessor entries from
  `ops/index.ts`,
  or the execution records why that invariant is owned by a different exact
  rule;
- topology promotion decision is recorded as `promoted enforced`;
- enforcement/file-shape reviewer accepts Stage 1 before Stage 2.

## Stage 2: Morphology Ops Binding Cleanup

Objective:
make morphology match the domain `ops.ts` and operation registry owner shape.

Rows:

| Row | Current source | Final action | Destination / proof |
| --- | --- | --- | --- |
| `M-001` | `morphology/ops.ts` re-export of `GeomorphicCycleConfigSchema` | delete public re-export | no live consumer outside local contract/stage mirrors; prove with Narsil and `rg`. |
| `M-002` | `morphology/ops.ts` re-export of `LandmaskConfigSchema` | delete public re-export | no live consumer outside local contract/stage mirrors; prove with Narsil and `rg`. |
| `M-003` | `morphology/ops.ts` re-export of `ShelfMaskConfigSchema` | delete public re-export | no live consumer outside local contract/stage mirrors; prove with Narsil and `rg`. |
| `M-004` | `morphology/ops.ts` re-export of `SubstrateConfigSchema` | delete public re-export | no live consumer outside local contract/stage mirrors; prove with Narsil and `rg`. |
| `M-005` | `DEFAULT_ELEVATION_SCALE` defined in `compute-base-topography/rules/index.ts` and exported via `morphology/ops.ts` | move/reroute owner | `morphology/model/policy/elevation-scale.ts`; import from there in compute-base-topography rules and `landmassPlates.ts`. |
| `M-006` | `DEFAULT_ELEVATION_SCALE` re-exported from `morphology/ops/index.ts` | delete helper export | operation registry exports operation implementations, not helper constants. |
| `M-007` | named operation re-export blocks in every `domain/*/ops/index.ts` | delete convenience exports | operation registry is default-export only; consumers use the root domain ops object. |

Decision criteria:

- `DEFAULT_ELEVATION_SCALE` is morphology policy because it is shared by a
  morphology operation rule and a recipe stage step. It is not operation-local
  after cross-stage/source consumption is accepted, and it is not an `ops.ts`
  public convenience export.
- operation contract schemas remain in their owning operation contracts; if a
  stage needs authoring schema, it owns stage-local composition.

Gate:
all root `ops.ts` files pass the binding rail, and morphology registry no
longer exports non-operation helpers.

Acceptance:

```bash
rg -P -n '^export\s+(?!default)' mods/mod-swooper-maps/src/domain/*/ops.ts
rg -n 'DEFAULT_ELEVATION_SCALE' mods/mod-swooper-maps/src/domain/morphology/ops.ts mods/mod-swooper-maps/src/domain/morphology/ops/index.ts
bun habitat check --rule require_domain_ops_binding_surface --json
bun habitat check --rule require_domain_ops_registry_surface --json
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test
```

The first two `rg` commands must report zero matches.

## Stage 3: Resource Expected-Count Range Owner Cleanup

Objective:
close or narrow the resource data-contract domino by naming one reusable owner
for expected-count range shape and eliminating operation-contract clones.

Owner decision:

`mods/mod-swooper-maps/src/domain/resources/model/schemas/expected-count-range.schema.ts`
is the named reusable owner for the expected-count range primitive and related
TypeScript types:

- `ResourceExpectedCountRangeSchema`;
- `ResourceExpectationRangeEvidenceSchema`;
- `ResourceExpectedCountRange`;
- `ResourceExpectationRangeEvidence`.

Rows:

| Row | Current source | Final action |
| --- | --- | --- |
| `E-001` | new reusable expected-count range owner | create `resources/model/schemas/expected-count-range.schema.ts` and export it from `model/schemas/index.ts`. |
| `E-002` | `model/data/earthlike-expectations/types.ts` local `ResourceExpectedCountRange` / `ResourceExpectationRangeEvidence` | import or re-export the accepted primitive types from `model/schemas`; keep data-specific artifact types local. |
| `E-003` | `plan-aquatic-resources/contract.ts` local `ExpectedCountRangeSchema` | replace clone with imported primitive schema. |
| `E-004` | `plan-cultivated-resources/contract.ts` local `ExpectedCountRangeSchema` | replace clone with imported primitive schema. |
| `E-005` | `plan-geological-resources/contract.ts` local `ExpectedCountRangeSchema` | replace clone with imported primitive schema. |
| `E-006` | `plan-terrestrial-resources/contract.ts` local `ExpectedCountRangeSchema` | replace clone with imported primitive schema. |
| `E-007` | `earthlike-expectations.artifact.ts` blocked/active literal range schemas | keep closed corpus validation; reuse primitive vocabulary only where strictness is unchanged. |
| `E-008` | `resource-policy-data-contract.domino.md` | close if all rows above are complete; otherwise replace broad text with exact remaining symbols and trigger. |

Decision criteria:

- the reusable primitive owns the generic shape: `baseline`, `min`, `target`,
  `max`, and range evidence vocabulary;
- the artifact must keep closed corpus validation for blocked zero ranges and
  active accepted literal tuples unless tests prove an equivalent strict
  composition;
- operation contracts may own operation-specific expectation and plan row
  envelopes, but may not clone the generic expected-count range primitive;
- official resource ids and age vocabulary remain owned by `@civ7/map-policy`
  or `@civ7/types`, not this primitive.

Required artifact strictness proof:

- add or preserve a resource artifact test rejecting an ordered but non-corpus
  tuple, for example `{ min: 1, target: 1, max: 2 }`;
- add or preserve a blocked-resource test that still requires all-zero blocked
  ranges.

Gate:
all operation-contract clones are gone or converted to imports from the
accepted primitive, artifact validation strictness is unchanged, and owner
enforcement exists for the reusable primitive owner class. Closure requires the
general `require_domain_model_schema_policy_owner_shape` rule to prove the
destination class: reusable schema primitives live under
`domain/<domain>/model/schemas/*.schema.ts`, operation contracts may compose
from those primitives, and operation contracts may not become generic primitive
owner buckets. Fixture proof must be general; it may use resource-flavored
examples, but it must not encode the expected-count symbol name, artifact name,
or resources domain as the rule law.

`rg` clone scans and Narsil reference proof are row-level execution evidence for
the expected-count cleanup only; they are not Habitat law.

Acceptance:

```bash
rg -n 'const ExpectedCountRangeSchema|ExpectedCountRangeSchema = Type.Object' mods/mod-swooper-maps/src/domain/resources/ops
rg -n 'ResourceExpectedCountRange|ResourceExpectationRangeEvidence|ResourceExpectedCountRangeSchema|ResourceExpectationRangeEvidenceSchema' mods/mod-swooper-maps/src/domain/resources
bun habitat check --rule require_domain_model_schema_policy_owner_shape --json
bun habitat check --rule require_domain_operation_contract_file_shape --json
bun habitat check --rule require_artifact_file_shape --json
nx run mod-swooper-maps:test
nx run mod-swooper-maps:check
```

Narsil MCP proof to capture in the Stage 3 record:

- `find_references(repo: "civ7-modding-tools", symbol: "ExpectedCountRangeSchema")`
  before edits, to identify clone owners and call/import sites;
- `find_references(repo: "civ7-modding-tools", symbol: "ResourceExpectedCountRangeSchema")`
  after edits, to prove the accepted owner and consumers;
- `find_references(repo: "civ7-modding-tools", symbol: "ResourceExpectedCountRange")`
  after edits, to prove type consumers route through the accepted primitive.

The clone scan must report zero local clone definitions.
`require_domain_model_schema_policy_owner_shape` must have injected bad/clean
proof for the general reusable-primitive owner class. The full test run must
include the resource artifact and resource operation contract behavior tests
named in the allowed write set.

## Stage 4: Record Reconciliation And Topology Closure

Objective:
make the active records describe the new truth and remove the stale prework
queue.

Actions:

- update Slice 002 inventory so the old remaining decision slices are completed,
  superseded, or converted into exact implementation rows;
- update Slice 001 inventory so historical `Owner-law pending` rows resolved by
  completed prework are not active blockers;
- update `resource-policy-data-contract.domino.md` according to `E-008`;
- update `execution-status-register.md` only if its current closure overlay
  needs to mention this cleanup;
- update `rule.json`, run the check green, and record the Graphite commit as
  enforcement activation.

Stale-record scans:

```bash
rg -n 'Current next move: open and run the Placement Status|Owner-law pending|Resources Initial Map Authoring|Morphology `ops.ts` Non-Binding Exports|Domain Public / Import Surface|resource-policy-data-contract.domino.md.*tracked later' .habitat/.active/workstreams/define-domain-blueprint-structure
```

Gate:
record-truth scan output is either zero or each hit is in historical context
with an explicit current-state sentence nearby.

Acceptance:

```bash
bun habitat check --rule require_domain_source_topology --json
bun habitat check --rule require_public_domain_surfaces_in_recipes_and_maps --json
bun habitat check --rule require_public_domain_surfaces_in_tests --json
bun habitat check --owner mod-swooper-maps --json
git diff --check -- .habitat/.active mods/mod-swooper-maps/src mods/mod-swooper-maps/test
```

## Proof Matrix

| Proof label | Command/evidence | Proves | Does not prove |
| --- | --- | --- | --- |
| `RECORD_TRUTH_ACCEPTED` | Stage 0 ledger plus record-truth review | active records agree with current source and accepted decisions | source behavior |
| `OPS_BINDING_RAIL_PASS` | `bun habitat check --rule require_domain_ops_binding_surface --json` | root `ops.ts` files match binding-only shape | registry helper exports unless separate rail covers them |
| `OPS_REGISTRY_RAIL_PASS` | `bun habitat check --rule require_domain_ops_registry_surface --json` plus injected bad/clean proof | `ops/index.ts` contains only registry type imports, direct ops-child default imports, shorthand registry assembly, and the default registry export | root `ops.ts` shape; whether an ops-child directory is a valid operation remains owned by the topology rail while that rail is advisory |
| `RESOURCE_RANGE_OWNER_PASS` | `bun habitat check --rule require_domain_model_schema_policy_owner_shape --json` plus general injected bad/clean proof; row-level clone scan is supporting evidence only | generic range clone ownership is consolidated under the accepted owner class | artifact strictness |
| `ARTIFACT_STRICTNESS_PASS` | resource artifact tests | artifact validation did not weaken | all resource operation behavior |
| `HABITAT_DOMAIN_TOPOLOGY_GREEN` | `require_domain_source_topology` output | topology has zero diagnostics in enforced mode | behavior or package boundaries |
| `NX_CHECK_PASS` | `nx run mod-swooper-maps:check` | package static/typecheck passes | behavior |
| `NX_TEST_PASS` | `nx run mod-swooper-maps:test` | package tests pass | topology or architectural law |
| `DIFF_CHECK_PASS` | `git diff --check` | whitespace/diff hygiene | semantics |
| `GRAPHITE_SUBMITTED` | `gt submit --ai` | branch was published through repo workflow | correctness |

## Agent Lanes

### Lane A: Records And Dominoes

Inputs:

- this packet;
- Slice 001 inventory/execution/frame;
- Slice 002 prework inventory;
- Domain Model Config Law disposition, execution status register, and resource
  domino.

Output:

- Stage 0 row ledger;
- exact record patches for Stage 4;
- review finding disposition.

Blockers:

- any broad `Owner-law pending`, `later`, or active queue label that lacks an
  exact current state.

### Lane B: Habitat Rails

Inputs:

- `.habitat/scopes/domain/files/ops-ts.md`;
- `.habitat/scopes/domain/scopes/ops/files/index-ts.md`;
- existing domain, domain-operation, and artifact blueprint rules.

Output:

- registered `require_domain_ops_binding_surface`;
- registry-only rail or exact accepted owner rule;
- injected violation/clean proof;
- topology promotion recommendation and patch if accepted.

Blockers:

- fallback grep used as the only enforcement;
- negative-only rule that does not assert the positive file shape;
- topology claimed enforced while rule lane remains advisory.

### Lane C: Morphology Cleanup

Inputs:

- rows `M-001` through `M-006`;
- Narsil and `rg` references for every moved/deleted export;
- morphology model policy owner docs/rules.

Output:

- source changes for morphology binding cleanup;
- import/reference proof;
- package check/test proof.

Blockers:

- any extra root `ops.ts` export remains;
- `DEFAULT_ELEVATION_SCALE` remains public through `/ops`;
- operation contract schemas remain exposed as public convenience exports.

### Lane D: Resource Expected-Count Range

Inputs:

- rows `E-001` through `E-008`;
- resource artifact contract;
- resource model data types;
- four resource planning operation contracts;
- resource tests.

Output:

- reusable expected-count range primitive;
- clone removal;
- artifact strictness test/proof;
- resource domino closure or exact narrowed track-out.

Blockers:

- artifact validation accepts non-corpus active tuples;
- operation contracts retain cloned generic range schemas;
- `model/schemas` becomes a broader resource config bucket.

### Lane E: Final Review

Inputs:

- full diff;
- all Habitat/Nx outputs;
- Stage 0 ledger and proof matrix.

Output:

- P1/P2/P3 findings with accepted/rejected disposition;
- closure recommendation.

Blockers:

- accepted P1/P2 finding unresolved;
- untracked generated output;
- dirty worktree after Graphite submit.

## Planned Verification

```bash
bun habitat check --rule require_domain_ops_binding_surface --json
bun habitat check --rule require_domain_ops_registry_surface --json
bun habitat check --rule require_domain_source_topology --json
bun habitat check --rule require_public_domain_surfaces_in_recipes_and_maps --json
bun habitat check --rule require_public_domain_surfaces_in_tests --json
bun habitat check --rule require_domain_model_schema_policy_owner_shape --json
bun habitat check --rule require_domain_operation_contract_file_shape --json
bun habitat check --rule require_artifact_file_shape --json
bun habitat check --rule require_artifact_index_aggregate_shape --json
bun habitat check --owner mod-swooper-maps --json
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test
git diff --check -- .habitat/.active .habitat/blueprints mods/mod-swooper-maps/src mods/mod-swooper-maps/test
```

Use Graphite for commit and submit. Closure requires clean worktree after
Graphite submit.

## Closure Record

Completed:

- `require_domain_ops_binding_surface` is enforced green and locks root
  `domain/*/ops.ts` files to binding-only `createDomain` surfaces.
- `require_domain_ops_registry_surface` is enforced green and locks
  `domain/*/ops/index.ts` files to registry type imports, direct ops-child
  default imports, shorthand registry assembly, and default export.
- The registry rail was flipped red before closure for side-effect imports,
  mixed default+named imports, spread forwarding, and method registry entries,
  then returned green after each temporary probe was removed.
- Named operation registry re-exports were removed across all domain
  `ops/index.ts` files.
- `DEFAULT_ELEVATION_SCALE` now lives under morphology model policy and no
  longer leaks through `/ops`.
- Resource expected-count range shape now has a reusable
  `resources/model/schemas` owner; resource operation contracts compose that
  primitive instead of cloning it; artifact strictness remains artifact-owned.
- Active Slice 001/Slice 002 records now mark the old resource domino closed
  rather than tracked later.

Review:

- source/type reviewer: accepted, no unresolved P1/P2 findings;
- record-truth reviewer: found stale resource closure text; repaired and
  accepted;
- Habitat/Grit reviewer: found registry rule loopholes for broad operation
  imports, spread forwarding, method/accessor entries, and named/namespace/type
  operation-child imports; repaired and accepted.

Topology boundary:

`require_domain_source_topology` has been promoted to enforced after green
proof. The selected Slice 001 domain-root topology depth is now ratcheted as
live Habitat law.

Final verification:

- `bun habitat check --owner mod-swooper-maps --json`: pass, 79 rules, 0
  failing, 0 advisory findings;
- targeted Habitat rails for ops binding, ops registry, domain source topology,
  public domain surfaces, model schema/policy shape, operation contract shape,
  artifact file shape, and artifact index aggregate shape: pass;
- `nx run mod-swooper-maps:check`: pass;
- `nx run mod-swooper-maps:test`: pass, 493 passed, 2 skipped, 0 failed;
- `git diff --check -- .habitat/.active .habitat/blueprints .habitat/scopes
  mods/mod-swooper-maps/src mods/mod-swooper-maps/test`: pass;
- stale export/clone scans for domain ops re-export blocks and resource
  `ExpectedCountRangeSchema` clones: zero matches.
