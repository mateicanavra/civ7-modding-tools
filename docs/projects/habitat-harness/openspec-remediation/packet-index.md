# Deep Habitat OpenSpec Remediation Packet Index

This index tracks the conversion of the Phase 2 domino suite into OpenSpec
change packets. It is part of the remediation frame, not an implementation
commitment. Global review findings were converted into shared constraints, and
each domino then received its own per-domino adversarial review. D0-D15 and
G-HOST are accepted for design/specification after their per-domino final
reviews found no unresolved P1/P2 blockers. Source implementation status is
tracked per row as each domino layer lands.

Path variables and operational checkout fixtures are defined in
`$REMEDIATION_DIR/context.md`. This index records packet identity and sequencing;
it does not repeat local worktree paths or branch names.

| Domino | Packet | OpenSpec Change | Requires | Enables | Status |
| --- | --- | --- | --- | --- | --- |
| D0 | D0 Command Surface Inventory | `deep-habitat-d0-command-surface-inventory` | Fresh worktree from main, dependency install, matrix validation, OpenSpec validation, D0 command/test probes | All later dominoes | implementation matrix authored at `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`; current matrix has 346 concrete rows after D14A authored-artifact rows, D12 verify receipt rows, stale row removals, and record-authority repair anchor rows; packet-boundary approved for downstream implementation-start preparation |
| D1 | D1 Receipt Contract Boundary | `deep-habitat-d1-receipt-contract-boundary` | D0 command surface inventory; concrete D0 matrix rows exist; D1 execution inventory, output-family citations, inherited D0 evidence baseline, and implementation-start review dispositions cleared before source implementation | D6, D7, D8, D9, D10, D11, D12, D13, D14 | source implementation submitted in PR #1835 and PR #1836; command-engine monolith deleted; focused command modules and verify receipt failed-state boundary implemented; no unresolved accepted D1 P1/P2 blockers recorded |
| D2 | D2 Rule Registry Metadata Contract | `deep-habitat-d2-rule-registry-metadata-contract` | D0, D1; concrete D0 matrix rows and D1 malformed-metadata output-family citations required before source implementation | D3, D4, D5, D6, D7, D8, D10, D13 | source implementation submitted as draft PR #1837; TypeBox registry parser and named consumer contracts are live; focused D2 parser/consumer gates pass; structural adapter-domain enforcement is registered as a Habitat pattern check; agent review accepted D2 for D3 advancement |
| D3 | D3 Workspace Graph Boundary | `deep-habitat-d3-workspace-graph-boundary` | D0, D2; concrete D0 public-surface rows and live D2 `ruleGraphFacts` implementation required before source implementation | D4, D7, D12 | source implementation and boundary-review repairs submitted in draft PR #1838 v3; `src/plugin.js` is only the D0 workspace-graph compatibility adapter while graph/service contracts are TypeScript/TypeBox-owned; D3 behavioral, package, OpenSpec, and diff gates pass; broad MapGen/generated-output/formatter drift remains outside D3 |
| D4 | D4 Classify Orientation And Routing | `deep-habitat-d4-orientation-routing` | D0, D1 vocabulary, D2, D3; concrete D0 rows plus live D2/D3 implementation facts required before source implementation | D14 | source implementation submitted as draft PR #1839; TypeBox-first `ClassifyResult` replaces old classify DTOs, `classifyPath`/`classifyTarget` return the D4 model, D2/D3 contracts drive routing/target guidance, D14 example corpus is populated, focused check/test/build/OpenSpec gates pass, and agent source/record rereviews found no unresolved P1/P2 blockers |
| D5 | D5 Baseline Contract | `deep-habitat-d5-baseline-authority` | D0, D2; concrete D0 rows and live D2 `ruleBaselineFacts`/baseline contracts required before source implementation | D7, D8 | source implementation submitted as draft PR #1840: TypeBox-first baseline modules replace the old baseline module, D5 root exports are versioned to D5 names/schema records, focused typecheck/baseline/classify/command/OpenSpec/diff gates pass, `habitat check --json --base agent-DRA-d4-orientation-routing` contains passing built-in `baseline-integrity`, and D13 pattern-generator CJS/TS loader residual is recorded for D13 |
| D6 | D6 Diagnostic Pattern Catalog | `deep-habitat-d6-diagnostic-pattern-catalog` | D0, D1, D2; concrete D0 rows, D1 output-family decisions where touched, and live D2 pattern facts required before source implementation | D7, D8, D9, D11, D15 evaluation | source implementation submitted in PR #1841: TypeBox diagnostic catalog/outcome contracts, native docs-local diagnostic outcomes, closed scan-root/cache/probe states, branch-specific pattern/native contracts, and focused adapter/probe/native pattern gates pass; agent source/record rereviews found no unresolved P1/P2 blockers |
| D7 | D7 Structural Enforcement Pipeline | `deep-habitat-d7-structural-enforcement-pipeline` | D0, D1, D2, D3, D5, D6, D10; concrete D0 rows, D1 output-family handling, live D2/D3/D5/D6 contracts, and accepted D10 guard contract required before source implementation where touched | D11, D12 | source implementation submitted in PR #1842 and closure layer PR #1843; structural check/report pipeline is split and D7 closure records show no unresolved P1/P2 blockers |
| D8 | D8 Patterns | `deep-habitat-d8-pattern-governance` | D0, D1, D2, D5, D6; D7 where current-tree/check admission input is consumed; D10/G-HOST where protected/generated-zone or host-policy paths/gates are touched; concrete D0 rows, D1 output-family citations, live D2 pattern/baseline facts, D5 baseline contract, and D6 diagnostic contracts required before source implementation | D9, D13; D11 through hook-runtime eligibility/recovery contracts | source implementation submitted as draft PR #1844: TypeBox-first Patterns state, validation, refusal, and admission-state constructors are live behind the existing Patterns facade; focused TypeScript/manifest/OpenSpec gates pass; D9/D11/D13/D10/G-HOST behavior remains owned by those packets |
| G-HOST | Host Policy Boundary Gate | `deep-habitat-host-policy-boundary-gate` | D0, D1 | D10, D13, D9 host-gate consumption | source implementation submitted in PR #1846 on `agent-DRA-host-policy-boundary-gate`: TypeBox-first internal host-policy facade/modules, bundled host declarations, semantic conflict refusal, and structured recovery are live; generated-zone and scan-root consumers use host decisions instead of local host path catalogs; focused G-HOST package gates pass; D9/D13/D14 consumption remains downstream packet-local work |
| D9 | D9 Pattern Apply | `deep-habitat-d9-pattern-apply` | D0, D1, D6, D8, D10, G-HOST where host-specific gates are touched; concrete D0 rows, D8 apply-admission contracts, D10 path/zone decisions, and G-HOST host-gate declarations required before live writes where touched | D11, D13; D15 only if D9 records an impossible local state | source implementation submitted in PR #1845: `habitat fix` routes through a TypeBox-first Pattern Apply boundary, consumes registered D8 apply admissions, derives typed D8 transaction-input contracts from rule facts before native dry-run execution, preserves command-level `fix --dry-run`, and refuses before live writes; remaining live-write expansion belongs to a future accepted packet |
| D10 | D10 Protected Zone Contract | `deep-habitat-d10-protected-zones` | D0, D1, D2, G-HOST | D7, D8 where protected/generated paths are touched, D9, D11 | source implementation submitted in PR #1847: TypeBox-first protected-zone decision modules replace the old generated-zone helper, D7 file-layer checks consume D10 decisions, D6 pattern scan-root refusals carry D10 owner/recovery data, D9 live-write intent consumes and binds D10 path decisions before refusing unimplemented live writes, `generated:check` is recorded as an uncached file-layer structural gate, focused source/OpenSpec/diff gates pass, and agent implementation P1/P2 findings are repaired or assigned downstream owner |
| D11 | D11 Hook Runtime | `deep-habitat-d11-local-feedback` | D0, D1, D3 for pre-push graph/affected facts, D6 staged diagnostic contracts, D7 hook-runtime check contract, D9 hook-safe transaction contract where surfaced, D10 protected mutation contract; D8 conditional for hook eligibility/admission; G-HOST only through D9/D10 contracts unless D11 touches host-owned surfaces | D12, D15 only when D11 records an impossible local state | bounded source implementation submitted in PR #1848 on `agent-DRA-d11-local-feedback`: generic hook runtime modules, TypeBox-first hook/resource schemas, optional configured resource policy, remote-default pre-push base resolution, process-only runtime scaffolding removed, no hard-coded host resource defaults, and focused/full package gates pass; future D11 source changes remain gated by concrete D0 rows, D1 output-family handling, and live upstream contracts where consumed |
| D12 | D12 Verify Handoff Receipt | `deep-habitat-d12-verify-handoff-receipt` | D0, D1, D3, D7; D11 only if a future receipt consumes hook runtime contracts | D14 | source implementation submitted in PR #1849: `habitat verify` is a thin Oclif adapter over TypeBox-first verify receipt modules, D7 check contract controls affected-execution admission, D3 target plan controls affected targets, affected states are executed/failed/skipped, receipts store bounded stream metadata and post-state, D0 matrix rows are updated, and focused package/OpenSpec/diff gates pass; live `habitat verify --json` currently emits a valid blocked receipt because current-tree Habitat check blocks affected execution |
| D13 | D13 Scaffolding And Refusal Contracts | `deep-habitat-d13-scaffolding-refusal-contracts` | D0, D1, D2, D8, G-HOST | D14A, D14 | source implementation submitted in PR #1850: plugin project scaffolding, TypeBox-backed scaffold refusal schema, TypeScript-generated workspace generator schemas, candidate-only pattern drafts, and no-write refusals for unsupported project kinds and active registration requests are implemented; host policy and Authoring Topology scaffolding remain outside D13 source scope |
| D14A | D14A Authored Artifacts | `deep-habitat-d14a-authored-artifact-authority` | D0, D2, D5, D8, D13 | D14 | source implementation submitted as draft PR #1853: checked-in authored Habitat registry, baselines, and active patterns live under `.habitat`; SDK/package code remains under `tools/habitat`; executor compatibility views stay outside the authored Habitat hierarchy; slow live-checkout validation moved out of the Vitest unit suite |
| D14 | D14 Authoring Topology Fence | `deep-habitat-d14-authoring-topology-fence` | D0, D4, D12, D13, D14A | none | current implementation boundary complete pending Graphite submission: D14 adds no product-specific parser or authoring data file; current D13 unsupported project-kind refusals remain the implemented no-write scaffold boundary; Habitat docs and D14 records state that MapGen recipe/domain/op/stage/step authoring remains unsupported until a future accepted authoring packet defines a real command/API surface |
| D15 | D15 Command Observation Trigger | `deep-habitat-d15-execution-provenance-trigger` | D6, D7, D9, D11, or G-HOST consuming packet identifies a concrete command-observation state that local DTOs/contracts cannot represent without contradiction | A future packet-local command-observation substrate decision only when triggered | dormant trigger confirmed: D6, D7, D9, D11, and G-HOST records do not accept or request D15; no source implementation is authorized unless a later accepted packet changes D15 from `dormant` to `trigger-accepted` with concrete D0 rows, D1 output-family handling, write set, and validation gates |

