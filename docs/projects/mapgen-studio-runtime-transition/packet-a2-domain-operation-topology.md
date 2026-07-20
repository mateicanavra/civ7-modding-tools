# Packet A.2: Domain Operation Topology

Status: takeover-controlled; validator ownership, rule introduction, G.1,
RuleDiagnostics, G.2, and A.3a are sealed; G.2.1 and an immutable handoff
boundary precede user-team Authority and descent execution

Parent workstream:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

Live initiative state:
`docs/projects/mapgen-studio-runtime-transition/verification-ledger.md`

## Outcome

Normalize every MapGen domain operation into one predictable, closed module
shape without changing algorithms, configuration semantics, recipe behavior,
runtime behavior, or public domain imports.

The completed corpus has one operation ontology:

```text
<domain>/ops/<operation>/
  contract.ts
  index.ts
  rules/
    index.ts
    <rule>.ts
  strategies/
    index.ts
    <strategy>.ts
```

Every operation root has exactly those four direct children. Both nested
directories require `index.ts`; named rule and strategy modules are allowed as
the operation requires them. An operation with no standalone rule retains an
intentionally empty `rules/index.ts` because the closed blueprint requires the
slot. This required empty slot is deliberate: optional `rules/` would retain
two operation shapes and force every constructor, reviewer, and authority rule
to reason about both. No operation root retains `types.ts`, `policy/`, helper
files, schema files, data files, or implementation catch-alls.

This packet is structural. Its product value is reduced state space before
static test/tool coverage and config-ontology work: every operation contract,
binding, strategy, and reusable local rule has one obvious owner.

## Laws

1. `contract.ts` owns the TypeBox operation contract and every type derived
   directly from that contract. A type bag formerly in `types.ts` moves here;
   strategy-private algorithm types remain with their strategy or named rule.
2. `index.ts` assembles the operation from its contract and named strategies.
   It preserves the operation's current named public export surface, but it
   does not contain an algorithm, policy, schema, helper, or inline strategy.
3. `strategies/<strategy>.ts` owns assembly plus the algorithm for that
   strategy. `strategies/index.ts` is an export-only barrel.
4. A reusable pure computation rule used by an operation lives in a named file
   under that operation's `rules/`. `rules/index.ts` is an export-only barrel.
5. Operation-local `policy/` is not a second kind. Pure operation-local policy
   becomes a named rule. Policy shared by more than one operation moves to the
   domain model policy owner only after a concrete consumer inventory shows
   that it is genuinely shared.
6. Cross-operation callers use domain public operation surfaces. They do not
   import another operation's private rules or strategies.
7. Domain registries remain `ops/contracts.ts` and `ops/index.ts`; they are not
   operation roots and are not changed into a new ontology.
8. No compatibility aliases, forwarding `types.ts` files, forwarding
   `policy/` directories, fallback imports, or dual layouts survive a slice.
9. No behavior test may inventory current contract keys, registry keys,
   configuration properties, source tokens, or exact implementation names.
   Delete such a test when TypeScript or positive Habitat authority owns the
   guarantee. Preserve tests of algorithms, generic schema laws, orchestration,
   composition, public boundaries, metrics, and runtime behavior.
10. Structure authority describes classes of operation modules. It must not
    enumerate the 101 current operation names or reproduce their source code.

## External Sentinel

`codex/readiness-final-aggregate-proof-green@f325250d087843e13b8c529c4fd036b84d911162`
is a separately owned, reference-only Habitat sentinel, not A.2's execution
base and not part of this packet's mutation cohort. Its
`descend-002-domain-operation-interior` frame, decisions, and row ledger are
required evidence for Branch 1. A.2 consumes their settled semantic work and
records which rows it satisfies, supersedes, or preserves; it does not mutate
or restack that worktree.

The direct initiative decision in this packet closes the sentinel's container,
dependency, and aggregation questions: both `strategies/` and `rules/` are
required slots, operation-local `policy/` is removed, and strategy dependencies
use positive generic authority. The remaining contract-quality question is
dispositioned below. Later stack integration must drop or supersede the
sentinel's overlapping execution frame rather than running a second
operation-interior descent. Generic Grit diagnostic acquisition,
authority-derived fix admission, and the corrective RuleFixPreview boundary
are prerequisites of A.2, not A.2 write surfaces. Their inherited mixed
candidate is evidence only. Each capability is reconstructed, reviewed, and
sealed on its own clean layer before Authority is recreated; no runner defect
is repaired opportunistically inside a domain branch.

## Authority Decision

Direct initiative direction and this packet's accepted target supersede the
older permissive operation-root model. The conflict must be repaired through
Habitat before source normalization proceeds.

Current conflicting authority includes:

- `.habitat/blueprints/domain/require_domain_source_topology/structure.toml`,
  which currently allows `types.ts` and `policy/` and makes `rules/` and
  `strategies/` optional;
- `.habitat/scopes/domain/scopes/ops/scopes/operation/`, which documents the
  same stale slots;
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  and `SPEC-packaging-and-file-structure.md`, which call `types.ts` canonical;
- `SPEC-architecture-overview.md`, `SPEC-standard-content-package.md`,
  `SPEC-appendix-target-trees.md`, and
  `SPEC-DOMAIN-MODELING-GUIDELINES.md`, which repeat that older operation
  surface;
- `adr/adr-er1-034-operation-kind-semantics.md` and
  `resources/workflow/domain-refactor/references/{op-and-config-design,structure-and-module-shape}.md`;
