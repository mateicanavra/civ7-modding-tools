# Review Disposition Ledger: deep-habitat-d3-workspace-graph-boundary

## Status

D3 is accepted for design/specification after final per-domino rereview found
no unresolved P1/P2 blockers. D3 source implementation and implementation-time
boundary-review repairs are locally validated and submitted through draft PR
#1838 v3.

## Imported Negative Control Review

Context/router fixture: `$REMEDIATION_DIR/context.md`.

Source: `$D3_NEGATIVE_REVIEW`.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Live false-green `habitat:rule:biome-ci` alias was not made a blocking contract. | P1 | accepted; repaired; final D3 rereview accepted | `proposal.md` Problem Statement and Stop Conditions name the false-green alias. `design.md` Current Diagnosis and Validation Oracle define the failure. `spec.md` requires resolved dependency declarations and relationships. `tasks.md` requires bad-alias tests and cache-disabled alias validation. |
| Graph state model was left for implementation to design. | P1 | accepted; repaired; final D3 rereview accepted | `design.md` Target State Model defines `WorkspaceGraphReadState` and `WorkspaceTargetFact` states. `spec.md` requires closed target facts. |
| Owner/write-set boundaries were too vague to prevent duplicate graph truth. | P1 | accepted; repaired; final D3 rereview accepted | `design.md` Canonical Module Boundary, Approved Implementation Write Set, Protected Paths, and Safe Refactor Sequence name the owner module and concrete write set. |
| Validation gates were smoke checks that could pass while the alias false-greened. | P2 | accepted; repaired; final D3 rereview accepted | `proposal.md`, `design.md`, `tasks.md`, and `phase-record.md` require injected missing-project alias, cache-disabled alias run or dependency-execution evidence, and no-op wrapper failure semantics. |
| Spec delta did not cover alias, aggregate, graph error, malformed graph JSON, daemon/read failure, or public contract states. | P2 | accepted; repaired; final D3 rereview accepted | `spec.md` now has requirements for singular graph authority, closed target facts, dependency declaration resolution, consumer scope, D0/D2 blockers, and downstream fact consumption. |
| D0/D2 prerequisites were named but not operationally dispositioned. | P2 | accepted; repaired; final D3 rereview accepted | `proposal.md` Requires and `design.md` D0/D2 Dependency Inventory state that D3 source implementation is blocked behind concrete D0 rows and D2 graph projection implementation facts. |
| Verify was listed as a consumer without an integration contract. | P2 | accepted; repaired; final D3 rereview accepted | `proposal.md` Consumer Scope and `design.md` Consumer Contracts define classify/check/verify roles and D12 non-claims. |
| Downstream realignment was too generic to control D4, D7, and D12 assumptions. | P2 | accepted; repaired; final D3 rereview accepted | `design.md` Downstream Handoffs and `downstream-realignment-ledger.md` name D4/D7/D12 graph facts and non-claims. |
| Check appeared in product scenario but disappeared from implementation tasks. | P3 | accepted; repaired; final D3 rereview accepted | `proposal.md`, `design.md`, and `tasks.md` state that direct `habitat check` graph reads are non-goal; D3 controls only Nx inferred check surfaces. |
| Legacy proof/evidence language lacked local disposition. | P3 | accepted; repaired; final D3 rereview accepted | `design.md` treats legacy classify `proof` fields as compatibility DTO fields and rejects them as target-domain language. |
| Phase record used a local path form that would become stale across worktrees. | P3 | accepted; repaired; final D3 rereview accepted | `phase-record.md` now references `$REMEDIATION_DIR/context.md` variables for source, change, worktree, and branch identity. |

