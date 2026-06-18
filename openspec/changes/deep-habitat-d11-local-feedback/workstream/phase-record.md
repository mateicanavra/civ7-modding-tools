# Phase Record: D11 Local Feedback

## Path Variables

- `$REPO_ROOT`: active remediation checkout root.
- `$D11_CHANGE`: `$REPO_ROOT/openspec/changes/deep-habitat-d11-local-feedback`.
- `$D11_SOURCE_PACKET`: `$REPO_ROOT/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`.
- `$REMEDIATION_DIR`: `$REPO_ROOT/docs/projects/habitat-harness/openspec-remediation`.
- `$AGENT_SCRATCH`: `$REMEDIATION_DIR/agent-scratch`.
- `$HABITAT_TOOL`: `$REPO_ROOT/tools/habitat-harness`.

## State

- Status: accepted for design/specification after final D11 rereview; not
  implementation-complete.
- Worktree fixture: `$ACTIVE_REMEDIATION_WORKTREE` from
  `$REMEDIATION_DIR/context.md`.
- Branch: `codex/d11-local-feedback-packet`.
- Source packet: `$D11_SOURCE_PACKET`.
- OpenSpec change: `$D11_CHANGE`.
- Implementation: not started and not authorized by this state.

## Objective

Specify D11 as the complete Local Feedback OpenSpec packet: hook command
semantics, staged-file workflow, resource pre-commit decisions, D6/D7/D9/D10/D3
projection consumption, local feedback trace/non-claims, public compatibility
gates, and validation oracles. D11 must remain generic Habitat repo-maintenance
infrastructure and must not own diagnostic, graph, protected-zone, transaction,
CI, review, Graphite, or runtime/product truth.

## Current Gate

D11's design/specification gate is closed. Fresh final rereview lanes read the
repaired disk state and recorded no unresolved P1/P2 findings:

- `$AGENT_SCRATCH/domino-D11-final-domain-ontology-review.md`;
- `$AGENT_SCRATCH/domino-D11-final-typescript-validation-review.md`;
- `$AGENT_SCRATCH/domino-D11-final-openspec-information-review.md`;
- `$AGENT_SCRATCH/domino-D11-final-code-vendor-topology-review.md`;
- `$AGENT_SCRATCH/domino-D11-final-cross-domino-product-review.md`.

The first-wave investigation files remain negative repair input. The final
rereview files are the acceptance input for design/specification only.

## Incorporated First-Wave Inputs

| Input | Current disposition |
| --- | --- |
| `$AGENT_SCRATCH/domino-D11-domain-ontology-investigation.md` | Accepted as blocking repair input for Local Feedback ontology, resource-state naming, upstream owner boundaries, native tool roles, staged-path policy, pre-push base/affected semantics, and branch metadata. |
| `$AGENT_SCRATCH/domino-D11-typescript-state-investigation.md` | Accepted as blocking repair input for TypeScript state-space collapse, discriminated resource decisions, trace compatibility, raw diagnostic parsing removal, stage extraction order, and behavior-preserving implementation slices. |
| `$AGENT_SCRATCH/domino-D11-code-vendor-topology-investigation.md` | Accepted as blocking repair input for current hook topology, public surface inventory, D0/D1 blockers, D6/D3 dependency repair, vendor behavior, and invalid help-command validation. |
| `$AGENT_SCRATCH/domino-D11-openspec-information-testing-investigation.md` | Accepted as blocking repair input for spec/task completeness, false-green refusal scenarios, D6 direct dependency, validation oracles, and stale branch metadata. |
| `$AGENT_SCRATCH/domino-D11-cross-domino-product-investigation.md` | Accepted as blocking repair input for D6/D3/D8/G-HOST dependency modeling, product recovery behavior, D15 trigger discipline, and packet-index repair. |

## Design-Time Validation Gates

| Gate | Required current result | Scope |
| --- | --- | --- |
| D11 wording audit | No active reduced-standard guidance in `$D11_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, or `$AGENT_SCRATCH/domino-D11-*.md` except explicitly classified legacy compatibility terms. | Artifact language control only. |
| `bun run openspec -- validate deep-habitat-d11-local-feedback --strict` | Pass before final rereview and before any acceptance movement. | OpenSpec shape only. |
| `bun run openspec:validate` | Pass before final rereview and before any acceptance movement. | Full OpenSpec corpus shape only. |
| `git diff --check` | Pass before final rereview and before commit. | Whitespace/diff hygiene. |
| Fresh final D11 rereviews | No unresolved P1/P2. | Design/specification acceptance gate. |

## Current Validation Record

Run from `$REPO_ROOT` after the first-wave D11 packet/control repair and final
rereview integration:

| Check | Result | Notes |
| --- | --- | --- |
| D11 complete-standard wording audit | passed for active D11 artifacts and D11 scratch | Remaining scan hits are packet-index canonical D13 traceability rows and global packet-index wording/status policy rows, not active D11 guidance. |
| `bun run openspec -- validate deep-habitat-d11-local-feedback --strict` | passed | OpenSpec shape only. |
| `bun run openspec:validate` | passed | Full OpenSpec corpus shape only. |
| `git diff --check` | passed | Diff hygiene only. |
| Final D11 rereview set | passed | All five final lanes record no unresolved P1/P2. |
| Post-closure reduced-standard and stale-status scan | passed for active D11 artifacts and all D11 scratch | Exact scan over `$D11_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D11-*.md` returns only canonical D13 packet-index traceability rows outside active D11 guidance. |
| Post-closure strict D11 validation | passed | `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`. |
| Post-closure full OpenSpec validation | passed | `bun run openspec:validate`. |
| Post-closure diff hygiene | passed | `git diff --check`. |

## Later Implementation Gates

These gates are not design-time acceptance claims:

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` plus
  D11-owned focused tests for resource decisions, staged path workflow, D6/D7
  projections, D9 transaction projection where consumed, D10 refusals, pre-push
  D3/Nx behavior, unsupported hook behavior, and trace compatibility.
- Controlled hook command probes only when they cannot mutate the active
  checkout or have explicit before/after `git status --short --branch` checks.
- D0 row validation for every touched command, output, help, trace, export,
  docs, Husky, script, or generated-help surface.

## Source Blockers

Source implementation remains blocked wherever any of these are absent:

- concrete D0 rows for touched hook public/durable surfaces;
- D1 output-family and non-claim decisions for hook output and trace records;
- live D3 graph/target/base facts required by pre-push affected feedback;
- live D6 staged diagnostic projections for hook diagnostic local feedback;
- live D7 `LocalFeedbackCheckProjection` for structural check local feedback;
- live D9 transaction projection where hook feedback surfaces apply/fix state;
- live D10 protected/generated/forbidden mutation projection;
- D8 local-feedback eligibility projection if hook eligibility/admission is
  consumed directly.

## Non-Claims

- This packet does not implement Habitat source changes.
- This packet does not establish runtime behavior.
- This packet does not authorize D11 source implementation until the source
  blockers above are live for the touched implementation slice.
- D11 hook pass is local feedback only; it is not CI, review, Graphite,
  OpenSpec, apply-safety, generated freshness, graph completeness, or
  product/runtime readiness.
