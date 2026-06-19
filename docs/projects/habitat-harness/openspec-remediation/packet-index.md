# Deep Habitat OpenSpec Remediation Packet Index

This index tracks the conversion of the Phase 2 domino suite into OpenSpec
change packets. It is part of the remediation frame, not an implementation
commitment. Global review findings were converted into shared constraints, and
each domino then received its own per-domino adversarial review. D0-D15 and
G-HOST are accepted for design/specification after their per-domino final
reviews found no unresolved P1/P2 blockers. D0-D15 and G-HOST are not
implementation-complete.

Path variables and operational checkout fixtures are defined in
`$REMEDIATION_DIR/context.md`. This index records packet identity and sequencing;
it does not repeat local worktree paths or branch names.

| Domino | Packet | OpenSpec Change | Requires | Enables | Status |
| --- | --- | --- | --- | --- | --- |
| D0 | D0 Command Surface Inventory | `deep-habitat-d0-command-surface-inventory` | Fresh worktree from main, dependency install, matrix validation, OpenSpec validation, D0 command/test probes | All later dominoes | implementation matrix authored at `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`; current matrix has 359 concrete rows after D4/D5 public-surface repairs; packet-boundary approved for downstream implementation-start preparation |
| D1 | D1 Receipt Contract Boundary | `deep-habitat-d1-receipt-contract-boundary` | D0 command surface inventory; concrete D0 matrix rows exist; D1 execution inventory, output-family citations, inherited D0 evidence baseline, and implementation-start review dispositions cleared before source implementation | D6, D7, D8, D9, D10, D11, D12, D13, D14 | source implementation submitted in PR #1835 and PR #1836; command-engine monolith deleted; focused command modules and verify receipt failed-state boundary implemented; no unresolved accepted D1 P1/P2 blockers recorded |
| D2 | D2 Rule Registry Metadata Contract | `deep-habitat-d2-rule-registry-metadata-contract` | D0, D1; concrete D0 matrix rows and D1 malformed-metadata output-family citations required before source implementation | D3, D4, D5, D6, D7, D8, D10, D13 | source implementation submitted as draft PR #1837; TypeBox registry parser and named projections are live; focused D2 parser/projection/consumer gates pass; structural adapter-domain enforcement is registered as GritQL; user-delegated temporary-supervisor approval accepted D2 for D3 advancement |
| D3 | D3 Workspace Graph Boundary | `deep-habitat-d3-workspace-graph-boundary` | D0, D2; concrete D0 public-surface rows and live D2 `ruleGraphFacts` implementation required before source implementation | D4, D7, D12 | source implementation and boundary-review repairs submitted in draft PR #1838 v3; `src/plugin.js` is only the D0/Nx compatibility adapter while Nx plugin implementation and graph/service contracts are TypeScript/TypeBox-owned; D3 behavioral, package, OpenSpec, and diff gates pass; broad MapGen/generated-output/Biome drift remains outside D3 |
| D4 | D4 Classify Orientation And Routing | `deep-habitat-d4-orientation-routing` | D0, D1 vocabulary, D2, D3; concrete D0 rows plus live D2/D3 implementation facts required before source implementation | D14 | source implementation submitted as draft PR #1839; TypeBox-first `ClassifyResult` replaces old classify DTOs without legacy fallback, `classifyPath`/`classifyTarget` return the D4 model, D2/D3 projections drive routing/target guidance, D14 example corpus is populated, focused check/test/build/OpenSpec gates pass, and temporary-supervisor source/record rereviews found no unresolved P1/P2 blockers |
| D5 | D5 Baseline Authority | `deep-habitat-d5-baseline-authority` | D0, D2; concrete D0 rows and live D2 `ruleBaselineFacts`/baseline projections required before source implementation | D7, D8 | source implementation submitted as draft PR #1840: TypeBox-first baseline authority modules replace the old baseline module, D5 root exports are versioned to D5 names/schema artifacts, focused typecheck/baseline/classify/command/OpenSpec/diff gates pass, `habitat check --json --base agent-DRA-d4-orientation-routing` contains passing built-in `baseline-integrity`, and D13 pattern-generator CJS/TS loader residual is recorded for D13 |
| D6 | D6 Diagnostic Pattern Catalog | `deep-habitat-d6-diagnostic-pattern-catalog` | D0, D1, D2; concrete D0 rows, D1 output-family decisions where touched, and live D2 `ruleGritFacts` required before source implementation | D7, D8, D9, D11, D15 evaluation | source implementation ready for Graphite submission: TypeBox diagnostic catalog/outcome contracts, native docs-local diagnostic outcomes, closed scan-root/cache/probe states, branch-specific Grit/native projections, and focused adapter/probe/native Grit gates pass; temporary-supervisor source/record rereviews found no unresolved P1/P2 blockers |
| D7 | D7 Structural Enforcement Pipeline | `deep-habitat-d7-structural-enforcement-pipeline` | D0, D1, D2, D3, D5, D6, D10; concrete D0 rows, D1 output-family handling, live D2/D3/D5/D6 projections, and accepted D10 guard contract required before source implementation where touched | D11, D12 | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, and code/topology/cross-domino rereviews found no unresolved P1/P2 blockers; not implementation-complete |
| D8 | D8 Pattern Governance | `deep-habitat-d8-pattern-governance` | D0, D1, D2, D5, D6; D7 where current-tree/check admission input is consumed; D10/G-HOST where protected/generated-zone or host-policy paths/gates are touched; concrete D0 rows, D1 output-family citations, live D2 `ruleGovernanceFacts`/`ruleGritFacts`/`ruleBaselineFacts`, D5 `BaselineAuthorityProjection`, and D6 diagnostic projections required before source implementation | D9, D13; D11 through local-feedback eligibility/recovery projections | source implementation ready for Graphite submission: TypeBox-first Pattern Governance state, validation, refusal, admission-state constructors, and consumer projections are live behind the existing Pattern Authority facade; focused TypeScript/manifest/projection/OpenSpec gates pass; D9/D11/D13/D10/G-HOST behavior remains owned by those packets |
| G-HOST | Host Policy Boundary Gate | `deep-habitat-host-policy-boundary-gate` | D0, D1 | D10, D13, D9 host-gate consumption | accepted for design/specification; after-repair final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D1 output-family handling, internal `$HABITAT_TOOL/src/lib/host-policy.ts` preserve/document-only handling, and accepted/live G-HOST projections |
| D9 | D9 Transformation Transaction | `deep-habitat-d9-transformation-transaction` | D0, D1, D6, D8, D10, G-HOST where host-specific gates are touched; concrete D0 rows, D8 apply-admission projections, D10 path/zone decisions, and G-HOST host-gate declarations required before source implementation where touched | D11, D13; D15 only if D9 records an impossible local state | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete |
| D10 | D10 Protected Zone Authority | `deep-habitat-d10-protected-zone-authority` | D0, D1, D2, G-HOST | D7, D8 where protected/generated paths are touched, D9, D11 | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D1 output-family handling, live D2 generated-zone projections, accepted/live G-HOST host declarations, and accepted/live D10 projections |
| D11 | D11 Local Feedback | `deep-habitat-d11-local-feedback` | D0, D1, D3 for pre-push graph/affected facts, D6 staged diagnostic projections, D7 local-feedback check projection, D9 local-feedback-safe transaction projection where surfaced, D10 protected mutation projection; D8 conditional for hook eligibility/admission; G-HOST only through D9/D10 projections unless D11 touches host-owned surfaces | D12, D15 only when D11 records an impossible local state | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D1 output-family handling, live D3/D6/D7/D9/D10 projections where consumed, conditional D8 projection where consumed, and G-HOST only through accepted D9/D10 projections unless D11 touches host-owned surfaces |
| D12 | D12 Verify Handoff Receipt | `deep-habitat-d12-verify-handoff-receipt` | D0, D1, D3, D7, D11 where local-feedback or hook trace projections are consumed; concrete D0 rows, D1 output-family handling, live D3 verify target plan facts, live D7 verify check projection facts, and live D11 projections where consumed required before source implementation | D14 | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D1 output-family handling, live D3 verify target plan facts, live D7 verify check projection facts, and live D11 projections where consumed |
| D13 | D13 Scaffolding And Refusal Contracts | `deep-habitat-d13-scaffolding-refusal-contracts` | D0, D1, D2, D8, G-HOST | D14 | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D1 refusal/output-family handling, live D2 governance/generated-zone facts, live D8 candidate/admission projections, accepted/live G-HOST host declarations where consumed, D10 path/zone decisions where touched, and D14 early-fence language for authoring-specific refusals |
| D14 | D14 Authoring Topology Fence | `deep-habitat-d14-authoring-topology-fence` | D0, D4, D12, D13 | none | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked behind concrete D0 rows, D13 refusal-envelope source work, and live D4/D12 examples where consumed |
| D15 | D15 Execution Provenance Trigger | `deep-habitat-d15-execution-provenance-trigger` | D6, D7, D9, D11, or G-HOST consuming packet identifies a concrete command-observation state that local DTOs/projections cannot represent without contradiction | A future packet-local command-observation substrate decision only when triggered | accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete; source implementation blocked unless a later accepted packet changes D15 from `dormant` to `trigger-accepted` with concrete D0 rows and D1 output-family handling |

