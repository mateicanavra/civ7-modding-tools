# Phase Record: D7 Structural Enforcement Pipeline

## State

- Status: check/report source slice implemented and under review. D11/D12
  projection consumption and D10 protected-zone authority remain open.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D7_SOURCE_PACKET`.
- OpenSpec change: `$D7_CHANGE`.
- D7 source implementation may begin for the source slice recorded in
  `workstream/implementation-start-inventory.md`.
- D10 generated/protected-zone authority remains out of scope until the later D10
  packet lands.

## Objective

Specify the Structural Enforcement Pipeline so implementation can collapse the
current check path into explicit stage outcomes without inventing product/domain
trade-offs while coding.

## Current Gate

Final D7 rereview gate is closed for design/specification acceptance. The
source-start inventory authorizes the current check/report source slice. The
source slice splits the check-report monolith into D7 check modules, keeps the
public facade, uses TypeBox-backed report validation, removes the old
`commandArgs` check-report input, and derives command context from Oclif
callers.

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
| D10 | later accepted design packet, not live in current stack order | protected-zone report authority is out of scope for this D7 source slice; preserve current file-layer behavior only |

## Validation Matrix

Design-time validation after this repair:

| Gate | Command | Expected | Result |
| --- | --- | --- | --- |
| D7-OPEN | `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` | exit 0 | passed |
| D7-ALL-OPEN | `bun run openspec:validate` | exit 0 | passed; 249 items valid |
| D7-DIFF | `git diff --check` | exit 0 | passed |
| D7-WORDING | complete-standard wording audit over `$D7_CHANGE/**` and D7 scratch/final review records | no active reduced-standard guidance | passed |
| D7-TSC | `bun run --cwd tools/habitat-harness check` | exit 0 | passed |
| D7-BUILD | `bun run --cwd tools/habitat-harness build` | exit 0 | passed |
| D7-FOCUSED | `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/commands/habitat-entrypoints.test.ts test/lib/baseline.test.ts test/lib/hooks.test.ts test/lib/verify-receipt.test.ts test/lib/classify.test.ts test/commands/habitat-commands.test.ts` | exit 0 | passed; 89 tests |
| D7-ENFORCEMENT-SURFACE | `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | exit 0 or recorded blocker | failed on existing direct wrapped-test generated-output freshness assertion: expected exit 0, got 130 |

Later implementation gates are listed in `design.md` and `tasks.md`.

## Write Set

Current design/specification layer may edit:

- `$D7_CHANGE/**`;
- `$REMEDIATION_DIR/context.md`;
- `$REMEDIATION_DIR/packet-index.md` only after acceptance status changes;
- D7 scratch/final review files under `$AGENT_SCRATCH`.

Source implementation write set is listed in `design.md`; the current source
slice is inside that write set.

## Non-Claims

- D7 source slice does not complete D11/D12 consumer projection adoption.
- D7 repair does not prove current-tree structural cleanliness.
- D7 repair does not prove CI, runtime/product behavior, apply safety, Graphite
  readiness, OpenSpec acceptance for later packets, or D10 protected-zone
  closure.
- The broad enforcement-surface wrapped-test freshness failure remains a
  residual gate; this slice does not change that behavior.
