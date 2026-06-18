# Phase Record: D7 Structural Enforcement Pipeline

## State

- Status: accepted for design/specification after fresh final rereview found no
  unresolved P1/P2 blockers. Not implementation-complete.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D7_SOURCE_PACKET`.
- OpenSpec change: `$D7_CHANGE`.
- D7 source implementation remains blocked behind concrete D0 rows, D1
  output-family handling, live D2/D3/D5/D6 projections, and accepted D10 guard
  contract wherever those surfaces are touched.

## Objective

Specify the Structural Enforcement Pipeline so implementation can collapse the
current check path into explicit stage outcomes without inventing product/domain
trade-offs while coding.

## Current Gate

Final D7 rereview gate is closed for design/specification acceptance. The first
investigation wave found P1/P2 blockers, the packet was rewritten to repair
them, and fresh final domain/ontology, TypeScript/validation,
OpenSpec/information, and code/topology/cross-domino lanes read the repaired
disk and recorded no unresolved P1/P2 findings.

## First Investigation Inputs

| Lane | Scratch record | Status |
| --- | --- | --- |
| Domain/ontology | `$D7_DOMAIN_REVIEW` | BLOCKING; imported as repair input |
| TypeScript state-space | `$D7_TYPESCRIPT_REVIEW` | BLOCKING; imported as repair input |
| Code/topology | `$D7_TOPOLOGY_REVIEW` | BLOCKING; imported as repair input |
| OpenSpec/information | `$D7_INFORMATION_REVIEW` | BLOCKING; imported as repair input |
| Testing/validation | `$D7_VALIDATION_REVIEW` | BLOCKING; imported as repair input |
| Cross-domino | `$D7_CROSS_DOMINO_REVIEW` | BLOCKING; imported as repair input |

## Final Rereview Evidence

| Lane | Scratch record | Result |
| --- | --- | --- |
| Domain/ontology | `$D7_FINAL_DOMAIN_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| TypeScript/validation | `$D7_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| OpenSpec/information | `$D7_FINAL_OPENSPEC_INFORMATION_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| Code/topology/cross-domino | `$D7_FINAL_TOPOLOGY_CROSS_DOMINO_REVIEW` | ACCEPTED; no unresolved P1/P2 |

## Dependency State

| Dependency | Design status | D7 implementation status |
| --- | --- | --- |
| D0 | accepted for design/specification | concrete matrix rows required before public-surface edits |
| D1 | accepted for design/specification | output-family handling required where D7 touches D1-governed surfaces |
| D2 | accepted for design/specification | live selector/report/execution/baseline/Grit/generated-zone projections required before deleting whole-row registry coupling |
| D3 | accepted for design/specification | live graph target/refusal projections required before D7 closes wrapper false-green paths |
| D5 | accepted for design/specification | live baseline application/integrity results required before D7 deletes baseline internals |
| D6 | accepted for design/specification | live diagnostic consumer projections required before D7 deletes Grit/native coupling |
| D10 | draft/blocking | accepted protected-zone guard/refusal contract required before D7 implements protected-zone outcomes |

## Validation Matrix

Design-time validation after this repair:

| Gate | Command | Expected | Result |
| --- | --- | --- | --- |
| D7-OPEN | `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` | exit 0 | passed |
| D7-ALL-OPEN | `bun run openspec:validate` | exit 0 | passed; 249 items valid |
| D7-DIFF | `git diff --check` | exit 0 | passed |
| D7-WORDING | complete-standard wording audit over `$D7_CHANGE/**` and D7 scratch/final review records | no active reduced-standard guidance | passed |

Later implementation gates are listed in `design.md` and `tasks.md`. Fresh
validation investigation recorded current red behavior for command help and rule
inventory drift; implementation closure must repair or disposition those facts.

## Write Set

Current design/specification layer may edit:

- `$D7_CHANGE/**`;
- `$REMEDIATION_DIR/context.md`;
- `$REMEDIATION_DIR/packet-index.md` only after acceptance status changes;
- D7 scratch/final review files under `$AGENT_SCRATCH`.

Source implementation write set is listed in `design.md` and remains blocked.

## Non-Claims

- D7 repair does not implement Habitat source changes.
- D7 repair does not prove current-tree structural cleanliness.
- D7 repair does not prove CI, runtime/product behavior, apply safety, Graphite
  readiness, OpenSpec acceptance for later packets, or D10 protected-zone
  closure.
- D7 accepted design/specification, when achieved, will not mean
  implementation-complete.
