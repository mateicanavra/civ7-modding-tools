# OpenSpec Remediation Context

This file is the path/router fixture for the Deep Habitat OpenSpec remediation
corpus. Packet artifacts should reference these variables instead of repeating a
specific local worktree path, branch name, or shared path segment.

## Operational Fixture

These values describe the active remediation checkout. Update this section when
the remediation work moves, then keep durable packet artifacts pointed at the
variables below.

| Variable | Value |
| --- | --- |
| `$ACTIVE_REMEDIATION_WORKTREE` | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation` |
| `$ACTIVE_REMEDIATION_BRANCH` | `codex/d9-transformation-transaction-packet` |

## Path Variables

| Variable | Meaning |
| --- | --- |
| `$REPO_ROOT` | The active checkout root for the remediation or implementation worktree. |
| `$HABITAT_PROJECT` | `$REPO_ROOT/docs/projects/habitat-harness`. |
| `$REMEDIATION_DIR` | `$HABITAT_PROJECT/openspec-remediation`. |
| `$AGENT_SCRATCH` | `$REMEDIATION_DIR/agent-scratch`. |
| `$PHASE2_PACKET_DIR` | `$HABITAT_PROJECT/phase2-workstream-packets`. |
| `$OPENSPEC_CHANGES` | `$REPO_ROOT/openspec/changes`. |
| `$HABITAT_TOOL` | `$REPO_ROOT/tools/habitat-harness`. |

## D3 Variables

| Variable | Meaning |
| --- | --- |
| `$D3_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d3-workspace-graph-boundary`. |
| `$D3_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D3-workspace-graph-integration-boundary.md`. |
| `$D3_NEGATIVE_REVIEW` | `$AGENT_SCRATCH/domino-D3-review.md`. |
| `$D3_REVIEW_LEDGER` | `$D3_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D3_PHASE_RECORD` | `$D3_CHANGE/workstream/phase-record.md`. |
| `$D3_DOWNSTREAM_LEDGER` | `$D3_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D3_CLOSURE_CHECKLIST` | `$D3_CHANGE/workstream/closure-checklist.md`. |

## D4 Variables

| Variable | Meaning |
| --- | --- |
| `$D4_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing`. |
| `$D4_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D4-orientation-and-routing.md`. |
| `$D4_NEGATIVE_REVIEW` | `$AGENT_SCRATCH/domino-D4-review.md`. |
| `$D4_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D4-domain-ontology-investigation.md`. |
| `$D4_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D4-code-topology-investigation.md`. |
| `$D4_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D4-typescript-state-investigation.md`. |
| `$D4_OPENSPEC_TESTING_REVIEW` | `$AGENT_SCRATCH/domino-D4-openspec-testing-investigation.md`. |
| `$D4_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D4-information-design-investigation.md`. |
| `$D4_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D4-cross-domino-investigation.md`. |
| `$D4_REVIEW_LEDGER` | `$D4_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D4_PHASE_RECORD` | `$D4_CHANGE/workstream/phase-record.md`. |
| `$D4_DOWNSTREAM_LEDGER` | `$D4_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D4_CLOSURE_CHECKLIST` | `$D4_CHANGE/workstream/closure-checklist.md`. |

## D5 Variables

| Variable | Meaning |
| --- | --- |
| `$D5_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d5-baseline-authority`. |
| `$D5_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D5-baseline-authority.md`. |
| `$D5_NEGATIVE_REVIEW` | `$AGENT_SCRATCH/domino-D5-review.md`. |
| `$D5_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D5-domain-ontology-investigation.md`. |
| `$D5_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D5-code-topology-investigation.md`. |
| `$D5_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D5-typescript-state-investigation.md`. |
| `$D5_OPENSPEC_TESTING_REVIEW` | `$AGENT_SCRATCH/domino-D5-openspec-testing-investigation.md`. |
| `$D5_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D5-information-design-investigation.md`. |
| `$D5_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D5-cross-domino-investigation.md`. |
| `$D5_REVIEW_LEDGER` | `$D5_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D5_PHASE_RECORD` | `$D5_CHANGE/workstream/phase-record.md`. |
| `$D5_DOWNSTREAM_LEDGER` | `$D5_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D5_CLOSURE_CHECKLIST` | `$D5_CHANGE/workstream/closure-checklist.md`. |

## D6 Variables

| Variable | Meaning |
| --- | --- |
| `$D6_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d6-diagnostic-pattern-catalog`. |
| `$D6_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D6-diagnostic-pattern-catalog.md`. |
| `$D6_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D6-domain-ontology-investigation.md`. |
| `$D6_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D6-typescript-state-investigation.md`. |
| `$D6_FINAL_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D6-final-domain-ontology-review.md`. |
| `$D6_FINAL_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D6-typescript-validation-final-review.md`. |
| `$D6_FINAL_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D6-openspec-information-final-review.md`. |
| `$D6_FINAL_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D6-code-vendor-topology-investigation.md`. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY` | `$AGENT_SCRATCH/domino-D6-final-rereview-domain-ontology.md`. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION` | `$AGENT_SCRATCH/domino-D6-final-rereview-typescript-validation.md`. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION` | `$AGENT_SCRATCH/domino-D6-final-rereview-openspec-information.md`. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY` | `$AGENT_SCRATCH/domino-D6-final-rereview-code-vendor-topology.md`. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_AFTER_REPAIR` | `$AGENT_SCRATCH/domino-D6-final-rereview-typescript-validation-after-repair.md`. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_AFTER_REPAIR` | `$AGENT_SCRATCH/domino-D6-final-rereview-openspec-information-after-repair.md`. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY_LATEST` | `$AGENT_SCRATCH/domino-D6-final-rereview-domain-ontology-latest.md`. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_LATEST` | `$AGENT_SCRATCH/domino-D6-final-rereview-typescript-validation-latest.md`. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_LATEST` | `$AGENT_SCRATCH/domino-D6-final-rereview-openspec-information-latest.md`. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY_LATEST` | `$AGENT_SCRATCH/domino-D6-final-rereview-code-vendor-topology-latest.md`. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY_AFTER_OBSERVED_IDENTITY` | `$AGENT_SCRATCH/domino-D6-final-rereview-domain-ontology-after-observed-identity.md`. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_AFTER_OBSERVED_IDENTITY` | `$AGENT_SCRATCH/domino-D6-final-rereview-typescript-validation-after-observed-identity.md`. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_AFTER_OBSERVED_IDENTITY` | `$AGENT_SCRATCH/domino-D6-final-rereview-openspec-information-after-observed-identity.md`. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY_AFTER_OBSERVED_IDENTITY` | `$AGENT_SCRATCH/domino-D6-final-rereview-code-vendor-topology-after-observed-identity.md`. |
| `$D6_REVIEW_LEDGER` | `$D6_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D6_PHASE_RECORD` | `$D6_CHANGE/workstream/phase-record.md`. |
| `$D6_DOWNSTREAM_LEDGER` | `$D6_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D6_CLOSURE_CHECKLIST` | `$D6_CHANGE/workstream/closure-checklist.md`. |

## D7 Variables

| Variable | Meaning |
| --- | --- |
| `$D7_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d7-structural-enforcement-pipeline`. |
| `$D7_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D7-structural-enforcement-pipeline.md`. |
| `$D7_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D7-domain-ontology-investigation.md`. |
| `$D7_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D7-typescript-state-investigation.md`. |
| `$D7_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D7-code-topology-investigation.md`. |
| `$D7_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D7-openspec-information-investigation.md`. |
| `$D7_VALIDATION_REVIEW` | `$AGENT_SCRATCH/domino-D7-testing-validation-investigation.md`. |
| `$D7_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D7-cross-domino-investigation.md`. |
| `$D7_FINAL_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D7-final-domain-ontology-review.md`. |
| `$D7_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | `$AGENT_SCRATCH/domino-D7-final-typescript-validation-review.md`. |
| `$D7_FINAL_OPENSPEC_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D7-final-openspec-information-review.md`. |
| `$D7_FINAL_TOPOLOGY_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D7-final-code-topology-cross-domino-review.md`. |
| `$D7_REVIEW_LEDGER` | `$D7_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D7_PHASE_RECORD` | `$D7_CHANGE/workstream/phase-record.md`. |
| `$D7_DOWNSTREAM_LEDGER` | `$D7_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D7_CLOSURE_CHECKLIST` | `$D7_CHANGE/workstream/closure-checklist.md`. |

