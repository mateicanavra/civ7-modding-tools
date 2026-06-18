# Deep Habitat OpenSpec Remediation Packet Index

This index tracks the conversion of the Phase 2 domino suite into OpenSpec
change packets. It is part of the remediation frame, not an implementation
commitment. Most rows remain draft scaffolding: global review findings have
been converted into shared constraints, but each domino remains blocking until
its own per-domino adversarial review has run and all accepted P1/P2 findings
are repaired. D0, D1, D2, D3, D4, and D5 are the current exceptions: they are
accepted for design/specification after their per-domino final reviews found no
unresolved P1/P2 blockers. D0-D5 are not implementation-complete, and
D6-D15/G-HOST remain blocking unless their own status rows say otherwise.

Path variables and operational checkout fixtures are defined in
`$REMEDIATION_DIR/context.md`. This index records packet identity and sequencing;
it does not repeat local worktree paths or branch names.

| Domino | Packet | OpenSpec Change | Requires | Enables | Status |
| --- | --- | --- | --- | --- | --- |
| D0 | D0 Command Surface Inventory | `deep-habitat-d0-command-surface-inventory` | Fresh worktree from main, Baseline install/build/OpenSpec/lint grounding | All later dominoes | accepted for design/specification; final review found no P1/P2 blockers |
| D1 | D1 Receipt Contract Boundary | `deep-habitat-d1-receipt-contract-boundary` | D0 command surface inventory; concrete D0 matrix rows required before source implementation | D6, D7, D8, D9, D10, D11, D12, D13, D14 | accepted for design/specification; final review and re-review found no unresolved P1/P2 blockers; not implementation-complete |
| D2 | D2 Rule Registry Metadata Contract | `deep-habitat-d2-rule-registry-metadata-contract` | D0, D1; concrete D0 matrix rows and D1 malformed-metadata output-family citations required before source implementation | D3, D4, D5, D6, D7, D8, D10, D13 | accepted for design/specification; final review and code/topology recheck found no unresolved P1/P2 blockers; not implementation-complete |
| D3 | D3 Workspace Graph Boundary | `deep-habitat-d3-workspace-graph-boundary` | D0, D2; concrete D0 public-surface rows and live D2 `ruleGraphFacts` implementation required before source implementation | D4, D7, D12 | accepted for design/specification; final rereview found no unresolved P1/P2 blockers; not implementation-complete |
| D4 | D4 Classify Orientation And Routing | `deep-habitat-d4-orientation-routing` | D0, D1 vocabulary, D2, D3; concrete D0 rows plus live D2/D3 implementation facts required before source implementation | D14 | accepted for design/specification; final domain/ontology, OpenSpec/testing, and topology/cross-domino rereviews found no unresolved P1/P2 blockers; not implementation-complete |
| D5 | D5 Baseline Authority | `deep-habitat-d5-baseline-authority` | D0, D2; concrete D0 rows and live D2 `ruleBaselineFacts`/baseline projections required before source implementation | D7, D8 | accepted for design/specification; final domain/ontology, OpenSpec/testing, and topology/TypeScript/cross-domino rereviews found no unresolved P1/P2 blockers; not implementation-complete |
| D6 | D6 Diagnostic Pattern Catalog | `deep-habitat-d6-diagnostic-pattern-catalog` | D0, D1, D2 | D7, D8, D9, D15 evaluation | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D7 | D7 Structural Enforcement Pipeline | `deep-habitat-d7-structural-enforcement-pipeline` | D0, D1, D2, D3, D5, D6, D10 | D11, D12 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D8 | D8 Pattern Governance | `deep-habitat-d8-pattern-governance` | D0, D2, D5, D6 | D9, D13 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| G-HOST | Host Policy Boundary Gate | `deep-habitat-host-policy-boundary-gate` | D0, D1 | D10, D13 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D9 | D9 Transformation Transaction | `deep-habitat-d9-transformation-transaction` | D0, D1, D6, D8, D10 | D11 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D10 | D10 Protected Zone Authority | `deep-habitat-d10-protected-zone-authority` | D0, D1, D2, G-HOST | D7, D9, D11 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D11 | D11 Local Feedback | `deep-habitat-d11-local-feedback` | D0, D1, D7, D9, D10 | none | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D12 | D12 Verify Handoff Receipt | `deep-habitat-d12-verify-handoff-receipt` | D0, D1, D3, D7 | D14 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D13 | D13 Scaffolding And Refusal Contracts | `deep-habitat-d13-scaffolding-refusal-contracts` | D0, D2, D8, G-HOST | D14 | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D14 | D14 Authoring Topology Fence | `deep-habitat-d14-authoring-topology-fence` | D0, D4, D12, D13 | none | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |
| D15 | D15 Execution Provenance Trigger | `deep-habitat-d15-execution-provenance-trigger` | D6, D7, D9, or D11 consuming packet identifies impossible local states | A future packet-local substrate decision only when triggered | draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING |

