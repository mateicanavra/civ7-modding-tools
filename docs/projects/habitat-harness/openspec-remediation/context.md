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
| `$ACTIVE_REMEDIATION_BRANCH` | `codex/deep-habitat-openspec-remediation` |

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
