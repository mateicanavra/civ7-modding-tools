# Deep Habitat Phase 2 Workstream Packet Suite

This directory is the Phase 2 design suite for the Deep Habitat Toolkit refactor.
It is architecture and workstream design only. It does not authorize TypeScript
implementation.

The suite is grounded in:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`
- `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`
- `docs/projects/habitat-harness/domain-refactor-frame.md`
- current source under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/`

## Suite Objective

Design the full Phase 2 Deep Habitat Toolkit refactor workstream packet suite,
domino by domino, from the prepared source-authority register, scenario corpus,
code topology map, domain-responsibility map, and reviewed domino ledger. For
every domino, the packet states product scenario, domain owner, consumer,
contract, dependency order, TypeScript state-space reduction, public surface
impact, proof classes, review lanes, downstream realignment, Graphite/OpenSpec
closure, and stop conditions. Habitat remains a generic repo-local structural
toolkit. Implementation waits until this suite is reviewed.

## Suite Rules

- Current code is present-behavior evidence, not target-domain authority.
- Public command, package export, root script, Nx target, generator, and hook
  contracts are stabilized before internal extraction.
- A packet is valid only when it reduces reachable TypeScript state or deletes
  an accidental authority overlap.
- Proof classes stay separate: command behavior, schema tests, current-tree
  checks, native Grit behavior, injected violation proof, hook feedback, graph
  metadata, Graphite state, and OpenSpec validation are different claims.
- No packet may justify generic Habitat boundaries from Civ7 or MapGen-only
  behavior without the host-policy boundary.
- D15 is a trigger protocol, not a default substrate migration.

## Critical Sequence

1. D0 Scenario/Public Contract Inventory.
2. D1 Proof Contract Boundary.
3. D2 Rule Registry Metadata Contract.
4. Parallel lanes after D0/D1: G-HOST Host Policy Boundary can start while D2
   proceeds. After D2, D3 Workspace Graph Integration Boundary, D5 Baseline
   Authority, and D6 Diagnostic Pattern Catalog can proceed.
5. D4 Orientation and Routing after D3.
6. D10 Generated/Protected Zone Authority after G-HOST and D2.
7. D7 Structural Enforcement Pipeline after D5, D6, and D10.
8. D8 Pattern Governance after D5 and D6.
9. D9 Transformation Transaction after D8, D6, and D10.
10. D11 Local Feedback after D7, D9, and D10.
11. D12 Proof/Handoff Verify Command after D1, D3, and D7.
12. D13 Scaffolding and Refusal Contracts after D0, D2, D8, and G-HOST.
13. D14 Authoring Topology Fence after D4, D12, and D13.
14. D15 Execution Provenance Substrate Trigger is evaluated inside D6, D7, D9,
    and D11 only when typed command provenance is otherwise impossible.

## Packets

- [D0 Scenario/Public Contract Inventory](./D0-scenario-public-contract-inventory.md)
- [D1 Proof Contract Boundary](./D1-proof-contract-boundary.md)
- [D2 Rule Registry Metadata Contract](./D2-rule-registry-metadata-contract.md)
- [D3 Workspace Graph Integration Boundary](./D3-workspace-graph-integration-boundary.md)
- [D4 Orientation and Routing](./D4-orientation-and-routing.md)
- [D5 Baseline Authority](./D5-baseline-authority.md)
- [D6 Diagnostic Pattern Catalog](./D6-diagnostic-pattern-catalog.md)
- [D7 Structural Enforcement Pipeline](./D7-structural-enforcement-pipeline.md)
- [D8 Pattern Governance](./D8-pattern-governance.md)
- [G-HOST Host Policy Boundary Gate](./G-HOST-host-policy-boundary-gate.md)
- [D9 Transformation Transaction](./D9-transformation-transaction.md)
- [D10 Generated/Protected Zone Authority](./D10-generated-protected-zone-authority.md)
- [D11 Local Feedback](./D11-local-feedback.md)
- [D12 Proof/Handoff Verify Command](./D12-proof-handoff-verify-command.md)
- [D13 Scaffolding and Refusal Contracts](./D13-scaffolding-and-refusal-contracts.md)
- [D14 Authoring Topology Fence](./D14-authoring-topology-fence.md)
- [D15 Execution Provenance Substrate Trigger](./D15-execution-provenance-substrate-trigger.md)
- [Review Disposition Ledger](./review-disposition-ledger.md)
- [Validation Results](./validation-results.md)