## Global Constraints

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global domain-language concern catalog applies to this packet. | Global constraint | applied, not acceptance evidence | D3 now names graph facts, target facts, dependency declarations, resolved dependency relationships, aggregate targets, and graph refusals as the local domain language. |
| Global OpenSpec artifact-shape constraints apply to this packet. | Global constraint | applied, not acceptance evidence | D3 artifacts now follow proposal/design/spec/tasks/workstream shape with D3-specific requirements. |
| Global information-design constraints apply to this packet. | Global constraint | applied, not acceptance evidence | `design.md` is the decision center; `tasks.md` and ledgers mirror the same contract. |
| Global validation-design constraints apply to this packet. | Global constraint | applied, not acceptance evidence | D3 validation gates are falsifying and scenario-specific; fresh rereview remains required. |
| Global cross-domino sequencing constraints apply to this packet. | Global constraint | applied, not acceptance evidence | D3 dependencies and D4/D7/D12 handoffs are explicit, but downstream packet acceptance remains separate. |

## Fresh D3 Investigation Dispositions

Sources:

- `$AGENT_SCRATCH/domino-D3-domain-ontology-investigation.md`
- `$AGENT_SCRATCH/domino-D3-code-topology-investigation.md`
- `$AGENT_SCRATCH/domino-D3-openspec-testing-investigation.md`
- `$AGENT_SCRATCH/domino-D3-typescript-state-investigation.md`
- `$AGENT_SCRATCH/domino-D3-information-design-investigation.md`
- `$AGENT_SCRATCH/domino-D3-cross-domino-investigation.md`

| Investigation | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Domain/ontology: graph fact language was too broad; dependency declarations needed a relationship model; refusal/error states and consumer projections needed closed names. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` Target Ontology now names `WorkspaceGraphSnapshot`, `WorkspaceProject`, `WorkspaceTarget`, `TargetDependencyDeclaration`, `TargetDependency`, `TargetAlias`, `GraphRefusal`, `ClassifyTargetProjection`, `CheckInvocationSurface`, and `VerifyTargetPlan`. `design.md` Target State Model separates `WorkspaceTargetState`, `TargetDependencyDeclaration`, and `TargetDependencyResolution`. |
| Code/topology: `plugin.js`, `nx-projects.ts`, and `command-engine.ts` remain separate graph authorities in current code; D3 needed one owner and complete write/protected set. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` Canonical Module Boundary, Approved Implementation Write Set, Protected Paths, and Safe Refactor Sequence name the Workspace Graph module and how `plugin.js`, `nx-projects.ts`, `command-engine.ts`, verify, graph command, and tests consume it. |
| OpenSpec/testing: workstream controls needed the full D3 validation suite and a full-domain graph inventory oracle, not only current alias checks. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` Validation Oracle, `spec.md` full graph inventory scenario, `tasks.md` validation task 7.4, and `phase-record.md` D3-INVENTORY gate require every Habitat-owned graph surface to be inventoried from the Workspace Graph module. |
| TypeScript state-space: no-op wrapper was too close to domain state; tasks/spec/phase had to make the full graph state model normative. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` removes wrapper command from `alias-target`, adds `NxInferredTargetDefinition` as a projection, and states no-op wrappers are valid only after resolved dependency declarations. `tasks.md` requires deletion of colon-split parsing and local graph maps. |
| Information design: plugin/service validation flow and public compatibility map were implicit; control records had to match the stronger design. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` Plugin/Graph Validation Data Flow and Public Compatibility Map now define contract/service/plugin/classify/verify handoff and D0 compatibility handling. `phase-record.md`, `downstream-realignment-ledger.md`, and `closure-checklist.md` now mirror the complete contract. |
| Cross-domino: D0/D2 design acceptance versus source readiness had to be explicit; D4/D7/D12 needed exact facts and non-claims. | P1/P2 | accepted; repaired; final D3 rereview accepted | `proposal.md`, `design.md`, `tasks.md`, `phase-record.md`, `downstream-realignment-ledger.md`, and `packet-index.md` state that D3 design may consume accepted D0/D2 design, while source implementation waits for concrete D0 rows and live D2 graph projections. D4/D7/D12 downstream facts and non-claims are named. |

## Supervisor D3 Dependency-Topology Challenge

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| D3 completeness review found that the Workspace Graph Integration contract must cover every dependency declaration kind currently emitted by Habitat, including same-project target dependencies, explicit project target dependencies, aggregate/workspace dependencies, and multi-dependency target relationships. | P1/P2 | accepted; repaired; final D3 rereview accepted | `design.md` now defines `TargetDependencyDeclaration` kinds for same-project target dependency, explicit project target dependency, aggregate/workspace dependency, and multi-dependency target relationship, plus resolution/failure rules. `spec.md` adds scenarios for same-project resolution/refusal, explicit project dependencies, aggregate child resolution, and closed declaration kinds. `tasks.md`, `phase-record.md`, and `closure-checklist.md` add validation gates for same-project and aggregate/multi-dependency behavior. |

## Remaining Gate

- [x] Fresh final D3 domain/ontology review accepts terminology and owner boundaries.
- [x] Fresh final D3 code/topology review accepts the write set and false-green alias repair.
- [x] Fresh final D3 OpenSpec/testing review accepts requirement families and validation gates.
- [x] Fresh final D3 TypeScript state-space review accepts graph states and safe refactor moves.
- [x] Fresh final D3 information-design review accepts artifact readability and no hidden implementation decisions.
- [x] Fresh final D3 cross-domino review accepts D0/D2 dependencies and D4/D7/D12 handoffs.

## Final D3 Rereview Evidence

| Review lane | Scratch record | Disposition |
| --- | --- | --- |
| Domain/ontology | `$AGENT_SCRATCH/domino-D3-final-domain-ontology-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers |
| Code/topology | `$AGENT_SCRATCH/domino-D3-final-code-topology-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers; P3 wording concern repaired in `proposal.md` |
| OpenSpec/testing | `$AGENT_SCRATCH/domino-D3-final-openspec-testing-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers |
| TypeScript state-space | `$AGENT_SCRATCH/domino-D3-final-typescript-state-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers |
| Information design | `$AGENT_SCRATCH/domino-D3-final-information-design-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers; P3 task wording repaired in `tasks.md` |
| Cross-domino | `$AGENT_SCRATCH/domino-D3-final-cross-domino-review.md` | accepted for design/specification only; no unresolved P1/P2 blockers |