## Review Gate Semantics

- Global review artifacts are concern catalogs and corpus-wide constraints.
  They are not packet-specific acceptance records.
- Each domino must still run its own adversarial domain-language, OpenSpec,
  topology, validation, information-design, and cross-domino review before the
  packet can advance from blocking packet status to accepted execution status.
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
- D14 is a fence/refusal packet unless a later accepted command/API packet opens
  authoring implementation.
- G-HOST must resolve host-policy boundaries before D9 consumes host-gate
  behavior, D10 closes generated/protected host-surface behavior, or D13
  closes host-owned project support/refusal behavior.

## Traceability Convention

The table below records the source packet filename and OpenSpec change slug.
Resolve authority paths through `$REMEDIATION_DIR/context.md` path templates:
source packets use `$PHASE2_PACKET_DIR/<source-packet-file>`, and OpenSpec
artifacts use `$OPENSPEC_CHANGES/<change-slug>/...`.

| Domino | Source Packet File | Change Slug |
| --- | --- | --- |
| D0 | `D0-scenario-public-contract-inventory.md` | `deep-habitat-d0-command-surface-inventory` |
| D1 | `D1-receipt-contract-boundary.md` | `deep-habitat-d1-receipt-contract-boundary` |
| D2 | `D2-rule-registry-metadata-contract.md` | `deep-habitat-d2-rule-registry-metadata-contract` |
| D3 | `D3-workspace-graph-integration-boundary.md` | `deep-habitat-d3-workspace-graph-boundary` |
| D4 | `D4-orientation-and-routing.md` | `deep-habitat-d4-orientation-routing` |
| D5 | `D5-baseline-authority.md` | `deep-habitat-d5-baseline-authority` |
| D6 | `D6-diagnostic-pattern-catalog.md` | `deep-habitat-d6-diagnostic-pattern-catalog` |
| D7 | `D7-structural-enforcement-pipeline.md` | `deep-habitat-d7-structural-enforcement-pipeline` |
| D8 | `D8-patterns.md` | `deep-habitat-d8-pattern-governance` |
| D9 | `D9-pattern-apply.md` | `deep-habitat-d9-pattern-apply` |
| D10 | `D10-generated-protected-zones.md` | `deep-habitat-d10-protected-zones` |
| D11 | `D11-hook-runtime.md` | `deep-habitat-d11-local-feedback` |
| D12 | `D12-verify-handoff-command.md` | `deep-habitat-d12-verify-handoff-receipt` |
| D13 | `D13-scaffolding-and-refusal-contracts.md` | `deep-habitat-d13-scaffolding-refusal-contracts` |
| D14A | implementation-inserted authored authority data packet | `deep-habitat-d14a-authored-artifact-authority` |
| D14 | `D14-authoring-topology-fence.md` | `deep-habitat-d14-authoring-topology-fence` |
| D15 | `D15-execution-provenance-substrate-trigger.md` | `deep-habitat-d15-execution-provenance-trigger` |
| G-HOST | `G-HOST-host-policy-boundary-gate.md` | `deep-habitat-host-policy-boundary-gate` |

## Evidence Status Policy

- Current validation records must cite `$ACTIVE_REMEDIATION_WORKTREE` and
  `$ACTIVE_REMEDIATION_BRANCH` from `$REMEDIATION_DIR/context.md`, then name the
  command, expected status, actual status, cache/freshness stance, and
  scope limits.
- Historical source-prep paths in the Phase 2 packets are provenance only. They are not executable command paths for implementation.
- OpenSpec packet commands must use `$REPO_ROOT`/path-template variables from
  `$REMEDIATION_DIR/context.md` or repo-relative paths when run by
  implementation agents.
- Scope limits define the owner boundary for passing receipts or command
  results; they do not convert a failed required gate into closure.
- If D15 is triggered by more than one consuming packet, shared substrate edits must move into one sequential owner packet before implementation.
- D14 has two duties: early scope/future-authoring refusal responsibility before D13 authors those refusals, and late command-facing closure after D4/D12/D13 examples exist.