## Packetization Decision Table

| ID | Standalone Status | Why It Is Separate |
| --- | --- | --- |
| D0 | Standalone packet | Every other packet depends on public command/API/export compatibility. Folding it into D1 would let proof terminology hide public surface drift. |
| D1 | Standalone packet | Proof-class boundaries are consumed by most later packets and must be stable before proof DTOs are reshaped. |
| D2 | Standalone packet | Registry metadata is the typed source for graph, classify, baseline, diagnostics, governance, zones, and scaffolding; a section in one consumer would recreate duplicated interpretations. |
| D3 | Standalone packet | Workspace graph truth has separate Nx/plugin proof and fixes the false-green target-alias risk before classify/verify consume targets. |
| D4 | Standalone packet | Orientation is the primary user/agent entry scenario and needs its own public JSON/refusal contract. |
| D5 | Standalone packet | Baseline debt authority has shrink-only behavior and Pattern Governance dependency separate from enforcement execution. |
| D6 | Standalone packet | Grit diagnostic acquisition/projection must stay separate from governance and apply. |
| D7 | Standalone packet | Structural enforcement is the main check pipeline and must consume D5/D6 rather than owning them. |
| D8 | Standalone packet | Pattern lifecycle admission is a product gate distinct from diagnostics and scaffolding. |
| G-HOST | Standalone gate packet | Host-specific paths and gates currently exist in generic code; D9/D10/D13 cannot claim generic closure without this boundary. |
| D9 | Standalone packet | Safe write/apply transaction has rollback and proof obligations that cannot be a Grit or governance subsection. |
| D10 | Standalone packet | Generated/protected zone authority is a structural guard consumed by hooks/apply/check and blocked by host policy. |
| D11 | Standalone packet | Hooks orchestrate many owners but own only local feedback, requiring explicit proof non-claims. |
| D12 | Standalone packet | Verify is a handoff proof assembler with public proof JSON and graph/check dependencies. |
| D13 | Standalone packet | Scaffolding/refusal is a generator-facing product contract distinct from Pattern Governance registration. |
| D14 | Standalone fence packet | Kept separate because it is a scope-control and future-trigger artifact; implementation remains outside Phase 3 unless D13 refusal tests require a small variant. |
| D15 | Trigger packet, not default implementation | Kept as a decision record so packet-local provenance needs are governed. It does not authorize a standalone substrate migration unless a consuming packet passes minimization. |

## Shared Closure Requirements

Every implementation phase derived from these packets must:

- open or update an OpenSpec change before code when a public behavior or
  implementation contract changes;
- preserve or explicitly version public CLI JSON, package export, Nx target,
  generator, and hook surfaces;
- run packet-specific tests and exact command proof recorded with proof class
  labels and non-claims;
- update downstream docs, ledgers, generated records, and scenario examples
  named in the packet;
- commit one logical Graphite layer with a clean worktree;
- avoid Graphite submit/PR readiness claims while a downstack branch reports
  `needs restack`.
- include exact command strings, expected exit status, cache/freshness stance,
  injected-bad-case requirement where relevant, and explicit non-claims.

## Completion Gate

The suite is ready for Phase 3 execution only after adversarial review finds no
accepted P1/P2 issue in:

- sequence and dependency order,
- public contract preservation,
- domain ownership,
- state-space reduction value,
- proof sufficiency and non-claims,
- generic Habitat boundary,
- downstream realignment,
- Graphite/OpenSpec closure.
