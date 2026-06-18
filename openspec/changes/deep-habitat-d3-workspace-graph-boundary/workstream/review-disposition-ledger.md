# Review Disposition Ledger: deep-habitat-d3-workspace-graph-boundary

## Status

D3 is accepted for design/specification after final per-domino rereview found
no unresolved P1/P2 blockers. D3 is not implementation-complete, and source
implementation remains blocked until concrete D0 rows and live D2 graph
projection facts exist.

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
