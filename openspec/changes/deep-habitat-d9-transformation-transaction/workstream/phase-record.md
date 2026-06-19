# Phase Record: D9 Transformation Transaction

## State

- Status: Source implementation slice under D9 repair. D9 now owns the
  Transformation Transaction boundary for admitted dry-runs and fail-closed
  live writes, but it is not implementation-complete.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d9-transformation-transaction`.
- Source packet: `$D9_SOURCE_PACKET`.
- OpenSpec change: `$D9_CHANGE`.

## Objective

Implement D9 as the Transformation Transaction owner for `habitat fix`: a
TypeBox-first request/record boundary that consumes D8 apply admission, requires
typed transaction input before running non-writing dry-runs through the Habitat
process port, fails closed before native writes, and keeps D10/G-HOST authority
blocking live protected or host-specific writes.

## Current Gate

Current source slice deletes the previous hard-coded `grit-apply` transaction
module and routes `habitat fix` through `transformation-transaction/*`.
The command now enters D9 with explicit dry-run/live-write intent variants,
D9 resolves registered D8 apply admissions and derives D8 transaction-input
projections from typed rule facts before native dry-run execution, records a
TypeBox-validated worktree observation, and preserves the D0 `habitat fix
--dry-run` public surface as a non-writing native Grit dry-run.
Missing D8 admission is refused at the command/admission boundary, not accepted
as a valid transaction request.

Live implementation remains blocked where D10 protected/generated-zone
decisions are required and absent. G-HOST projections are live downstack, but
the current D9 slice does not yet consume host apply-gate projections for live
write approval.

## First-Wave Investigation Inputs

| Lane | Scratch | Current disposition |
| --- | --- | --- |
| Domain/ontology | `$D9_DOMAIN_REVIEW` | Imported negative findings; repaired in proposal/design/spec/tasks/control records; accepted by final rereview. |
| TypeScript state-space | `$D9_TYPESCRIPT_REVIEW` | Imported negative findings; repaired with closed state model and TypeScript reduction requirements; accepted by final rereview. |
| Code/vendor topology | `$D9_TOPOLOGY_REVIEW` | Imported negative findings; repaired with write/protected surfaces, vendor boundary, and invalid `--json` gate correction; accepted by final rereview. |
| OpenSpec/information/testing | `$D9_INFORMATION_REVIEW` | Imported negative findings; repaired with expanded requirements/tasks and validation split; accepted by final rereview. |
| Cross-domino/product | `$D9_CROSS_DOMINO_REVIEW` | Imported negative findings; repaired with upstream/downstream projections and source blockers; accepted by final rereview. |

## Final Rereview Evidence

| Lane | Scratch | Result |
| --- | --- | --- |
| Domain/ontology | `$D9_FINAL_DOMAIN_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| TypeScript/validation | `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| OpenSpec/information | `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| Code/vendor topology | `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| Cross-domino/product | `$D9_FINAL_CROSS_DOMINO_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |

## Design-Time Validation Gates

| Gate | Expected status | Claim |
| --- | --- | --- |
| D9 wording audit over `$D9_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D9-*.md` | Pass before acceptance | Active D9 guidance avoids reduced-standard wording except canonical traceability. |
| `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict` | Pass before acceptance | OpenSpec shape for D9 is valid. |
| `bun run openspec:validate` | Pass before acceptance | Repository OpenSpec corpus remains valid. |
| `git diff --check` | Pass before acceptance | Diff hygiene is clean. |
| Fresh final D9 rereviews | Passed | D9 is accepted for design/specification only. |

## Source Validation Gates

- Passed: `bun run --cwd tools/habitat-harness check`.
- Passed: `bun run --cwd tools/habitat-harness build`.
- Passed: `bun run --cwd tools/habitat-harness test -- test/lib/transformation-transaction.test.ts test/commands/habitat-commands.test.ts test/rules/pattern-governance-projections.test.ts`.
- Passed: `wc -l tools/habitat-harness/src/lib/transformation-transaction/*.ts`;
  largest D9 transaction module is under 250 lines.
- Passed: `bun tools/habitat-harness/bin/dev.ts fix --help`.
- Passed: `bun tools/habitat-harness/bin/dev.ts fix --dry-run` exits 0, runs
  registry-derived non-writing Grit dry-run inputs, reports source-lane
  `Processed 1751 files and found 0 matches`, docs-lane `Processed 1582 files
  and found 87 matches`, plus current parser diagnostics, and leaves
  `git status --short --branch` unchanged.
- Passed: temporary implementation boundary review repaired accepted P2s for
  D8 transaction-input projection ownership, repo-relative path validation, and
  admission identity matching.
- Passed: `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`.
- Passed: `bun run openspec:validate`.
- Passed: `git diff --check`.
- Passed: `git status --short --branch` reports a clean D9 worktree after
  Graphite submission.
- Full package test limitation: `test/lib/grit-injected-probe.test.ts` passes
  focused, but one concurrent full-suite run produced a transient probe cleanup
  failure. `test/generators/pattern-generator.test.ts` persistently fails before
  tests run because existing CJS generator code requires a TS registry loader
  that imports sibling `.js` ESM specifiers.

## Non-Claims

- This source slice does not make D9 implementation-complete.
- This phase does not authorize `habitat fix --json`; that requires D0-backed
  public contract design and implementation.
- This phase does not complete D10 path authority, dry-run inventory, approved
  write sets, live write, formatter/gate handoffs, rollback, or downstream
  D11/D13 projections.
- This phase runs native Grit only when D9 has an admitted dry-run transaction
  input projection from typed rule facts or an explicit caller-provided
  projection. It does not run native Grit live writes, Biome, Git rollback, Nx,
  hooks, or generators through D9 transaction authority.