## D8 Variables

| Variable | Meaning |
| --- | --- |
| `$D8_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d8-pattern-governance`. |
| `$D8_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D8-pattern-governance.md`. |
| `$D8_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D8-domain-ontology-investigation.md`. |
| `$D8_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D8-typescript-state-investigation.md`. |
| `$D8_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D8-code-vendor-topology-investigation.md`. |
| `$D8_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D8-openspec-information-testing-investigation.md`. |
| `$D8_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D8-cross-domino-investigation.md`. |
| `$D8_FINAL_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D8-final-domain-ontology-review.md`. |
| `$D8_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | `$AGENT_SCRATCH/domino-D8-final-typescript-validation-review.md`. |
| `$D8_FINAL_OPENSPEC_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D8-final-openspec-information-review.md`. |
| `$D8_FINAL_CODE_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D8-final-code-vendor-topology-review.md`. |
| `$D8_FINAL_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D8-final-cross-domino-review.md`. |
| `$D8_REVIEW_LEDGER` | `$D8_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D8_PHASE_RECORD` | `$D8_CHANGE/workstream/phase-record.md`. |
| `$D8_DOWNSTREAM_LEDGER` | `$D8_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D8_CLOSURE_CHECKLIST` | `$D8_CHANGE/workstream/closure-checklist.md`. |

## D9 Variables

| Variable | Meaning |
| --- | --- |
| `$D9_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d9-transformation-transaction`. |
| `$D9_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D9-transformation-transaction.md`. |
| `$D9_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D9-domain-ontology-investigation.md`. |
| `$D9_TYPESCRIPT_REVIEW` | `$AGENT_SCRATCH/domino-D9-typescript-state-investigation.md`. |
| `$D9_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D9-code-vendor-topology-investigation.md`. |
| `$D9_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D9-openspec-information-testing-investigation.md`. |
| `$D9_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D9-cross-domino-investigation.md`. |
| `$D9_FINAL_DOMAIN_REVIEW` | `$AGENT_SCRATCH/domino-D9-final-domain-ontology-review.md`. |
| `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | `$AGENT_SCRATCH/domino-D9-final-typescript-validation-review.md`. |
| `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW` | `$AGENT_SCRATCH/domino-D9-final-openspec-information-review.md`. |
| `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW` | `$AGENT_SCRATCH/domino-D9-final-code-vendor-topology-review.md`. |
| `$D9_FINAL_CROSS_DOMINO_REVIEW` | `$AGENT_SCRATCH/domino-D9-final-cross-domino-review.md`. |
| `$D9_REVIEW_LEDGER` | `$D9_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D9_PHASE_RECORD` | `$D9_CHANGE/workstream/phase-record.md`. |
| `$D9_DOWNSTREAM_LEDGER` | `$D9_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D9_CLOSURE_CHECKLIST` | `$D9_CHANGE/workstream/closure-checklist.md`. |