- `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`,
  which still admits operation-local type and policy surfaces;
- `.agents/skills/civ7-mapgen-workstream/assets/recipe-scaffolds.md` and
  `.agents/skills/civ7-mapgen-workstream/references/pipeline-map.md`;
- `docs/system/libs/mapgen/how-to/add-an-op.md` and
  `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`;
- `.habitat/blueprints/domain-operation-strategy/README.md`, which remains the
  strategy-semantics owner but needs an explicit link to parent topology;
- the Ecology-only `require_ecology_canonical_op_module_topology` rule, which
  is a permissive instance rule rather than generic blueprint authority;
- `preserve_decomposed_foundation_contract_surfaces`, whose exact operation
  inventory and required `../rules/` imports preserve the wrong algorithm
  ownership;
- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`
  rows for operation topology, strategy locality, contract quality, and rules
  entrypoints.

The authority branch must:

1. remove operation-root ownership from the parent domain structure packet;
2. add `require_domain_operation_source_topology` under the parent
   `domain-operation` blueprint. It owns the exact four direct root children
   and the closed `rules/` and `strategies/` scopes. The child
   `domain-operation-strategy` blueprint retains strategy identity, schema,
   binding, determinism, and dependency semantics; it does not own container
   topology;
3. add generic `require_domain_operation_entrypoint_shape` and
   `require_domain_operation_support_barrel_shape` Grit authority for
   assembly-only operation entrypoints and export-only nested barrels;
4. add `require_domain_operation_strategy_dependency_shape` under
   `domain-operation-strategy`. It positively owns strategy dependency classes
   across all six domains and supersedes the Foundation-only import list;
5. add `require_domain_operation_rule_dependency_shape` under the parent
   `domain-operation` blueprint. It positively owns imports and re-exports for
   every named rule module, not only the barrel, and can absorb legacy
   operation-local shim sentries without enumerating operations;
6. replace the under-scoped `prohibit_cross_op_runtime_calls` packet with
   `prohibit_domain_operation_private_cross_imports`. The replacement first
   preserves every existing entrypoint, domain ops-barrel, import, export, and
   dynamic-import failure class across every operation file, then adds sibling
   private `rules/` and `strategies/` path classes. The old locked rule retires
   only after fixture and injected-violation parity;
7. rewrite the active scope and architecture references to place
   contract-derived types in `contract.ts` and operation-local policy in
   named rules;
8. retire the duplicate Ecology topology rule and exact Foundation predicate
   through the existing Habitat registration and cleanup-ledger mechanism;
9. retain generic contract, registry, purity, deterministic-input, and runtime
   boundary authority while dispositioning every affected cleanup-ledger row.

All six new or replaced rules are admitted with the repo's normal rule
introduction records and shrink-only baselines derived from their named
diagnostics. Branch 1 remains green with those baselines. Each domain branch
removes only the baseline rows it resolves and runs baseline integrity against
its recorded branch parent; no branch may add or rewrite an unresolved row.
Placement closes every A.2 baseline as the locked empty array.

Structure fixtures must demonstrate that missing either nested `index.ts`
fails, an extra operation-root child fails, an intentionally empty
`rules/index.ts` passes, and arbitrary named rule and strategy modules pass.
Grit fixtures must discriminate valid assembly/barrel forms from executable
logic and private cross-operation imports without enumerating current operation
names or matching one exact implementation. Read the repository's Grit
capability records and current official GritQL documentation before authoring
those patterns. Do not replace Structure authority with a script or copy source
logic into a meta-layer.

### Sentinel And Residual Rule Disposition

Branch 1 re-derives these rows on the current Studio tip and closes them as
follows. A stale row is still recorded as stale; it is not silently omitted.

| Row | Disposition |
| --- | --- |
| D1 strategy container | satisfied by required `strategies/` in `require_domain_operation_source_topology` |
| D2 strategy dependencies | satisfied by `require_domain_operation_strategy_dependency_shape`; source anomalies B1-B4 enter the import-owner matrix |
| D3 contract quality | preserve the package-owned schema-description clause until its owner is separately adjudicated; remove only the blanket exported-function JSDoc and stale recipe-path clauses. A.2 does not silently delete or generalize contract-metadata authority |
| D4 support aggregation | satisfied by required nested indices, export-only/local-source barrel authority, and removal of operation-local `policy/` |
| A1 Ecology topology proxy | retire after generic Structure and source-shape fixtures cover its valid classes |
| A2 artifacts-module sentry | absorb only when an injected nested `artifacts.ts` probe fails the new closed Structure grammar; otherwise preserve it |
| A3 Foundation strategy import list | retire after positive generic strategy-dependency authority passes clean and injected fixtures |
| A4 tectonics shim re-export sentry | retire only after generic rule-dependency authority rejects the same shim from both a named rule module and its barrel |
| A5 Ecology contract-quality script | split according to D3; preserve schema-metadata pressure and delete only clauses that have no durable requirement |
| Foundation config-bag rule | retire after `require_domain_operation_contract_file_shape` and `prohibit_root_config_facade_imports_in_domain_ops` demonstrate fixture parity |
| `preserve_decomposed_foundation_contract_surfaces` | remove the mandatory `../rules/` clause after generic strategy authority replaces it. Rehome the foundation-tectonics operation inventory to a recipe-owned generic composition/execution check that does not duplicate the exact key list. Its unrelated artifact and projection concerns remain with their existing owners until separately dispositioned |

The additional authority sources named above are updated where they teach
`types.ts`, optional support directories, or per-op `policy/`; the strategy
README is preserved and linked to parent topology. No stale source is merely
left contradictory, and no historical document is rewritten when normal
supersession or archive treatment is the honest disposition.

## Baseline

The current corpus has 101 operation roots:

| Domain | Operations | Fully conforming |
| --- | ---: | ---: |
| Ecology | 34 | 6 |
| Foundation | 18 | 0 |
| Morphology | 19 | 0 |
| Hydrology | 19 | 0 |
| Resources | 8 | 0 |
| Placement | 3 | 0 |
| Total | 101 | 6 |

Cross-cutting deltas:

- 60 roots contain `types.ts`;
- 7 roots contain `policy/`;
- 48 roots lack `rules/index.ts`;
- 9 Foundation roots lack `strategies/index.ts` and keep strategy logic in
  root `index.ts`;
- 35 rules barrels still contain executable rule implementations;
- 89 roots violate the direct-child topology and six additional roots violate
  only the assembly/barrel laws, for 95 roots violating at least one
  destination invariant.

The census is execution input, not permanent authority. Habitat enforces the
kind shape generically after the corpus is normalized.

## Stack

The shared prerequisite spine is linear through one immutable A.2 launch
commit. From that tree, A.2 and the disjoint product-closeout work advance on
protected temporary tracks and are integrated later through inspected native
Graphite operations:

```text
codex/mapgen-domain-operation-topology               # this frame
  -> codex/mapgen-generated-validator-ownership
  -> codex/habitat-rule-introduction-baseline-manifests
  -> codex/mapgen-runtime-closeout-takeover-frame
  -> codex/mapgen-runtime-closeout-grit-diagnostic-acquisition
  -> codex/mapgen-runtime-closeout-rule-diagnostics-resource
  -> codex/mapgen-runtime-closeout-generic-fix-admission
  -> codex/mapgen-studio-atomic-reroll              # A.3a; source-independent of A.2
  -> codex/mapgen-runtime-closeout-rule-fix-preview # truthful no-write effect preview
  -> immutable A.2 launch boundary
       |-> user A.2: Authority -> census -> Ecology -> Foundation ->
       |             Morphology -> Hydrology -> Resources -> Placement
       |-> main: independent A.3 -> A.4 -> admitted A.5 -> control-oRPC ->
                   P19 -> P20
  -> inspected A.2 integration -> sensitive A.3 -> P21