## Implementation-Time Dispositions

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| `plugin.js` deletion would violate the D0/Nx public plugin surface. | P1 | accepted; repaired | `$HABITAT_TOOL/src/plugin.js` remains present and is still referenced by `nx.json` and `$HABITAT_TOOL/package.json`, but it is now only a one-line compatibility adapter over `$HABITAT_TOOL/src/plugin/nx-plugin.ts`. |
| Verify and classify could diverge if they consumed separate graph inventories. | P1 | accepted; repaired | `$HABITAT_TOOL/src/lib/classify.ts` and `$HABITAT_TOOL/src/lib/verify-receipt.ts` now consume the D3 workspace graph projections/target plan rather than separate local target construction. |
| Generic graph code must not hardcode host-specific Civ/MapGen generated-zone dependencies. | P1 | accepted; repaired | `generated:check` now uses the generic Habitat file-layer command; host-specific generated-zone policy remains a G-HOST/D10 non-claim. |
| Runnable alias wrappers must require resolved dependencies; unresolved graph relationships cannot false-green through `node -e ""`. | P1 | accepted; repaired | Workspace graph projections distinguish resolved and unresolved dependencies; `plugin.js` withholds unresolved aliases; `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` invokes the canonical Biome dependency and fails inside that dependency rather than succeeding through the wrapper. |
| Workspace graph refusal state was too loose for classify/verify consumers. | P2 | accepted; repaired | `GraphRefusalStateSchema` and related projection schemas are TypeBox-owned in `$HABITAT_TOOL/src/lib/workspace-graph/schema.ts`; classify derives its refusal DTO from that state rather than a hand-written parallel union. |
| D3 implementation introduced unnecessary JS shim surfaces. | P2 | accepted; repaired | The one-line registry JS re-export and stray note artifact were deleted. `find $HABITAT_TOOL/src -name '*.js'` now returns only `$HABITAT_TOOL/src/plugin.js`, which re-exports the TypeScript implementation for the existing Nx/package path. |
| TypeBox-first contract discipline must hold for D3 DTO/schema surfaces. | P2 | accepted; repaired | D3 graph, target-definition, and receipt-adjacent schemas use TypeBox schema constants plus derived static types and TypeBox `Value` parsing at boundaries; targeted scan found no `Type.Unsafe` or `as any` in D3-touched implementation source. |
| The JS loader boundary still owned too much graph construction and target-definition logic. | P2 | accepted; repaired | `$HABITAT_TOOL/src/plugin.js` is a one-line adapter. Nx plugin implementation lives in `$HABITAT_TOOL/src/plugin/nx-plugin.ts`; rule alias mapping lives in `$HABITAT_TOOL/src/rules/registry/graph.ts`; target definition construction lives in `$HABITAT_TOOL/src/plugin/target-definitions.ts`; TypeBox schemas remain the runtime validation source. |
| Nx inferred alias targets could be silently omitted because plugin inference used package JSON target inventory as dependency authority. | P2 | accepted; repaired | Package JSON scanning was removed from the Nx plugin implementation. Alias wrappers are emitted with explicit Nx `dependsOn` declarations, and Nx metadata/execution now owns missing dependency failure rather than a non-authoritative package inventory. `nx show project @internal/habitat-harness --json` reports all 16 `habitat:rule:*` aliases, including `biome-ci`. |
| The package `files` boundary did not include the TS modules imported by the plugin runtime. | P2 | accepted; repaired | `$HABITAT_TOOL/package.json` now includes `src/lib/workspace-graph`, `src/lib/workspace-graph-contract.ts`, and `src/rules/registry` alongside `src/plugin` and `src/plugin.js`, so the declared package file surface matches runtime imports including `src/plugin/nx-plugin.ts`. |
| Boundary review found an untriaged TODO committed in the D3 command test file. | P2 | accepted; repaired | The loose TODO was removed from `$HABITAT_TOOL/test/commands/habitat-commands.test.ts`; command-test modernization remains tracked by existing Habitat docs and later packet-owned command-test gates rather than a source TODO. |
| Boundary review found duplicate rule alias authority between plugin inference and classify/verify graph facts. | P2 | accepted; repaired | `ruleGraphFacts` now lives in `$HABITAT_TOOL/src/rules/registry/graph.ts` and is consumed by both `$HABITAT_TOOL/src/plugin/nx-plugin.ts` and `$HABITAT_TOOL/src/rules/facts.ts`; `$HABITAT_TOOL/src/plugin/rule-alias.ts` and `$HABITAT_TOOL/src/plugin/rule-graph.ts` were deleted. |
| Boundary review found duplicate target-name default policy in the JS loader. | P2 | accepted; repaired | `$HABITAT_TOOL/src/plugin/nx-plugin.ts` consumes `$HABITAT_TOOL/src/lib/workspace-graph-contract.ts` for target-name construction and validates the result with `WorkspaceGraphTargetNamesSchema`; the JS adapter does not reconstruct defaults locally. |
| Boundary review found workspace `lint` emitted as local projection truth without a D3 target-name declaration. | P2 | accepted; repaired | `lint` is now part of `WorkspaceGraphTargetNamesSchema` and the shared target-name contract. It remains a D0-compatible classify workspace aggregate projection, not an inferred Nx plugin target. |
| Boundary review found stale Graphite closure wording after PR #1838 v2 was submitted. | P2/P3 | accepted; repaired | D3 phase, downstream, packet-index, and review records now identify the boundary-review repair state and draft PR #1838 v3 instead of saying Graphite closure is pending/prepared. |

Implementation-time and boundary-review findings above are accepted and
repaired; no unresolved P1/P2 findings remain from those waves.