## Path Templates

Use these templates instead of copying full paths through packet artifacts:

- Source domino packet: `$PHASE2_PACKET_DIR/<source-packet-file>`.
- OpenSpec change root: `$OPENSPEC_CHANGES/<change-slug>`.
- OpenSpec proposal: `$OPENSPEC_CHANGES/<change-slug>/proposal.md`.
- OpenSpec design: `$OPENSPEC_CHANGES/<change-slug>/design.md`.
- OpenSpec tasks: `$OPENSPEC_CHANGES/<change-slug>/tasks.md`.
- OpenSpec Habitat spec delta:
  `$OPENSPEC_CHANGES/<change-slug>/specs/habitat-harness/spec.md`.
- Workstream phase record:
  `$OPENSPEC_CHANGES/<change-slug>/workstream/phase-record.md`.
- Workstream review ledger:
  `$OPENSPEC_CHANGES/<change-slug>/workstream/review-disposition-ledger.md`.
- Workstream downstream ledger:
  `$OPENSPEC_CHANGES/<change-slug>/workstream/downstream-realignment-ledger.md`.
- Workstream closure checklist:
  `$OPENSPEC_CHANGES/<change-slug>/workstream/closure-checklist.md`.

## Usage Rule

Use absolute filesystem paths in tool calls and agent checkout instructions.
Use these variables in durable docs and packet artifacts when referring to repo
locations, so a worktree move requires updating this router rather than editing
every packet.

If the same path or operational value would appear in more than one durable
artifact, add or update a variable/template here first and reference that
fixture from the artifact.