```

Each branch is a complete, reviewable domino. Source mapping proved A.3a has no
A.2 dependency. G.2.1 closes the false planning surface before the launch
boundary; Ecology starts from the user team's sealed Authority tip. Neither
prerequisite is counted among A.2's Authority-plus-six closure branches.

The stale `codex/mapgen-domain-operation-authority` ref and its dirty worktree
are historical evidence, not the future Authority branch. Before handoff,
account every dirty hunk as adopted evidence, superseded, or excluded; retain
only unique settled decisions/docs needed by the launch contract; then remove
that worktree and branch ref. Dirty rules, fixtures, manifests, baselines, and
source changes remain excluded from the handoff tree.

Before the fork, the next branch starts only after the current branch's
implementation, focused checks, three review lanes, repairs, closing checks,
and Graphite commit are complete. After the fork, each track preserves those
same branch gates within its protected surface. Final A.2 aggregate receipts
amend the Placement branch; do not create a bookkeeping-only closure branch.

### Temporary Ownership Split

The takeover DRA owns every prerequisite through one clean immutable A.2
handoff commit, the independent non-A.2 closeout track, later integration, and
final product/stack closure. The user's A.2 team owns Authority implementation,
the advisory census and deterministic row classification, and all six domain
migrations from that handoff tree. The takeover DRA must consume the returned
commits, not reproduce them.

After handoff the main track does not mutate domain-operation source roots,
A.2 blueprints/scopes/patterns/baselines/authority records, A.2-specific docs or
tests, or the frozen generic Habitat rule/fix contracts. The A.2 track does not
mutate Studio config/browser/control surfaces, control-oRPC, P19/P20, or
unrelated static-coverage owners. Temporary parallel ancestry is permitted;
final linearization uses native Graphite operations after concrete inspection.

## Prerequisite Branch: Check Boundaries

The frame's classify-reported workspace gate found 11 Nx boundary violations
across three Habitat command checks:

- `validate_generated_map_entrypoint_contracts`;
- `verify_standard_recipe_artifacts_match_source_stages`;
- `verify_standard_recipe_public_authoring_surface`.

Their active authority records classify package execution, derived schemas,
and generated equivalence as package-local validation. Making the checks load
product code indirectly would hide real runtime dependencies from Nx and
preserve the wrong owner. This branch therefore retires all three Habitat
command packets through the normal registry and cleanup-ledger mechanism. It
does not add `createRequire`, dynamic loading, package exports, subprocesses, or
a new Habitat wrapper.

Retain useful behavior at its semantic owners:

1. Add a non-cacheable `mod-swooper-maps:generated:check` target. It depends on
   `gen:maps`, then fails when `git status --porcelain -- src/maps/generated`
   is nonempty. Make `mod-swooper-maps:test` depend on it. This post-generation
   check detects stale, missing, extra, or changed tracked entrypoints without a
   second content oracle or a standalone script; root CI already runs the test
   target.
2. Add one Swooper standard-recipe generated-artifact test that compares the
   generated schema and complete default config with
   `deriveStandardRecipeArtifacts()`. It also derives the expected UI metadata
   structural projection from `STANDARD_STAGES` and
   `deriveStageAuthoringModel()`, comparing stage IDs, step IDs, full step IDs,
   and focus paths. It does not duplicate label maps or config-property
   inventories. The existing test target's `build:studio-recipes` dependency
   supplies the generated artifact without a Habitat dependency cycle.
3. Keep generic stage authoring, closed-schema, and config-materialization laws
   in existing MapGen Core tests. Keep the existing Studio consumer test for
   generated focus paths resolving through schema and defaults.
4. Delete without replacement the hardcoded `STANDARD_PUBLIC_KEYS` table,
   exact stage/key equality, raw `{ strategy, config }` property-name scans,
   and literal focus-path bans. They mirror today's config vocabulary rather
   than behavior. Generated UI metadata remains covered by its real Studio
   consumer; exact label assertions are added only when a separately declared
   product contract requires particular labels.

Nx `generated:check` owns generated-entrypoint currentness. Habitat continues
positively owning generated-zone mutation/write protection and workspace
dependency boundaries. Update the active rule-authority cleanup rows and live
source-conversion inventory to the package-local destinations. Preserve the
closed command-check split wave as historical observation and add a
supersession receipt instead of rewriting it.

The root `habitat:biome:ci` target currently reports the separately owned
repo-wide lintEffect corpus assigned to `TOOL-EFFECT`. This branch runs Biome on
its exact changed files and does not claim that independent corpus is green.

Closing gates:

```bash
nx run habitat:boundaries
nx run habitat:check
nx run habitat:test
nx run mapgen-core:test
nx run mod-swooper-maps:generated:check
nx run mod-swooper-maps:test
nx run mapgen-studio:test
bun habitat check --rule protect_generated_map_entrypoints_from_hand_edits --json
bun run openspec:validate
bunx biome ci <exact changed TypeScript and JSON files>
git diff --check
git status --short
```

The generated check and test run must leave tracked and generated source clean;
the final `git status --short` observation must be empty after the branch
commit. The authority branch
starts only after these gates pass from the committed prerequisite tip. This is
an ownership correction, not permission to redesign generation, the Habitat
harness, Studio authoring behavior, or the independent lintEffect corpus.

## Tooling Prerequisite: Rule-Introduction Baseline Manifests

Authority admission exposed one upstream Habitat capability gap only after the
six generic rules produced nonempty initial diagnostic sets: D5 can validate a
rule-introduction manifest, but the CLI supplies no registry-owned manifest to
either D7 integrity or baseline expansion. This is a real dependency of the
shrink-only baseline contract, not permission to weaken it. A comparison of
the existing Habitat and `TOOL-EFFECT` branches found no deterministic
changeset that owns the complete runtime flow, so one minimal tooling branch is
inserted between the sealed validator tip and untouched Authority branch.

Owned work:

- add one optional rule-introduction-manifest support-file relation to D2 rule
  registry facts, referenced-file integrity, authority-path classification,
  and Nx target inputs;
- TypeBox-load and validate the referenced JSON in D5, preserving a distinct
  malformed refusal from missing and semantic mismatch;
- supply the admitted manifest through the existing registry contract to both
  D7 integrity and baseline-expansion paths;
- cover valid admission, missing relation or file, malformed JSON or schema,
  semantic mismatch, and write/no-write expansion behavior at the real
  CLI/service boundary.

The relation remains optional for rules that do not introduce nonempty debt.
Admission is never inferred from current diagnostics. The branch adds no
advisory mode, empty-baseline workaround, compatibility path, general Habitat
refactor, or second authority tree. The existing exact semantic match remains
authoritative for rule id, owner, runner, baseline path, comparison base, and
sorted unique initial keys.

Closing gates:

```bash
nx run habitat:boundaries --skip-nx-cache --outputStyle=static
nx run habitat:check --skip-nx-cache --outputStyle=static
nx run habitat:build --skip-nx-cache --outputStyle=static
nx run habitat:test --skip-nx-cache --outputStyle=static
bun biome ci --max-diagnostics=none \
  tools/habitat/src/nx-plugin.ts \
  tools/habitat/src/service/model/baseline/dto/baseline.schema.ts \
  tools/habitat/src/service/model/baseline/rule-introduction-manifest.policy.ts \
  tools/habitat/src/service/model/rules/dto/registry.schema.ts \
  tools/habitat/src/service/model/rules/policy/authority-paths.policy.ts \
  tools/habitat/src/service/model/rules/policy/facts.policy.ts \
  tools/habitat/test/lib/nx-plugin.test.ts \
  tools/habitat/test/rules/registry/facts.test.ts \
  tools/habitat/test/service/check-baseline-manifest-service.test.ts