## Review Gate Semantics

- Global review artifacts are concern catalogs and corpus-wide constraints.
  They are not packet-specific acceptance evidence.
- Each domino must still run its own adversarial domain-language, OpenSpec,
  topology, validation, information-design, and cross-domino review before the
  packet can advance from draft scaffold to accepted execution authority.
- Per-domino review is a design-time gate, not an implementation-time cleanup
  task. Implementation cannot start from a packet whose review ledger still
  marks that gate as blocking.
- A packet can be called implementation-ready only after its own review ledger
  records the per-domino reviewers, dispositions every accepted P1/P2 finding,
  and updates downstream assumptions accordingly.

## Global Rules

- Existing Phase 2 packets are controlling inputs, not final OpenSpec outputs.
- Domain and information design review are mandatory before implementation.
- Proof/evidence-shaped product code and type names are suspect unless they
  directly serve a repo-maintenance scenario.
- D15 is a trigger protocol, not a default substrate migration.
- D14 is a fence/refusal packet unless a later accepted authority opens
  authoring implementation.
- G-HOST must resolve host-policy boundaries before D10 or D13 claim generic
  closure.

## Traceability Convention

The table below records the source packet filename and OpenSpec change slug.
Resolve artifact paths through `$REMEDIATION_DIR/context.md` path templates:
source packets use `$PHASE2_PACKET_DIR/<source-packet-file>`, and OpenSpec
artifacts use `$OPENSPEC_CHANGES/<change-slug>/...`.

| Domino | Source Packet File | Change Slug |
| --- | --- | --- |
| D0 | `D0-scenario-public-contract-inventory.md` | `deep-habitat-d0-command-surface-inventory` |
| D1 | `D1-proof-contract-boundary.md` | `deep-habitat-d1-receipt-contract-boundary` |
| D2 | `D2-rule-registry-metadata-contract.md` | `deep-habitat-d2-rule-registry-metadata-contract` |
| D3 | `D3-workspace-graph-integration-boundary.md` | `deep-habitat-d3-workspace-graph-boundary` |
| D4 | `D4-orientation-and-routing.md` | `deep-habitat-d4-orientation-routing` |
| D5 | `D5-baseline-authority.md` | `deep-habitat-d5-baseline-authority` |
| D6 | `D6-diagnostic-pattern-catalog.md` | `deep-habitat-d6-diagnostic-pattern-catalog` |
| D7 | `D7-structural-enforcement-pipeline.md` | `deep-habitat-d7-structural-enforcement-pipeline` |
| D8 | `D8-pattern-governance.md` | `deep-habitat-d8-pattern-governance` |
| D9 | `D9-transformation-transaction.md` | `deep-habitat-d9-transformation-transaction` |
| D10 | `D10-generated-protected-zone-authority.md` | `deep-habitat-d10-protected-zone-authority` |
| D11 | `D11-local-feedback.md` | `deep-habitat-d11-local-feedback` |
| D12 | `D12-proof-handoff-verify-command.md` | `deep-habitat-d12-verify-handoff-receipt` |
| D13 | `D13-scaffolding-and-refusal-contracts.md` | `deep-habitat-d13-scaffolding-refusal-contracts` |
| D14 | `D14-authoring-topology-fence.md` | `deep-habitat-d14-authoring-topology-fence` |
| D15 | `D15-execution-provenance-substrate-trigger.md` | `deep-habitat-d15-execution-provenance-trigger` |
| G-HOST | `G-HOST-host-policy-boundary-gate.md` | `deep-habitat-host-policy-boundary-gate` |

## Evidence Status Policy

- Current evidence must cite `$ACTIVE_REMEDIATION_WORKTREE` and
  `$ACTIVE_REMEDIATION_BRANCH` from `$REMEDIATION_DIR/context.md`, then name the
  command, expected status, actual status, cache/freshness stance, and
  non-claims.
- Historical source-prep paths in the Phase 2 packets are provenance only. They are not executable command paths for implementation.
- OpenSpec packet commands must use `$REPO_ROOT`/path-template variables from
  `$REMEDIATION_DIR/context.md` or repo-relative paths when run by
  implementation agents.
- Non-claims define what a passing receipt or command result does and does not prove; they do not convert a failed required gate into closure evidence.
- If D15 is triggered by more than one consuming packet, shared substrate edits must move into one sequential owner packet before implementation.
- D14 has two duties: early scope/future-authoring refusal authority before D13 authors those refusals, and late command-facing closure after D4/D12/D13 examples exist.