## Review Gate Semantics

- Global review artifacts are concern catalogs and corpus-wide constraints.
  They are not packet-specific acceptance records.
- Each domino must still run its own adversarial domain-language, OpenSpec,
  topology, validation, information-design, and cross-domino review before the
  packet can advance from blocking packet status to accepted execution authority.
- Per-domino review is a design-time gate, not an implementation-time cleanup
  task. Implementation cannot start from a packet whose review ledger still
  marks that gate as blocking.
- A packet can be called implementation-ready only after its own review ledger
  records the per-domino reviewers, dispositions every accepted P1/P2 finding,
  and updates downstream assumptions accordingly.

## Global Rules

- Existing Phase 2 packets are controlling inputs, not final OpenSpec outputs.
- Domain and information design review are mandatory before implementation.
- Verification-artifact-shaped product code and type names are suspect unless they
  directly serve a repo-maintenance scenario.
- D15 is a trigger protocol, not a default substrate migration.
- D14 is a fence/refusal packet unless a later accepted authority opens
  authoring implementation.
- G-HOST must resolve host-policy boundaries before D9 claims host-gate
  consumption, D10 claims generated/protected host-surface closure, or D13
  claims host-owned project support/refusal closure.

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

- Current validation records must cite `$ACTIVE_REMEDIATION_WORKTREE` and
  `$ACTIVE_REMEDIATION_BRANCH` from `$REMEDIATION_DIR/context.md`, then name the
  command, expected status, actual status, cache/freshness stance, and
  non-claims.
- Historical source-prep paths in the Phase 2 packets are provenance only. They are not executable command paths for implementation.
- OpenSpec packet commands must use `$REPO_ROOT`/path-template variables from
  `$REMEDIATION_DIR/context.md` or repo-relative paths when run by
  implementation agents.
- Non-claims define what a passing receipt or command result does and does not
  validate; they do not convert a failed required gate into closure.
- If D15 is triggered by more than one consuming packet, shared substrate edits must move into one sequential owner packet before implementation.
- D14 has two duties: early scope/future-authoring refusal authority before D13 authors those refusals, and late command-facing closure after D4/D12/D13 examples exist.