bun biome check --linter-enabled=false --max-diagnostics=none \
  tools/habitat/src/service/model/baseline/operations.policy.ts \
  tools/habitat/src/service/model/rules/repositories/registry.repository.ts \
  tools/habitat/test/lib/baseline.test.ts \
  tools/habitat/test/rules/registry/manifest-contract.test.ts
git diff --check
git status --short
```

For changed files that inherit the independent `TOOL-EFFECT` lintEffect
corpus, the focused Biome gate requires formatter/parser success, an exact
parent-to-candidate diagnostic-fingerprint comparison, and changed-line
selection. Every candidate-owned selected diagnostic must be repaired; an
unchanged inherited fingerprint is neither an A.2 failure nor a waiver of the
independent corpus.

Three fresh adversarial lanes review TypeScript/Effect inference and resource
correctness; code quality, module ownership, JSDoc, and cornerstone comments;
and Habitat baseline authority, TypeBox 1.3 validation, CLI behavior, and D2 to
D7 dependency flow. Accepted findings receive bounded fresh implementation and
affected reruns. The branch starts at immutable validator tip
`dd38de22e05b1c014cc720099591a3a0726686a3`; Authority is recreated above its
sealed Graphite tip and receives no mutation before then.

The three initial code/test lanes and their affected re-reviews closed after
bounded repairs. The final candidate preserves the Effect environment in the
extracted manifest policy, removes the unused service-harness field,
distinguishes every declared missing/malformed/mismatch boundary state, and has
zero candidate-owned selected Biome diagnostics. A terminal records review
retained A2-HAB-CQ-003 after porcelain showed 13 code/test paths plus the five
existing record surfaces, not the previously recorded 12 plus five. The exact
count was repaired to 18 status paths, and a fresh exact-count re-review passed
with no P0-P3 and closed CQ-003.
Cached Habitat check and boundaries, 44 focused tests, and both parts of the
focused Biome gate passed. Uncached Habitat boundaries/check/build/test,
focused Biome, record integrity, protected-ref, and Graphite seal gates then
passed. The prerequisite is sealed at `9ff0f711e0d7`; those receipts do not
admit Authority until the three generic Grit capability layers above are sealed.

## Takeover Capability Prerequisites

Provider investigation exposed three generic prerequisites between the sealed
rule-introduction tip and Authority:

1. reconstruct diagnostic acquisition as a hermetic, pinned-CLI,
   TypeBox-decoded `check | apply-dry-run` boundary with explicit per-rule root
   dispositions and no identity-specific adapter;
2. derive admissible fix/apply planning from authority records instead of a
   hardcoded rule list, while preserving multi-rule selection and refusing
   unsupported live mutation;
3. correct that lossy planning surface into `RuleFixPreview`, with closed file
   impacts, explicit per-rule effect authority, one complete-root Grit
   observation, and categorical no-write semantics.

The inherited worktree mixes both provider evidence and the A.2 Authority
candidate. It remains read-only and uncommitted. The user's team re-derives
Authority from current diagnostics after the clean handoff; no inherited
Authority hunk crosses a prerequisite changeset or the launch boundary.

## Depth Cascade Admission

A descent is executable only after it is mechanical. Planning is not complete
because the destination shape is described; it is complete when every observed
red row has exactly one enforceable action and one exact destination and no
implementer must make an ownership or semantic decision.

Before handoff, the takeover DRA reconciles and retires the stale Authority
worktree/ref, imports the adapted readiness roadmap/workspace shape/pre-descent/
`descend-002` documents without stale execution state, settles the target
semantics and protected path surfaces, and freezes the launch SHA/tree plus
return contract. It does not implement Authority or classify the live red
corpus.

Starting from that immutable handoff, the user's A.2 team owns the following
gates before domain source mutation:

1. Use the existing N=1 frames as the analysis grammar:
   `BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`,
   `RULE-REMEDIATION-SLICE-FRAME.md`,
   `RULE-ACTION-CLASSIFICATION-FRAME.md`,
   `SINGLE-RED-INVENTORY-ITEM-INVESTIGATION-FRAME.md`, and
   `DESTINATION-SIMPLIFICATION-FRAME.md` under `.habitat/.active/frames/`.
   This packet's direct decisions supersede conflicts in those imported frames.
2. Finalize the generic Structure and Grit laws, fixtures, ownership, and
   diagnostic identity. Register their advisory form and run them against the
   complete current corpus. Do not classify violations against a provisional
   pattern.
3. Store the bounded red corpus as JSONL beside the imported `descend-002`
   workstream. Each row contains discriminants plus at most one explanatory
   field:

   ```json
   {"id":"D2-0001","ruleId":"require_domain_operation_strategy_dependency_shape","file":"mods/.../default.ts","clause":"import-source","predicate":"cross-domain-private","action":"rewrite-import","destination":"mods/.../contract.ts","frameRefs":["RULE-ACTION-CLASSIFICATION-FRAME.md"],"state":"mechanical","detail":"consume the already-admitted contract field"}
   ```

   `file`, `clause`, and `predicate` identify the violation. `action` comes from
   a finite vocabulary such as move, extract, inline, split, delete, add-slot,
   rewrite-import, retire-rule, replace-rule, preserve, or close-stale.
   `destination` is an exact owner path or an explicit no-change terminal, not
   a broad category.
4. Send disjoint row groups to fresh analysis agents with the relevant N=1
   frame, rule law, source neighborhood, allowed action/destination vocabulary,
   and proof oracle. They classify; they do not edit. The A.2 orchestrator
   integrates duplicate or conflicting classifications and preserves one row per
   file/clause/predicate.
5. If any row needs an action outside the finite vocabulary, lacks an exact
   destination, reveals a missing destination class, or cannot be asserted by
   the finalized authority, stop the descent and ask the user for the contextual
   decision. Do not hide that decision inside an implementation prompt.
6. Freeze the complete zero-unknown JSONL corpus, source-symbol preservation
   census, per-row focused proof, and disjoint write assignments. Only then
   launch fresh implementation agents in broad parallel. Their prompts contain
   predetermined rows and guardrails; implementation is relocation and repair,
   not design.

The JSONL ledger and imported frames are planning evidence, not a new runtime or
tracking system. Habitat diagnostics remain the authority and are rerun after
every slice. Any new red row invalidates mechanical readiness for the affected
slice and returns it to classification.

## Branch 1: Authority

Close the authority conflict before moving production files.

Owned work:

- positive parent `domain-operation` Structure and source-shape authority;
- positive child strategy-dependency authority;
- parent-domain structure split;
- operation/rules/strategies scope references;
- engine-refactor topology specs, evergreen ops contract, and architecture
  skill reference;
- Ecology topology-rule, exact Foundation predicate, and under-scoped
  cross-operation rule retirement;
- fresh cross-operation and cross-domain import-owner matrix;
- external `descend-002` row disposition;
- affected authority ledgers, manifests, baselines, and semantic fixtures.

This branch must remain green through shrink-only baselines. Its closing
condition is that the authority artifacts are internally valid, their fixtures
discriminate the target shape, the initial diagnostic keys exactly match the
fresh corpus, and baseline integrity passes against the branch parent. It must
not weaken a rule, grow a baseline after admission, or modify the Grit runner
merely to keep the old corpus green.

## Branch 2: Ecology

Normalize all 34 Ecology operations. This branch establishes the repeatable
patterns for thin type removal, policy-to-rule movement, empty rule slots, and
rules-barrel decomposition.

Already conforming:

- `compute-vegetation-substrate`
- `vegetation-score-forest`
- `vegetation-score-rainforest`
- `vegetation-score-sagebrush-steppe`
- `vegetation-score-savanna-woodland`
- `vegetation-score-taiga`

Type-surface removal, preserving existing real rules:

- `classify-biomes`
- `features-apply`
- `pedology-aggregate`
- `pedology-classify`
- `plan-plot-effects`
- `refine-biome-edges`
- `resource-plan-basins`
- `resource-score-balance`

Policy-to-rule movement:

- `compute-feature-substrate`
- `features-plan-ice`
- `features-plan-reefs`
- `features-plan-vegetation`
- `features-plan-wetlands`

Required rule-slot creation:

- `features-plan-floodplains`
- `ice-score-ice`
- `plot-effects-score-burned`
- `plot-effects-score-jungle`
- `plot-effects-score-sand`
- `plot-effects-score-snow`
- `reef-score-atoll`
- `reef-score-cold-reef`
- `reef-score-lotus`
- `reef-score-reef`
- `wet-score-mangrove`
- `wet-score-marsh`
- `wet-score-oasis`
- `wet-score-tundra-bog`
- `wet-score-watering-hole`

Resolve `resolveSnowElevationRange` before editing either consumer. It is
currently a private sibling-rule import, while the Standard-recipe diagnostics
independently compute the same percentile concept. Inventory the import and the
duplicate diagnostic implementation. Assign one honest shared Ecology
model-policy owner, or retain two deliberately distinct computations with
different names and owners. Do not duplicate the production rule or preserve
the private import.

## Branch 3: Foundation

Normalize all 18 Foundation operations.

Move inline root implementations into `strategies/default.ts`, preserving
behavior byte-for-byte except for imports and ownership:

- `compute-crust`
- `compute-crust-evolution`
- `compute-mantle-forcing`
- `compute-mantle-potential`
- `compute-mesh`
- `compute-plate-graph`
- `compute-plate-motion`
- `compute-plates-tensors`
- `compute-tectonic-segments`

Remove root type surfaces and classify every executable rule barrel before
moving it:

- `compute-era-plate-membership`
- `compute-segment-events`
- `compute-era-tectonic-fields`
- `compute-hotspot-events`
- `compute-tectonic-history-rollups`
- `compute-tectonic-provenance`
- `compute-tectonics-current`
- `compute-tracer-advection`
- `compute-plate-topology`

A whole single-strategy algorithm moves into `strategies/default.ts`. Only an
independently named reusable computation remains under `rules/`. Do not retain
thin strategies that merely delegate the entire algorithm to a rules barrel.

Delete
`test/recipes/swooper-physics-standard/stages/foundation-tectonics/contracts.test.ts`.
It mirrors the current operation-binding key set and declaration identities;
TypeScript, operation contracts, recipe execution tests, and positive Habitat
authority own those guarantees.

Local numeric clamps, limits, and algorithm constants remain implementation
constants with descriptive all-caps names near the top of their owning rule or
strategy module. Do not expose algorithm containment values as config.

## Branch 4: Morphology

Normalize all 19 Morphology operations.

Remove type surfaces and classify executable rule barrels under Laws 3 and 4:

- `compute-base-topography`
- `compute-belt-drivers`
- `compute-coastline-metrics`
- `compute-flow-routing`
- `compute-geomorphic-cycle`
- `compute-landmask`
- `compute-landmasses`
- `compute-sculpt-continental-margin`
- `compute-sea-level`
- `compute-substrate`
- `plan-foothills`
- `plan-island-chains`
- `plan-ridges`
- `plan-rough-lands`
- `plan-volcanoes`

Add the required intentional rule slot without inventing algorithm logic:

- `compute-coastal-adjacency`
- `compute-distance-to-coast`
- `compute-shelf-mask`
- `reconcile-heightfield-from-coast`

## Branch 5: Hydrology

Normalize all 19 Hydrology operations.

Remove type surfaces and classify executable rule barrels under Laws 3 and 4:

- `accumulate-discharge`
- `apply-albedo-feedback`
- `compute-atmospheric-circulation`
- `compute-climate-diagnostics`
- `compute-cryosphere-state`
- `compute-drainage-routing`
- `compute-evaporation-sources`
- `compute-land-water-budget`
- `compute-ocean-geometry`
- `compute-ocean-surface-currents`
- `compute-ocean-thermal-state`
- `compute-precipitation`
- `compute-radiative-forcing`
- `compute-thermal-state`
- `project-river-network`
- `transport-moisture`

Add required rule slots while preserving existing strategies:

- `compute-river-network-metrics`
- `plan-lakes`
- `select-navigable-river-terrain`

## Branch 6: Resources

Normalize all eight Resources operations:

- `adjust-resource-support`
- `derive-habitat-fields`
- `plan-aquatic-resources`
- `plan-cultivated-resources`
- `plan-geological-resources`
- `plan-resource-groups`
- `plan-terrestrial-resources`
- `select-resource-sites`

Move `select-resource-sites/policy/*` into named operation rules. Do not use
this structural packet to consolidate similar resource algorithms or invent a
shared resource-family helper.

## Branch 7: Placement

Normalize all three Placement operations:

- `plan-natural-wonders`
- `plan-starts`
- `plan-wonders`

Move `plan-starts/policy/*` into named rules, retaining each current concern as
an independently readable module. Before moving source, classify the existing
Placement-to-Hydrology imports for `plan-starts` and `plan-natural-wonders` as
an allowed public model-policy dependency, a public-root repair, or a required
contract input. A dataflow or behavior change is semantic backflow and requires
parent adjudication; it must not hide inside the topology move.

The `start-viability.test.ts` DTO and cast repair remains in A.3, where an
owner-local test TypeScript project can actually check it. A.2 preserves its
behavior cases and changes only imports that source movement makes necessary.

The two large Placement strategies remain strategy-owned algorithms. Split
only standalone reusable rules; do not fragment an algorithm into arbitrary
helpers to satisfy file-count aesthetics.

## Slice Loop

Every branch executes the same closed loop. This packet is the A.2 Wave Packet;
agent prompts are the Agent Packets, and the existing verification ledger holds
the per-branch corpus and assignment rows. Do not create another tracking
system.

1. Re-run the finalized advisory rules and admit only a zero-unknown JSONL
   slice whose rows still reproduce. A new or changed row returns to the depth
   cascade; it never becomes an implementation surprise.
2. Admit the exact branch parent, clean worktree, mutation owner, current
   sentinel SHA, row ids, disjoint allowed write sets, shared-file integrator,
   and forbidden edits. Create the named Graphite branch through `gt` only
   after that admission is frozen.
3. Assign a fresh implementation team. Parallel agents receive disjoint
   operation roots, one work kind, and only predetermined action/destination
   rows. They run TypeScript checking and focused tests while editing, not only
   after return.
4. The A.2 orchestrator integrates source-symbol preservation and reruns the
   advisory corpus.
   Any residual or novel row invalidates only the affected assignment and
   returns it to analysis; agents do not improvise a destination during repair.
5. Commit the complete semantic slice through Graphite, then run the
   branch's focused TypeScript, tests, Habitat, lint,
   and diff-hygiene checks.
6. Run three fresh read-only review lanes:
   - TypeScript refactoring and inference;
   - code quality, behavior preservation, modularity, comments, and operation
     ownership;
   - Habitat/Structure/Grit and relevant TypeBox/MapGen Core correctness,
     including baseline shrink and non-brittle rule design.

   Authority review emphasizes Structure fixtures, source-map consistency,
   cleanup-ledger disposition, and baseline mechanics. Ecology adds explicit
   architecture review of shared snow semantics. Foundation adds testing-design
   review of the deleted contract mirror.
7. Repair concrete findings with a fresh implementation team. Do not redirect
   reviewers into implementation work.
8. Rerun affected checks and the branch closing gates. Update the existing
   verification ledger, commit the branch-seal receipt, rerun gates affected by
   that receipt, and assert Graphite parentage plus an empty worktree.
9. Detach the clean Narsil checkout at
   `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools` to the
   final branch tip and let its watcher reindex naturally. If Narsil lags, use
   `rg`, TypeScript, and Nx rather than restarting or rebuilding its service.
10. Send the parent supervisor a branch-seal summary and proceed unless a
    correction or semantic-deviation decision is outstanding.

Agents finish naturally. Close them after collecting their result. Do not stop
an agent for speed, reuse a reviewer as an implementer, or keep stale agents
open across branches. An agent that is genuinely unresponsive or tool-failed
may be closed as `no-result`; account for its files and launch a fresh agent
rather than reusing it.

## Verification

Use Nx cache during implementation. Bypass it only for the final execution of
a closing gate whose receipt must establish current-tree execution.

Authority branch:

```bash
bun habitat classify .habitat/blueprints/domain-operation
nx run habitat:check
nx run habitat:test
bun habitat check --rule require_domain_operation_source_topology --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_entrypoint_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_support_barrel_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_strategy_dependency_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_rule_dependency_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule prohibit_domain_operation_private_cross_imports --baseline-integrity --base "$A2_BRANCH_PARENT" --json
git diff --check
```

Per domain branch:

```bash
bun habitat classify mods/mod-swooper-maps/src/domain/<domain>/ops
nx run mod-swooper-maps:check
bun test mods/mod-swooper-maps/test/domains/<domain>
bun habitat check --rule require_domain_operation_source_topology --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_entrypoint_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_support_barrel_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_strategy_dependency_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule require_domain_operation_rule_dependency_shape --baseline-integrity --base "$A2_BRANCH_PARENT" --json
bun habitat check --rule prohibit_domain_operation_private_cross_imports --baseline-integrity --base "$A2_BRANCH_PARENT" --json
git diff --check
```

`A2_BRANCH_PARENT` is the immutable parent SHA recorded at branch admission,
not an inferred `HEAD^` after intermediate commits.

Run every additional check reported by Habitat classification and the focused
recipe/stage tests named by the branch's changed consumers. A shell glob that
matches no tests is a command error, not a skipped gate; enumerate actual paths
from the current tree.

Closing each branch:

```bash
NX_DAEMON=false nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static
NX_DAEMON=false nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static
```

Aggregate A.2 closure after Placement:

```bash
bun run openspec:validate
bun run lint
bun habitat check --rule require_domain_source_topology --json
bun habitat check --rule require_domain_operation_source_topology --json
bun habitat check --rule require_domain_operation_entrypoint_shape --json
bun habitat check --rule require_domain_operation_support_barrel_shape --json
bun habitat check --rule require_domain_operation_strategy_dependency_shape --json
bun habitat check --rule require_domain_operation_rule_dependency_shape --json
bun habitat check --rule prohibit_domain_operation_private_cross_imports --json
bun habitat check --rule require_domain_operation_contract_file_shape --json
bun habitat check --rule require_domain_ops_registry_surface --json
nx run-many -t habitat:check
NX_DAEMON=false nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static
NX_DAEMON=false nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static
NX_DAEMON=false nx run mod-swooper-maps:build --skip-nx-cache --outputStyle=static
git diff --check
test -z "$(git status --porcelain)"
```

Aggregate closure also records the operation-root count with:

```bash
for ops in mods/mod-swooper-maps/src/domain/*/ops; do
  find "$ops" -mindepth 1 -maxdepth 1 -type d
done | sort | wc -l
```

The result must be 101. It is a census receipt only; the six Habitat rules and
their fixtures own topology, entrypoint, barrel, and private-import guarantees.

## Test Disposition

Delete the named Foundation contract mirror. Any additional deletion must be
pre-admitted in the branch corpus and show that a stronger static or behavioral
owner already exists. The relevant brittle categories are:

- operation or registry key inventories;
- exact contract property inventories;
- exact complete-config property inventories;
- source tokens, file paths, private imports, or implementation names;
- equality between two declarations without executing public behavior.

Do not replace a deleted mirror with another mirror. Preserve or add a test
only when a user-visible, domain-semantic, algorithmic, generic schema, recipe
composition, or runtime behavior would otherwise be unobserved.

These independent findings remain assigned to A.3 and must not expand A.2:

- test-inclusive TypeScript project coverage;
- the `start-viability.test.ts` derived-input and component-cast repair;
- unsafe casts in MapGen Core recipe/compiler tests;
- duplicate stateful execution in dependency-gating tests;
- broader Studio source-token tests;
- movement of source-local compile-time tests into owner-local test projects.

## Handoff And Return Contract

The initiative takeover DRA owns prerequisite closure, the immutable A.2 launch
commit, protected-surface accounting, the independent product track, returned-
stack integration, and final initiative closure. The user's A.2 orchestrator
owns this packet's Authority and domain execution from the launch tree through
the aggregate A.2 receipt. Neither side reproduces the other's changes.

The handoff records the exact launch commit and tree, Graphite ancestry,
prerequisite gates, protected path sets, curated frames, settled semantic laws,
known residuals, and return requirements. After handoff the takeover DRA does
not amend, squash, reorder, or redesign those ancestors without explicit
coordination.

The A.2 orchestrator:

- uses this packet and curated N=1 frames as the execution contract;
- manages fresh bounded research, analysis, implementation, and review sessions
  with model-optimized prompts and disjoint write sets;
- freezes the zero-unknown row corpus before mechanical source work;
- preserves unrelated main-track changes and never resets, stashes, or rewrites
  another worktree's state;
- seals coherent Authority and domain layers through Graphite;
- avoids custom progress tooling, behavior changes, generated hand edits,
  compatibility paths, and speculative cleanup;
- escalates any new destination, action, semantic backflow, or ontology change
  before dependent mutation.

Permanent review roles remain TypeScript/state-space, architecture/authority,
and product/runtime/library; fresh sessions fill them for every frozen
changeset and every materially affected repair. The returned stack must descend
from the launch commit, remain inside A.2-owned surfaces, be clean and reviewed,
carry the frozen JSONL/aggregate closure receipts, and report every intentional
deviation. The takeover DRA then inspects and integrates those commits with
native Graphite operations rather than recreating their tree.

## Closure

A.2 closes only when:

- the authority conflict is resolved through Habitat's normal mechanism;
- all 101 operation roots conform to the closed blueprint;
- no operation-local `types.ts` or `policy/` remains;
- root and nested barrels contain no displaced algorithms or rules;
- the brittle Foundation contract-key test is deleted;
- all A.2 rule baselines are empty and locked;
- the Authority branch and all six domain branches have complete review lanes
  and green declared gates;
- the aggregate checks pass from the committed stack tip;
- generated artifacts leave no tracked drift;
- the Graphite stack and active worktree are clean.

Closure also records the A.2 disposition of every overlapping
`descend-002-domain-operation-interior` row so later stack integration has one
surviving implementation authority rather than two.

This packet does not claim Studio Run in Game product closure. Its completion
unblocks A.3 static coverage and A.4 config-ontology reduction on a transparent
domain-operation substrate.
